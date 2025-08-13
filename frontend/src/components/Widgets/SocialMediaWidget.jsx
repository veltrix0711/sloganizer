import React from 'react';
import { Share2, Calendar, TrendingUp, Users, Crown, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../services/authContext';

const SocialMediaWidget = () => {
  const { user } = useAuth();
  
  const hasAccess = user?.subscription?.plan_code === 'AGENCY' || 
                    user?.subscription_tier === 'pro-500' ||
                    user?.subscription_tier === 'premium';

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center">
          <Share2 className="w-5 h-5 mr-2 text-blue-400" />
          Social Media Manager
        </h3>
        {!hasAccess && (
          <Crown className="w-5 h-5 text-purple-400" />
        )}
      </div>

      {hasAccess ? (
        <div className="space-y-4">
          <p className="text-slate-300 text-sm">
            Schedule posts, track analytics, and manage your social presence across all platforms.
          </p>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-700/30 rounded-lg p-3 text-center">
              <Calendar className="w-6 h-6 text-green-400 mx-auto mb-1" />
              <p className="text-xs text-slate-300">Schedule Posts</p>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-3 text-center">
              <TrendingUp className="w-6 h-6 text-purple-400 mx-auto mb-1" />
              <p className="text-xs text-slate-300">Track Analytics</p>
            </div>
          </div>

          <Link
            to="/social-media"
            className="block w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-medium text-white text-center shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105"
          >
            Open Social Manager
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-slate-300 text-sm">
            Automate your social media presence with scheduling, analytics, and cross-platform management.
          </p>
          
          <div className="space-y-2">
            <div className="flex items-center text-slate-300 text-sm">
              <Calendar className="w-4 h-4 text-blue-400 mr-2" />
              Schedule posts across all platforms
            </div>
            <div className="flex items-center text-slate-300 text-sm">
              <Users className="w-4 h-4 text-green-400 mr-2" />
              Connect multiple social accounts
            </div>
            <div className="flex items-center text-slate-300 text-sm">
              <TrendingUp className="w-4 h-4 text-purple-400 mr-2" />
              Track performance analytics
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/30 p-3 text-center">
            <Crown className="w-5 h-5 text-purple-400 mx-auto mb-1" />
            <p className="text-purple-300 text-xs mb-2">Premium Feature</p>
            <Link 
              to="/pricing" 
              className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-600 rounded-md text-white text-xs font-medium hover:shadow-lg transition-all duration-200"
            >
              <Zap className="w-3 h-3 mr-1" />
              Upgrade Now
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialMediaWidget;