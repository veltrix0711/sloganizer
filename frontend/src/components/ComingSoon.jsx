import React from 'react';
import { Clock, Sparkles, Bell, Star } from 'lucide-react';

const ComingSoon = ({ 
  title = "Coming Soon", 
  description = "This feature is currently in development and will be available soon.",
  icon: Icon = Sparkles,
  features = [],
  showNotifyButton = true 
}) => {
  const handleNotifyMe = () => {
    // You can implement email signup or notification here
    alert('Thanks for your interest! We\'ll notify you when this feature is ready.');
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 text-center shadow-xl">
      {/* Icon */}
      <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg">
        <Icon className="w-8 h-8 text-white" />
      </div>
      
      {/* Coming Soon Badge */}
      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-full px-4 py-2 mb-4">
        <Clock className="w-4 h-4 text-yellow-400" />
        <span className="text-yellow-400 font-medium text-sm">Coming Soon</span>
      </div>

      {/* Title */}
      <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
      
      {/* Description */}
      <p className="text-slate-300 mb-6 max-w-md mx-auto leading-relaxed">
        {description}
      </p>

      {/* Features Preview */}
      {features.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-white mb-3">What to Expect:</h4>
          <div className="space-y-2">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3 text-slate-300 justify-center">
                <Star className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notify Button */}
      {showNotifyButton && (
        <button
          onClick={handleNotifyMe}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Bell className="w-4 h-4" />
          Notify Me When Ready
        </button>
      )}

      {/* Progress Indicator */}
      <div className="mt-6 pt-6 border-t border-slate-700">
        <div className="text-slate-400 text-sm">
          Development Progress
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full transition-all duration-500" 
               style={{ width: '75%' }}></div>
        </div>
        <div className="text-slate-400 text-xs mt-1">75% Complete</div>
      </div>
    </div>
  );
};

export default ComingSoon;