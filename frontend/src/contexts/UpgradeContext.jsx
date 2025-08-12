import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from '../services/authContext'
import api from '../services/api'
import UpgradeModal from '../components/UpgradeModals/UpgradeModal'
import UsageToast from '../components/UpgradeModals/UsageToast'
import toast from 'react-hot-toast'

const UpgradeContext = createContext()

export const useUpgrade = () => {
  const context = useContext(UpgradeContext)
  if (!context) {
    throw new Error('useUpgrade must be used within an UpgradeProvider')
  }
  return context
}

export const UpgradeProvider = ({ children }) => {
  const { user } = useAuth()
  const [usage, setUsage] = useState({})
  const [subscription, setSubscription] = useState(null)
  const [modal, setModal] = useState({ isOpen: false })
  const [toastState, setToastState] = useState({ isVisible: false })
  const [lastWarningShown, setLastWarningShown] = useState({})

  // Fetch usage and subscription data
  useEffect(() => {
    if (user) {
      fetchUsageData()
      fetchSubscriptionData()
    }
  }, [user])

  const fetchUsageData = async () => {
    try {
      const response = await api.get('/billing/usage')
      if (response.data.success) {
        setUsage(response.data.usage)
        checkForWarnings(response.data.usage)
      }
    } catch (error) {
      console.error('Error fetching usage:', error)
    }
  }

  const fetchSubscriptionData = async () => {
    try {
      const response = await api.get('/billing/subscription')
      if (response.data.success) {
        setSubscription(response.data.subscription)
      }
    } catch (error) {
      console.error('Error fetching subscription:', error)
    }
  }

  // Check if warnings should be shown
  const checkForWarnings = (usageData) => {
    if (!usageData) return

    const now = Date.now()
    const warningCooldown = 24 * 60 * 60 * 1000 // 24 hours

    // Check posts usage
    if (usageData.postsUsed && usageData.postsLimit > 0) {
      const postsPercentage = (usageData.postsUsed / usageData.postsLimit) * 100
      if (postsPercentage >= 80 && postsPercentage < 100) {
        const lastShown = lastWarningShown.posts || 0
        if (now - lastShown > warningCooldown) {
          showUsageWarning('posts', {
            type: 'posts',
            used: usageData.postsUsed,
            limit: usageData.postsLimit,
            percentage: Math.round(postsPercentage)
          })
          setLastWarningShown(prev => ({ ...prev, posts: now }))
        }
      }
    }

    // Check credits usage
    if (usageData.creditsUsed && usageData.creditsLimit > 0) {
      const creditsPercentage = (usageData.creditsUsed / usageData.creditsLimit) * 100
      if (creditsPercentage >= 80 && creditsPercentage < 100) {
        const lastShown = lastWarningShown.credits || 0
        if (now - lastShown > warningCooldown) {
          showUsageWarning('credits', {
            type: 'AI credits',
            used: usageData.creditsUsed,
            limit: usageData.creditsLimit,
            percentage: Math.round(creditsPercentage)
          })
          setLastWarningShown(prev => ({ ...prev, credits: now }))
        }
      }
    }

    // Check video minutes usage
    if (usageData.videoMinutesUsed && usageData.videoMinutesLimit > 0) {
      const videoPercentage = (usageData.videoMinutesUsed / usageData.videoMinutesLimit) * 100
      if (videoPercentage >= 80 && videoPercentage < 100) {
        const lastShown = lastWarningShown.video || 0
        if (now - lastShown > warningCooldown) {
          showUsageWarning('video', {
            type: 'video minutes',
            used: usageData.videoMinutesUsed,
            limit: usageData.videoMinutesLimit,
            percentage: Math.round(videoPercentage)
          })
          setLastWarningShown(prev => ({ ...prev, video: now }))
        }
      }
    }
  }

  // Show usage warning toast
  const showUsageWarning = (limitType, usageInfo) => {
    setToastState({
      isVisible: true,
      type: 'warning',
      usage: usageInfo,
      message: `You've used ${usageInfo.percentage}% of your ${usageInfo.type}. Consider upgrading to avoid interruptions.`
    })
  }

  // Show watermark encounter toast
  const showWatermarkToast = (context = '') => {
    setToastState({
      isVisible: true,
      type: 'watermark',
      message: `Watermark added to your ${context}. Upgrade to remove watermarks and get professional exports.`
    })
  }

  // Show queue full toast
  const showQueueFullToast = () => {
    setToastState({
      isVisible: true,
      type: 'queue_full',
      message: 'Your processing queue is full. Upgrade for priority processing and skip the wait.'
    })
  }

  // Show limit reached modal
  const showLimitReachedModal = async (limitType, currentUsage = {}) => {
    try {
      // Get upgrade suggestions from backend
      const response = await api.get(`/billing/upgrade-suggestions?limitType=${limitType}`)
      
      let suggestions = []
      if (response.data.success) {
        suggestions = response.data.suggestions
      } else {
        // Fallback suggestions
        suggestions = getDefaultSuggestions(limitType)
      }

      setModal({
        isOpen: true,
        triggerReason: 'limit_reached',
        limitType,
        currentUsage,
        suggestions
      })
    } catch (error) {
      console.error('Error fetching upgrade suggestions:', error)
      // Show fallback suggestions
      setModal({
        isOpen: true,
        triggerReason: 'limit_reached',
        limitType,
        currentUsage,
        suggestions: getDefaultSuggestions(limitType)
      })
    }
  }

  // Get default upgrade suggestions as fallback
  const getDefaultSuggestions = (limitType) => {
    const currentPlan = subscription?.plan_code || 'STARTER'

    if (currentPlan === 'STARTER') {
      return [
        {
          action: 'upgrade_plan',
          type: 'upgrade',
          planCode: 'PRO_50',
          name: 'Pro-50',
          price: '$29.99',
          benefits: [
            'Up to 1,000 posts/month',
            '1,000 AI credits/month', 
            '60 video minutes/month',
            'Advanced analytics'
          ]
        }
      ]
    }

    // For Pro plans, suggest add-ons or higher tiers
    const addOnSuggestions = []
    
    if (limitType === 'credits') {
      addOnSuggestions.push({
        action: 'purchase_addon',
        type: 'addon',
        addonType: 'credits_500',
        name: '+500 Credits',
        price: '$5',
        benefits: ['500 additional AI credits', 'One-time purchase', 'Available immediately']
      })
    }
    
    if (limitType === 'posts') {
      addOnSuggestions.push({
        action: 'purchase_addon',
        type: 'addon',
        addonType: 'posts_1000',
        name: '+1,000 Posts',
        price: '$5',
        benefits: ['1,000 additional posts', 'One-time purchase', 'Available immediately']
      })
    }

    return addOnSuggestions
  }

  // Handle toast upgrade button click
  const handleToastUpgrade = () => {
    setToastState({ isVisible: false })
    
    // Show appropriate modal based on toast type
    if (toastState.type === 'watermark') {
      showLimitReachedModal('watermark', usage)
    } else if (toastState.type === 'queue_full') {
      showLimitReachedModal('queue_full', usage)
    } else {
      showLimitReachedModal(toastState.usage?.type || 'general', usage)
    }
  }

  // Public API methods
  const triggerWatermarkNudge = (context) => {
    showWatermarkToast(context)
  }

  const triggerQueueFullNudge = () => {
    showQueueFullToast()
  }

  const triggerLimitReached = (limitType, currentUsage) => {
    showLimitReachedModal(limitType, currentUsage)
  }

  const refreshUsage = () => {
    fetchUsageData()
  }

  const value = {
    usage,
    subscription,
    triggerWatermarkNudge,
    triggerQueueFullNudge,
    triggerLimitReached,
    refreshUsage
  }

  return (
    <UpgradeContext.Provider value={value}>
      {children}
      
      {/* Usage Toast */}
      <UsageToast
        isVisible={toastState.isVisible}
        type={toastState.type}
        usage={toastState.usage}
        message={toastState.message}
        onClose={() => setToastState({ isVisible: false })}
        onUpgrade={handleToastUpgrade}
      />

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={modal.isOpen}
        triggerReason={modal.triggerReason}
        limitType={modal.limitType}
        currentUsage={modal.currentUsage}
        suggestions={modal.suggestions}
        onClose={() => setModal({ isOpen: false })}
      />
    </UpgradeContext.Provider>
  )
}

export default UpgradeProvider