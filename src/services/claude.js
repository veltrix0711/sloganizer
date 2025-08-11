import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Generic Claude generation function for brand profile features
export const generateWithClaude = async (prompt) => {
  try {
    // Use the Anthropic API directly
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    return response.content[0].text.trim();
  } catch (error) {
    console.error('Claude generation error:', error);
    throw new Error('Failed to generate content with Claude');
  }
};

// Specific function for business name generation
export const generateBusinessNames = async (niche, style, keywords, brandContext, count) => {
  const prompt = `Generate ${count} creative and memorable business names for a ${niche} business.

Style preference: ${style}
${keywords.length > 0 ? `Keywords to consider: ${keywords.join(', ')}` : ''}

${brandContext.name ? `Brand context:
- Current brand: ${brandContext.name}
- Tagline: ${brandContext.tagline || 'Not specified'}
- Tone: ${brandContext.tone_of_voice || 'Not specified'}
- Target audience: ${brandContext.target_audience || 'Not specified'}
- Industry: ${brandContext.industry || 'Not specified'}
` : ''}

Requirements:
1. Names should be 1-3 words
2. Easy to pronounce and remember
3. Suitable for domain registration
4. Avoid trademark conflicts
5. Match the specified style and niche

For each name, also suggest:
- The style category (compound, invented, descriptive, abstract, etc.)
- Why it works for this business

Format your response as a JSON array with this structure:
[
  {
    "name": "Business Name",
    "style": "compound", 
    "reasoning": "Why this name works"
  }
]

Only return valid JSON, no additional text.`;

  return generateWithClaude(prompt);
};

// Specific function for social media post generation
export const generateSocialPosts = async (platform, postType, topic, tone, brandContext, includeHashtags, platformInfo, count) => {
  let prompt = `Generate ${count} engaging ${postType} social media posts for ${platform.toUpperCase()} about: ${topic}

Platform requirements:
- Maximum ${platformInfo.maxChars} characters
- Tone: ${tone}
${includeHashtags && platformInfo.supportsHashtags ? `- Include relevant hashtags (max ${platformInfo.hashtagLimit})` : '- No hashtags needed'}

`;

  if (brandContext) {
    prompt += `Brand context:
- Brand: ${brandContext.name}
- Industry: ${brandContext.industry || 'Not specified'}
- Target audience: ${brandContext.target_audience || 'General'}
- Brand personality: ${Array.isArray(brandContext.brand_personality) ? brandContext.brand_personality.join(', ') : 'Professional'}
- Mission: ${brandContext.mission || 'Not specified'}

`;
  }

  prompt += `Requirements:
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

  return generateWithClaude(prompt);
};