import express from 'express';
import { supabase } from '../services/supabase.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Export slogans in various formats
router.get('/:format', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const format = req.params.format.toLowerCase();
    const { type = 'all', ids } = req.query; // 'all', 'favorites', or specific IDs

    if (!['csv', 'pdf', 'txt', 'json'].includes(format)) {
      return res.status(400).json({ error: 'Unsupported export format' });
    }

    let query = supabase.from('slogans').select('*');

    if (type === 'favorites') {
      // Get favorite slogans
      query = supabase
        .from('favorites')
        .select(`
          slogans (
            id,
            text,
            company_name,
            industry,
            brand_personality,
            keywords,
            tone,
            created_at
          )
        `)
        .eq('user_id', userId);
    } else if (ids) {
      // Get specific slogans by IDs
      const idArray = ids.split(',');
      query = query.eq('user_id', userId).in('id', idArray);
    } else {
      // Get all user's slogans
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Process data for favorites (flatten structure)
    const slogans = type === 'favorites' 
      ? data.map(item => item.slogans).filter(Boolean)
      : data;

    if (slogans.length === 0) {
      return res.status(404).json({ error: 'No slogans found to export' });
    }

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `slogans-${timestamp}.${format}`;

    switch (format) {
      case 'csv':
        const csvContent = generateCSV(slogans);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(csvContent);
        break;

      case 'txt':
        const txtContent = generateTXT(slogans);
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(txtContent);
        break;

      case 'json':
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.json({
          exportDate: new Date().toISOString(),
          totalSlogans: slogans.length,
          slogans
        });
        break;

      case 'pdf':
        // For PDF, we'll return a simple text version since PDF generation requires additional libraries
        const pdfContent = generatePDFText(slogans);
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', `attachment; filename="slogans-${timestamp}.txt"`);
        res.send(pdfContent);
        break;

      default:
        return res.status(400).json({ error: 'Unsupported format' });
    }

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export slogans' });
  }
});

// Export preview
router.get('/preview/:format', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const format = req.params.format.toLowerCase();
    const { type = 'all', limit = 5 } = req.query;

    let query = supabase.from('slogans').select('*').limit(limit);

    if (type === 'favorites') {
      query = supabase
        .from('favorites')
        .select(`
          slogans (
            id,
            text,
            company_name,
            industry,
            brand_personality,
            keywords,
            tone,
            created_at
          )
        `)
        .eq('user_id', userId)
        .limit(limit);
    } else {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const slogans = type === 'favorites' 
      ? data.map(item => item.slogans).filter(Boolean)
      : data;

    let preview = '';
    switch (format) {
      case 'csv':
        preview = generateCSV(slogans);
        break;
      case 'txt':
        preview = generateTXT(slogans);
        break;
      case 'json':
        preview = JSON.stringify({ slogans }, null, 2);
        break;
      case 'pdf':
        preview = generatePDFText(slogans);
        break;
      default:
        return res.status(400).json({ error: 'Unsupported format' });
    }

    res.json({ 
      success: true,
      preview: preview.substring(0, 1000) + (preview.length > 1000 ? '...' : ''),
      totalSlogans: slogans.length
    });

  } catch (error) {
    console.error('Export preview error:', error);
    res.status(500).json({ error: 'Failed to generate preview' });
  }
});

// Get available export formats
router.get('/formats/available', (req, res) => {
  res.json({
    success: true,
    formats: [
      { format: 'csv', name: 'CSV (Excel)', description: 'Comma-separated values for spreadsheet applications' },
      { format: 'txt', name: 'Text File', description: 'Plain text format' },
      { format: 'json', name: 'JSON', description: 'Structured data format' },
      { format: 'pdf', name: 'PDF (Text)', description: 'Portable document format (simplified)' }
    ]
  });
});

// Helper functions for export formats
function generateCSV(slogans) {
  const header = 'Slogan,Company,Industry,Personality,Keywords,Tone,Created\n';
  const rows = slogans.map(slogan => {
    return [
      `"${(slogan.text || '').replace(/"/g, '""')}"`,
      `"${(slogan.company_name || '').replace(/"/g, '""')}"`,
      `"${(slogan.industry || '').replace(/"/g, '""')}"`,
      `"${(slogan.brand_personality || '').replace(/"/g, '""')}"`,
      `"${(slogan.keywords || '').replace(/"/g, '""')}"`,
      `"${(slogan.tone || '').replace(/"/g, '""')}"`,
      `"${new Date(slogan.created_at).toLocaleDateString()}"`
    ].join(',');
  }).join('\n');
  
  return header + rows;
}

function generateTXT(slogans) {
  let content = 'MARKETING SLOGANS EXPORT\n';
  content += '========================\n\n';
  
  slogans.forEach((slogan, index) => {
    content += `${index + 1}. ${slogan.text}\n`;
    if (slogan.company_name) content += `   Company: ${slogan.company_name}\n`;
    if (slogan.industry) content += `   Industry: ${slogan.industry}\n`;
    if (slogan.brand_personality) content += `   Personality: ${slogan.brand_personality}\n`;
    if (slogan.tone) content += `   Tone: ${slogan.tone}\n`;
    if (slogan.keywords) content += `   Keywords: ${slogan.keywords}\n`;
    content += `   Created: ${new Date(slogan.created_at).toLocaleDateString()}\n\n`;
  });
  
  return content;
}

function generatePDFText(slogans) {
  // Simplified PDF-like text format
  let content = 'MARKETING SLOGANS EXPORT\n';
  content += '========================\n\n';
  content += `Generated: ${new Date().toLocaleDateString()}\n`;
  content += `Total Slogans: ${slogans.length}\n\n`;
  
  slogans.forEach((slogan, index) => {
    content += `${index + 1}. "${slogan.text}"\n`;
    content += `   Company: ${slogan.company_name || 'N/A'}\n`;
    content += `   Industry: ${slogan.industry || 'N/A'}\n`;
    content += `   Style: ${slogan.brand_personality || 'N/A'} / ${slogan.tone || 'N/A'}\n`;
    if (slogan.keywords) content += `   Keywords: ${slogan.keywords}\n`;
    content += '\n';
  });
  
  return content;
}

export default router;