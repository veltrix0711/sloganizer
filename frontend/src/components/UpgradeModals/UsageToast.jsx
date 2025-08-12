import { useState, useEffect } from 'react'
import { 
  X, 
  AlertTriangle, 
  Zap, 
  TrendingUp, 
  Crown,
  Sparkles,
  ArrowRight
} from 'lucide-react'

const UsageToast = ({ 
  isVisible, 
  onClose, 
  onUpgrade,
  type = 'warning', // warning, watermark, queue_full
  usage = {},
  message,
  autoClose = true,
  duration = 8000
}) => {
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    if (isVisible && autoClose) {
      const timer = setTimeout(() => {
        handleClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [isVisible, autoClose, duration])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      onClose()
      setIsExiting(false)
    }, 300)
  }

  const getToastConfig = () => {
    switch (type) {
      case 'watermark':
        return {
          icon: <Sparkles className="h-5 w-5" />,
          title: 'Watermark Added',
          subtitle: message || 'Upgrade to remove watermarks from exports',
          bgClass: 'bg-orange/10 border-orange/30',
          iconBg: 'bg-orange/20',
          iconColor: 'text-orange',
          buttonClass: 'bg-orange hover:bg-orange/90',
          ctaText: 'Remove Watermarks'
        }
      case 'queue_full':
        return {
          icon: <TrendingUp className="h-5 w-5" />,
          title: 'Queue Full',
          subtitle: message || 'Your processing queue is full. Upgrade for priority processing.',
          bgClass: 'bg-electric/10 border-electric/30',
          iconBg: 'bg-electric/20',
          iconColor: 'text-electric',
          buttonClass: 'bg-electric hover:bg-electric/90',
          ctaText: 'Get Priority Queue'
        }
      case 'limit_reached':
        return {
          icon: <Crown className="h-5 w-5" />,
          title: 'Limit Reached',
          subtitle: message || 'You\'ve reached your current plan limits',
          bgClass: 'bg-teal/10 border-teal/30',
          iconBg: 'bg-teal/20',
          iconColor: 'text-teal',
          buttonClass: 'bg-teal hover:bg-teal/90',
          ctaText: 'Upgrade Plan'
        }
      default: // warning
        return {
          icon: <AlertTriangle className="h-5 w-5" />,
          title: 'Usage Warning',
          subtitle: message || `You've used ${usage.percentage || 80}% of your ${usage.type || 'resources'}`,
          bgClass: 'bg-orange/10 border-orange/30',
          iconBg: 'bg-orange/20',
          iconColor: 'text-orange',
          buttonClass: 'bg-orange hover:bg-orange/90',
          ctaText: 'Upgrade Now'
        }
    }
  }

  const config = getToastConfig()

  if (!isVisible && !isExiting) return null

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 transform ${
      isVisible && !isExiting 
        ? 'translate-x-0 opacity-100 scale-100' 
        : 'translate-x-full opacity-0 scale-95'
    }`}>
      <div className={`max-w-sm w-full border rounded-xl p-4 backdrop-blur-sm shadow-xl ${config.bgClass}`}>
        <div className="flex items-start">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 flex-shrink-0 ${config.iconBg}`}>
            <div className={config.iconColor}>
              {config.icon}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-bold text-heading truncate">
                {config.title}
              </h4>
              <button
                onClick={handleClose}
                className="p-1 text-muted hover:text-heading rounded transition-colors ml-2"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-body mb-3 leading-relaxed">
              {config.subtitle}
            </p>

            {/* Usage indicators for warning type */}
            {type === 'warning' && usage && Object.keys(usage).length > 0 && (
              <div className="mb-3 p-2 bg-space/50 rounded-lg">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted">{usage.type || 'Usage'}</span>
                  <span className="text-heading font-medium">
                    {usage.used?.toLocaleString() || 0} / {usage.limit?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="mt-1 w-full bg-space rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      (usage.percentage || 0) >= 90 ? 'bg-orange' : 
                      (usage.percentage || 0) >= 80 ? 'bg-orange' : 'bg-teal'
                    }`}
                    style={{ width: `${Math.min(usage.percentage || 0, 100)}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={onUpgrade}
                className={`flex-1 px-3 py-1.5 rounded-lg text-white text-xs font-medium transition-all duration-200 hover:scale-105 ${config.buttonClass} flex items-center justify-center group`}
              >
                {config.ctaText}
                <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
              </button>
              
              {autoClose && (
                <button
                  onClick={handleClose}
                  className="px-3 py-1.5 text-xs text-muted hover:text-body transition-colors"
                >
                  Later
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Progress bar for auto-close */}
        {autoClose && isVisible && !isExiting && (
          <div className="mt-3 w-full bg-space/30 rounded-full h-0.5 overflow-hidden">
            <div 
              className="h-0.5 bg-gradient-to-r from-electric to-teal rounded-full animate-shrink"
              style={{ animationDuration: `${duration}ms` }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default UsageToast