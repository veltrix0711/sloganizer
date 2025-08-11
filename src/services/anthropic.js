import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

class AnthropicService {
  async generateSlogans({ companyName, industry, brandPersonality, keywords = [], tone = 'casual', maxSlogans = 5 }) {
    try {
      const keywordText = keywords.length > 0 ? `Keywords to include: ${keywords.join(', ')}\n` : '';
      
      const prompt = `Generate ${maxSlogans} creative and memorable marketing slogans for a company with the following details:

Company Name: ${companyName}
Industry: ${industry}
Brand Personality: ${brandPersonality}
Tone: ${tone}
${keywordText}

Requirements:
- Each slogan should be unique and memorable
- Keep slogans between 3-8 words
- Match the specified brand personality and tone
- Be appropriate for the ${industry} industry
- Avoid generic or overused phrases
- Make them catchy and impactful

Please return exactly ${maxSlogans} slogans, one per line, without numbering or additional formatting.`;

      const response = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const content = response.content[0].text;
      console.log('Claude API Response content:', content);
      
      const slogans = content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && !line.match(/^\d+\./))
        .slice(0, maxSlogans);

      console.log('Parsed slogans:', slogans);
      return slogans.length >= Math.min(3, maxSlogans) ? slogans : this.getFallbackSlogans(companyName, maxSlogans);
    } catch (error) {
      console.error('Anthropic API error:', error);
      return this.getFallbackSlogans(companyName, maxSlogans);
    }
  }

  getFallbackSlogans(companyName, maxSlogans = 5) {
    const fallbacks = [
      `${companyName} - Your Success Story Starts Here`,
      `Experience Excellence with ${companyName}`,
      `${companyName} - Innovation Meets Excellence`,
      `Trust ${companyName} for Quality Results`,
      `${companyName} - Where Dreams Become Reality`
    ];
    return fallbacks.slice(0, maxSlogans);
  }

  async generateSingleSlogan({ companyName, industry, brandPersonality }) {
    try {
      const prompt = `Create one perfect marketing slogan for:
Company: ${companyName}
Industry: ${industry}
Brand Personality: ${brandPersonality}

Make it memorable, concise (3-7 words), and perfectly suited for this brand.`;

      const response = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 100,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      return response.content[0].text.trim();
    } catch (error) {
      console.error('Anthropic API error:', error);
      return `${companyName} - Excellence Delivered`;
    }
  }
}

export const anthropicService = new AnthropicService();