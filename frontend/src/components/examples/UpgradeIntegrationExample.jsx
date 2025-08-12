import { useState } from 'react'
import { useUpgradeNudges } from '../../hooks/useUpgradeNudges'
import { Zap, TrendingUp, Video, AlertCircle } from 'lucide-react'

/**
 * Example component demonstrating how to integrate upgrade nudges
 * This shows the proper usage patterns for different scenarios
 */
const UpgradeIntegrationExample = () => {
  const {
    usage,
    checkLimits,
    triggerWatermark,
    triggerQueueFull,
    shouldShowWatermark,
    getUsagePercentage,
    isApproachingLimits,
    getCurrentPlan
  } = useUpgradeNudges()

  const [isProcessing, setIsProcessing] = useState(false)

  // Example: Generate slogan with credit check
  const handleGenerateSlogan = async () => {
    setIsProcessing(true)

    try {
      // Check if user has enough credits (1 credit per slogan)
      const canProceed = await checkLimits('credits', 1)
      
      if (!canProceed) {
        // checkLimits automatically shows upgrade modal
        return
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Your actual slogan generation logic here...
      console.log('Slogan generated successfully!')

    } finally {
      setIsProcessing(false)
    }
  }

  // Example: Create video with video minutes check
  const handleCreateVideo = async () => {
    setIsProcessing(true)

    try {
      // Check if user has enough video minutes (assume 2 minutes per video)
      const canProceed = await checkLimits('video_minutes', 2)
      
      if (!canProceed) {
        return
      }

      // Simulate video creation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      console.log('Video created successfully!')

    } finally {
      setIsProcessing(false)
    }
  }

  // Example: Export with watermark handling
  const handleExportLogo = async () => {
    setIsProcessing(true)

    try {
      // Simulate logo generation/export
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Check if user should see watermark
      if (shouldShowWatermark()) {
        // Add watermark to export and trigger nudge
        console.log('Adding watermark to logo export...')
        triggerWatermark('logo export')
      } else {
        console.log('Clean logo export (no watermark)')
      }

    } finally {
      setIsProcessing(false)
    }
  }

  // Example: Queue full scenario
  const handleAddToQueue = () => {
    // Simulate queue check
    const queueIsFull = Math.random() > 0.7 // 30% chance of full queue
    
    if (queueIsFull) {
      triggerQueueFull()
      return
    }

    console.log('Added to processing queue')
  }

  return (
    <div className="max-w-4xl mx-auto p-8 bg-space rounded-xl border border-electric/10">
      <h2 className="text-2xl font-bold text-heading mb-6">
        Upgrade Nudges Integration Demo
      </h2>

      {/* Usage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-night p-4 rounded-lg border border-electric/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-body text-sm">Posts</span>
            <span className="text-electric text-sm font-medium">
              {getUsagePercentage('posts')}%
            </span>
          </div>
          <div className="w-full bg-space rounded-full h-2">
            <div 
              className="h-2 bg-electric rounded-full transition-all duration-300"
              style={{ width: `${Math.min(getUsagePercentage('posts'), 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-night p-4 rounded-lg border border-teal/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-body text-sm">Credits</span>
            <span className="text-teal text-sm font-medium">
              {getUsagePercentage('credits')}%
            </span>
          </div>
          <div className="w-full bg-space rounded-full h-2">
            <div 
              className="h-2 bg-teal rounded-full transition-all duration-300"
              style={{ width: `${Math.min(getUsagePercentage('credits'), 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-night p-4 rounded-lg border border-orange/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-body text-sm">Video</span>
            <span className="text-orange text-sm font-medium">
              {getUsagePercentage('video')}%
            </span>
          </div>
          <div className="w-full bg-space rounded-full h-2">
            <div 
              className="h-2 bg-orange rounded-full transition-all duration-300"
              style={{ width: `${Math.min(getUsagePercentage('video'), 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="mb-8">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-electric rounded-full mr-2" />
            <span className="text-body">Plan: {getCurrentPlan()}</span>
          </div>
          
          {isApproachingLimits() && (
            <div className="flex items-center text-orange">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span>Approaching limits</span>
            </div>
          )}

          {shouldShowWatermark() && (
            <div className="flex items-center text-muted">
              <span>Trial mode - watermarks active</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={handleGenerateSlogan}
          disabled={isProcessing}
          className="flex items-center justify-center px-4 py-3 bg-grad-surge rounded-lg text-white font-medium hover:scale-105 transition-all duration-200 disabled:opacity-50"
        >
          <Zap className="h-5 w-5 mr-2" />
          Generate Slogan
        </button>

        <button
          onClick={handleCreateVideo}
          disabled={isProcessing}
          className="flex items-center justify-center px-4 py-3 bg-grad-heat rounded-lg text-white font-medium hover:scale-105 transition-all duration-200 disabled:opacity-50"
        >
          <Video className="h-5 w-5 mr-2" />
          Create Video
        </button>

        <button
          onClick={handleExportLogo}
          disabled={isProcessing}
          className="flex items-center justify-center px-4 py-3 bg-grad-quantum rounded-lg text-white font-medium hover:scale-105 transition-all duration-200 disabled:opacity-50"
        >
          Export Logo
        </button>

        <button
          onClick={handleAddToQueue}
          className="flex items-center justify-center px-4 py-3 bg-space border border-electric/20 rounded-lg text-body font-medium hover:border-electric/40 transition-all duration-200"
        >
          <TrendingUp className="h-5 w-5 mr-2" />
          Add to Queue
        </button>
      </div>

      {/* Usage Information */}
      <div className="mt-8 p-4 bg-night/50 rounded-lg border border-muted/10">
        <h3 className="text-heading font-medium mb-2">Integration Notes:</h3>
        <ul className="text-body text-sm space-y-1">
          <li>• Use <code className="text-electric">checkLimits()</code> before resource-consuming actions</li>
          <li>• Call <code className="text-electric">triggerWatermark()</code> when adding watermarks to exports</li>
          <li>• Use <code className="text-electric">triggerQueueFull()</code> when queue capacity is reached</li>
          <li>• Check <code className="text-electric">shouldShowWatermark()</code> for trial users</li>
          <li>• Monitor <code className="text-electric">getUsagePercentage()</code> for UI indicators</li>
        </ul>
      </div>
    </div>
  )
}

export default UpgradeIntegrationExample