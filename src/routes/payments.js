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

// Get subscription plans
router.get('/plans', async (req, res) => {
  try {
    const plans = [
      {
        id: 'starter',
        name: 'Starter',
        description: 'Perfect for exploring your brand potential',
        pricing: {
          monthly: {
            amount: 0,
            currency: 'usd',
            priceId: 'price_free' // Placeholder for free plan
          }
        },
        features: [
          '3 brand profiles',
          '10 name generations per month',
          'Basic logo templates',
          '5 social posts per month',
          'Standard brand kit exports',
          'Community support'
        ]
      },
      {
        id: 'pro',
        name: 'Professional',
        description: 'Complete brand creation for growing businesses',
        pricing: {
          monthly: {
            amount: 2999, // $29.99 in cents
            currency: 'usd',
            priceId: process.env.STRIPE_PRICE_ID_PRO || 'price_pro_placeholder'
          }
        },
        features: [
          'Unlimited brand profiles',
          '100 name generations per month',
          'AI-powered logo generation',
          '50 social posts per month',
          'Premium brand kit exports',
          'Domain checking included',
          'Priority email support'
        ]
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        description: 'Advanced branding for agencies and large teams',
        pricing: {
          monthly: {
            amount: 7999, // $79.99 in cents
            currency: 'usd',
            priceId: process.env.STRIPE_PRICE_ID_ENTERPRISE || 'price_enterprise_placeholder'
          }
        },
        features: [
          'Everything in Professional',
          'Unlimited generations',
          'Advanced AI models',
          'White-label brand kits',
          'Team collaboration tools',
          'API access',
          'Custom integrations',
          'Dedicated account manager'
        ]
      }
    ];

    res.json({
      success: true,
      plans
    });
  } catch (error) {
    console.error('Error getting subscription plans:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create checkout session (Stripe integration placeholder)
router.post('/create-checkout-session', authMiddleware, async (req, res) => {
  try {
    const { priceId, planName } = req.body;

    if (!priceId || !planName) {
      return res.status(400).json({
        success: false,
        error: 'Price ID and plan name are required'
      });
    }

    // For now, return a placeholder response since Stripe isn't fully configured
    // In a real implementation, you would create an actual Stripe checkout session
    if (priceId === 'price_free') {
      // Free plan - redirect to dashboard
      return res.json({
        success: true,
        sessionId: null,
        redirectUrl: '/dashboard'
      });
    }

    // Placeholder for paid plans
    // TODO: Implement actual Stripe checkout session creation
    console.log('Checkout session requested for:', { priceId, planName, userId: req.user.id });

    res.json({
      success: false,
      error: 'Payment system is currently being configured. Please check back soon!',
      message: 'Stripe integration is in progress. Free plan is available.'
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get subscription status
router.get('/subscription-status', authMiddleware, async (req, res) => {
  try {
    // Check user's current subscription status
    // For now, return a default free plan status
    res.json({
      success: true,
      subscription: {
        status: 'active',
        plan: 'starter',
        planName: 'Starter',
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false
      }
    });
  } catch (error) {
    console.error('Error getting subscription status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create billing portal session (placeholder)
router.post('/create-portal-session', authMiddleware, async (req, res) => {
  try {
    res.json({
      success: false,
      error: 'Billing portal is currently being configured. Please contact support for billing inquiries.'
    });
  } catch (error) {
    console.error('Error creating portal session:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;