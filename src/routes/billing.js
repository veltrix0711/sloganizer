import express from 'express';
import { supabase } from '../services/supabase.js';

const router = express.Router();

// Auth middleware - defined inline
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Get subscription status
router.get('/subscription', authMiddleware, async (req, res) => {
  try {
    // Get user profile from Supabase
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      // Return default if profile not found
      return res.json({
        success: true,
        subscription: {
          status: 'active',
          plan: 'starter',
          planName: 'Starter',
          currentPeriodStart: new Date().toISOString(),
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false,
          trialEnd: null
        }
      });
    }

    // Map subscription tier to plan info
    const tierMapping = {
      'free': { plan: 'starter', planName: 'Starter' },
      'pro': { plan: 'professional', planName: 'Professional' },
      'pro_500': { plan: 'professional', planName: 'Professional' },
      'pro-500': { plan: 'professional', planName: 'Professional' },
      'agency': { plan: 'enterprise', planName: 'Enterprise' },
      'premium': { plan: 'enterprise', planName: 'Enterprise' }
    };

    const tierInfo = tierMapping[profile.subscription_tier] || { plan: 'starter', planName: 'Starter' };

    res.json({
      success: true,
      subscription: {
        status: profile.subscription_status || 'active',
        plan: tierInfo.plan,
        planName: tierInfo.planName,
        tier: profile.subscription_tier,
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        trialEnd: null
      }
    });
  } catch (error) {
    console.error('Error getting subscription:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get billing usage
router.get('/usage', authMiddleware, async (req, res) => {
  try {
    // Placeholder usage data
    res.json({
      success: true,
      usage: {
        current_period: {
          start: new Date().toISOString(),
          end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        limits: {
          slogan_generations: 10,
          brand_profiles: 3,
          logo_generations: 5,
          social_posts: 5
        },
        used: {
          slogan_generations: 0,
          brand_profiles: 0,
          logo_generations: 0,
          social_posts: 0
        }
      }
    });
  } catch (error) {
    console.error('Error getting usage:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create billing checkout
router.post('/checkout', authMiddleware, async (req, res) => {
  try {
    const { planId, priceId } = req.body;

    if (!planId || !priceId) {
      return res.status(400).json({
        success: false,
        error: 'Plan ID and price ID are required'
      });
    }

    // Placeholder for checkout session creation
    res.json({
      success: false,
      error: 'Payment system is currently being configured. Please check back soon!'
    });

  } catch (error) {
    console.error('Error creating checkout:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get billing portal
router.get('/portal', authMiddleware, async (req, res) => {
  try {
    res.json({
      success: false,
      error: 'Billing portal is currently being configured. Please contact support for billing inquiries.'
    });
  } catch (error) {
    console.error('Error accessing billing portal:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get upgrade suggestions
router.get('/upgrade-suggestions', authMiddleware, async (req, res) => {
  try {
    const { limitType } = req.query;

    const suggestions = [
      {
        current_plan: 'starter',
        suggested_plan: 'pro',
        reason: 'Unlock unlimited brand profiles and more generations',
        benefits: [
          'Unlimited brand profiles',
          '100 name generations per month',
          'AI-powered logo generation',
          'Premium brand kit exports'
        ]
      }
    ];

    res.json({
      success: true,
      suggestions
    });
  } catch (error) {
    console.error('Error getting upgrade suggestions:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;