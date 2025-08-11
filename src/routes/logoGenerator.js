import express from 'express';
import { supabase } from '../services/supabase.js';
import { generateWithClaude } from '../services/claude.js';

const router = express.Router();

// Generate logo with AI
router.post('/generate', async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      brandProfileId,
      style = 'modern',
      concept,
      colors = [],
      includeText = false,
      iterations = 4
    } = req.body;

    // Validation
    if (!concept || concept.trim().length < 3) {
      return res.status(400).json({
        success: false,
        error: 'Logo concept is required and must be at least 3 characters'
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

    // Create background job for async processing
    const jobData = {
      user_id: userId,
      job_type: 'logo_generation',
      status: 'pending',
      input_data: {
        brandProfileId,
        style,
        concept: concept.trim(),
        colors,
        includeText,
        iterations,
        brandContext: brandProfile
      }
    };

    const { data: job, error: jobError } = await supabase
      .from('background_jobs')
      .insert(jobData)
      .select()
      .single();

    if (jobError) throw jobError;

    // Start async processing
    processLogoGeneration(job.id, jobData.input_data).catch(error => {
      console.error('Logo generation background job failed:', error);
    });

    res.json({
      success: true,
      jobId: job.id,
      status: 'processing',
      message: 'Logo generation started. This may take 1-2 minutes.'
    });

  } catch (error) {
    console.error('Logo generation initiation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start logo generation'
    });
  }
});

// Get all logo generation jobs for user
router.get('/jobs', async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, limit = 50, offset = 0 } = req.query;

    let query = supabase
      .from('background_jobs')
      .select('*')
      .eq('user_id', userId)
      .eq('job_type', 'logo_generation')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: jobs, error } = await query;

    if (error) throw error;

    res.json({
      success: true,
      jobs: jobs || []
    });
  } catch (error) {
    console.error('Get logo jobs error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch logo generation jobs' 
    });
  }
});

// Check logo generation job status
router.get('/jobs/:jobId', async (req, res) => {
  try {
    const userId = req.user.id;
    const { jobId } = req.params;

    const { data: job, error } = await supabase
      .from('background_jobs')
      .select('*')
      .eq('id', jobId)
      .eq('user_id', userId)
      .eq('job_type', 'logo_generation')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Job not found'
        });
      }
      throw error;
    }

    let assets = [];
    if (job.status === 'completed' && job.output_data?.assetIds) {
      const { data: logoAssets, error: assetsError } = await supabase
        .from('brand_assets')
        .select('*')
        .in('id', job.output_data.assetIds)
        .eq('user_id', userId);

      if (!assetsError) {
        assets = logoAssets || [];
      }
    }

    res.json({
      success: true,
      job: {
        id: job.id,
        status: job.status,
        createdAt: job.created_at,
        completedAt: job.completed_at,
        errorMessage: job.error_message,
        progress: job.output_data?.progress || 0
      },
      assets
    });

  } catch (error) {
    console.error('Get logo job error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch job status'
    });
  }
});

// Get user's logo assets
router.get('/assets', async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      brandProfileId,
      assetType = 'logo',
      limit = 20,
      offset = 0 
    } = req.query;

    let query = supabase
      .from('brand_assets')
      .select('*')
      .eq('user_id', userId)
      .eq('asset_type', assetType);

    if (brandProfileId) {
      query = query.eq('brand_profile_id', brandProfileId);
    }

    query = query
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    const { data: assets, error } = await query;

    if (error) throw error;

    res.json({
      success: true,
      assets: assets || [],
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: assets && assets.length === parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get logo assets error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch logo assets'
    });
  }
});

// Set logo as primary for brand profile
router.patch('/assets/:assetId/primary', async (req, res) => {
  try {
    const userId = req.user.id;
    const { assetId } = req.params;

    // Get the asset to check ownership and get brand profile
    const { data: asset, error: fetchError } = await supabase
      .from('brand_assets')
      .select('id, brand_profile_id, asset_type')
      .eq('id', assetId)
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Asset not found'
        });
      }
      throw fetchError;
    }

    // Unset any existing primary assets of the same type for this brand profile
    if (asset.brand_profile_id) {
      await supabase
        .from('brand_assets')
        .update({ is_primary: false })
        .eq('brand_profile_id', asset.brand_profile_id)
        .eq('asset_type', asset.asset_type)
        .eq('user_id', userId);
    }

    // Set this asset as primary
    const { data: updatedAsset, error } = await supabase
      .from('brand_assets')
      .update({ is_primary: true })
      .eq('id', assetId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      asset: updatedAsset
    });

  } catch (error) {
    console.error('Set primary logo error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to set primary logo'
    });
  }
});

// Delete a logo asset
router.delete('/assets/:assetId', async (req, res) => {
  try {
    const userId = req.user.id;
    const { assetId } = req.params;

    // Get asset info before deletion
    const { data: asset, error: fetchError } = await supabase
      .from('brand_assets')
      .select('file_path')
      .eq('id', assetId)
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Asset not found'
        });
      }
      throw fetchError;
    }

    // Delete from storage
    if (asset.file_path) {
      const { error: storageError } = await supabase.storage
        .from('brand-assets')
        .remove([asset.file_path]);

      if (storageError) {
        console.error('Storage deletion error:', storageError);
      }
    }

    // Delete from database
    const { error } = await supabase
      .from('brand_assets')
      .delete()
      .eq('id', assetId)
      .eq('user_id', userId);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Asset deleted successfully'
    });

  } catch (error) {
    console.error('Delete logo asset error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete asset'
    });
  }
});

// Background Processing Functions

async function processLogoGeneration(jobId, inputData) {
  try {
    // Update job status to processing
    await supabase
      .from('background_jobs')
      .update({
        status: 'processing',
        started_at: new Date().toISOString()
      })
      .eq('id', jobId);

    const {
      brandProfileId,
      style,
      concept,
      colors,
      includeText,
      iterations,
      brandContext
    } = inputData;

    // Generate optimized prompts for Stability AI
    const prompts = await generateLogoPrompts(concept, style, colors, brandContext, includeText);
    
    const generatedAssets = [];
    
    for (let i = 0; i < Math.min(iterations, prompts.length); i++) {
      try {
        // Update progress
        await supabase
          .from('background_jobs')
          .update({
            output_data: { progress: Math.round((i / iterations) * 80) }
          })
          .eq('id', jobId);

        // Generate logo with Stability AI
        const logoImage = await generateLogoWithStabilityAI(prompts[i]);
        
        if (logoImage) {
          // Upload to Supabase Storage
          const asset = await saveLogoAsset(
            inputData.user_id || (await getJobUserId(jobId)),
            brandProfileId,
            logoImage,
            prompts[i],
            i
          );
          
          if (asset) {
            generatedAssets.push(asset.id);
          }
        }

        // Small delay between generations
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`Logo generation iteration ${i} failed:`, error);
        // Continue with other iterations
      }
    }

    if (generatedAssets.length > 0) {
      // Job completed successfully
      await supabase
        .from('background_jobs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          output_data: {
            progress: 100,
            assetIds: generatedAssets,
            generatedCount: generatedAssets.length
          }
        })
        .eq('id', jobId);
    } else {
      // Job failed - no assets generated
      await supabase
        .from('background_jobs')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_message: 'Failed to generate any logo assets'
        })
        .eq('id', jobId);
    }

  } catch (error) {
    console.error('Logo generation job failed:', error);
    
    // Update job status to failed
    await supabase
      .from('background_jobs')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_message: error.message || 'Logo generation failed'
      })
      .eq('id', jobId);
  }
}

async function generateLogoPrompts(concept, style, colors, brandContext, includeText) {
  const prompt = `Generate 4 optimized logo prompts for Stability AI image generation.

Business concept: ${concept}
Style: ${style}
Colors: ${colors.length > 0 ? colors.join(', ') : 'brand appropriate'}
Include text: ${includeText}

${brandContext ? `Brand context:
- Name: ${brandContext.name}
- Industry: ${brandContext.industry || 'Not specified'}
- Tone: ${brandContext.tone_of_voice || 'professional'}
- Target audience: ${brandContext.target_audience || 'general'}
` : ''}

Requirements for each prompt:
1. Be specific about logo design elements
2. Mention it should be suitable for business use
3. Specify clean, professional design
4. Include style and color guidance
5. Keep under 200 characters each
6. Avoid copyrighted references

Return as JSON array of strings:
["prompt 1", "prompt 2", "prompt 3", "prompt 4"]`;

  try {
    const response = await generateWithClaude(prompt);
    const prompts = JSON.parse(response);
    
    if (Array.isArray(prompts) && prompts.length > 0) {
      return prompts;
    }
  } catch (error) {
    console.error('Prompt generation failed:', error);
  }

  // Fallback prompts
  return [
    `Professional ${style} logo for ${concept}, clean design, suitable for business use`,
    `Modern minimal logo design for ${concept} business, simple and memorable`,
    `Creative ${style} style logo for ${concept}, professional appearance`,
    `Clean business logo for ${concept}, ${style} design, corporate suitable`
  ];
}

async function generateLogoWithStabilityAI(prompt) {
  try {
    // This is a placeholder for Stability AI integration
    // In production, you would use the actual Stability API
    
    const stabilityApiKey = process.env.STABILITY_API_KEY;
    if (!stabilityApiKey) {
      console.warn('Stability API key not configured');
      return null;
    }

    const fetch = (await import('node-fetch')).default;
    
    const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stabilityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text_prompts: [
          {
            text: `${prompt}, logo design, transparent background, high quality, professional`,
            weight: 1
          },
          {
            text: 'blurry, low quality, pixelated, watermark, text artifacts',
            weight: -1
          }
        ],
        cfg_scale: 7,
        height: 1024,
        width: 1024,
        steps: 30,
        samples: 1,
      }),
      timeout: 60000 // 60 second timeout
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Stability API error:', response.status, error);
      return null;
    }

    const result = await response.json();
    
    if (result.artifacts && result.artifacts.length > 0) {
      // Return base64 image data
      return {
        base64: result.artifacts[0].base64,
        seed: result.artifacts[0].seed
      };
    }

    return null;

  } catch (error) {
    console.error('Stability AI generation error:', error);
    return null;
  }
}

async function saveLogoAsset(userId, brandProfileId, logoImage, prompt, iteration) {
  try {
    if (!logoImage || !logoImage.base64) {
      return null;
    }

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(logoImage.base64, 'base64');
    const fileName = `logo-${Date.now()}-${iteration}.png`;
    const filePath = `${userId}/${fileName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('brand-assets')
      .upload(filePath, imageBuffer, {
        contentType: 'image/png',
        upsert: false
      });

    if (uploadError) {
      console.error('Logo upload error:', uploadError);
      return null;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('brand-assets')
      .getPublicUrl(filePath);

    // Save asset record to database
    const { data: asset, error } = await supabase
      .from('brand_assets')
      .insert({
        user_id: userId,
        brand_profile_id: brandProfileId,
        asset_type: 'logo',
        file_name: fileName,
        file_path: filePath,
        file_url: publicUrl,
        file_size: imageBuffer.length,
        mime_type: 'image/png',
        width: 1024,
        height: 1024,
        is_primary: false,
        ai_prompt: prompt,
        ai_model: 'stability-diffusion-xl',
        generation_params: {
          seed: logoImage.seed,
          iteration: iteration
        }
      })
      .select()
      .single();

    if (error) {
      console.error('Logo asset save error:', error);
      return null;
    }

    return asset;

  } catch (error) {
    console.error('Save logo asset error:', error);
    return null;
  }
}

async function getJobUserId(jobId) {
  const { data: job } = await supabase
    .from('background_jobs')
    .select('user_id')
    .eq('id', jobId)
    .single();
  
  return job?.user_id;
}

export default router;