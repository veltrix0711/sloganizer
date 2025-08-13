import express from 'express';
import SocialMediaService from '../services/socialMediaService.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

const socialMediaService = new SocialMediaService();

// Get user's connected social accounts
router.get('/accounts', authMiddleware, async (req, res) => {
  try {
    const accounts = await socialMediaService.getUserSocialAccounts(req.user.id);
    res.json({
      success: true,
      accounts
    });
  } catch (error) {
    console.error('Error getting social accounts:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Connect a new social account
router.post('/accounts/connect', authMiddleware, async (req, res) => {
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
    } = req.body;

    // Validate required fields
    if (!platform || !accountName || !accountId) {
      return res.status(400).json({
        success: false,
        error: 'Platform, account name, and account ID are required'
      });
    }

    const account = await socialMediaService.connectSocialAccount(req.user.id, {
      platform,
      accountName,
      accountId,
      accessToken,
      refreshToken,
      expiresAt,
      avatarUrl,
      followerCount
    });

    res.json({
      success: true,
      account
    });
  } catch (error) {
    console.error('Error connecting social account:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Disconnect a social account
router.delete('/accounts/:accountId', authMiddleware, async (req, res) => {
  try {
    const { accountId } = req.params;
    
    const result = await socialMediaService.disconnectSocialAccount(req.user.id, accountId);
    
    res.json(result);
  } catch (error) {
    console.error('Error disconnecting social account:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Schedule a post
router.post('/posts/schedule', authMiddleware, async (req, res) => {
  try {
    const {
      socialAccountId,
      contentText,
      mediaUrls,
      hashtags,
      scheduledFor,
      brandProfileId,
      createdFrom
    } = req.body;

    // Validate required fields
    if (!socialAccountId || !contentText || !scheduledFor) {
      return res.status(400).json({
        success: false,
        error: 'Social account ID, content text, and scheduled time are required'
      });
    }

    // Validate scheduled time is in the future
    const scheduledDate = new Date(scheduledFor);
    if (scheduledDate <= new Date()) {
      return res.status(400).json({
        success: false,
        error: 'Scheduled time must be in the future'
      });
    }

    const post = await socialMediaService.schedulePost(req.user.id, {
      socialAccountId,
      contentText,
      mediaUrls,
      hashtags,
      scheduledFor,
      brandProfileId,
      createdFrom
    });

    res.json({
      success: true,
      post
    });
  } catch (error) {
    console.error('Error scheduling post:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get scheduled posts
router.get('/posts/scheduled', authMiddleware, async (req, res) => {
  try {
    const {
      status,
      platform,
      fromDate,
      toDate,
      limit = 50,
      offset = 0
    } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (platform) filters.platform = platform;
    if (fromDate) filters.fromDate = fromDate;
    if (toDate) filters.toDate = toDate;

    const posts = await socialMediaService.getScheduledPosts(req.user.id, filters);

    res.json({
      success: true,
      posts: posts.slice(offset, offset + parseInt(limit)),
      total: posts.length
    });
  } catch (error) {
    console.error('Error getting scheduled posts:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update scheduled post
router.put('/posts/scheduled/:postId', authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated
    delete updates.id;
    delete updates.user_id;
    delete updates.created_at;

    const post = await socialMediaService.updateScheduledPost(req.user.id, postId, updates);

    res.json({
      success: true,
      post
    });
  } catch (error) {
    console.error('Error updating scheduled post:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete scheduled post
router.delete('/posts/scheduled/:postId', authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    
    const result = await socialMediaService.deleteScheduledPost(req.user.id, postId);
    
    res.json(result);
  } catch (error) {
    console.error('Error deleting scheduled post:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create autopost template
router.post('/templates', authMiddleware, async (req, res) => {
  try {
    const {
      templateName,
      templateContent,
      platform,
      templateVariables
    } = req.body;

    // Validate required fields
    if (!templateName || !templateContent || !platform) {
      return res.status(400).json({
        success: false,
        error: 'Template name, content, and platform are required'
      });
    }

    const template = await socialMediaService.createAutopostTemplate(req.user.id, {
      templateName,
      templateContent,
      platform,
      templateVariables
    });

    res.json({
      success: true,
      template
    });
  } catch (error) {
    console.error('Error creating autopost template:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get autopost templates
router.get('/templates', authMiddleware, async (req, res) => {
  try {
    const { platform } = req.query;
    
    const templates = await socialMediaService.getAutopostTemplates(req.user.id, platform);

    res.json({
      success: true,
      templates
    });
  } catch (error) {
    console.error('Error getting autopost templates:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create autopost schedule
router.post('/schedules', authMiddleware, async (req, res) => {
  try {
    const {
      templateId,
      socialAccountIds,
      scheduleType,
      scheduleConfig,
      nextPostAt
    } = req.body;

    // Validate required fields
    if (!templateId || !socialAccountIds || !scheduleType || !scheduleConfig) {
      return res.status(400).json({
        success: false,
        error: 'Template ID, social account IDs, schedule type, and config are required'
      });
    }

    const schedule = await socialMediaService.createAutopostSchedule(req.user.id, {
      templateId,
      socialAccountIds,
      scheduleType,
      scheduleConfig,
      nextPostAt
    });

    res.json({
      success: true,
      schedule
    });
  } catch (error) {
    console.error('Error creating autopost schedule:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get social analytics
router.get('/analytics', authMiddleware, async (req, res) => {
  try {
    const {
      platform,
      fromDate,
      toDate
    } = req.query;

    const filters = {};
    if (platform) filters.platform = platform;
    if (fromDate) filters.fromDate = fromDate;
    if (toDate) filters.toDate = toDate;

    const analytics = await socialMediaService.getSocialAnalytics(req.user.id, filters);

    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('Error getting social analytics:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Generate content for social post using AI
router.post('/content/generate', authMiddleware, async (req, res) => {
  try {
    const {
      platform,
      contentType = 'promotional',
      businessName,
      industry,
      targetAudience,
      keywords = [],
      brandProfileId
    } = req.body;

    if (!platform || !businessName) {
      return res.status(400).json({
        success: false,
        error: 'Platform and business name are required'
      });
    }

    // Check rate limits
    const rateLimit = await socialMediaService.checkRateLimit(req.user.id, platform, 'generate_content');
    if (!rateLimit.allowed) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded. Please try again later.',
        remaining: rateLimit.remaining
      });
    }

    // Use existing social post template logic (enhanced)
    const contentTemplates = {
      instagram: {
        promotional: `🚀 Exciting news from ${businessName}! ${industry ? `As leaders in ${industry},` : ''} we're thrilled to ${keywords.length > 0 ? `bring you ${keywords.join(', ')} ` : ''}offer something special for ${targetAudience || 'our amazing community'}! 

✨ ${keywords.length > 0 ? `#${keywords.join(' #')} ` : ''}#${businessName.replace(/\s+/g, '')} #Innovation #Quality #Excellence`,

        engagement: `Hey ${targetAudience || 'everyone'}! 👋 

Question for our ${businessName} community: What's your biggest challenge when it comes to ${industry || 'your business'}? 

Drop a comment below - we love hearing from you! 💬

${keywords.length > 0 ? `#${keywords.join(' #')} ` : ''}#Community #${businessName.replace(/\s+/g, '')}`,

        educational: `💡 Pro Tip from ${businessName}:

${industry ? `In the ${industry} industry,` : 'Here\'s something'} ${keywords.length > 0 ? keywords[0] : 'quality'} makes all the difference. 

Here's what ${targetAudience || 'you'} should know:
✅ Focus on consistency
✅ Quality over quantity  
✅ Listen to your audience

What tips would you add? Share below! 👇

#${businessName.replace(/\s+/g, '')} #Tips #Knowledge`
      },

      linkedin: {
        promotional: `I'm excited to share an update from ${businessName}. ${industry ? `Working in ${industry},` : ''} we understand the challenges ${targetAudience || 'businesses'} face.

That's why we're ${keywords.length > 0 ? `focused on ${keywords.join(', ')} to ` : ''}committed to delivering exceptional value.

${keywords.length > 0 ? `Key focus areas: ${keywords.join(' • ')}` : ''}

What are your thoughts on this approach? I'd love to hear your perspective.

#${businessName.replace(/\s+/g, '')} #Innovation #Business`,

        engagement: `Question for my network:

As professionals in ${industry || 'business'}, what's the one challenge you wish someone would solve for ${targetAudience || 'your industry'}?

At ${businessName}, we're always looking to understand pain points and create meaningful solutions.

Share your thoughts in the comments - your insights could spark our next innovation!

#Networking #${businessName.replace(/\s+/g, '')} #ProfessionalGrowth`,

        educational: `Insight from ${businessName}:

${industry ? `In ${industry},` : 'In business,'} success often comes down to understanding ${keywords.length > 0 ? keywords[0] : 'your market'}.

Key learnings we've gathered:
→ ${targetAudience || 'Clients'} value consistency
→ Transparency builds trust
→ Innovation requires listening

What principles guide your ${industry || 'business'} approach?

#Leadership #${businessName.replace(/\s+/g, '')} #BusinessInsights`
      },

      twitter: {
        promotional: `🎉 Big news from ${businessName}! ${keywords.length > 0 ? `Bringing you ${keywords[0]} ` : ''}innovation for ${targetAudience || 'everyone'}. ${industry ? `#${industry.replace(/\s+/g, '')} ` : ''}#Innovation #Quality`,

        engagement: `${targetAudience || 'Community'}, what's your take on ${keywords.length > 0 ? keywords[0] : industry || 'innovation'}? Drop your thoughts! 👇 @${businessName.replace(/\s+/g, '')}`,

        educational: `💡 Quick tip: ${keywords.length > 0 ? `${keywords[0]} success` : 'Success'} starts with understanding ${targetAudience || 'your audience'}. What's your experience? #${businessName.replace(/\s+/g, '')} #Tips`
      },

      facebook: {
        promotional: `We're thrilled to share some exciting news from ${businessName}! 

${industry ? `As your trusted partner in ${industry},` : ''} we're always working to serve ${targetAudience || 'our community'} better. ${keywords.length > 0 ? `Our latest focus on ${keywords.join(', ')} ` : 'Our commitment '}reflects our dedication to excellence.

Thank you for being part of our journey! We can't wait to show you what's next.

${keywords.length > 0 ? `#${keywords.join(' #')} ` : ''}#${businessName.replace(/\s+/g, '')} #Community #Excellence`,

        engagement: `Hey ${businessName} family! 👥

We want to hear from you: What's one thing you'd love to see more of ${industry ? `in the ${industry} space` : 'from businesses like ours'}?

Your feedback helps us serve ${targetAudience || 'you'} better. Comment below with your ideas! 

#Community #Feedback #${businessName.replace(/\s+/g, '')}`,

        educational: `${targetAudience || 'Friends'}, let's talk about ${keywords.length > 0 ? keywords[0] : industry || 'success'}! 

At ${businessName}, we've learned that ${industry ? `in ${industry}` : 'in business'}, the key is ${keywords.length > 0 ? `focusing on ${keywords.join(' and ')}` : 'staying focused on what matters'}.

Here are our top insights:
• Quality always wins
• Customer feedback is gold
• Consistency builds trust

What insights would you add to this list? Share your wisdom! 

#${businessName.replace(/\s+/g, '')} #Wisdom #Growth`
      }
    };

    const platformTemplates = contentTemplates[platform] || contentTemplates.instagram;
    const template = platformTemplates[contentType] || platformTemplates.promotional;

    res.json({
      success: true,
      content: template,
      platform,
      contentType,
      remaining: rateLimit.remaining
    });

  } catch (error) {
    console.error('Error generating social content:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;