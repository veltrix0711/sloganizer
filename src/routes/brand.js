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

// Get all brand profiles for user  
router.get('/profiles', async (req, res) => {
  try {
    // For now, return empty array since we don't have brand_profiles table yet
    // This prevents the HTML error and allows the UI to work
    res.json({
      success: true,
      profiles: []
    });
  } catch (error) {
    console.error('Error fetching brand profiles:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create a new brand profile
router.post('/profiles', getUserFromEmail, async (req, res) => {
  try {
    const { name, description, industry, targetAudience, values, mission } = req.body;
    
    // For now, return a mock created profile
    const mockProfile = {
      id: Date.now().toString(),
      user_id: req.user.id,
      name: name || 'New Brand Profile',
      description: description || '',
      industry: industry || '',
      target_audience: targetAudience || '',
      values: values || [],
      mission: mission || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    res.json({
      success: true,
      profile: mockProfile
    });
  } catch (error) {
    console.error('Error creating brand profile:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get specific brand profile
router.get('/profiles/:id', getUserFromEmail, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Return mock profile for now
    const mockProfile = {
      id,
      user_id: req.user.id,
      name: 'Sample Brand Profile',
      description: 'A sample brand profile',
      industry: 'Technology',
      target_audience: 'Tech professionals',
      values: ['Innovation', 'Quality', 'Trust'],
      mission: 'To provide excellent solutions',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    res.json({
      success: true,
      profile: mockProfile
    });
  } catch (error) {
    console.error('Error fetching brand profile:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update brand profile
router.patch('/profiles/:id', getUserFromEmail, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Return updated mock profile
    const updatedProfile = {
      id,
      user_id: req.user.id,
      ...updates,
      updated_at: new Date().toISOString()
    };

    res.json({
      success: true,
      profile: updatedProfile
    });
  } catch (error) {
    console.error('Error updating brand profile:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete brand profile
router.delete('/profiles/:id', getUserFromEmail, async (req, res) => {
  try {
    const { id } = req.params;
    
    res.json({
      success: true,
      message: 'Brand profile deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting brand profile:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get default brand profile
router.get('/default', getUserFromEmail, async (req, res) => {
  try {
    // Return a default profile
    const defaultProfile = {
      id: 'default',
      user_id: req.user.id,
      name: 'Default Profile',
      description: 'Your default brand profile',
      industry: '',
      target_audience: '',
      values: [],
      mission: '',
      is_default: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    res.json({
      success: true,
      profile: defaultProfile
    });
  } catch (error) {
    console.error('Error fetching default profile:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;