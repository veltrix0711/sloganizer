import express from 'express';
import { supabase } from '../services/supabase.js';

const router = express.Router();

// Middleware to get user from email
const getUserFromEmail = async (req, res, next) => {
  try {
    const email = req.query.email || req.body.email;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email parameter required'
      });
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    req.user = profile;
    next();
  } catch (error) {
    console.error('User lookup error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Run AI analysis for a brand
router.post('/analyze/:brandId', getUserFromEmail, async (req, res) => {
  try {
    const { brandId } = req.params;
    
    // Return mock analysis results
    const mockAnalysis = {
      id: Date.now().toString(),
      brand_id: brandId,
      analysis_type: 'comprehensive',
      results: {
        brand_strength: {
          score: 78,
          areas: ['messaging', 'visual_identity', 'market_positioning'],
          strengths: ['Clear value proposition', 'Strong visual identity'],
          weaknesses: ['Limited market presence', 'Inconsistent messaging']
        },
        recommendations: [
          {
            category: 'messaging',
            priority: 'high',
            title: 'Strengthen brand messaging consistency',
            description: 'Develop a comprehensive messaging framework'
          },
          {
            category: 'visual',
            priority: 'medium',
            title: 'Enhance visual elements',
            description: 'Consider updating logo and color palette'
          }
        ],
        competitive_analysis: {
          position: 'growing',
          key_differentiators: ['Innovation', 'Customer service'],
          opportunities: ['Digital presence', 'Content marketing']
        }
      },
      status: 'completed',
      created_at: new Date().toISOString()
    };

    res.json({
      success: true,
      analysis: mockAnalysis
    });
  } catch (error) {
    console.error('Error running brand analysis:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Generate content suggestions for a brand
router.post('/content-suggestions/:brandId', getUserFromEmail, async (req, res) => {
  try {
    const { brandId } = req.params;
    const { type, count = 5 } = req.body;
    
    // Generate mock content suggestions based on type
    const suggestions = [];
    for (let i = 1; i <= count; i++) {
      suggestions.push({
        id: `${brandId}-${type}-${i}-${Date.now()}`,
        type: type || 'slogan',
        content: `Sample ${type || 'slogan'} ${i} for your brand`,
        confidence_score: 0.8 + Math.random() * 0.2,
        reasoning: `This ${type || 'slogan'} aligns with your brand values and target audience`,
        created_at: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      suggestions
    });
  } catch (error) {
    console.error('Error generating content suggestions:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get content suggestions with query parameters
router.get('/content-suggestions/:brandId', getUserFromEmail, async (req, res) => {
  try {
    const { brandId } = req.params;
    const { type = 'slogan', includeUsed = false } = req.query;
    
    // Generate mock content suggestions
    const suggestions = [];
    for (let i = 1; i <= 5; i++) {
      suggestions.push({
        id: `${brandId}-${type}-${i}-${Date.now()}`,
        type: type,
        content: `Sample ${type} ${i} for your brand`,
        confidence_score: 0.8 + Math.random() * 0.2,
        reasoning: `This ${type} aligns with your brand values and target audience`,
        is_used: false,
        is_favorite: false,
        created_at: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      suggestions
    });
  } catch (error) {
    console.error('Error fetching content suggestions:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Mark suggestion as used
router.post('/content-suggestions/:suggestionId/use', getUserFromEmail, async (req, res) => {
  try {
    const { suggestionId } = req.params;
    
    res.json({
      success: true,
      message: 'Suggestion marked as used'
    });
  } catch (error) {
    console.error('Error marking suggestion as used:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Mark suggestion as favorite
router.post('/content-suggestions/:suggestionId/favorite', getUserFromEmail, async (req, res) => {
  try {
    const { suggestionId } = req.params;
    
    res.json({
      success: true,
      message: 'Suggestion marked as favorite'
    });
  } catch (error) {
    console.error('Error marking suggestion as favorite:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get dashboard data for a brand
router.get('/dashboard/:brandId', getUserFromEmail, async (req, res) => {
  try {
    const { brandId } = req.params;
    
    // Return mock dashboard data
    const mockDashboard = {
      brand_id: brandId,
      metrics: {
        brand_score: 78,
        content_generated: 25,
        suggestions_used: 12,
        favorites_saved: 8
      },
      recent_activity: [
        {
          type: 'analysis',
          description: 'Brand analysis completed',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          type: 'content',
          description: 'New slogans generated',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
        }
      ],
      recommendations: [
        {
          priority: 'high',
          title: 'Update brand messaging',
          description: 'Consider refreshing your core messaging'
        }
      ],
      last_updated: new Date().toISOString()
    };

    res.json({
      success: true,
      dashboard: mockDashboard
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get analysis history for a brand
router.get('/history/:brandId', getUserFromEmail, async (req, res) => {
  try {
    const { brandId } = req.params;
    
    // Return mock analysis history
    const mockHistory = [
      {
        id: '1',
        brand_id: brandId,
        analysis_type: 'comprehensive',
        score: 78,
        status: 'completed',
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        brand_id: brandId,
        analysis_type: 'quick',
        score: 72,
        status: 'completed',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    res.json({
      success: true,
      history: mockHistory
    });
  } catch (error) {
    console.error('Error fetching analysis history:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;