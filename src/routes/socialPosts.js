import express from 'express';
import { supabase } from '../services/supabase.js';
import { generateWithClaude } from '../services/claude.js';

const router = express.Router();

// Platform-specific character limits and requirements
const PLATFORM_LIMITS = {
  twitter: { maxChars: 280, supportsHashtags: true, hashtagLimit: 10 },
  instagram: { maxChars: 2200, supportsHashtags: true, hashtagLimit: 30 },
  linkedin: { maxChars: 3000, supportsHashtags: true, hashtagLimit: 5 },
  facebook: { maxChars: 63206, supportsHashtags: false, hashtagLimit: 0 },
  tiktok: { maxChars: 300, supportsHashtags: true, hashtagLimit: 20 }
};

// Generate social media posts
router.post('/generate', async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      brandProfileId,
      platforms = ['instagram'],
      postType = 'promotional',
      topic,
      includeHashtags = true,
      toneOverride,
      count = 3
    } = req.body;

    // Validation
    if (!topic || topic.trim().length < 3) {
      return res.status(400).json({
        success: false,
        error: 'Post topic is required and must be at least 3 characters'
      });
    }

    if (!Array.isArray(platforms) || platforms.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one platform must be specified'
      });
    }

    // Validate platforms
    const validPlatforms = Object.keys(PLATFORM_LIMITS);
    const invalidPlatforms = platforms.filter(p => !validPlatforms.includes(p));
    if (invalidPlatforms.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Invalid platforms: ${invalidPlatforms.join(', ')}`
      });
    }

    // Get brand profile context
    let brandProfile = null;
    if (brandProfileId) {
      const { data: profile, error } = await supabase
        .from('brand_profiles')
        .select('*')
        .eq('id', brandProfileId)
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      brandProfile = profile;
    }

    const generatedPosts = [];

    // Generate posts for each platform
    for (const platform of platforms) {
      try {
        const platformPosts = await generatePostsForPlatform(
          platform,
          postType,
          topic.trim(),
          brandProfile,
          toneOverride,
          includeHashtags,
          count
        );

        // Save posts to database
        for (const postData of platformPosts) {
          const { data: savedPost, error } = await supabase
            .from('social_posts')
            .insert({
              user_id: userId,
              brand_profile_id: brandProfileId || null,
              platform,
              content: postData.content,
              hashtags: postData.hashtags || [],
              character_count: postData.content.length,
              is_draft: true,
              ai_prompt: postData.prompt,
              tone_override: toneOverride || null
            })
            .select()
            .single();

          if (!error && savedPost) {
            generatedPosts.push(savedPost);
          }
        }
      } catch (error) {
        console.error(`Failed to generate posts for ${platform}:`, error);
        // Continue with other platforms
      }
    }

    if (generatedPosts.length === 0) {
      return res.status(500).json({
        success: false,
        error: 'Failed to generate any posts'
      });
    }

    res.json({
      success: true,
      posts: generatedPosts,
      generatedCount: generatedPosts.length,
      platforms: platforms
    });

  } catch (error) {
    console.error('Social post generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate social media posts'
    });
  }
});

// Get user's social media posts
router.get('/posts', async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      brandProfileId,
      platform,
      isDraft,
      limit = 20,
      offset = 0
    } = req.query;

    let query = supabase
      .from('social_posts')
      .select('*')
      .eq('user_id', userId);

    // Apply filters
    if (brandProfileId) {
      query = query.eq('brand_profile_id', brandProfileId);
    }

    if (platform) {
      query = query.eq('platform', platform);
    }

    if (isDraft !== undefined) {
      query = query.eq('is_draft', isDraft === 'true');
    }

    // Pagination and ordering
    query = query
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    const { data: posts, error } = await query;

    if (error) throw error;

    res.json({
      success: true,
      posts: posts || [],
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: posts && posts.length === parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get social posts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch social media posts'
    });
  }
});

// Update a social media post
router.patch('/posts/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates.id;
    delete updates.user_id;
    delete updates.created_at;
    delete updates.posted_at; // Handle separately

    // Update character count if content changed
    if (updates.content) {
      updates.character_count = updates.content.length;
    }

    // Update timestamp
    updates.updated_at = new Date().toISOString();

    const { data: post, error } = await supabase
      .from('social_posts')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Post not found'
        });
      }
      throw error;
    }

    res.json({
      success: true,
      post
    });

  } catch (error) {
    console.error('Update social post error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update post'
    });
  }
});

// Schedule a social media post
router.patch('/posts/:id/schedule', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { scheduledFor } = req.body;

    if (!scheduledFor) {
      return res.status(400).json({
        success: false,
        error: 'scheduledFor timestamp is required'
      });
    }

    const { data: post, error } = await supabase
      .from('social_posts')
      .update({
        scheduled_for: scheduledFor,
        is_draft: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Post not found'
        });
      }
      throw error;
    }

    res.json({
      success: true,
      post
    });

  } catch (error) {
    console.error('Schedule post error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to schedule post'
    });
  }
});

// Mark post as published
router.patch('/posts/:id/publish', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { data: post, error } = await supabase
      .from('social_posts')
      .update({
        is_draft: false,
        posted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Post not found'
        });
      }
      throw error;
    }

    res.json({
      success: true,
      post
    });

  } catch (error) {
    console.error('Publish post error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to publish post'
    });
  }
});

// Delete a social media post
router.delete('/posts/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { error } = await supabase
      .from('social_posts')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });

  } catch (error) {
    console.error('Delete social post error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete post'
    });
  }
});

// Get platform requirements
router.get('/platforms', (req, res) => {
  res.json({
    success: true,
    platforms: PLATFORM_LIMITS
  });
});

// Helper Functions

async function generatePostsForPlatform(platform, postType, topic, brandProfile, toneOverride, includeHashtags, count) {
  const platformInfo = PLATFORM_LIMITS[platform];
  const tone = toneOverride || brandProfile?.tone_of_voice || 'professional';

  const prompt = createSocialPostPrompt(
    platform,
    postType,
    topic,
    tone,
    brandProfile,
    includeHashtags,
    platformInfo,
    count
  );

  const response = await generateWithClaude(prompt);
  return parseSocialPostResponse(response, platform, prompt);
}

function createSocialPostPrompt(platform, postType, topic, tone, brandProfile, includeHashtags, platformInfo, count) {
  let prompt = `Generate ${count} engaging ${postType} social media posts for ${platform.toUpperCase()} about: ${topic}

Platform requirements:
- Maximum ${platformInfo.maxChars} characters
- Tone: ${tone}
${includeHashtags && platformInfo.supportsHashtags ? `- Include relevant hashtags (max ${platformInfo.hashtagLimit})` : '- No hashtags needed'}

`;

  if (brandProfile) {
    prompt += `Brand context:
- Brand: ${brandProfile.name}
- Industry: ${brandProfile.industry || 'Not specified'}
- Target audience: ${brandProfile.target_audience || 'General'}
- Brand personality: ${Array.isArray(brandProfile.brand_personality) ? brandProfile.brand_personality.join(', ') : 'Professional'}
- Mission: ${brandProfile.mission || 'Not specified'}

`;
  }

  prompt += `Post type guidelines:
${getPostTypeGuidelines(postType)}

Platform-specific requirements:
${getPlatformGuidelines(platform)}

Requirements:
1. Stay within character limits
2. Match the specified tone
3. Be engaging and actionable
4. Include call-to-action where appropriate
5. Use platform best practices
6. Be authentic to the brand voice

Format as JSON array:
[
  {
    "content": "Post content here",
    "hashtags": ["hashtag1", "hashtag2"] // Only if includeHashtags is true
  }
]

Return only valid JSON, no additional text.`;

  return prompt;
}

function getPostTypeGuidelines(postType) {
  const guidelines = {
    promotional: 'Focus on products/services benefits, include clear value proposition and call-to-action',
    educational: 'Provide valuable tips, insights, or how-to information that helps the audience',
    behind_the_scenes: 'Show authentic moments, company culture, or process insights',
    user_generated: 'Encourage audience participation, ask questions, create community engagement',
    announcement: 'Share news, updates, or important information clearly and excitingly',
    inspirational: 'Motivate and inspire audience with uplifting messages and stories',
    entertaining: 'Create fun, shareable content that brings joy while staying brand-appropriate'
  };
  
  return guidelines[postType] || 'Create engaging content that resonates with your audience';
}

function getPlatformGuidelines(platform) {
  const guidelines = {
    instagram: 'Use visual language, emojis, and storytelling. Encourage saves and shares.',
    twitter: 'Be concise, timely, and conversational. Use trending topics when relevant.',
    linkedin: 'Professional tone, industry insights, thought leadership content.',
    facebook: 'Community-focused, longer-form content okay, encourage comments and discussions.',
    tiktok: 'Trendy, authentic, video-focused language. Use current slang appropriately.'
  };
  
  return guidelines[platform] || 'Follow platform best practices for engagement';
}

function parseSocialPostResponse(response, platform, originalPrompt) {
  try {
    const parsed = JSON.parse(response);
    if (Array.isArray(parsed)) {
      return parsed.map(item => ({
        content: item.content || '',
        hashtags: item.hashtags || [],
        prompt: originalPrompt
      }));
    }
  } catch (error) {
    console.error('Failed to parse social post response:', error);
    
    // Fallback parsing
    const lines = response.split('\n').filter(line => line.trim());
    const posts = [];
    
    for (const line of lines) {
      if (line.length > 10 && !line.startsWith('#') && !line.startsWith('//')) {
        // Extract hashtags
        const hashtagMatches = line.match(/#[\w]+/g) || [];
        const content = line.replace(/#[\w]+/g, '').trim();
        
        if (content.length > 0) {
          posts.push({
            content: content,
            hashtags: hashtagMatches.map(h => h.substring(1)),
            prompt: originalPrompt
          });
        }
      }
    }
    
    return posts.slice(0, 3); // Limit fallback results
  }
  
  return [];
}

export default router;