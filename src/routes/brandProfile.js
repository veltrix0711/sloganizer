import express from 'express';
import { supabase } from '../services/supabase.js';

const router = express.Router();

// Get all brand profiles for the current user
router.get('/profiles', async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: profiles, error } = await supabase
      .from('brand_profiles')
      .select(`
        *,
        brand_assets!brand_assets_brand_profile_id_fkey(
          id,
          asset_type,
          file_url,
          is_primary,
          width,
          height
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      profiles
    });
  } catch (error) {
    console.error('Get brand profiles error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch brand profiles' 
    });
  }
});

// Get a specific brand profile
router.get('/profiles/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { data: profile, error } = await supabase
      .from('brand_profiles')
      .select(`
        *,
        brand_assets!brand_assets_brand_profile_id_fkey(
          id,
          asset_type,
          file_name,
          file_url,
          is_primary,
          width,
          height,
          ai_prompt
        ),
        brand_names!brand_names_brand_profile_id_fkey(
          id,
          name,
          niche,
          domain_available,
          is_favorite,
          is_claimed,
          created_at
        )
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Brand profile not found'
        });
      }
      throw error;
    }

    res.json({
      success: true,
      profile
    });
  } catch (error) {
    console.error('Get brand profile error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch brand profile' 
    });
  }
});

// Create a new brand profile
router.post('/profiles', async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      tagline,
      mission,
      primary_color,
      secondary_color,
      accent_color,
      primary_font,
      secondary_font,
      tone_of_voice,
      target_audience,
      brand_personality,
      industry,
      niche_tags,
      website_url,
      social_links,
      is_default
    } = req.body;

    // Validation
    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Brand name must be at least 2 characters long'
      });
    }

    // If this is being set as default, unset other default profiles
    if (is_default) {
      await supabase
        .from('brand_profiles')
        .update({ is_default: false })
        .eq('user_id', userId);
    }

    const profileData = {
      user_id: userId,
      name: name.trim(),
      tagline: tagline?.trim(),
      mission: mission?.trim(),
      primary_color,
      secondary_color,
      accent_color,
      primary_font: primary_font || 'Inter',
      secondary_font: secondary_font || 'Inter',
      tone_of_voice,
      target_audience: target_audience?.trim(),
      brand_personality: brand_personality || [],
      industry,
      niche_tags: niche_tags || [],
      website_url: website_url?.trim(),
      social_links: social_links || {},
      is_default: is_default || false
    };

    const { data: profile, error } = await supabase
      .from('brand_profiles')
      .insert(profileData)
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      profile
    });
  } catch (error) {
    console.error('Create brand profile error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create brand profile' 
    });
  }
});

// Update a brand profile
router.patch('/profiles/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates.id;
    delete updates.user_id;
    delete updates.created_at;
    delete updates.version;

    // If setting as default, unset other defaults
    if (updates.is_default) {
      await supabase
        .from('brand_profiles')
        .update({ is_default: false })
        .eq('user_id', userId)
        .neq('id', id);
    }

    // Remove version increment for now - handle in database if needed
    // updates.version = 1; // Simple increment or remove entirely
    updates.updated_at = new Date().toISOString();

    const { data: profile, error } = await supabase
      .from('brand_profiles')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Brand profile not found'
        });
      }
      throw error;
    }

    res.json({
      success: true,
      profile
    });
  } catch (error) {
    console.error('Update brand profile error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update brand profile' 
    });
  }
});

// Delete a brand profile
router.delete('/profiles/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Check if profile exists and belongs to user
    const { data: profile, error: fetchError } = await supabase
      .from('brand_profiles')
      .select('id, is_default')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Brand profile not found'
        });
      }
      throw fetchError;
    }

    // Delete the profile (cascade will handle related data)
    const { error } = await supabase
      .from('brand_profiles')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;

    // If this was the default profile, set another as default if any exist
    if (profile.is_default) {
      const { data: otherProfiles } = await supabase
        .from('brand_profiles')
        .select('id')
        .eq('user_id', userId)
        .limit(1);

      if (otherProfiles && otherProfiles.length > 0) {
        await supabase
          .from('brand_profiles')
          .update({ is_default: true })
          .eq('id', otherProfiles[0].id);
      }
    }

    res.json({
      success: true,
      message: 'Brand profile deleted successfully'
    });
  } catch (error) {
    console.error('Delete brand profile error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to delete brand profile' 
    });
  }
});

// Get user's default brand profile
router.get('/default', async (req, res) => {
  try {
    const userId = req.user.id;

    let { data: profile, error } = await supabase
      .from('brand_profiles')
      .select(`
        *,
        brand_assets!brand_assets_brand_profile_id_fkey(
          id,
          asset_type,
          file_url,
          is_primary
        )
      `)
      .eq('user_id', userId)
      .eq('is_default', true)
      .single();

    // If no default profile, get the most recent one
    if (error && error.code === 'PGRST116') {
      const { data: profiles, error: fetchError } = await supabase
        .from('brand_profiles')
        .select(`
          *,
          brand_assets!brand_assets_brand_profile_id_fkey(
            id,
            asset_type,
            file_url,
            is_primary
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;
      profile = profiles && profiles.length > 0 ? profiles[0] : null;
    } else if (error) {
      throw error;
    }

    res.json({
      success: true,
      profile
    });
  } catch (error) {
    console.error('Get default brand profile error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch default brand profile' 
    });
  }
});

export default router;