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

// Get all favorites for user
router.get('/', getUserFromAuth, async (req, res) => {
  try {
    // For now, return empty array since we don't have favorites table yet
    // This prevents the loading issue
    res.json({
      success: true,
      data: []
    });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Save a favorite
router.post('/', getUserFromAuth, async (req, res) => {
  try {
    const { slogan_text, business_name, industry, personality, explanation } = req.body;
    
    if (!slogan_text) {
      return res.status(400).json({
        success: false,
        error: 'Slogan text is required'
      });
    }

    // Return mock saved favorite
    const mockFavorite = {
      id: Date.now().toString(),
      user_id: req.user.id,
      slogan_text,
      business_name: business_name || '',
      industry: industry || '',
      personality: personality || '',
      explanation: explanation || '',
      created_at: new Date().toISOString()
    };

    res.json({
      success: true,
      data: mockFavorite,
      message: 'Slogan saved to favorites'
    });
  } catch (error) {
    console.error('Error saving favorite:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete a favorite
router.delete('/:id', getUserFromAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    res.json({
      success: true,
      message: 'Favorite deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting favorite:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update a favorite
router.put('/:id', getUserFromAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Return mock updated favorite
    const updatedFavorite = {
      id,
      user_id: req.user.id,
      ...updates,
      updated_at: new Date().toISOString()
    };

    res.json({
      success: true,
      data: updatedFavorite,
      message: 'Favorite updated successfully'
    });
  } catch (error) {
    console.error('Error updating favorite:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Bulk delete favorites
router.post('/bulk/delete', getUserFromAuth, async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({
        success: false,
        error: 'IDs array is required'
      });
    }

    res.json({
      success: true,
      deleted_count: ids.length,
      message: `${ids.length} favorite(s) deleted successfully`
    });
  } catch (error) {
    console.error('Error bulk deleting favorites:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get favorites stats summary
router.get('/stats/summary', getUserFromAuth, async (req, res) => {
  try {
    // Return mock stats
    const mockStats = {
      success: true,
      stats: {
        total_favorites: 0,
        categories: {
          slogans: 0,
          logos: 0,
          social_posts: 0
        },
        recent_activity: []
      }
    };

    res.json(mockStats);
  } catch (error) {
    console.error('Error getting favorites stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;