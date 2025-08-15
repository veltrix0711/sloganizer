import React, { useState } from 'react';
import { useAuth } from '../services/authContext';
import SocialMediaDashboard from '../components/SocialMedia/SocialMediaDashboard';
import PostScheduler from '../components/SocialMedia/PostScheduler';
import AccountConnector from '../components/SocialMedia/AccountConnector';
import ComingSoon from '../components/ComingSoon';
import { Share2, Calendar, BarChart3 } from 'lucide-react';

const SocialMediaPage = () => {
  const { user } = useAuth();
  const [showPostScheduler, setShowPostScheduler] = useState(false);
  const [showAccountConnector, setShowAccountConnector] = useState(false);
  const [dashboardKey, setDashboardKey] = useState(0);

  // Check if user has access to social media features
  const hasAccess = user?.subscription?.plan_code === 'AGENCY' || 
                    user?.subscription_tier === 'pro-500' ||
                    user?.subscription_tier === 'premium';

  const refreshDashboard = () => {
    setDashboardKey(prev => prev + 1);
  };

  const handleAccountConnected = (account) => {
    refreshDashboard();
  };

  const handlePostScheduled = () => {
    refreshDashboard();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Authentication Required</h2>
          <p className="text-slate-300">Please sign in to access social media management</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-slate-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-12 text-center shadow-2xl">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">
              Social Media Management
            </h1>
            <p className="text-lg text-slate-300 mb-8 leading-relaxed max-w-2xl mx-auto">
              Connect your social media accounts, schedule posts, and analyze your social media performance with our comprehensive social media management suite.
            </p>
            
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6 mb-8">
              <h3 className="text-purple-300 font-semibold text-lg mb-3">🚀 Premium Feature</h3>
              <p className="text-purple-200/80 mb-4">
                Social Media Management is available for Premium and Pro-500 subscribers
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="space-y-2">
                  <div className="flex items-center text-purple-200">
                    <svg className="w-4 h-4 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Connect multiple social accounts
                  </div>
                  <div className="flex items-center text-purple-200">
                    <svg className="w-4 h-4 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Schedule posts across platforms
                  </div>
                  <div className="flex items-center text-purple-200">
                    <svg className="w-4 h-4 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    AI-powered content generation
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-purple-200">
                    <svg className="w-4 h-4 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Analytics and performance tracking
                  </div>
                  <div className="flex items-center text-purple-200">
                    <svg className="w-4 h-4 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Automated posting schedules
                  </div>
                  <div className="flex items-center text-purple-200">
                    <svg className="w-4 h-4 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Brand voice integration
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                Upgrade to Premium
              </button>
              <button className="px-8 py-3 bg-slate-700/50 border border-slate-600 rounded-lg font-semibold text-slate-300 hover:bg-slate-600/50 hover:border-purple-500/50 hover:text-purple-400 transition-all duration-200">
                View Pricing
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">Social Media Management</h1>
          <p className="text-slate-300 max-w-2xl mx-auto">
            Manage your social media presence with AI-powered content generation and automated posting
          </p>
        </div>

        {/* Coming Soon Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Auto Posting Coming Soon */}
          <ComingSoon 
            title="Auto Post Scheduling"
            description="Schedule and automatically post content across multiple social media platforms with AI-optimized timing."
            icon={Calendar}
            features={[
              "Multi-platform posting",
              "Optimal timing suggestions",
              "Content calendar view",
              "Bulk post scheduling",
              "Auto-hashtag generation"
            ]}
          />

          {/* Account Connector Coming Soon */}
          <ComingSoon 
            title="Social Account Integration"
            description="Connect and manage multiple social media accounts from one unified dashboard."
            icon={Share2}
            features={[
              "Instagram, Facebook, Twitter, LinkedIn",
              "Real-time account sync",
              "Cross-platform analytics",
              "Unified inbox management",
              "Team collaboration tools"
            ]}
          />

        </div>

        {/* Analytics Coming Soon */}
        <div className="mb-8">
          <ComingSoon 
            title="Advanced Analytics Dashboard"
            description="Get deep insights into your social media performance with AI-powered analytics and recommendations."
            icon={BarChart3}
            features={[
              "Engagement tracking across platforms",
              "Audience growth analytics",
              "Content performance insights",
              "AI-powered recommendations",
              "Competitor analysis",
              "ROI tracking and reporting"
            ]}
          />
        </div>

        {/* What's Available Now */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-white mb-4">Available Now</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">AI Content Generation</h4>
                <p className="text-slate-300 text-sm">Generate engaging social media posts using our AI tools in the Brand Suite</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Brand Analysis</h4>
                <p className="text-slate-300 text-sm">Analyze your brand's social presence and get recommendations</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SocialMediaPage;