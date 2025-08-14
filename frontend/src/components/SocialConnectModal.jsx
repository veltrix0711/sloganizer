import { useState } from 'react'
import { X, Instagram, Twitter, Facebook, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '../services/authContext'
import api from '../services/api'
import toast from 'react-hot-toast'

const SocialConnectModal = ({ isOpen, onClose, onAccountConnected }) => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState(null)
  const [step, setStep] = useState('select') // 'select', 'connecting', 'success'

  const platforms = [
    {
      id: 'instagram',
      name: 'Instagram',
      icon: <Instagram className="h-6 w-6" />,
      color: 'from-pink-500 to-purple-600',
      description: 'Connect your Instagram Business account to track posts, stories, and reels performance.',
      available: true
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: <Facebook className="h-6 w-6" />,
      color: 'from-blue-500 to-blue-700',
      description: 'Connect your Facebook Page to analyze post engagement and reach.',
      available: true
    },
    {
      id: 'twitter',
      name: 'Twitter/X',
      icon: <Twitter className="h-6 w-6" />,
      color: 'from-blue-400 to-blue-600',
      description: 'Connect your Twitter account to track tweet performance and engagement.',
      available: false // Twitter API requires special approval
    }
  ]

  const handlePlatformSelect = (platform) => {
    setSelectedPlatform(platform)
    
    if (!platform.available) {
      toast.error(`${platform.name} integration coming soon!`)
      return
    }

    handleConnect(platform)
  }

  const handleConnect = async (platform) => {
    setLoading(true)
    setStep('connecting')

    try {
      // In a real implementation, this would:
      // 1. Open OAuth popup window for the platform
      // 2. Handle the OAuth flow
      // 3. Get access tokens
      // 4. Store the connection

      // For demo purposes, we'll simulate the connection
      await simulateOAuthFlow(platform)

    } catch (error) {
      console.error('Connection error:', error)
      toast.error(`Failed to connect ${platform.name}`)
      setStep('select')
    } finally {
      setLoading(false)
    }
  }

  const simulateOAuthFlow = async (platform) => {
    // Simulate OAuth flow delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // For demo purposes, create a mock connection
    const mockData = {
      email: user.email,
      platform: platform.id,
      accessToken: `mock_${platform.id}_token_${Date.now()}`,
      refreshToken: `mock_${platform.id}_refresh_${Date.now()}`,
      platformUserData: {
        id: `mock_user_${platform.id}_${Date.now()}`,
        username: `user_${platform.id}`,
        display_name: `Demo ${platform.name} Account`,
        profile_picture_url: `https://via.placeholder.com/150?text=${platform.name}`,
        expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString() // 60 days
      }
    }

    // Send to backend
    const response = await api.post('/analytics/connect', mockData)

    if (response.data.success) {
      setStep('success')
      toast.success(`${platform.name} connected successfully!`)
      
      // Trigger sync
      setTimeout(async () => {
        try {
          await api.post('/analytics/sync', {
            email: user.email,
            platform: platform.id
          })
          toast.success(`${platform.name} data sync started`)
        } catch (syncError) {
          console.error('Sync error:', syncError)
        }
      }, 1000)

      // Notify parent component
      if (onAccountConnected) {
        onAccountConnected(platform.id)
      }

      // Close modal after delay
      setTimeout(() => {
        onClose()
        setStep('select')
        setSelectedPlatform(null)
      }, 2000)
    } else {
      throw new Error(response.data.error || 'Connection failed')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-xl font-bold text-heading">Connect Social Media</h2>
            <p className="text-sm text-muted mt-1">Connect your accounts to start tracking analytics</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-muted" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'select' && (
            <div className="space-y-4">
              <p className="text-body text-sm mb-6">
                Choose which social media platforms you'd like to connect to start tracking your content performance.
              </p>

              {platforms.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => handlePlatformSelect(platform)}
                  disabled={!platform.available}
                  className={`w-full p-4 rounded-xl border text-left transition-all duration-200 ${
                    platform.available
                      ? 'border-slate-600 hover:border-electric hover:bg-slate-700/50 cursor-pointer'
                      : 'border-slate-700 bg-slate-700/50 cursor-not-allowed opacity-60'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${platform.color} flex-shrink-0`}>
                      {platform.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-heading">{platform.name}</h3>
                        {!platform.available && (
                          <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full">
                            Coming Soon
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted mt-1 line-clamp-2">
                        {platform.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}

              <div className="mt-6 p-4 bg-slate-700/50 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-heading">Secure Connection</h4>
                    <p className="text-xs text-muted mt-1">
                      Your social media data is encrypted and only used to provide analytics insights. 
                      We never post on your behalf without permission.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'connecting' && selectedPlatform && (
            <div className="text-center py-8">
              <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${selectedPlatform.color} flex items-center justify-center mx-auto mb-4`}>
                {loading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                ) : (
                  selectedPlatform.icon
                )}
              </div>
              <h3 className="text-lg font-semibold text-heading mb-2">
                Connecting to {selectedPlatform.name}
              </h3>
              <p className="text-muted text-sm mb-6">
                Please complete the authorization in the popup window...
              </p>
              <div className="space-y-2 text-xs text-muted">
                <p>• Authorizing access to your account</p>
                <p>• Setting up data sync</p>
                <p>• Configuring analytics tracking</p>
              </div>
            </div>
          )}

          {step === 'success' && selectedPlatform && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-heading mb-2">
                {selectedPlatform.name} Connected!
              </h3>
              <p className="text-muted text-sm mb-4">
                Your account has been successfully connected. We're now syncing your data.
              </p>
              <div className="text-xs text-green-400">
                ✓ Data sync initiated
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 'select' && (
          <div className="px-6 py-4 border-t border-slate-700 bg-slate-700/30">
            <p className="text-xs text-muted text-center">
              Need help? Check our{' '}
              <a href="/help" className="text-electric hover:underline">
                connection guide
              </a>{' '}
              for step-by-step instructions.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SocialConnectModal