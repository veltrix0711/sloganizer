import React, { useState } from 'react';
import { 
  Instagram, 
  Linkedin, 
  Twitter, 
  Facebook,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Loader2,
  X
} from 'lucide-react';
import { useAuth } from '../../services/authContext';
import toast from 'react-hot-toast';

const AccountConnector = ({ onClose, onConnected }) => {
  const { user } = useAuth();
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionData, setConnectionData] = useState({
    accountName: '',
    accountId: '',
    accessToken: '',
    followerCount: ''
  });

  const platforms = {
    instagram: {
      name: 'Instagram',
      icon: Instagram,
      color: 'from-pink-500 to-purple-600',
      description: 'Connect your Instagram Business account',
      authUrl: 'https://api.instagram.com/oauth/authorize',
      features: ['Post photos and videos', 'Stories support', 'Analytics tracking', 'Hashtag optimization']
    },
    linkedin: {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'from-blue-600 to-blue-700',
      description: 'Connect your LinkedIn Company page',
      authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
      features: ['Professional networking', 'Article publishing', 'Company updates', 'B2B targeting']
    },
    twitter: {
      name: 'Twitter/X',
      icon: Twitter,
      color: 'from-blue-400 to-blue-500',
      description: 'Connect your Twitter/X account',
      authUrl: 'https://api.twitter.com/oauth/authorize',
      features: ['Real-time updates', 'Thread support', 'Trending topics', 'Engagement tracking']
    },
    facebook: {
      name: 'Facebook',
      icon: Facebook,
      color: 'from-blue-700 to-blue-800',
      description: 'Connect your Facebook Page',
      authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
      features: ['Page management', 'Event promotion', 'Community building', 'Detailed analytics']
    }
  };

  const handleConnect = async () => {
    if (!selectedPlatform) {
      toast.error('Please select a platform');
      return;
    }

    if (!connectionData.accountName.trim() || !connectionData.accountId.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsConnecting(true);
    try {
      const response = await fetch('/api/social-media/accounts/connect', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          platform: selectedPlatform,
          accountName: connectionData.accountName,
          accountId: connectionData.accountId,
          accessToken: connectionData.accessToken || `demo_token_${Date.now()}`,
          followerCount: parseInt(connectionData.followerCount) || 0,
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(connectionData.accountName)}&background=random`
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`${platforms[selectedPlatform].name} account connected successfully!`);
        onConnected?.(data.account);
        onClose?.();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to connect account');
      }
    } catch (error) {
      console.error('Error connecting account:', error);
      toast.error('Failed to connect account');
    } finally {
      setIsConnecting(false);
    }
  };

  const initiateOAuthFlow = (platform) => {
    // In a real implementation, this would redirect to the platform's OAuth URL
    // For demo purposes, we'll show a mock connection form
    toast.info(`OAuth flow for ${platforms[platform].name} would start here`);
    setSelectedPlatform(platform);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">Connect Social Account</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {!selectedPlatform ? (
          // Platform Selection
          <div className="p-6">
            <p className="text-slate-300 mb-6">
              Choose a social media platform to connect with your LaunchZone account
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(platforms).map(([key, platform]) => {
                const Icon = platform.icon;
                return (
                  <button
                    key={key}
                    onClick={() => initiateOAuthFlow(key)}
                    className="group p-6 bg-slate-700/30 rounded-xl border border-slate-600 hover:border-slate-500 transition-all duration-200 text-left hover:bg-slate-700/50"
                  >
                    <div className="flex items-center mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${platform.color} rounded-lg flex items-center justify-center mr-4`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-lg">{platform.name}</h3>
                        <p className="text-slate-400 text-sm">{platform.description}</p>
                      </div>
                      <ExternalLink className="w-5 h-5 text-slate-400 ml-auto group-hover:text-cyan-400 transition-colors" />
                    </div>
                    
                    <div className="space-y-2">
                      {platform.features.map((feature, index) => (
                        <div key={index} className="flex items-center text-sm text-slate-300">
                          <CheckCircle className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-blue-300 font-medium mb-1">Demo Mode</h4>
                  <p className="text-blue-200/80 text-sm">
                    For demonstration purposes, you can connect accounts using mock data. 
                    In production, this would use proper OAuth flows with each platform.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Connection Form
          <div className="p-6">
            <div className="flex items-center mb-6">
              <div className={`w-12 h-12 bg-gradient-to-r ${platforms[selectedPlatform].color} rounded-lg flex items-center justify-center mr-4`}>
                {React.createElement(platforms[selectedPlatform].icon, { className: "w-6 h-6 text-white" })}
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">Connect {platforms[selectedPlatform].name}</h3>
                <p className="text-slate-400 text-sm">{platforms[selectedPlatform].description}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Account Name *
                </label>
                <input
                  type="text"
                  value={connectionData.accountName}
                  onChange={(e) => setConnectionData(prev => ({ ...prev, accountName: e.target.value }))}
                  placeholder={`Your ${platforms[selectedPlatform].name} account name`}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Account ID *
                </label>
                <input
                  type="text"
                  value={connectionData.accountId}
                  onChange={(e) => setConnectionData(prev => ({ ...prev, accountId: e.target.value }))}
                  placeholder={`Your ${platforms[selectedPlatform].name} account ID`}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-200"
                />
                <p className="text-slate-400 text-sm mt-1">
                  This can be your username or numerical ID
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Follower Count (Optional)
                </label>
                <input
                  type="number"
                  value={connectionData.followerCount}
                  onChange={(e) => setConnectionData(prev => ({ ...prev, followerCount: e.target.value }))}
                  placeholder="1000"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Access Token (Demo)
                </label>
                <input
                  type="text"
                  value={connectionData.accessToken}
                  onChange={(e) => setConnectionData(prev => ({ ...prev, accessToken: e.target.value }))}
                  placeholder="demo_access_token_123"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-200"
                />
                <p className="text-slate-400 text-sm mt-1">
                  In production, this would be handled automatically via OAuth
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-amber-400 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-amber-300 font-medium mb-1">Demo Connection</h4>
                  <p className="text-amber-200/80 text-sm">
                    This is a demonstration connection. In a production environment, 
                    you would be redirected to {platforms[selectedPlatform].name} to authorize access.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        {selectedPlatform && (
          <div className="flex items-center justify-between p-6 border-t border-slate-700">
            <button
              onClick={() => setSelectedPlatform(null)}
              className="px-6 py-3 text-slate-300 hover:text-white transition-colors"
            >
              ← Back to Platforms
            </button>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-3 text-slate-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConnect}
                disabled={
                  isConnecting || 
                  !connectionData.accountName.trim() || 
                  !connectionData.accountId.trim()
                }
                className="flex items-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Connect Account
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountConnector;