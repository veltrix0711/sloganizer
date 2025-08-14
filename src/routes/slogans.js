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

// Generate slogans
router.post('/generate', getUserFromAuth, async (req, res) => {
  try {
    const { 
      businessName, 
      industry, 
      personality, 
      targetAudience, 
      keywords,
      brandProfile 
    } = req.body;
    
    if (!businessName) {
      return res.status(400).json({
        success: false,
        error: 'Business name is required'
      });
    }

    // Generate mock slogans for now
    const mockSlogans = [
      {
        id: '1',
        text: `${businessName}: Where Innovation Meets Excellence`,
        explanation: `This slogan emphasizes both innovation and quality, appealing to customers who value cutting-edge solutions with proven results.`,
        confidence: 0.92
      },
      {
        id: '2', 
        text: `Elevating ${industry} Standards`,
        explanation: `Positions your brand as a leader that raises the bar in your industry, suggesting premium quality and expertise.`,
        confidence: 0.88
      },
      {
        id: '3',
        text: `Your Success, Our Mission`,
        explanation: `Customer-centric messaging that emphasizes your commitment to client outcomes and partnership approach.`,
        confidence: 0.85
      },
      {
        id: '4',
        text: `Experience the ${businessName} Difference`,
        explanation: `Highlights uniqueness and suggests a superior experience compared to competitors.`,
        confidence: 0.83
      },
      {
        id: '5',
        text: `Building Tomorrow, Today`,
        explanation: `Forward-thinking message that suggests innovation and future-readiness, perfect for tech or progressive companies.`,
        confidence: 0.87
      }
    ];

    res.json({
      success: true,
      slogans: mockSlogans,
      generated_count: mockSlogans.length,
      remaining_generations: req.user.slogans_remaining - 1
    });

  } catch (error) {
    console.error('Error generating slogans:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get slogan history
router.get('/history', getUserFromAuth, async (req, res) => {
  try {
    // Return empty history for now
    res.json({
      success: true,
      slogans: []
    });
  } catch (error) {
    console.error('Error fetching slogan history:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;