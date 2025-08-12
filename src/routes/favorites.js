import express from 'express';
import { supabase } from '../services/supabase.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get user's favorites
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { data: favorites, error } = await supabase
      .from('favorites')
      .select(`
        id,
        created_at,
        user_id,
        slogan_id
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ 
      success: true,
      favorites,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// Add slogan to favorites
router.post('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { sloganText, companyName, industry, brandPersonality, keywords, tone } = req.body;

    // Check if slogan already exists for this user
    const { data: existingSlogan } = await supabase
      .from('slogans')
      .select('id')
      .eq('user_id', userId)
      .eq('text', sloganText)
      .single();

    let sloganId = existingSlogan?.id;

    // If slogan doesn't exist, create it
    if (!sloganId) {
      const { data: newSlogan, error: sloganError } = await supabase
        .from('slogans')
        .insert({
          user_id: userId,
          text: sloganText,
          company_name: companyName,
          industry,
          brand_personality: brandPersonality,
          keywords: Array.isArray(keywords) ? keywords.join(', ') : keywords,
          tone
        })
        .select()
        .single();

      if (sloganError) {
        return res.status(400).json({ error: sloganError.message });
      }

      sloganId = newSlogan.id;
    }

    // Check if already in favorites
    const { data: existingFavorite } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('slogan_id', sloganId)
      .single();

    if (existingFavorite) {
      return res.status(400).json({ error: 'Slogan already in favorites' });
    }

    // Add to favorites
    const { data: favorite, error } = await supabase
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

    res.json({ 
      success: true,
      message: 'Slogan added to favorites',
      favorite
    });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ error: 'Failed to add to favorites' });
  }
});

// Remove from favorites
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const favoriteId = req.params.id;

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('id', favoriteId)
      .eq('user_id', userId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ 
      success: true,
      message: 'Removed from favorites'
    });
  } catch (error) {
    console.error('Delete favorite error:', error);
    res.status(500).json({ error: 'Failed to remove from favorites' });
  }
});

// Update favorite
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const favoriteId = req.params.id;
    const updates = req.body;

    const { data: favorite, error } = await supabase
      .from('favorites')
      .update(updates)
      .eq('id', favoriteId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ 
      success: true,
      favorite
    });
  } catch (error) {
    console.error('Update favorite error:', error);
    res.status(500).json({ error: 'Failed to update favorite' });
  }
});

// Bulk delete favorites
router.post('/bulk/delete', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Invalid ids array' });
    }

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .in('id', ids);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ 
      success: true,
      message: `${ids.length} favorites deleted`
    });
  } catch (error) {
    console.error('Bulk delete favorites error:', error);
    res.status(500).json({ error: 'Failed to delete favorites' });
  }
});

// Get favorites statistics
router.get('/stats/summary', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const { count, error } = await supabase
      .from('favorites')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ 
      success: true,
      totalFavorites: count
    });
  } catch (error) {
    console.error('Get favorites stats error:', error);
    res.status(500).json({ error: 'Failed to get favorites stats' });
  }
});

export default router;