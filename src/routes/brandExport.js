import express from 'express';
import { supabase } from '../services/supabase.js';

const router = express.Router();

// Create a brand kit export
router.post('/brand-kit', async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      brandProfileId,
      exportType = 'pdf',
      exportOptions = {}
    } = req.body;

    // Validation
    if (!brandProfileId) {
      return res.status(400).json({
        success: false,
        error: 'Brand profile ID is required'
      });
    }

    if (!['pdf', 'notion', 'markdown'].includes(exportType)) {
      return res.status(400).json({
        success: false,
        error: 'Export type must be pdf, notion, or markdown'
      });
    }

    // Check if brand profile exists and belongs to user
    const { data: brandProfile, error: profileError } = await supabase
      .from('brand_profiles')
      .select(`
        *,
        brand_assets!brand_assets_brand_profile_id_fkey(
          id,
          asset_type,
          file_name,
          file_url,
          is_primary,
          width,
          height
        )
      `)
      .eq('id', brandProfileId)
      .eq('user_id', userId)
      .single();

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Brand profile not found'
        });
      }
      throw profileError;
    }

    // Check for existing pending/processing export
    const { data: existingExport } = await supabase
      .from('brand_exports')
      .select('id, status, created_at')
      .eq('brand_profile_id', brandProfileId)
      .eq('user_id', userId)
      .eq('export_type', exportType)
      .in('status', ['pending', 'processing'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (existingExport) {
      return res.status(409).json({
        success: false,
        error: 'Export already in progress',
        exportId: existingExport.id
      });
    }

    // Create export record
    const exportData = {
      user_id: userId,
      brand_profile_id: brandProfileId,
      export_type: exportType,
      status: 'pending',
      export_options: {
        includeLogo: exportOptions.includeLogo !== false,
        includeColors: exportOptions.includeColors !== false,
        includeFonts: exportOptions.includeFonts !== false,
        includeGuidelines: exportOptions.includeGuidelines !== false,
        includeAssets: exportOptions.includeAssets !== false,
        template: exportOptions.template || 'standard',
        ...exportOptions
      }
    };

    const { data: exportRecord, error: insertError } = await supabase
      .from('brand_exports')
      .insert(exportData)
      .select()
      .single();

    if (insertError) throw insertError;

    // Start background processing
    processBrandExport(exportRecord.id, brandProfile, exportData.export_options)
      .catch(error => {
        console.error('Brand export processing failed:', error);
      });

    res.json({
      success: true,
      exportId: exportRecord.id,
      status: 'processing',
      estimatedTime: getEstimatedTime(exportType),
      message: `Brand kit export started. This may take ${getEstimatedTime(exportType)}.`
    });

  } catch (error) {
    console.error('Brand export creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create brand export'
    });
  }
});

// Get export status and download
router.get('/exports/:exportId', async (req, res) => {
  try {
    const userId = req.user.id;
    const { exportId } = req.params;

    const { data: exportRecord, error } = await supabase
      .from('brand_exports')
      .select('*')
      .eq('id', exportId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Export not found'
        });
      }
      throw error;
    }

    // Check if export has expired
    if (exportRecord.expires_at && new Date(exportRecord.expires_at) < new Date()) {
      return res.status(410).json({
        success: false,
        error: 'Export has expired',
        export: {
          id: exportRecord.id,
          status: 'expired',
          createdAt: exportRecord.created_at
        }
      });
    }

    res.json({
      success: true,
      export: {
        id: exportRecord.id,
        status: exportRecord.status,
        exportType: exportRecord.export_type,
        createdAt: exportRecord.created_at,
        processedAt: exportRecord.processed_at,
        expiresAt: exportRecord.expires_at,
        downloadUrl: exportRecord.file_url,
        fileSize: exportRecord.file_size,
        errorMessage: exportRecord.error_message
      }
    });

  } catch (error) {
    console.error('Get export error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch export'
    });
  }
});

// List user's exports
router.get('/exports', async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      brandProfileId,
      exportType,
      status,
      limit = 20,
      offset = 0
    } = req.query;

    let query = supabase
      .from('brand_exports')
      .select(`
        id,
        brand_profile_id,
        export_type,
        status,
        file_size,
        created_at,
        processed_at,
        expires_at,
        brand_profiles!brand_exports_brand_profile_id_fkey(name)
      `)
      .eq('user_id', userId);

    // Apply filters
    if (brandProfileId) {
      query = query.eq('brand_profile_id', brandProfileId);
    }

    if (exportType) {
      query = query.eq('export_type', exportType);
    }

    if (status) {
      query = query.eq('status', status);
    }

    // Pagination and ordering
    query = query
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    const { data: exports, error } = await query;

    if (error) throw error;

    res.json({
      success: true,
      exports: exports || [],
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: exports && exports.length === parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get exports error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch exports'
    });
  }
});

// Delete an export
router.delete('/exports/:exportId', async (req, res) => {
  try {
    const userId = req.user.id;
    const { exportId } = req.params;

    // Get export info before deletion
    const { data: exportRecord, error: fetchError } = await supabase
      .from('brand_exports')
      .select('file_path')
      .eq('id', exportId)
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Export not found'
        });
      }
      throw fetchError;
    }

    // Delete file from storage if exists
    if (exportRecord.file_path) {
      const { error: storageError } = await supabase.storage
        .from('brand-exports')
        .remove([exportRecord.file_path]);

      if (storageError) {
        console.error('Storage deletion error:', storageError);
      }
    }

    // Delete export record
    const { error } = await supabase
      .from('brand_exports')
      .delete()
      .eq('id', exportId)
      .eq('user_id', userId);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Export deleted successfully'
    });

  } catch (error) {
    console.error('Delete export error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete export'
    });
  }
});

// Background Processing Functions

async function processBrandExport(exportId, brandProfile, exportOptions) {
  try {
    // Update status to processing
    await supabase
      .from('brand_exports')
      .update({
        status: 'processing'
      })
      .eq('id', exportId);

    const exportType = (await getExportType(exportId));
    let exportResult;

    switch (exportType) {
      case 'pdf':
        exportResult = await generatePDFExport(brandProfile, exportOptions);
        break;
      case 'notion':
        exportResult = await generateNotionExport(brandProfile, exportOptions);
        break;
      case 'markdown':
        exportResult = await generateMarkdownExport(brandProfile, exportOptions);
        break;
      default:
        throw new Error('Unsupported export type');
    }

    if (exportResult.success) {
      // Upload file and update record
      await supabase
        .from('brand_exports')
        .update({
          status: 'completed',
          file_path: exportResult.filePath,
          file_url: exportResult.fileUrl,
          file_size: exportResult.fileSize,
          processed_at: new Date().toISOString()
        })
        .eq('id', exportId);
    } else {
      throw new Error(exportResult.error || 'Export generation failed');
    }

  } catch (error) {
    console.error('Brand export processing error:', error);

    await supabase
      .from('brand_exports')
      .update({
        status: 'failed',
        error_message: error.message,
        processed_at: new Date().toISOString()
      })
      .eq('id', exportId);
  }
}

async function generatePDFExport(brandProfile, exportOptions) {
  try {
    // This is a placeholder for PDF generation
    // In production, you would use a library like Puppeteer or jsPDF
    
    const htmlContent = generateBrandKitHTML(brandProfile, exportOptions);
    
    // Simulate PDF generation delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // For now, create a simple text export as placeholder
    const textContent = generateBrandKitText(brandProfile, exportOptions);
    const fileName = `brand-kit-${brandProfile.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.txt`;
    const filePath = `${brandProfile.user_id}/${fileName}`;
    
    // Upload to storage
    const { data, error } = await supabase.storage
      .from('brand-exports')
      .upload(filePath, textContent, {
        contentType: 'text/plain',
        upsert: false
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('brand-exports')
      .getPublicUrl(filePath);

    return {
      success: true,
      filePath,
      fileUrl: publicUrl,
      fileSize: Buffer.byteLength(textContent, 'utf8')
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function generateNotionExport(brandProfile, exportOptions) {
  try {
    const notionMarkdown = generateNotionMarkdown(brandProfile, exportOptions);
    const fileName = `brand-kit-notion-${brandProfile.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.md`;
    const filePath = `${brandProfile.user_id}/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('brand-exports')
      .upload(filePath, notionMarkdown, {
        contentType: 'text/markdown',
        upsert: false
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('brand-exports')
      .getPublicUrl(filePath);

    return {
      success: true,
      filePath,
      fileUrl: publicUrl,
      fileSize: Buffer.byteLength(notionMarkdown, 'utf8')
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function generateMarkdownExport(brandProfile, exportOptions) {
  try {
    const markdown = generateBrandKitMarkdown(brandProfile, exportOptions);
    const fileName = `brand-kit-${brandProfile.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.md`;
    const filePath = `${brandProfile.user_id}/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('brand-exports')
      .upload(filePath, markdown, {
        contentType: 'text/markdown',
        upsert: false
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('brand-exports')
      .getPublicUrl(filePath);

    return {
      success: true,
      filePath,
      fileUrl: publicUrl,
      fileSize: Buffer.byteLength(markdown, 'utf8')
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Content Generation Functions

function generateBrandKitHTML(brandProfile, options) {
  const { brand_assets = [] } = brandProfile;
  const primaryLogo = brand_assets.find(asset => asset.asset_type === 'logo' && asset.is_primary);

  return `
<!DOCTYPE html>
<html>
<head>
    <title>${brandProfile.name} Brand Kit</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { text-align: center; margin-bottom: 40px; }
        .section { margin-bottom: 30px; }
        .color-palette { display: flex; gap: 20px; }
        .color-swatch { width: 80px; height: 80px; border-radius: 8px; }
    </style>
</head>
<body>
    <div class="header">
        ${primaryLogo ? `<img src="${primaryLogo.file_url}" alt="${brandProfile.name} Logo" style="max-width: 200px;">` : ''}
        <h1>${brandProfile.name}</h1>
        ${brandProfile.tagline ? `<p style="font-size: 18px; color: #666;">${brandProfile.tagline}</p>` : ''}
    </div>
    
    ${options.includeColors ? `
    <div class="section">
        <h2>Brand Colors</h2>
        <div class="color-palette">
            ${brandProfile.primary_color ? `<div style="background: ${brandProfile.primary_color};" class="color-swatch"></div>` : ''}
            ${brandProfile.secondary_color ? `<div style="background: ${brandProfile.secondary_color};" class="color-swatch"></div>` : ''}
            ${brandProfile.accent_color ? `<div style="background: ${brandProfile.accent_color};" class="color-swatch"></div>` : ''}
        </div>
    </div>` : ''}
    
    ${options.includeFonts ? `
    <div class="section">
        <h2>Typography</h2>
        <p>Primary Font: ${brandProfile.primary_font}</p>
        <p>Secondary Font: ${brandProfile.secondary_font}</p>
    </div>` : ''}
    
    <div class="section">
        <h2>Brand Voice</h2>
        <p>Tone: ${brandProfile.tone_of_voice || 'Professional'}</p>
        <p>Target Audience: ${brandProfile.target_audience || 'Not specified'}</p>
        ${brandProfile.mission ? `<p>Mission: ${brandProfile.mission}</p>` : ''}
    </div>
</body>
</html>`;
}

function generateBrandKitText(brandProfile, options) {
  let content = `${brandProfile.name.toUpperCase()} BRAND KIT\n`;
  content += '='.repeat(brandProfile.name.length + 10) + '\n\n';

  if (brandProfile.tagline) {
    content += `Tagline: ${brandProfile.tagline}\n\n`;
  }

  if (brandProfile.mission) {
    content += `Mission: ${brandProfile.mission}\n\n`;
  }

  if (options.includeColors) {
    content += 'BRAND COLORS:\n';
    if (brandProfile.primary_color) content += `Primary: ${brandProfile.primary_color}\n`;
    if (brandProfile.secondary_color) content += `Secondary: ${brandProfile.secondary_color}\n`;
    if (brandProfile.accent_color) content += `Accent: ${brandProfile.accent_color}\n`;
    content += '\n';
  }

  if (options.includeFonts) {
    content += 'TYPOGRAPHY:\n';
    content += `Primary Font: ${brandProfile.primary_font}\n`;
    content += `Secondary Font: ${brandProfile.secondary_font}\n\n`;
  }

  content += 'BRAND VOICE:\n';
  content += `Tone: ${brandProfile.tone_of_voice || 'Professional'}\n`;
  content += `Target Audience: ${brandProfile.target_audience || 'Not specified'}\n`;
  if (brandProfile.brand_personality && Array.isArray(brandProfile.brand_personality)) {
    content += `Personality: ${brandProfile.brand_personality.join(', ')}\n`;
  }
  content += `Industry: ${brandProfile.industry || 'Not specified'}\n\n`;

  content += `Generated on: ${new Date().toLocaleDateString()}\n`;
  content += 'Created with Launchzone Brand Kit Generator\n';

  return content;
}

function generateNotionMarkdown(brandProfile, options) {
  return generateBrandKitMarkdown(brandProfile, options, true);
}

function generateBrandKitMarkdown(brandProfile, options, forNotion = false) {
  const { brand_assets = [] } = brandProfile;
  const primaryLogo = brand_assets.find(asset => asset.asset_type === 'logo' && asset.is_primary);

  let content = `# ${brandProfile.name} Brand Kit\n\n`;

  if (primaryLogo && options.includeLogo) {
    content += `![${brandProfile.name} Logo](${primaryLogo.file_url})\n\n`;
  }

  if (brandProfile.tagline) {
    content += `> ${brandProfile.tagline}\n\n`;
  }

  if (brandProfile.mission) {
    content += `## Mission\n${brandProfile.mission}\n\n`;
  }

  if (options.includeColors) {
    content += '## Brand Colors\n\n';
    if (brandProfile.primary_color) {
      content += `**Primary Color:** ${brandProfile.primary_color}\n`;
    }
    if (brandProfile.secondary_color) {
      content += `**Secondary Color:** ${brandProfile.secondary_color}\n`;
    }
    if (brandProfile.accent_color) {
      content += `**Accent Color:** ${brandProfile.accent_color}\n`;
    }
    content += '\n';
  }

  if (options.includeFonts) {
    content += '## Typography\n\n';
    content += `**Primary Font:** ${brandProfile.primary_font}\n`;
    content += `**Secondary Font:** ${brandProfile.secondary_font}\n\n`;
  }

  content += '## Brand Voice\n\n';
  content += `**Tone:** ${brandProfile.tone_of_voice || 'Professional'}\n`;
  content += `**Target Audience:** ${brandProfile.target_audience || 'Not specified'}\n`;
  
  if (brandProfile.brand_personality && Array.isArray(brandProfile.brand_personality)) {
    content += `**Personality Traits:** ${brandProfile.brand_personality.join(', ')}\n`;
  }
  
  content += `**Industry:** ${brandProfile.industry || 'Not specified'}\n\n`;

  if (brandProfile.website_url) {
    content += `**Website:** ${brandProfile.website_url}\n\n`;
  }

  if (forNotion) {
    content += '---\n';
    content += '*This brand kit was generated using Launchzone Brand Kit Generator*\n';
  } else {
    content += `---\n*Generated on ${new Date().toLocaleDateString()} with Launchzone*\n`;
  }

  return content;
}

// Helper Functions

async function getExportType(exportId) {
  const { data } = await supabase
    .from('brand_exports')
    .select('export_type')
    .eq('id', exportId)
    .single();
  
  return data?.export_type;
}

function getEstimatedTime(exportType) {
  const times = {
    pdf: '1-2 minutes',
    notion: '30 seconds',
    markdown: '30 seconds'
  };
  
  return times[exportType] || '1-2 minutes';
}

export default router;