import express from 'express';
import { supabase } from '../services/supabase.js';

const router = express.Router();

// Middleware to get user from auth header
const getUserFromAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Authorization header required'
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return res.status(404).json({
        success: false,
        error: 'User profile not found'
      });
    }

    req.user = profile;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Export data in different formats
router.get('/:format', getUserFromAuth, async (req, res) => {
  try {
    const { format } = req.params;
    
    if (!['csv', 'json', 'pdf'].includes(format)) {
      return res.status(400).json({
        success: false,
        error: 'Unsupported format. Use csv, json, or pdf'
      });
    }

    // Mock export data
    const exportData = [
      {
        slogan: "Your Success, Our Mission",
        business_name: "Sample Business",
        industry: "Technology",
        created_at: new Date().toISOString()
      }
    ];

    if (format === 'csv') {
      // Generate CSV
      const headers = ['Slogan', 'Business Name', 'Industry', 'Created At'];
      const csvRows = [
        headers.join(','),
        ...exportData.map(item => [
          `"${item.slogan}"`,
          `"${item.business_name}"`,
          `"${item.industry}"`,
          `"${item.created_at}"`
        ].join(','))
      ];
      
      const csvContent = csvRows.join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="slogans.csv"');
      return res.send(csvContent);
    }

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="slogans.json"');
      return res.json({
        exported_at: new Date().toISOString(),
        data: exportData
      });
    }

    if (format === 'pdf') {
      // Mock PDF generation
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="slogans.pdf"');
      return res.send('Mock PDF content - PDF generation not implemented yet');
    }

  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get export preview
router.get('/preview/:format', getUserFromAuth, async (req, res) => {
  try {
    const { format } = req.params;
    
    const mockPreview = {
      format,
      estimated_size: '2.3 KB',
      record_count: 5,
      available_fields: ['slogan', 'business_name', 'industry', 'created_at'],
      sample_data: [
        {
          slogan: "Your Success, Our Mission",
          business_name: "Sample Business",
          industry: "Technology"
        }
      ]
    };

    res.json({
      success: true,
      preview: mockPreview
    });
  } catch (error) {
    console.error('Error generating export preview:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get available export formats
router.get('/formats/available', getUserFromAuth, async (req, res) => {
  try {
    const formats = [
      {
        format: 'csv',
        name: 'CSV (Comma Separated Values)',
        description: 'Spreadsheet compatible format',
        max_records: 10000
      },
      {
        format: 'json',
        name: 'JSON',
        description: 'Structured data format',
        max_records: 5000
      },
      {
        format: 'pdf',
        name: 'PDF Document',
        description: 'Formatted document with styling',
        max_records: 1000
      }
    ];

    res.json({
      success: true,
      formats
    });
  } catch (error) {
    console.error('Error fetching export formats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;