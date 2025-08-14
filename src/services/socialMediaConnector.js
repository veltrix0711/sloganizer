import fetch from 'node-fetch';
import { supabase } from './supabase.js';

class SocialMediaConnector {
  constructor() {
    this.platforms = {
      instagram: {
        baseUrl: 'https://graph.instagram.com',
        version: 'v18.0'
      },
      facebook: {
        baseUrl: 'https://graph.facebook.com',
        version: 'v18.0'
      },
      twitter: {
        baseUrl: 'https://api.twitter.com',
        version: '2'
      },
      tiktok: {
        baseUrl: 'https://open-api.tiktok.com',
        version: 'v1.3'
      }
    };
  }

  // Connect a social media account
  async connectAccount(userId, platform, accessToken, refreshToken = null, platformUserData = {}) {
    try {
      // Encrypt tokens (in production, use proper encryption)
      const encryptedAccessToken = this.encryptToken(accessToken);
      const encryptedRefreshToken = refreshToken ? this.encryptToken(refreshToken) : null;

      const accountData = {
        user_id: userId,
        platform: platform.toLowerCase(),
        platform_user_id: platformUserData.id || platformUserData.user_id,
        username: platformUserData.username || platformUserData.screen_name,
        display_name: platformUserData.display_name || platformUserData.name,
        profile_picture_url: platformUserData.profile_picture_url || platformUserData.profile_image_url,
        access_token: encryptedAccessToken,
        refresh_token: encryptedRefreshToken,
        token_expires_at: platformUserData.expires_at ? new Date(platformUserData.expires_at) : null,
        account_data: platformUserData,
        is_active: true,
        connected_at: new Date(),
        last_sync_at: new Date()
      };

      const { data, error } = await supabase
        .from('social_accounts')
        .upsert(accountData, {
          onConflict: 'user_id,platform,platform_user_id',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, account: data };
    } catch (error) {
      console.error('Error connecting social account:', error);
      return { success: false, error: error.message };
    }
  }

  // Get connected accounts for a user
  async getConnectedAccounts(userId) {
    try {
      const { data, error } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true);

      if (error) throw error;

      // Decrypt tokens for active accounts
      const accounts = data.map(account => ({
        ...account,
        access_token: this.decryptToken(account.access_token),
        refresh_token: account.refresh_token ? this.decryptToken(account.refresh_token) : null
      }));

      return { success: true, accounts };
    } catch (error) {
      console.error('Error getting connected accounts:', error);
      return { success: false, error: error.message };
    }
  }

  // Sync metrics for Instagram
  async syncInstagramMetrics(accountId, accessToken) {
    try {
      console.log('Syncing Instagram metrics for account:', accountId);

      // Get Instagram Business Account ID
      const accountResponse = await fetch(
        `${this.platforms.instagram.baseUrl}/me?fields=id,username,account_type&access_token=${accessToken}`
      );
      const accountData = await accountResponse.json();

      if (!accountResponse.ok) {
        throw new Error(`Instagram API error: ${accountData.error?.message || 'Unknown error'}`);
      }

      // Get recent media
      const mediaResponse = await fetch(
        `${this.platforms.instagram.baseUrl}/${accountData.id}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&limit=25&access_token=${accessToken}`
      );
      const mediaData = await mediaResponse.json();

      if (!mediaResponse.ok) {
        throw new Error(`Instagram Media API error: ${mediaData.error?.message || 'Unknown error'}`);
      }

      const syncedPosts = [];

      // Process each media item
      for (const media of mediaData.data || []) {
        try {
          // Get insights for this media
          const insightsResponse = await fetch(
            `${this.platforms.instagram.baseUrl}/${media.id}/insights?metric=impressions,reach,likes,comments,shares,saves&access_token=${accessToken}`
          );
          
          let insights = {};
          if (insightsResponse.ok) {
            const insightsData = await insightsResponse.json();
            insights = this.processInstagramInsights(insightsData.data || []);
          }

          // Store/update post in database
          const postResult = await this.storePostData({
            platform: 'instagram',
            platform_post_id: media.id,
            content: media.caption || '',
            media_urls: [media.media_url, media.thumbnail_url].filter(Boolean),
            posted_at: new Date(media.timestamp),
            post_url: media.permalink,
            account_id: accountId
          });

          if (postResult.success) {
            // Store metrics
            await this.storeMetricsData({
              post_id: postResult.post.id,
              platform: 'instagram',
              views: insights.impressions || 0,
              likes: insights.likes || 0,
              shares: insights.shares || 0,
              comments: insights.comments || 0,
              saves: insights.saves || 0,
              reach: insights.reach || 0,
              impressions: insights.impressions || 0
            });

            syncedPosts.push(postResult.post);
          }

          // Rate limiting - wait between requests
          await this.delay(200);

        } catch (mediaError) {
          console.error(`Error processing Instagram media ${media.id}:`, mediaError);
          continue; // Skip this media and continue with others
        }
      }

      // Update last sync time
      await this.updateAccountSyncTime(accountId);

      return { success: true, syncedPosts: syncedPosts.length };

    } catch (error) {
      console.error('Instagram sync error:', error);
      return { success: false, error: error.message };
    }
  }

  // Sync metrics for Twitter/X
  async syncTwitterMetrics(accountId, accessToken) {
    try {
      console.log('Syncing Twitter metrics for account:', accountId);

      // Get recent tweets with metrics
      const tweetsResponse = await fetch(
        `${this.platforms.twitter.baseUrl}/${this.platforms.twitter.version}/tweets/search/recent?query=from:me&tweet.fields=created_at,public_metrics,text,attachments&max_results=25`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const tweetsData = await tweetsResponse.json();

      if (!tweetsResponse.ok) {
        throw new Error(`Twitter API error: ${tweetsData.detail || tweetsData.title || 'Unknown error'}`);
      }

      const syncedPosts = [];

      // Process each tweet
      for (const tweet of tweetsData.data || []) {
        try {
          const metrics = tweet.public_metrics || {};

          // Store/update post in database
          const postResult = await this.storePostData({
            platform: 'twitter',
            platform_post_id: tweet.id,
            content: tweet.text || '',
            posted_at: new Date(tweet.created_at),
            post_url: `https://twitter.com/i/status/${tweet.id}`,
            account_id: accountId
          });

          if (postResult.success) {
            // Store metrics
            await this.storeMetricsData({
              post_id: postResult.post.id,
              platform: 'twitter',
              views: metrics.impression_count || 0,
              likes: metrics.like_count || 0,
              shares: metrics.retweet_count || 0,
              comments: metrics.reply_count || 0,
              reach: metrics.impression_count || 0,
              impressions: metrics.impression_count || 0
            });

            syncedPosts.push(postResult.post);
          }

          await this.delay(100);

        } catch (tweetError) {
          console.error(`Error processing tweet ${tweet.id}:`, tweetError);
          continue;
        }
      }

      await this.updateAccountSyncTime(accountId);
      return { success: true, syncedPosts: syncedPosts.length };

    } catch (error) {
      console.error('Twitter sync error:', error);
      return { success: false, error: error.message };
    }
  }

  // Sync metrics for Facebook
  async syncFacebookMetrics(accountId, accessToken) {
    try {
      console.log('Syncing Facebook metrics for account:', accountId);

      // Get Facebook page posts
      const postsResponse = await fetch(
        `${this.platforms.facebook.baseUrl}/${this.platforms.facebook.version}/me/posts?fields=id,message,created_time,permalink_url,insights.metric(post_impressions,post_engaged_users,post_clicks)&limit=25&access_token=${accessToken}`
      );

      const postsData = await postsResponse.json();

      if (!postsResponse.ok) {
        throw new Error(`Facebook API error: ${postsData.error?.message || 'Unknown error'}`);
      }

      const syncedPosts = [];

      // Process each post
      for (const post of postsData.data || []) {
        try {
          const insights = this.processFacebookInsights(post.insights?.data || []);

          // Store/update post in database
          const postResult = await this.storePostData({
            platform: 'facebook',
            platform_post_id: post.id,
            content: post.message || '',
            posted_at: new Date(post.created_time),
            post_url: post.permalink_url,
            account_id: accountId
          });

          if (postResult.success) {
            // Store metrics
            await this.storeMetricsData({
              post_id: postResult.post.id,
              platform: 'facebook',
              views: insights.impressions || 0,
              likes: 0, // Facebook doesn't provide likes in insights API
              shares: 0,
              comments: 0,
              reach: insights.engaged_users || 0,
              impressions: insights.impressions || 0,
              clicks: insights.clicks || 0
            });

            syncedPosts.push(postResult.post);
          }

          await this.delay(200);

        } catch (postError) {
          console.error(`Error processing Facebook post ${post.id}:`, postError);
          continue;
        }
      }

      await this.updateAccountSyncTime(accountId);
      return { success: true, syncedPosts: syncedPosts.length };

    } catch (error) {
      console.error('Facebook sync error:', error);
      return { success: false, error: error.message };
    }
  }

  // Store post data in database
  async storePostData(postData) {
    try {
      const { data, error } = await supabase
        .from('content_posts')
        .upsert({
          platform: postData.platform,
          post_id_on_platform: postData.platform_post_id,
          content: postData.content,
          media_urls: postData.media_urls || [],
          posted_at: postData.posted_at,
          status: 'posted',
          user_id: await this.getUserIdFromAccountId(postData.account_id),
          created_at: new Date(),
          updated_at: new Date()
        }, {
          onConflict: 'platform,post_id_on_platform',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, post: data };

    } catch (error) {
      console.error('Error storing post data:', error);
      return { success: false, error: error.message };
    }
  }

  // Store metrics data in database
  async storeMetricsData(metricsData) {
    try {
      const { data, error } = await supabase
        .from('post_metrics')
        .upsert({
          post_id: metricsData.post_id,
          platform: metricsData.platform,
          views: metricsData.views || 0,
          likes: metricsData.likes || 0,
          shares: metricsData.shares || 0,
          comments: metricsData.comments || 0,
          saves: metricsData.saves || 0,
          clicks: metricsData.clicks || 0,
          reach: metricsData.reach || 0,
          impressions: metricsData.impressions || 0,
          collected_at: new Date(),
          created_at: new Date()
        }, {
          onConflict: 'post_id,platform',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, metrics: data };

    } catch (error) {
      console.error('Error storing metrics data:', error);
      return { success: false, error: error.message };
    }
  }

  // Helper functions
  processInstagramInsights(insights) {
    const processed = {};
    insights.forEach(insight => {
      processed[insight.name] = insight.values?.[0]?.value || 0;
    });
    return processed;
  }

  processFacebookInsights(insights) {
    const processed = {};
    insights.forEach(insight => {
      processed[insight.name.replace('post_', '')] = insight.values?.[0]?.value || 0;
    });
    return processed;
  }

  async getUserIdFromAccountId(accountId) {
    try {
      const { data, error } = await supabase
        .from('social_accounts')
        .select('user_id')
        .eq('id', accountId)
        .single();

      if (error) throw error;
      return data.user_id;
    } catch (error) {
      console.error('Error getting user ID from account ID:', error);
      return null;
    }
  }

  async updateAccountSyncTime(accountId) {
    try {
      await supabase
        .from('social_accounts')
        .update({ last_sync_at: new Date() })
        .eq('id', accountId);
    } catch (error) {
      console.error('Error updating account sync time:', error);
    }
  }

  // Simple encryption (use proper encryption in production)
  encryptToken(token) {
    // In production, use proper encryption like AES
    return Buffer.from(token).toString('base64');
  }

  decryptToken(encryptedToken) {
    // In production, use proper decryption
    return Buffer.from(encryptedToken, 'base64').toString('utf-8');
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Sync all connected accounts for a user
  async syncAllUserAccounts(userId) {
    try {
      const accountsResult = await this.getConnectedAccounts(userId);
      if (!accountsResult.success) {
        return { success: false, error: accountsResult.error };
      }

      const syncResults = [];

      for (const account of accountsResult.accounts) {
        try {
          let result;
          
          switch (account.platform) {
            case 'instagram':
              result = await this.syncInstagramMetrics(account.id, account.access_token);
              break;
            case 'twitter':
              result = await this.syncTwitterMetrics(account.id, account.access_token);
              break;
            case 'facebook':
              result = await this.syncFacebookMetrics(account.id, account.access_token);
              break;
            default:
              result = { success: false, error: `Unsupported platform: ${account.platform}` };
          }

          syncResults.push({
            platform: account.platform,
            account_id: account.id,
            ...result
          });

          // Rate limiting between accounts
          await this.delay(1000);

        } catch (accountError) {
          console.error(`Error syncing account ${account.id}:`, accountError);
          syncResults.push({
            platform: account.platform,
            account_id: account.id,
            success: false,
            error: accountError.message
          });
        }
      }

      return { success: true, results: syncResults };

    } catch (error) {
      console.error('Error syncing user accounts:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instance
const socialMediaConnector = new SocialMediaConnector();
export default socialMediaConnector;