import express from 'express';
import Stripe from 'stripe';
import { supabase } from '../services/supabase.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  maxNetworkRetries: 3,
  timeout: 10000, // 10 seconds
  telemetry: false
});

// Debug endpoint to check payment configuration
router.get('/debug', async (req, res) => {
  try {
    const debugInfo = {
      stripeConfigured: !!process.env.STRIPE_SECRET_KEY,
      stripeKeyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 10) + '...',
      frontendUrl: process.env.FRONTEND_URL,
      priceIds: {
        pro: process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
        agency: process.env.STRIPE_AGENCY_MONTHLY_PRICE_ID
      },
      userAuthenticated: !!req.user,
      userId: req.user?.id || 'not authenticated'
    };
    
    res.json(debugInfo);
  } catch (error) {
    res.json({ error: error.message, debugInfo: 'failed to load' });
  }
});

// Test Stripe price validity (no auth needed)
router.get('/debug/stripe-test', async (req, res) => {
  try {
    console.log('Testing Stripe prices...');
    
    const proPriceId = process.env.STRIPE_PRO_MONTHLY_PRICE_ID;
    const agencyPriceId = process.env.STRIPE_AGENCY_MONTHLY_PRICE_ID;
    
    const results = {
      pro: { priceId: proPriceId },
      agency: { priceId: agencyPriceId }
    };
    
    try {
      const proPrice = await stripe.prices.retrieve(proPriceId);
      results.pro = {
        valid: true,
        priceId: proPrice.id,
        amount: proPrice.unit_amount,
        currency: proPrice.currency,
        interval: proPrice.recurring?.interval
      };
    } catch (error) {
      results.pro = {
        valid: false,
        priceId: proPriceId,
        error: error.message,
        type: error.type
      };
    }
    
    try {
      const agencyPrice = await stripe.prices.retrieve(agencyPriceId);
      results.agency = {
        valid: true,
        priceId: agencyPrice.id,
        amount: agencyPrice.unit_amount,
        currency: agencyPrice.currency,
        interval: agencyPrice.recurring?.interval
      };
    } catch (error) {
      results.agency = {
        valid: false,
        priceId: agencyPriceId,
        error: error.message,
        type: error.type
      };
    }
    
    res.json(results);
  } catch (error) {
    res.json({ error: error.message, stack: error.stack });
  }
});

// Test profile lookup
router.get('/debug/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    res.json({
      userId,
      profileFound: !!profile,
      profileError: profileError?.message || null,
      profile: profile || null
    });
  } catch (error) {
    res.json({ error: error.message });
  }
});

// Create checkout session
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { priceId } = req.body;
    const userId = req.user.id;

    console.log('Creating checkout session for user:', userId);
    console.log('Price ID:', priceId);
    console.log('Stripe Secret Key configured:', !!process.env.STRIPE_SECRET_KEY);
    console.log('Frontend URL:', process.env.FRONTEND_URL);

    // Get user email - first try from profiles table, then fall back to auth
    let userProfile = null;
    let userEmail = null;

    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', userId)
        .single();

      console.log('Profile query result:', { profile, profileError });

      if (profile && !profileError) {
        userProfile = profile;
        userEmail = profile.email;
      } else {
        console.log('Profile not found, using auth user data directly');
      }
    } catch (profileQueryError) {
      console.log('Profile query failed, using auth user data:', profileQueryError.message);
    }

    // If no profile found, get email directly from auth
    if (!userEmail) {
      try {
        const { data: userData } = await supabase.auth.getUser(req.headers.authorization?.substring(7));
        userEmail = userData.user?.email;
        
        if (!userEmail) {
          return res.status(400).json({ 
            error: 'Unable to determine user email. Please ensure you are logged in.' 
          });
        }
        
        console.log('Using email from auth user:', userEmail);
        
        // Optionally try to create profile in background (don't block the checkout)
        try {
          const profileData = {
            id: userId,
            email: userEmail,
            first_name: userData.user?.user_metadata?.first_name || '',
            last_name: userData.user?.user_metadata?.last_name || '',
            subscription_plan: 'free',
            subscription_status: 'active',
            slogans_remaining: 3
          };

          supabase
            .from('profiles')
            .insert(profileData)
            .then(() => console.log('Profile created in background'))
            .catch(err => console.log('Background profile creation failed:', err.message));
        } catch (backgroundError) {
          console.log('Background profile creation error:', backgroundError.message);
        }
        
      } catch (authError) {
        console.error('Error getting user from auth:', authError);
        return res.status(400).json({ 
          error: 'Unable to verify user authentication.' 
        });
      }
    }

    console.log('Creating Stripe session with:', {
      email: userEmail,
      priceId,
      frontendUrl: process.env.FRONTEND_URL,
      userId
    });

    const session = await stripe.checkout.sessions.create({
      customer_email: userEmail,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing`,
      metadata: {
        userId: userId,
      },
    });

    console.log('Stripe session created successfully:', session.id);
    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Create checkout session error:', {
      message: error.message,
      type: error.type,
      code: error.code,
      stack: error.stack
    });
    
    // Return more specific error information
    res.status(500).json({ 
      error: 'Failed to create checkout session',
      details: error.message,
      type: error.type || 'unknown'
    });
  }
});

// Get customer portal session
router.post('/create-portal-session', async (req, res) => {
  try {
    const userId = req.user.id;

    // Get customer ID from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    if (!profile.stripe_customer_id) {
      return res.status(400).json({ error: 'No subscription found' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${process.env.FRONTEND_URL}/profile`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Create portal session error:', error);
    res.status(500).json({ error: 'Failed to create portal session' });
  }
});

// Get subscription status
router.get('/subscription', async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('subscription_plan, subscription_status, stripe_customer_id, stripe_subscription_id')
      .eq('id', userId)
      .single();

    // Handle case where user profile doesn't exist or has errors
    if (error || !profile || profile === null) {
      console.log('Profile not found or error:', error?.message || 'Profile is null');
      return res.json({
        plan: 'free',
        status: 'active',
        subscription: null
      });
    }

    let subscriptionDetails = null;
    if (profile.stripe_subscription_id) {
      subscriptionDetails = await stripe.subscriptions.retrieve(profile.stripe_subscription_id);
    }

    res.json({
      plan: profile.subscription_plan || 'free',
      status: profile.subscription_status || 'active',
      subscription: subscriptionDetails
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ error: 'Failed to get subscription status' });
  }
});

// Webhook handler for Stripe events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  let event;

  try {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.error('Missing STRIPE_WEBHOOK_SECRET environment variable');
      return res.status(500).json({ error: 'Webhook configuration error' });
    }
    
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        await handleCheckoutSessionCompleted(session);
        break;
      
      case 'customer.subscription.updated':
        const subscription = event.data.object;
        await handleSubscriptionUpdated(subscription);
        break;
      
      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object;
        await handleSubscriptionDeleted(deletedSubscription);
        break;
      
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

async function handleCheckoutSessionCompleted(session) {
  const userId = session.metadata.userId;
  const customerId = session.customer;
  const subscriptionId = session.subscription;

  // Get subscription details
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const planName = getPlanName(subscription.items.data[0].price.id);

  await supabase
    .from('profiles')
    .update({
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      subscription_plan: planName,
      subscription_status: subscription.status,
      slogans_remaining: getSloganLimit(planName)
    })
    .eq('id', userId);
}

async function handleSubscriptionUpdated(subscription) {
  const customerId = subscription.customer;
  const planName = getPlanName(subscription.items.data[0].price.id);

  await supabase
    .from('profiles')
    .update({
      subscription_plan: planName,
      subscription_status: subscription.status,
      slogans_remaining: getSloganLimit(planName)
    })
    .eq('stripe_customer_id', customerId);
}

async function handleSubscriptionDeleted(subscription) {
  const customerId = subscription.customer;

  await supabase
    .from('profiles')
    .update({
      subscription_plan: 'free',
      subscription_status: 'canceled',
      slogans_remaining: 1,
      stripe_subscription_id: null
    })
    .eq('stripe_customer_id', customerId);
}

function getPlanName(priceId) {
  // Map price IDs to plan names - using your actual Stripe price IDs
  const pricePlanMap = {
    // Pro plan prices
    [process.env.STRIPE_PRO_MONTHLY_PRICE_ID]: 'pro',
    // Agency plan prices
    [process.env.STRIPE_AGENCY_MONTHLY_PRICE_ID]: 'agency'
  };
  return pricePlanMap[priceId] || 'free';
}

function getSloganLimit(plan) {
  const limits = {
    'free': 1,
    'pro': 100,
    'agency': -1 // unlimited
  };
  return limits[plan] || 1;
}

// Get subscription plans
router.get('/plans', async (req, res) => {
  try {
    const plans = [
      {
        id: 'pro',
        name: 'Pro Plan',
        description: 'Perfect for growing businesses',
        features: [
          '100 slogan generations per month',
          'Save unlimited favorites',
          'Export in all formats (CSV, TXT, JSON, PDF)',
          'Priority AI processing',
          'Email support'
        ],
        pricing: {
          monthly: {
            priceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
            amount: 1999, // $19.99 in cents
            currency: 'usd',
            interval: 'month'
          }
        },
        sloganLimit: 100,
        stripePriceIds: {
          monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID
        },
        stripeProductId: 'prod_SpTuDNVCfoRzWe'
      },
      {
        id: 'agency',
        name: 'Agency Plan',
        description: 'Unlimited power for agencies and enterprises',
        features: [
          'Unlimited slogan generations',
          'Save unlimited favorites',
          'Export in all formats (CSV, TXT, JSON, PDF)',
          'Bulk generation capabilities',
          'Priority AI processing',
          'Dedicated support',
          'Team collaboration features',
          'Custom branding options'
        ],
        pricing: {
          monthly: {
            priceId: process.env.STRIPE_AGENCY_MONTHLY_PRICE_ID,
            amount: 4999, // $49.99 in cents
            currency: 'usd',
            interval: 'month'
          }
        },
        sloganLimit: -1, // unlimited
        stripePriceIds: {
          monthly: process.env.STRIPE_AGENCY_MONTHLY_PRICE_ID
        },
        stripeProductId: 'prod_SpTvgM7gldgBXN'
      }
    ];

    // Filter out plans with missing environment variables
    const availablePlans = plans.filter(plan => 
      plan.pricing.monthly.priceId && 
      plan.stripeProductId
    );

    res.json({
      success: true,
      plans: availablePlans
    });
  } catch (error) {
    console.error('Get subscription plans error:', error);
    res.status(500).json({ error: 'Failed to get subscription plans' });
  }
});

export default router;