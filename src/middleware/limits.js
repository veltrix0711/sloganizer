import { supabase } from '../config/supabase.js'

/**
 * Middleware to check usage limits before operations
 */
export const checkLimits = (limitType, creditCost = 1) => {
  return async (req, res, next) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        })
      }

      // Get current usage bucket
      const { data: usageBucket, error } = await supabase
        .rpc('get_current_usage_bucket', { user_uuid: req.user.id })

      if (error) {
        console.error('Error getting usage bucket:', error)
        return res.status(500).json({
          success: false,
          error: 'Failed to check usage limits'
        })
      }

      if (!usageBucket) {
        return res.status(402).json({
          success: false,
          error: 'No active subscription',
          code: 'NO_SUBSCRIPTION',
          upgradeRequired: true
        })
      }

      let canProceed = true
      let errorMessage = ''
      let currentUsage = 0
      let limit = 0

      // Check limits based on type
      switch (limitType) {
        case 'posts':
          currentUsage = usageBucket.posts_used
          limit = usageBucket.posts_limit
          if (limit > 0 && currentUsage >= limit) {
            canProceed = false
            errorMessage = `Post limit reached (${currentUsage}/${limit})`
          }
          break

        case 'credits':
          currentUsage = usageBucket.credits_used
          limit = usageBucket.credits_limit
          if (limit > 0 && (currentUsage + creditCost) > limit) {
            canProceed = false
            errorMessage = `Not enough credits (${currentUsage + creditCost}/${limit} required)`
          }
          break

        case 'video_minutes':
          currentUsage = usageBucket.video_minutes_used
          limit = usageBucket.video_minutes_limit
          if (limit > 0 && (currentUsage + creditCost) > limit) {
            canProceed = false
            errorMessage = `Video minutes limit reached (${currentUsage + creditCost}/${limit} required)`
          }
          break

        case 'brands':
          const { data: brandCount, error: brandError } = await supabase
            .from('brands')
            .select('id', { count: 'exact' })
            .eq('user_id', req.user.id)
            .eq('is_active', true)

          if (brandError) {
            console.error('Error counting brands:', brandError)
            return res.status(500).json({
              success: false,
              error: 'Failed to check brand limits'
            })
          }

          currentUsage = brandCount.length
          limit = usageBucket.brands_limit
          if (limit > 0 && currentUsage >= limit) {
            canProceed = false
            errorMessage = `Brand limit reached (${currentUsage}/${limit})`
          }
          break

        default:
          return res.status(400).json({
            success: false,
            error: 'Invalid limit type'
          })
      }

      if (!canProceed) {
        // Calculate usage percentage for better UX
        const usagePercentage = limit > 0 ? Math.round((currentUsage / limit) * 100) : 100

        return res.status(402).json({
          success: false,
          error: errorMessage,
          code: 'LIMIT_EXCEEDED',
          details: {
            limitType,
            currentUsage,
            limit,
            usagePercentage,
            creditCost
          },
          upgradeRequired: true,
          suggestions: generateUpgradeSuggestions(limitType, usageBucket)
        })
      }

      // Store usage info in request for later use
      req.usageInfo = {
        bucket: usageBucket,
        limitType,
        creditCost
      }

      next()
    } catch (error) {
      console.error('Error in checkLimits middleware:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to check usage limits'
      })
    }
  }
}

/**
 * Middleware to increment usage after successful operation
 */
export const incrementUsage = () => {
  return async (req, res, next) => {
    // Store original res.json to intercept successful responses
    const originalJson = res.json

    res.json = function (body) {
      // Only increment usage on successful operations
      if (body?.success !== false && req.usageInfo) {
        const { limitType, creditCost } = req.usageInfo

        // Async increment - don't wait for it
        supabase
          .rpc('increment_usage', {
            user_uuid: req.user.id,
            usage_type: limitType,
            amount: creditCost
          })
          .then(({ error }) => {
            if (error) {
              console.error('Error incrementing usage:', error)
            }
          })

        // Log analytics event
        supabase
          .from('analytics_events')
          .insert({
            user_id: req.user.id,
            event_name: `${limitType}_used`,
            event_properties: {
              amount: creditCost,
              endpoint: req.path
            }
          })
          .then(({ error }) => {
            if (error) {
              console.error('Error logging usage event:', error)
            }
          })
      }

      // Call original json method
      return originalJson.call(this, body)
    }

    next()
  }
}

/**
 * Check if user has watermarks enabled
 */
export const checkWatermark = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      req.hasWatermark = true
      return next()
    }

    const { data: hasWatermark, error } = await supabase
      .rpc('has_watermark', { user_uuid: req.user.id })

    if (error) {
      console.error('Error checking watermark status:', error)
      req.hasWatermark = true
    } else {
      req.hasWatermark = hasWatermark || false
    }

    next()
  } catch (error) {
    console.error('Error in checkWatermark middleware:', error)
    req.hasWatermark = true
    next()
  }
}

/**
 * Generate upgrade suggestions based on limit type
 */
function generateUpgradeSuggestions(limitType, usageBucket) {
  const suggestions = []

  // Get current plan from usage bucket or default
  const currentPlan = determinePlanFromBucket(usageBucket)

  switch (limitType) {
    case 'credits':
      suggestions.push({
        type: 'addon',
        name: '+500 AI Credits',
        price: '$5.00',
        action: 'purchase_addon',
        addonType: 'CREDITS_500'
      })
      if (currentPlan === 'STARTER') {
        suggestions.push({
          type: 'upgrade',
          name: 'Pro-50 Plan',
          price: '$29.99/month',
          action: 'upgrade_plan',
          planCode: 'PRO_50',
          benefits: ['1,000 credits/month', '60 video minutes', 'Quick Ads']
        })
      }
      break

    case 'posts':
      suggestions.push({
        type: 'addon',
        name: '+1,000 Posts',
        price: '$5.00',
        action: 'purchase_addon',
        addonType: 'POSTS_1000'
      })
      if (currentPlan === 'STARTER') {
        suggestions.push({
          type: 'upgrade',
          name: 'Pro-50 Plan',
          price: '$29.99/month',
          action: 'upgrade_plan',
          planCode: 'PRO_50',
          benefits: ['1,000 posts/month', '1,000 credits', 'Marketing Plan']
        })
      }
      break

    case 'video_minutes':
      suggestions.push({
        type: 'addon',
        name: '+60 Video Minutes',
        price: '$8.00',
        action: 'purchase_addon',
        addonType: 'VIDEO_60'
      })
      suggestions.push({
        type: 'upgrade',
        name: 'Pro-50 Plan',
        price: '$29.99/month',
        action: 'upgrade_plan',
        planCode: 'PRO_50',
        benefits: ['60 video minutes/month', '1,000 posts', '1,000 credits']
      })
      break

    case 'brands':
      suggestions.push({
        type: 'addon',
        name: 'Extra Brand',
        price: '$5.00/month',
        action: 'purchase_addon',
        addonType: 'BRAND'
      })
      if (currentPlan !== 'AGENCY') {
        const nextPlan = getNextPlan(currentPlan)
        if (nextPlan) {
          suggestions.push({
            type: 'upgrade',
            name: nextPlan.name,
            price: `$${nextPlan.price}/month`,
            action: 'upgrade_plan',
            planCode: nextPlan.code,
            benefits: nextPlan.benefits
          })
        }
      }
      break
  }

  return suggestions
}

/**
 * Determine current plan from usage bucket limits
 */
function determinePlanFromBucket(bucket) {
  if (!bucket) return 'FREE'
  
  const { posts_limit, credits_limit } = bucket
  
  if (posts_limit === 200 && credits_limit === 200) return 'STARTER'
  if (posts_limit === 1000 && credits_limit === 1000) return 'PRO_50'
  if (posts_limit === 2500 && credits_limit === 2500) return 'PRO_200'
  if (posts_limit === 5000 && credits_limit === 5000) return 'PRO_500'
  if (posts_limit === -1) return 'AGENCY'
  
  return 'UNKNOWN'
}

/**
 * Get next plan upgrade option
 */
function getNextPlan(currentPlan) {
  const planUpgrades = {
    STARTER: {
      code: 'PRO_50',
      name: 'Pro-50 Plan',
      price: '29.99',
      benefits: ['2 brands', '1,000 posts/month', '60 video minutes']
    },
    PRO_50: {
      code: 'PRO_200',
      name: 'Pro-200 Plan',
      price: '49.99',
      benefits: ['3 brands', '2,500 posts/month', '150 video minutes', 'A/B tests']
    },
    PRO_200: {
      code: 'PRO_500',
      name: 'Pro-500 Plan',
      price: '79.99',
      benefits: ['5 brands', '5,000 posts/month', '300 video minutes', 'Priority queue']
    },
    PRO_500: {
      code: 'AGENCY',
      name: 'Agency Command',
      price: 'Contact Sales',
      benefits: ['Unlimited brands', 'Pooled credits', 'White-label', 'SSO/SAML']
    }
  }
  
  return planUpgrades[currentPlan] || null
}

/**
 * Usage tracking helper functions
 */
export const usageHelpers = {
  /**
   * Track analytics event
   */
  async trackEvent(userId, eventName, properties = {}) {
    try {
      await supabase
        .from('analytics_events')
        .insert({
          user_id: userId,
          event_name: eventName,
          event_properties: properties
        })
    } catch (error) {
      console.error('Error tracking event:', error)
    }
  },

  /**
   * Get usage percentage for UI
   */
  calculateUsagePercentage(used, limit) {
    if (limit <= 0) return 0
    return Math.min(Math.round((used / limit) * 100), 100)
  },

  /**
   * Check if usage is approaching limit (80%+)
   */
  isApproachingLimit(used, limit, threshold = 0.8) {
    if (limit <= 0) return false
    return (used / limit) >= threshold
  },

  /**
   * Format usage for display
   */
  formatUsage(used, limit) {
    if (limit <= 0) return `${used} used`
    return `${used.toLocaleString()}/${limit.toLocaleString()}`
  }
}