import { supabase } from './supabase.js';
import crypto from 'crypto';

class SocialMediaService {
  constructor() {
    this.encryptionKey = process.env.SOCIAL_ENCRYPTION_KEY || 'default-key-change-in-production';
  }

  // Encrypt sensitive tokens
  encrypt(text) {
    const cipher = crypto.createCipher('aes192', this.encryptionKey);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  // Decrypt sensitive tokens
  decrypt(encryptedText) {
    const decipher = crypto.createDecipher('aes192', this.encryptionKey);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  // Get user's connected social accounts
  async getUserSocialAccounts(userId) {
    try {
      const { data, error } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Don't return sensitive tokens in the response
      return data.map(account => ({
        ...account,
        access_token: undefined,
        refresh_token: undefined
      }));
    } catch (error) {
      console.error('Error getting social accounts:', error);
      throw new Error('Failed to retrieve social accounts');
    }
  }

  // Connect a new social account
  async connectSocialAccount(userId, accountData) {
    try {
      const {
        platform,
        accountName,
        accountId,
        accessToken,
        refreshToken,
        expiresAt,
        avatarUrl,
        followerCount
      } = accountData;

      // Encrypt sensitive tokens
      const encryptedAccessToken = accessToken ? this.encrypt(accessToken) : null;
      const encryptedRefreshToken = refreshToken ? this.encrypt(refreshToken) : null;

      const { data, error } = await supabase
        .from('social_accounts')
        .upsert({
          user_id: userId,
          platform,
          account_name: accountName,
          account_id: accountId,
          access_token: encryptedAccessToken,
          refresh_token: encryptedRefreshToken,
          token_expires_at: expiresAt,
          account_avatar_url: avatarUrl,
          follower_count: followerCount || 0,
          is_active: true,
          connection_status: 'connected',
          last_sync_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,platform,account_id'
        })
        .select()
        .single();

      if (error) throw error;

      // Don't return sensitive data
      return {
        ...data,
        access_token: undefined,
        refresh_token: undefined
      };
    } catch (error) {
      console.error('Error connecting social account:', error);
      throw new Error('Failed to connect social account');
    }
  }

  // Disconnect a social account
  async disconnectSocialAccount(userId, accountId) {
    try {
      const { error } = await supabase
        .from('social_accounts')
        .update({
          is_active: false,
          connection_status: 'disconnected',
          access_token: null,
          refresh_token: null
        })
        .eq('user_id', userId)
        .eq('id', accountId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error disconnecting social account:', error);
      throw new Error('Failed to disconnect social account');
    }
  }

  // Schedule a post
  async schedulePost(userId, postData) {
    try {
      const {
        socialAccountId,
        contentText,
        mediaUrls = [],
        hashtags = [],
        scheduledFor,
        brandProfileId,
        createdFrom = 'manual'
      } = postData;

      // Verify the social account belongs to the user
      const { data: account, error: accountError } = await supabase
        .from('social_accounts')
        .select('platform, is_active, connection_status')
        .eq('id', socialAccountId)
        .eq('user_id', userId)
        .single();

      if (accountError || !account) {
        throw new Error('Social account not found or access denied');
      }

      if (!account.is_active || account.connection_status !== 'connected') {
        throw new Error('Social account is not connected or active');
      }

      const { data, error } = await supabase
        .from('scheduled_posts')
        .insert({
          user_id: userId,
          social_account_id: socialAccountId,
          content_text: contentText,
          media_urls: mediaUrls,
          hashtags,
          scheduled_for: scheduledFor,
          brand_profile_id: brandProfileId,
          created_from: createdFrom,
          post_status: 'scheduled'
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error scheduling post:', error);
      throw new Error('Failed to schedule post');
    }
  }

  // Get scheduled posts for a user
  async getScheduledPosts(userId, filters = {}) {
    try {
      let query = supabase
        .from('scheduled_posts')
        .select(`
          *,
          social_accounts (
            platform,
            account_name,
            account_avatar_url
          )
        `)
        .eq('user_id', userId)
        .order('scheduled_for', { ascending: true });

      if (filters.status) {
        query = query.eq('post_status', filters.status);
      }

      if (filters.platform) {
        query = query.eq('social_accounts.platform', filters.platform);
      }

      if (filters.fromDate) {
        query = query.gte('scheduled_for', filters.fromDate);
      }

      if (filters.toDate) {
        query = query.lte('scheduled_for', filters.toDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error getting scheduled posts:', error);
      throw new Error('Failed to retrieve scheduled posts');
    }
  }

  // Update scheduled post
  async updateScheduledPost(userId, postId, updates) {
    try {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .update(updates)
        .eq('id', postId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error updating scheduled post:', error);
      throw new Error('Failed to update scheduled post');
    }
  }

  // Delete scheduled post
  async deleteScheduledPost(userId, postId) {
    try {
      const { error } = await supabase
        .from('scheduled_posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', userId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error deleting scheduled post:', error);
      throw new Error('Failed to delete scheduled post');
    }
  }

  // Check rate limits
  async checkRateLimit(userId, platform, actionType) {
    try {
      const windowStart = new Date();
      windowStart.setMinutes(windowStart.getMinutes() - 60); // 1 hour window

      const { data, error } = await supabase
        .from('social_rate_limits')
        .select('requests_count, max_requests')
        .eq('user_id', userId)
        .eq('platform', platform)
        .eq('action_type', actionType)
        .gte('window_start', windowStart.toISOString())
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      if (!data) {
        // No existing rate limit record, create one
        await supabase
          .from('social_rate_limits')
          .insert({
            user_id: userId,
            platform,
            action_type: actionType,
            requests_count: 1,
            window_start: new Date().toISOString()
          });
        return { allowed: true, remaining: 99 };
      }

      const isWithinLimit = data.requests_count < data.max_requests;
      
      if (isWithinLimit) {
        // Increment counter
        await supabase
          .from('social_rate_limits')
          .update({ requests_count: data.requests_count + 1 })
          .eq('user_id', userId)
          .eq('platform', platform)
          .eq('action_type', actionType);
      }

      return {
        allowed: isWithinLimit,
        remaining: data.max_requests - data.requests_count - 1
      };
    } catch (error) {
      console.error('Error checking rate limit:', error);
      // Allow request if rate limit check fails
      return { allowed: true, remaining: 0 };
    }
  }
}

export default SocialMediaService;