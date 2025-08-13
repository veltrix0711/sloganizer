import React, { useState } from 'react';
import { useAuth } from '../services/authContext';
import SocialMediaDashboard from '../components/SocialMedia/SocialMediaDashboard';
import PostScheduler from '../components/SocialMedia/PostScheduler';
import AccountConnector from '../components/SocialMedia/AccountConnector';

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
    <>
      <SocialMediaDashboard key={dashboardKey} />
      
      {/* Modals */}
      {showPostScheduler && (
        <PostScheduler 
          onClose={() => setShowPostScheduler(false)}
          onScheduled={handlePostScheduled}
        />
      )}
      
      {showAccountConnector && (
        <AccountConnector 
          onClose={() => setShowAccountConnector(false)}
          onConnected={handleAccountConnected}
        />
      )}

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col space-y-4">
        <button
          onClick={() => setShowPostScheduler(true)}
          className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:shadow-green-500/25 hover:scale-110 transition-all duration-300"
          title="Schedule Post"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
        
        <button
          onClick={() => setShowAccountConnector(true)}
          className="w-14 h-14 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:shadow-cyan-500/25 hover:scale-110 transition-all duration-300"
          title="Connect Account"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </button>
      </div>
    </>
  );
};

export default SocialMediaPage;