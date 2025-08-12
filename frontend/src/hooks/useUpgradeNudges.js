import { useUpgrade } from '../contexts/UpgradeContext'

/**
 * Hook to integrate upgrade nudges into components
 * Usage example:
 * 
 * const { checkLimits, triggerWatermark, refreshUsage } = useUpgradeNudges()
 * 
 * // Before performing an action that uses credits:
 * const canProceed = await checkLimits('credits', 10)
 * if (!canProceed) return // User will see upgrade modal automatically
 * 
 * // When adding watermark to export:
 * triggerWatermark('logo export')
 * 
 * // After user completes purchase:
 * refreshUsage()
 */
export const useUpgradeNudges = () => {
  const { 
    usage, 
    subscription, 
    triggerWatermarkNudge, 
    triggerQueueFullNudge, 
    triggerLimitReached, 
    refreshUsage 
  } = useUpgrade()

  /**
   * Check if user can perform an action that consumes resources
   * Automatically shows upgrade modal if limits are reached
   */
  const checkLimits = async (type, amount = 1) => {
    if (!usage) {
      await refreshUsage()
      return false
    }

    let currentUsed = 0
    let limit = 0
    let limitType = type

    switch (type) {
      case 'posts':
        currentUsed = usage.postsUsed || 0
        limit = usage.postsLimit || 0
        break
      case 'credits':
        currentUsed = usage.creditsUsed || 0
        limit = usage.creditsLimit || 0
        break
      case 'video_minutes':
        currentUsed = usage.videoMinutesUsed || 0
        limit = usage.videoMinutesLimit || 0
        limitType = 'video'
        break
      default:
        return true // Unknown type, allow
    }

    // Check if action would exceed limit
    if (limit > 0 && currentUsed + amount > limit) {
      triggerLimitReached(limitType, {
        type: limitType,
        used: currentUsed,
        limit: limit,
        percentage: Math.round((currentUsed / limit) * 100)
      })
      return false
    }

    return true
  }

  /**
   * Trigger watermark nudge with context
   */
  const triggerWatermark = (context = '') => {
    triggerWatermarkNudge(context)
  }

  /**
   * Trigger queue full nudge
   */
  const triggerQueueFull = () => {
    triggerQueueFullNudge()
  }

  /**
   * Check if user is on trial and should see watermarks
   */
  const shouldShowWatermark = () => {
    if (!subscription) return true // No subscription = trial user
    
    // Check if trial period is active
    if (subscription.trial_end && new Date(subscription.trial_end) > new Date()) {
      return true
    }

    // Check if subscription is not paid
    return subscription.status !== 'active'
  }

  /**
   * Get usage percentage for a specific resource type
   */
  const getUsagePercentage = (type) => {
    if (!usage) return 0

    switch (type) {
      case 'posts':
        return usage.postsLimit > 0 ? Math.round((usage.postsUsed / usage.postsLimit) * 100) : 0
      case 'credits':
        return usage.creditsLimit > 0 ? Math.round((usage.creditsUsed / usage.creditsLimit) * 100) : 0
      case 'video':
      case 'video_minutes':
        return usage.videoMinutesLimit > 0 ? Math.round((usage.videoMinutesUsed / usage.videoMinutesLimit) * 100) : 0
      default:
        return 0
    }
  }

  /**
   * Check if user is approaching any limits (>=80%)
   */
  const isApproachingLimits = () => {
    return getUsagePercentage('posts') >= 80 || 
           getUsagePercentage('credits') >= 80 || 
           getUsagePercentage('video') >= 80
  }

  /**
   * Get current plan information
   */
  const getCurrentPlan = () => {
    return subscription?.plan_code || 'STARTER'
  }

  return {
    usage,
    subscription,
    checkLimits,
    triggerWatermark,
    triggerQueueFull,
    refreshUsage,
    shouldShowWatermark,
    getUsagePercentage,
    isApproachingLimits,
    getCurrentPlan
  }
}

export default useUpgradeNudges