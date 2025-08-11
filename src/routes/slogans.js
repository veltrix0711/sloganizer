import express from 'express';
import { anthropicService } from '../services/anthropic.js';
import { supabase } from '../services/supabase.js';
import { validateSlogan } from '../middleware/validation.js';
import { authMiddleware } from '../middleware/auth.js';
import { exportService } from '../services/export.js';

const router = express.Router();

// Generate new slogans (supports both authenticated and unauthenticated users)
router.post('/generate', validateSlogan, async (req, res) => {
  try {
    const { companyName, industry, brandPersonality, keywords, tone } = req.body;
    
    // Check if user is authenticated
    const authHeader = req.headers.authorization;
    let userId = null;
    let isAuthenticated = false;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const { data: { user } } = await supabase.auth.getUser(token);
        if (user) {
          userId = user.id;
          isAuthenticated = true;
        }
      } catch (error) {
        // User not authenticated, continue as anonymous
      }
    }

    let remaining = 'unlimited';

    // If authenticated, check user's credits
    if (isAuthenticated) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('slogans_remaining, subscription_plan')
        .eq('id', userId)
        .single();

      if (profile && profile.slogans_remaining <= 0 && profile.subscription_plan === 'free') {
        return res.status(403).json({ 
          error: 'No slogans remaining. Please upgrade your plan.' 
        });
      }
      
      remaining = profile?.subscription_plan === 'free' ? profile.slogans_remaining - 1 : 'unlimited';
    }

    // Generate slogans using Claude (limit to 3 for unauthenticated users)
    const maxSlogans = isAuthenticated ? 10 : 3;
    const slogans = await anthropicService.generateSlogans({
      companyName,
      industry,
      brandPersonality,
      keywords,
      tone,
      maxSlogans
    });

    // Save slogans to database only for authenticated users
    if (isAuthenticated && userId) {
      const sloganPromises = slogans.map(slogan => 
        supabase
          .from('slogans')
          .insert({
            user_id: userId,
            text: slogan,
            company_name: companyName,
            industry,
            brand_personality: brandPersonality,
            keywords: keywords?.join(', '),
            tone
          })
      );

      await Promise.all(sloganPromises);

      // Decrement user's remaining slogans
      const { data: profile } = await supabase
        .from('profiles')
        .select('slogans_remaining, subscription_plan')
        .eq('id', userId)
        .single();

      if (profile && profile.subscription_plan === 'free') {
        await supabase
          .from('profiles')
          .update({ slogans_remaining: profile.slogans_remaining - 1 })
          .eq('id', userId);
      }
    }

    res.json({
      success: true,
      slogans,
      remaining: isAuthenticated ? remaining : 'Sign up for unlimited generations',
      authenticated: isAuthenticated
    });
  } catch (error) {
    console.error('Generate slogans error:', error);
    res.status(500).json({ error: 'Failed to generate slogans' });
  }
});

// Get user's slogan history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { data: slogans, error } = await supabase
      .from('slogans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ slogans, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch slogan history' });
  }
});

// Get user's favorite slogans
router.get('/favorites', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: favorites, error } = await supabase
      .from('favorites')
      .select(`
        id,
        created_at,
        slogans (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ favorites });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// Add slogan to favorites
router.post('/favorites/:sloganId', async (req, res) => {
  try {
    const userId = req.user.id;
    const { sloganId } = req.params;

    const { data, error } = await supabase
      .from('favorites')
      .insert({
        user_id: userId,
        slogan_id: sloganId
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({ favorite: data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add to favorites' });
  }
});

// Remove slogan from favorites
router.delete('/favorites/:sloganId', async (req, res) => {
  try {
    const userId = req.user.id;
    const { sloganId } = req.params;

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('slogan_id', sloganId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove from favorites' });
  }
});

// Export slogans
router.post('/export', async (req, res) => {
  try {
    const { sloganIds, format } = req.body;
    const userId = req.user.id;

    // Fetch slogans
    const { data: slogans, error } = await supabase
      .from('slogans')
      .select('*')
      .eq('user_id', userId)
      .in('id', sloganIds);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const exportData = await exportService.exportSlogans(slogans, format);

    res.setHeader('Content-Disposition', `attachment; filename="slogans.${format}"`);
    res.setHeader('Content-Type', exportService.getContentType(format));
    res.send(exportData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to export slogans' });
  }
});

export default router;