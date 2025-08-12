import { useState, useEffect } from 'react'
import { 
  X, 
  Zap, 
  TrendingUp, 
  ArrowRight, 
  AlertCircle,
  Crown,
  Sparkles,
  Building
} from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'

const UpgradeModal = ({ 
  isOpen, 
  onClose, 
  triggerReason = 'limit_reached',
  limitType = 'credits',
  currentUsage = {},
  suggestions = [] 
}) => {
  const [loading, setLoading] = useState(false)
  const [selectedOption, setSelectedOption] = useState(null)

  useEffect(() => {
    if (isOpen && suggestions.length > 0) {
      // Pre-select the first suggestion
      setSelectedOption(suggestions[0])
    }
  }, [isOpen, suggestions])

  const handleUpgrade = async (option) => {
    setLoading(true)

    try {
      let endpoint = '/billing/checkout'
      let payload = {
        successUrl: window.location.origin + '/billing/success',
        cancelUrl: window.location.origin + window.location.pathname
      }

      if (option.action === 'upgrade_plan') {
        payload.planCode = option.planCode
      } else if (option.action === 'purchase_addon') {
        payload.addonType = option.addonType
      }

      const response = await api.post(endpoint, payload)

      if (response.data.success && response.data.url) {
        window.location.href = response.data.url
      } else {
        throw new Error('Failed to create checkout session')
      }
    } catch (error) {
      console.error('Upgrade error:', error)
      toast.error('Failed to start upgrade process. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (loading) return
    onClose()
  }

  if (!isOpen) return null

  const getModalConfig = () => {
    switch (triggerReason) {
      case 'watermark_encountered':
        return {
          icon: <Sparkles className="h-8 w-8" />,
          title: 'Remove Watermarks',
          subtitle: 'Upgrade to get clean, professional exports',
          gradient: 'from-orange to-electric',
          glowColor: 'shadow-glow-orange'
        }
      case 'usage_warning':
        return {
          icon: <AlertCircle className="h-8 w-8" />,
          title: 'Usage Approaching Limit',
          subtitle: `You've used ${currentUsage.percentage}% of your ${limitType}`,
          gradient: 'from-orange to-teal',
          glowColor: 'shadow-glow-orange'
        }
      case 'queue_full':
        return {
          icon: <TrendingUp className="h-8 w-8" />,
          title: 'Queue Full',
          subtitle: 'Upgrade for priority processing',
          gradient: 'from-teal to-electric',
          glowColor: 'shadow-glow-teal'
        }
      default:
        return {
          icon: <Crown className="h-8 w-8" />,
          title: 'Upgrade Required',
          subtitle: 'You\'ve reached your current plan limits',
          gradient: 'from-electric to-teal',
          glowColor: 'shadow-glow-blue'
        }
    }
  }

  const modalConfig = getModalConfig()

  return (
    <div className="fixed inset-0 bg-night/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-space border border-electric/20 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-glow-blue">
        {/* Header */}
        <div className="relative p-8 text-center">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 text-muted hover:text-heading rounded-lg hover:bg-electric/10 transition-all duration-200"
          >
            <X className="h-5 w-5" />
          </button>

          <div className={`w-16 h-16 bg-gradient-to-r ${modalConfig.gradient} rounded-xl flex items-center justify-center mx-auto mb-6 ${modalConfig.glowColor}`}>
            {modalConfig.icon}
          </div>

          <h2 className="text-2xl font-bold text-heading mb-2">
            {modalConfig.title}
          </h2>
          <p className="text-body text-lg">
            {modalConfig.subtitle}
          </p>
        </div>

        {/* Current Usage Display */}
        {currentUsage && Object.keys(currentUsage).length > 0 && (
          <div className="px-8 pb-6">
            <div className="bg-night/50 rounded-lg p-4">
              <h3 className="text-heading font-medium mb-3">Current Usage</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {currentUsage.postsUsed !== undefined && (
                  <div className="text-center">
                    <div className="text-electric font-bold text-lg">
                      {currentUsage.postsUsed?.toLocaleString() || 0}
                    </div>
                    <div className="text-muted text-sm">Posts Used</div>
                    {currentUsage.postsLimit > 0 && (
                      <div className="text-xs text-body">
                        of {currentUsage.postsLimit.toLocaleString()}
                      </div>
                    )}
                  </div>
                )}
                {currentUsage.creditsUsed !== undefined && (
                  <div className="text-center">
                    <div className="text-teal font-bold text-lg">
                      {currentUsage.creditsUsed?.toLocaleString() || 0}
                    </div>
                    <div className="text-muted text-sm">Credits Used</div>
                    {currentUsage.creditsLimit > 0 && (
                      <div className="text-xs text-body">
                        of {currentUsage.creditsLimit.toLocaleString()}
                      </div>
                    )}
                  </div>
                )}
                {currentUsage.videoMinutesUsed !== undefined && (
                  <div className="text-center">
                    <div className="text-orange font-bold text-lg">
                      {currentUsage.videoMinutesUsed || 0}
                    </div>
                    <div className="text-muted text-sm">Video Minutes</div>
                    {currentUsage.videoMinutesLimit > 0 && (
                      <div className="text-xs text-body">
                        of {currentUsage.videoMinutesLimit}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Upgrade Options */}
        <div className="px-8 pb-8">
          <h3 className="text-heading font-bold mb-4">Choose Your Solution</h3>
          
          <div className="space-y-4">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  selectedOption?.action === suggestion.action
                    ? 'border-electric bg-electric/5 shadow-glow-blue'
                    : 'border-electric/20 hover:border-electric/40'
                }`}
                onClick={() => setSelectedOption(suggestion)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                      suggestion.type === 'upgrade' 
                        ? 'bg-gradient-to-r from-electric to-teal' 
                        : 'bg-gradient-to-r from-orange to-lime'
                    }`}>
                      {suggestion.type === 'upgrade' ? 
                        <Crown className="h-4 w-4 text-white" /> : 
                        <Zap className="h-4 w-4 text-white" />
                      }
                    </div>
                    <div>
                      <div className="font-semibold text-heading">
                        {suggestion.name}
                      </div>
                      <div className="text-sm text-body">
                        {suggestion.type === 'upgrade' ? 'Upgrade Plan' : 'One-time Add-on'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-heading">
                      {suggestion.price}
                    </div>
                    {suggestion.type === 'upgrade' && (
                      <div className="text-xs text-muted">
                        monthly
                      </div>
                    )}
                  </div>
                </div>

                {/* Benefits */}
                {suggestion.benefits && (
                  <div className="mt-3 pl-11">
                    <div className="text-sm text-body">
                      {suggestion.benefits.slice(0, 3).map((benefit, idx) => (
                        <div key={idx} className="flex items-center">
                          <div className="w-1 h-1 bg-teal rounded-full mr-2"></div>
                          {benefit}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Selection indicator */}
                {selectedOption?.action === suggestion.action && (
                  <div className="absolute top-4 right-4">
                    <div className="w-6 h-6 bg-electric rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={handleClose}
              className="flex-1 px-6 py-3 bg-space border border-electric/20 rounded-lg text-muted hover:text-heading hover:border-electric/40 transition-all duration-200"
            >
              Maybe Later
            </button>
            
            <button
              onClick={() => selectedOption && handleUpgrade(selectedOption)}
              disabled={!selectedOption || loading}
              className="flex-1 btn-primary group"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                <>
                  {selectedOption?.type === 'upgrade' ? 'Upgrade Now' : 'Purchase Add-on'}
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UpgradeModal