import express from 'express'
import stripe, { STRIPE_CONFIG, PLAN_CONFIGS, ADDON_CONFIGS } from '../config/stripe.js'
import { supabase } from '../config/supabase.js'
import { authenticateUser } from '../middleware/auth.js'
import rateLimit from 'express-rate-limit'

const router = express.Router()

// Rate limiting for billing operations
const billingRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 billing requests per windowMs
  message: { error: 'Too many billing requests, please try again later.' }
})

// Apply rate limiting to all billing routes
router.use(billingRateLimit)

/**
 * GET /api/billing/plans
 * Get available subscription plans
 */
router.get('/plans', authenticateUser, async (req, res) => {
  try {
    const { data: plans, error } = await supabase
      .from('plans')
      .select('*')
      .eq('is_active', true)
      .order('price_monthly')

    if (error) throw error

    res.json({
      success: true,
      plans
    })
  } catch (error) {
    console.error('Error fetching plans:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch plans'
    })
  }
})

/**
 * GET /api/billing/subscription
 * Get current user's subscription
 */
router.get('/subscription', authenticateUser, async (req, res) => {
  try {
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        plans (*)
      `)
      .eq('user_id', req.user.id)
      .eq('status', 'active')
      .maybeSingle()

    if (error) throw error

    // Get current usage bucket
    const { data: usageBucket, error: usageError } = await supabase
      .rpc('get_current_usage_bucket', { user_uuid: req.user.id })

    if (usageError) {
      console.error('Error fetching usage:', usageError)
    }

    res.json({
      success: true,
      subscription,
      usage: usageBucket
    })
  } catch (error) {
    console.error('Error fetching subscription:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch subscription'
    })
  }
})

/**
 * POST /api/billing/checkout
 * Create Stripe checkout session
 */
router.post('/checkout', authenticateUser, async (req, res) => {
  try {
    const { planCode, addonType, successUrl, cancelUrl } = req.body

    if (!planCode && !addonType) {
      return res.status(400).json({
        success: false,
        error: 'Either planCode or addonType is required'
      })
    }

    // Get or create Stripe customer
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('stripe_customer_id, email')
      .eq('user_id', req.user.id)
      .single()

    if (profileError) throw profileError

    let customerId = userProfile.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userProfile.email,
        metadata: {
          userId: req.user.id
        }
      })
      
      customerId = customer.id

      // Update user profile with customer ID
      await supabase
        .from('user_profiles')
        .update({ stripe_customer_id: customerId })
        .eq('user_id', req.user.id)
    }

    let lineItems = []
    let mode = 'subscription'

    if (planCode) {
      // Subscription checkout
      const planConfig = PLAN_CONFIGS[planCode]
      if (!planConfig) {
        return res.status(400).json({
          success: false,
          error: 'Invalid plan code'
        })
      }

      const priceId = STRIPE_CONFIG.prices[planCode]
      if (!priceId) {
        return res.status(400).json({
          success: false,
          error: 'Price ID not configured for plan'
        })
      }

      lineItems.push({
        price: priceId,
        quantity: 1,
      })

      // Add trial if applicable
      if (planConfig.trialDays > 0) {
        mode = 'subscription'
      }
    } else if (addonType) {
      // Add-on purchase
      mode = 'payment'
      const addonConfig = ADDON_CONFIGS[addonType]
      if (!addonConfig) {
        return res.status(400).json({
          success: false,
          error: 'Invalid addon type'
        })
      }

      const priceId = STRIPE_CONFIG.addons[addonType]
      if (!priceId) {
        return res.status(400).json({
          success: false,
          error: 'Price ID not configured for addon'
        })
      }

      lineItems.push({
        price: priceId,
        quantity: 1,
      })
    }

    // Create checkout session
    const sessionParams = {
      customer: customerId,
      line_items: lineItems,
      mode,
      success_url: successUrl || `${process.env.FRONTEND_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.FRONTEND_URL}/pricing`,
      metadata: {
        userId: req.user.id,
        planCode: planCode || '',
        addonType: addonType || '',
      },
      customer_update: {
        address: 'auto',
        name: 'auto',
      },
    }

    // Add trial period for subscription mode
    if (mode === 'subscription' && planCode && PLAN_CONFIGS[planCode].trialDays > 0) {
      sessionParams.subscription_data = {
        trial_period_days: PLAN_CONFIGS[planCode].trialDays,
        metadata: {
          planCode,
          userId: req.user.id,
        }
      }
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url
    })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create checkout session'
    })
  }
})

/**
 * GET /api/billing/portal
 * Create Stripe customer portal session
 */
router.get('/portal', authenticateUser, async (req, res) => {
  try {
    const { data: userProfile, error } = await supabase
      .from('user_profiles')
      .select('stripe_customer_id')
      .eq('user_id', req.user.id)
      .single()

    if (error) throw error

    if (!userProfile.stripe_customer_id) {
      return res.status(400).json({
        success: false,
        error: 'No Stripe customer found'
      })
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: userProfile.stripe_customer_id,
      return_url: `${process.env.FRONTEND_URL}/billing`,
    })

    res.json({
      success: true,
      url: session.url
    })
  } catch (error) {
    console.error('Error creating portal session:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create portal session'
    })
  }
})

/**
 * GET /api/billing/usage
 * Get current usage statistics
 */
router.get('/usage', authenticateUser, async (req, res) => {
  try {
    // Get current usage bucket
    const { data: usageBucket, error } = await supabase
      .rpc('get_current_usage_bucket', { user_uuid: req.user.id })

    if (error) throw error

    if (!usageBucket) {
      return res.json({
        success: true,
        usage: {
          postsUsed: 0,
          creditsUsed: 0,
          videoMinutesUsed: 0,
          postsLimit: 0,
          creditsLimit: 0,
          videoMinutesLimit: 0,
        },
        subscription: null
      })
    }

    // Calculate usage percentages
    const usage = {
      ...usageBucket,
      postsPercentage: usageBucket.posts_limit > 0 ? (usageBucket.posts_used / usageBucket.posts_limit) * 100 : 0,
      creditsPercentage: usageBucket.credits_limit > 0 ? (usageBucket.credits_used / usageBucket.credits_limit) * 100 : 0,
      videoPercentage: usageBucket.video_minutes_limit > 0 ? (usageBucket.video_minutes_used / usageBucket.video_minutes_limit) * 100 : 0,
    }

    res.json({
      success: true,
      usage
    })
  } catch (error) {
    console.error('Error fetching usage:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch usage'
    })
  }
})

/**
 * POST /api/billing/usage/increment
 * Increment usage counter
 */
router.post('/usage/increment', authenticateUser, async (req, res) => {
  try {
    const { type, amount = 1 } = req.body

    if (!['posts', 'credits', 'video_minutes'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid usage type'
      })
    }

    const { data: result, error } = await supabase
      .rpc('increment_usage', {
        user_uuid: req.user.id,
        usage_type: type,
        amount: amount
      })

    if (error) throw error

    res.json({
      success: result,
      message: result ? 'Usage incremented' : 'Failed to increment usage'
    })
  } catch (error) {
    console.error('Error incrementing usage:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to increment usage'
    })
  }
})

/**
 * GET /api/billing/limits/check
 * Check if user has reached limits
 */
router.get('/limits/check', authenticateUser, async (req, res) => {
  try {
    const { type, amount = 1 } = req.query

    // Get current usage bucket
    const { data: usageBucket, error } = await supabase
      .rpc('get_current_usage_bucket', { user_uuid: req.user.id })

    if (error) throw error

    if (!usageBucket) {
      return res.json({
        success: false,
        canProceed: false,
        reason: 'No active subscription'
      })
    }

    let canProceed = true
    let reason = null

    switch (type) {
      case 'posts':
        if (usageBucket.posts_limit > 0 && usageBucket.posts_used + parseInt(amount) > usageBucket.posts_limit) {
          canProceed = false
          reason = `Would exceed posts limit (${usageBucket.posts_used}/${usageBucket.posts_limit})`
        }
        break
      case 'credits':
        if (usageBucket.credits_limit > 0 && usageBucket.credits_used + parseInt(amount) > usageBucket.credits_limit) {
          canProceed = false
          reason = `Would exceed credits limit (${usageBucket.credits_used}/${usageBucket.credits_limit})`
        }
        break
      case 'video_minutes':
        if (usageBucket.video_minutes_limit > 0 && usageBucket.video_minutes_used + parseInt(amount) > usageBucket.video_minutes_limit) {
          canProceed = false
          reason = `Would exceed video minutes limit (${usageBucket.video_minutes_used}/${usageBucket.video_minutes_limit})`
        }
        break
    }

    res.json({
      success: true,
      canProceed,
      reason,
      usage: usageBucket
    })
  } catch (error) {
    console.error('Error checking limits:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to check limits'
    })
  }
})

/**
 * GET /api/billing/watermark
 * Check if user should see watermarks
 */
router.get('/watermark', authenticateUser, async (req, res) => {
  try {
    const { data: hasWatermark, error } = await supabase
      .rpc('has_watermark', { user_uuid: req.user.id })

    if (error) throw error

    res.json({
      success: true,
      hasWatermark: hasWatermark || false
    })
  } catch (error) {
    console.error('Error checking watermark status:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to check watermark status'
    })
  }
})

/**
 * GET /api/billing/upgrade-suggestions
 * Get intelligent upgrade suggestions based on usage and current plan
 */
router.get('/upgrade-suggestions', authenticateUser, async (req, res) => {
  try {
    const { limitType } = req.query
    const userId = req.user.id

    // Get current subscription and usage
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan_code')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle()

    const { data: usage } = await supabase
      .rpc('get_current_usage_bucket', { user_uuid: userId })

    const currentPlan = subscription?.plan_code || 'STARTER'
    const suggestions = []

    // Generate suggestions based on current plan and limit type
    if (currentPlan === 'STARTER') {
      // Starter users should upgrade to Pro
      suggestions.push({
        action: 'upgrade_plan',
        type: 'upgrade',
        planCode: 'PRO_50',
        name: 'Pro-50',
        price: '$29.99',
        benefits: [
          'Up to 1,000 posts/month',
          '1,000 AI credits/month',
          '60 video minutes/month',
          '2 team seats',
          'Advanced analytics'
        ]
      })

      if (limitType === 'credits' || limitType === 'posts') {
        suggestions.push({
          action: 'upgrade_plan',
          type: 'upgrade',
          planCode: 'PRO_200',
          name: 'Pro-200',
          price: '$49.99',
          benefits: [
            'Up to 2,500 posts/month',
            '2,500 AI credits/month',
            '150 video minutes/month',
            '4 team seats',
            'A/B testing & approvals'
          ]
        })
      }
    } else if (currentPlan.startsWith('PRO_')) {
      // Pro users can buy add-ons or upgrade tiers
      
      // Add-on suggestions
      if (limitType === 'credits' || limitType === 'general') {
        suggestions.push({
          action: 'purchase_addon',
          type: 'addon',
          addonType: 'credits_500',
          name: '+500 AI Credits',
          price: '$5',
          benefits: [
            '500 additional AI credits',
            'One-time purchase',
            'Available immediately'
          ]
        })
      }

      if (limitType === 'posts' || limitType === 'general') {
        suggestions.push({
          action: 'purchase_addon',
          type: 'addon',
          addonType: 'posts_1000',
          name: '+1,000 Posts',
          price: '$5',
          benefits: [
            '1,000 additional posts',
            'One-time purchase',
            'Available immediately'
          ]
        })
      }

      if (limitType === 'video' || limitType === 'general') {
        suggestions.push({
          action: 'purchase_addon',
          type: 'addon',
          addonType: 'video_60',
          name: '+60 Video Minutes',
          price: '$8',
          benefits: [
            '60 additional video minutes',
            'One-time purchase',
            'Available immediately'
          ]
        })
      }

      // Upgrade to higher Pro tiers
      if (currentPlan === 'PRO_50') {
        suggestions.push({
          action: 'upgrade_plan',
          type: 'upgrade',
          planCode: 'PRO_200',
          name: 'Pro-200',
          price: '$49.99',
          benefits: [
            '2,500 posts & credits/month',
            '150 video minutes/month',
            'A/B testing & approvals',
            '4 team seats'
          ]
        })
      }

      if (currentPlan === 'PRO_50' || currentPlan === 'PRO_200') {
        suggestions.push({
          action: 'upgrade_plan',
          type: 'upgrade',
          planCode: 'PRO_500',
          name: 'Pro-500',
          price: '$79.99',
          benefits: [
            '5,000 posts & credits/month',
            '300 video minutes/month',
            'Priority queue processing',
            '6 team seats'
          ]
        })
      }

      // For high usage, suggest Agency
      if (usage && (usage.posts_used > 3000 || usage.credits_used > 3000)) {
        suggestions.push({
          action: 'contact_sales',
          type: 'enterprise',
          planCode: 'AGENCY',
          name: 'Agency Command',
          price: 'Custom',
          benefits: [
            'Unlimited brands & pooled credits',
            'White-label branding',
            'SSO/SAML & audit logs',
            'Priority SLA & dedicated support'
          ]
        })
      }
    }

    res.json({
      success: true,
      suggestions,
      currentPlan,
      usage
    })

  } catch (error) {
    console.error('Error generating upgrade suggestions:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to generate upgrade suggestions'
    })
  }
})

export default router