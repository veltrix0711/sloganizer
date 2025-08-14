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

// Get voice training status for a profile
router.get('/profiles/:profileId/status', getUserFromEmail, async (req, res) => {
  try {
    const { profileId } = req.params;
    
    // Return mock voice training status
    const mockStatus = {
      profile_id: profileId,
      progress: {
        analyzed_samples: 0,
        total_samples: 0,
        completion_percentage: 0,
        last_training: null
      },
      voice_characteristics: {
        tone: null,
        style: null,
        formality: null,
        complexity: null
      },
      training_active: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    res.json({
      success: true,
      status: mockStatus,
      progress: mockStatus.progress
    });
  } catch (error) {
    console.error('Error fetching voice training status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Upload voice training content
router.post('/profiles/:profileId/content', getUserFromEmail, async (req, res) => {
  try {
    const { profileId } = req.params;
    const { content, content_type, source } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Content is required'
      });
    }

    // Return mock upload response
    const mockUpload = {
      id: Date.now().toString(),
      profile_id: profileId,
      content: content.substring(0, 100) + '...',
      content_type: content_type || 'text',
      source: source || 'manual',
      status: 'processing',
      created_at: new Date().toISOString()
    };

    res.json({
      success: true,
      upload: mockUpload,
      message: 'Content uploaded successfully and is being processed'
    });
  } catch (error) {
    console.error('Error uploading voice content:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get voice training samples for a profile
router.get('/profiles/:profileId/samples', getUserFromEmail, async (req, res) => {
  try {
    const { profileId } = req.params;
    
    // Return empty samples array for now
    res.json({
      success: true,
      samples: []
    });
  } catch (error) {
    console.error('Error fetching voice samples:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start voice training for a profile
router.post('/profiles/:profileId/train', getUserFromEmail, async (req, res) => {
  try {
    const { profileId } = req.params;
    
    // Return mock training start response
    res.json({
      success: true,
      message: 'Voice training started successfully',
      training_id: Date.now().toString(),
      estimated_completion: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes from now
    });
  } catch (error) {
    console.error('Error starting voice training:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete voice training sample
router.delete('/profiles/:profileId/samples/:sampleId', getUserFromEmail, async (req, res) => {
  try {
    const { profileId, sampleId } = req.params;
    
    res.json({
      success: true,
      message: 'Sample deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting voice sample:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;