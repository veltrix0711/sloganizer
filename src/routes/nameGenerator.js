import express from 'express';
import { randomUUID } from 'crypto';
import { supabase } from '../services/supabase.js';
import { generateWithClaude } from '../services/claude.js';

const router = express.Router();

// Generate business names with AI
router.post('/generate', async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      brandProfileId,
      niche, 
      style = 'modern',
      keywords = [],
      count = 10,
      checkDomains = true
    } = req.body;

    // Validation
    if (!niche || niche.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Business niche is required and must be at least 2 characters'
      });
    }

    // Get brand profile context if provided
    let brandContext = {};
    if (brandProfileId) {
      const { data: profile } = await supabase
        .from('brand_profiles')
        .select('name, tagline, mission, tone_of_voice, target_audience, industry, brand_personality')
        .eq('id', brandProfileId)
        .eq('user_id', userId)
        .single();
      
      if (profile) {
        brandContext = profile;
      }
    }

    // Create AI prompt for name generation
    const prompt = createNameGenerationPrompt(niche, style, keywords, brandContext, count);

    // Generate names with Claude
    const aiResponse = await generateWithClaude(prompt);
    const generatedNames = parseNameResponse(aiResponse);

    if (!generatedNames || generatedNames.length === 0) {
      return res.status(500).json({
        success: false,
        error: 'Failed to generate business names'
      });
    }

    const batchId = randomUUID();
    let processedNames = generatedNames;

    // Check domain availability if requested
    if (checkDomains) {
      processedNames = await checkDomainAvailability(generatedNames);
    }

    // Save generated names to database
    const nameRecords = processedNames.map(nameData => ({
      user_id: userId,
      brand_profile_id: brandProfileId || null,
      name: nameData.name,
      niche: niche.trim(),
      style: nameData.style || style,
      domain_available: nameData.domainAvailable || null,
      domain_checked_at: checkDomains ? new Date().toISOString() : null,
      available_extensions: nameData.availableExtensions || [],
      ai_prompt: prompt,
      generation_batch_id: batchId
    }));

    const { data: savedNames, error } = await supabase
      .from('brand_names')
      .insert(nameRecords)
      .select();

    if (error) throw error;

    res.json({
      success: true,
      names: savedNames,
      batchId,
      domainCheckEnabled: checkDomains
    });

  } catch (error) {
    console.error('Name generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate business names'
    });
  }
});

// Check domain availability for existing names
router.post('/check-domains', async (req, res) => {
  try {
    const userId = req.user.id;
    const { nameIds } = req.body;

    if (!nameIds || !Array.isArray(nameIds) || nameIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Name IDs array is required'
      });
    }

    // Get names from database
    const { data: names, error } = await supabase
      .from('brand_names')
      .select('id, name')
      .in('id', nameIds)
      .eq('user_id', userId);

    if (error) throw error;

    if (!names || names.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No names found'
      });
    }

    // Check domain availability
    const domainResults = await checkDomainAvailability(
      names.map(n => ({ name: n.name, id: n.id }))
    );

    // Update database with results
    const updates = domainResults.map(result => ({
      id: result.id,
      domain_available: result.domainAvailable,
      domain_checked_at: new Date().toISOString(),
      available_extensions: result.availableExtensions || []
    }));

    const updatePromises = updates.map(update => 
      supabase
        .from('brand_names')
        .update({
          domain_available: update.domain_available,
          domain_checked_at: update.domain_checked_at,
          available_extensions: update.available_extensions
        })
        .eq('id', update.id)
        .eq('user_id', userId)
    );

    await Promise.all(updatePromises);

    res.json({
      success: true,
      results: domainResults
    });

  } catch (error) {
    console.error('Domain check error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check domain availability'
    });
  }
});

// Get user's generated names
router.get('/names', async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      brandProfileId,
      includeAllProfiles = false,
      favoritesOnly = false,
      limit = 50,
      offset = 0
    } = req.query;

    let query = supabase
      .from('brand_names')
      .select('*')
      .eq('user_id', userId);

    // Filter by brand profile
    if (brandProfileId && !includeAllProfiles) {
      query = query.eq('brand_profile_id', brandProfileId);
    }

    // Filter favorites only
    if (favoritesOnly === 'true') {
      query = query.eq('is_favorite', true);
    }

    // Pagination and ordering
    query = query
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    const { data: names, error } = await query;

    if (error) throw error;

    res.json({
      success: true,
      names: names || [],
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: names && names.length === parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get names error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch generated names'
    });
  }
});

// Toggle favorite status
router.patch('/names/:id/favorite', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { isFavorite } = req.body;

    const { data: name, error } = await supabase
      .from('brand_names')
      .update({ is_favorite: isFavorite })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Name not found'
        });
      }
      throw error;
    }

    res.json({
      success: true,
      name
    });

  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update favorite status'
    });
  }
});

// Mark name as claimed (domain purchased)
router.patch('/names/:id/claim', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { data: name, error } = await supabase
      .from('brand_names')
      .update({ is_claimed: true })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Name not found'
        });
      }
      throw error;
    }

    res.json({
      success: true,
      name
    });

  } catch (error) {
    console.error('Claim name error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to claim name'
    });
  }
});

// Delete a generated name
router.delete('/names/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { error } = await supabase
      .from('brand_names')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Name deleted successfully'
    });

  } catch (error) {
    console.error('Delete name error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete name'
    });
  }
});

// Helper Functions

function createNameGenerationPrompt(niche, style, keywords, brandContext, count) {
  let prompt = `Generate ${count} creative and memorable business names for a ${niche} business.

Style preference: ${style}
${keywords.length > 0 ? `Keywords to consider: ${keywords.join(', ')}` : ''}

`;

  if (brandContext.name) {
    prompt += `Brand context:
- Current brand: ${brandContext.name}
- Tagline: ${brandContext.tagline || 'Not specified'}
- Mission: ${brandContext.mission || 'Not specified'}
- Tone: ${brandContext.tone_of_voice || 'Not specified'}
- Target audience: ${brandContext.target_audience || 'Not specified'}
- Industry: ${brandContext.industry || 'Not specified'}

`;
  }

  prompt += `Requirements:
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

  return prompt;
}

function parseNameResponse(response) {
  try {
    // Try to parse as JSON first
    const parsed = JSON.parse(response);
    if (Array.isArray(parsed)) {
      return parsed.map(item => ({
        name: item.name,
        style: item.style || 'modern',
        reasoning: item.reasoning || ''
      }));
    }
  } catch (error) {
    // Fallback: try to extract names from text response
    const lines = response.split('\n').filter(line => line.trim());
    const names = [];
    
    for (const line of lines) {
      if (line.includes('name') || line.match(/^\d+\./)) {
        const nameMatch = line.match(/["""]([^"""]+)["""]|(\w+(?:\s+\w+){0,2})/);
        if (nameMatch) {
          names.push({
            name: nameMatch[1] || nameMatch[2],
            style: 'modern',
            reasoning: 'Generated name'
          });
        }
      }
    }
    
    return names;
  }
  
  return [];
}

async function checkDomainAvailability(names) {
  const results = [];
  
  for (const nameData of names) {
    const domainName = nameData.name.toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 63); // Max domain length
    
    if (domainName.length < 1) {
      results.push({
        ...nameData,
        domainAvailable: false,
        availableExtensions: []
      });
      continue;
    }

    try {
      // Check common TLDs
      const extensions = ['.com', '.net', '.org', '.io', '.co'];
      const availableExtensions = [];

      for (const ext of extensions) {
        const available = await checkSingleDomain(domainName + ext);
        if (available) {
          availableExtensions.push(ext);
        }
      }

      results.push({
        ...nameData,
        domainAvailable: availableExtensions.length > 0,
        availableExtensions
      });

    } catch (error) {
      console.error('Domain check error for:', domainName, error);
      results.push({
        ...nameData,
        domainAvailable: null,
        availableExtensions: []
      });
    }

    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  return results;
}

async function checkSingleDomain(domain) {
  try {
    // Using a simple DNS lookup to check domain availability
    // In production, you might want to use a proper domain availability API
    const fetch = (await import('node-fetch')).default;
    
    const response = await fetch(`https://dns.google/resolve?name=${domain}&type=A`, {
      timeout: 3000
    });
    
    const data = await response.json();
    
    // If DNS resolution fails, domain might be available
    return !data.Answer || data.Answer.length === 0;
    
  } catch (error) {
    // If request fails, assume domain might be available
    return true;
  }
}

export default router;