import express from 'express';
import { supabase } from '../services/supabase.js';

const router = express.Router();

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Get slogan counts
    const { count: totalSlogans } = await supabase
      .from('slogans')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const { count: favoritesCount } = await supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    res.json({
      profile: {
        ...profile,
        stats: {
          total_slogans: totalSlogans || 0,
          favorites_count: favoritesCount || 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, company } = req.body;

    const { data, error } = await supabase
      .from('profiles')
      .update({
        first_name: firstName,
        last_name: lastName,
        company: company
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ profile: data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get user usage statistics
router.get('/usage', async (req, res) => {
  try {
    const userId = req.user.id;

    // Get profile info
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_plan, slogans_remaining')
      .eq('id', userId)
      .single();

    // Get this month's slogan count
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: thisMonthSlogans } = await supabase
      .from('slogans')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', startOfMonth.toISOString());

    res.json({
      subscription_plan: profile.subscription_plan,
      slogans_remaining: profile.slogans_remaining,
      slogans_this_month: thisMonthSlogans || 0,
      billing_cycle_start: startOfMonth.toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch usage statistics' });
  }
});

export default router;