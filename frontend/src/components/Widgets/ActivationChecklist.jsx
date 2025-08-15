import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle, ChevronDown, ChevronRight, X, Crown, Sparkles, Target, MessageSquare, Palette } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../services/authContext';

const ActivationChecklist = ({ user, onDismiss }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [checklistData, setChecklistData] = useState({
    hasGeneratedSlogan: false,
    hasBrandProfile: false,
    hasVoiceTraining: false,
    hasGeneratedName: false,
    hasGeneratedLogo: false,
    hasSavedFavorite: false
  });

  useEffect(() => {
    if (user && session?.access_token) {
      loadChecklistProgress();
    }
  }, [user, session]);

  const { session } = useAuth();

  const loadChecklistProgress = async () => {
    try {
      if (!session?.access_token) {
        console.log('No authenticated session available');
        return;
      }

      // Check for brand profiles
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const profilesResponse = await fetch(`${API_BASE_URL}/api/brand/profiles`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (profilesResponse.ok) {
        const profilesData = await profilesResponse.json();
        const hasProfiles = profilesData.profiles?.length > 0;
        
        // Check voice training status for any profile
        let hasVoiceTraining = false;
        if (hasProfiles) {
          for (const profile of profilesData.profiles) {
            try {
              const voiceResponse = await fetch(`${API_BASE_URL}/api/voice-training/profiles/${profile.id}/status`, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${session.access_token}`,
                  'Content-Type': 'application/json'
                }
              });
              if (voiceResponse.ok) {
                const voiceData = await voiceResponse.json();
                if (voiceData.progress?.analyzed_samples > 0) {
                  hasVoiceTraining = true;
                  break;
                }
              }
            } catch (error) {
              console.log('Voice training check failed for profile:', profile.id);
            }
          }
        }

        setChecklistData(prev => ({
          ...prev,
          hasBrandProfile: hasProfiles,
          hasVoiceTraining
        }));
      }

      // Check localStorage for other completed actions
      const localProgress = JSON.parse(localStorage.getItem('checklistProgress') || '{}');
      setChecklistData(prev => ({
        ...prev,
        ...localProgress
      }));

    } catch (error) {
      console.error('Error loading checklist progress:', error);
    }
  };

  const markCompleted = (action) => {
    const updatedData = { ...checklistData, [action]: true };
    setChecklistData(updatedData);
    
    // Save to localStorage
    localStorage.setItem('checklistProgress', JSON.stringify(updatedData));
  };

  // Allow external components to mark actions as completed
  useEffect(() => {
    window.markChecklistAction = markCompleted;
    return () => {
      delete window.markChecklistAction;
    };
  }, [checklistData]);

  const checklistItems = [
    {
      id: 'hasGeneratedSlogan',
      title: 'Generate your first slogan',
      description: 'Create compelling slogans for your business',
      icon: Sparkles,
      completed: checklistData.hasGeneratedSlogan,
      link: '/generate',
      points: 10
    },
    {
      id: 'hasBrandProfile',
      title: 'Create a brand profile',
      description: 'Set up your brand identity and guidelines',
      icon: Target,
      completed: checklistData.hasBrandProfile,
      link: '/brand-suite',
      points: 20,
      premium: false
    },
    {
      id: 'hasVoiceTraining',
      title: 'Train your brand voice',
      description: 'Upload content to train AI on your brand voice',
      icon: MessageSquare,
      completed: checklistData.hasVoiceTraining,
      link: '/brand-suite',
      points: 30,
      premium: true
    },
    {
      id: 'hasGeneratedName',
      title: 'Generate business names',
      description: 'Explore creative names for your business',
      icon: Sparkles,
      completed: checklistData.hasGeneratedName,
      link: '/generate',
      points: 10
    },
    {
      id: 'hasGeneratedLogo',
      title: 'Create logo concepts',
      description: 'Generate visual identity for your brand',
      icon: Palette,
      completed: checklistData.hasGeneratedLogo,
      link: '/generate',
      points: 15
    },
    {
      id: 'hasSavedFavorite',
      title: 'Save your favorites',
      description: 'Build a collection of your best content',
      icon: CheckCircle,
      completed: checklistData.hasSavedFavorite,
      link: '/favorites',
      points: 5,
      premium: false
    }
  ];

  const completedCount = checklistItems.filter(item => item.completed).length;
  const totalPoints = checklistItems.filter(item => item.completed).reduce((sum, item) => sum + item.points, 0);
  const completionPercentage = Math.round((completedCount / checklistItems.length) * 100);

  if (!user) return null;

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-slate-800/95 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-2xl z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-lg flex items-center justify-center">
            <Target className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">Getting Started</h3>
            <p className="text-slate-400 text-xs">{completedCount}/{checklistItems.length} completed • {totalPoints} points</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 text-slate-400 hover:text-white transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            onClick={onDismiss}
            className="p-1 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-4 py-2">
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-cyan-400 to-purple-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <p className="text-slate-400 text-xs mt-1 text-center">{completionPercentage}% Complete</p>
      </div>

      {/* Checklist Items */}
      {!isCollapsed && (
        <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
          {checklistItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-200 ${
                  item.completed 
                    ? 'bg-green-500/10 border-green-500/30' 
                    : 'bg-slate-700/30 border-slate-600/50 hover:border-slate-500'
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {item.completed ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${item.completed ? 'text-green-400' : 'text-slate-400'}`} />
                    <h4 className={`text-sm font-medium ${item.completed ? 'text-green-300' : 'text-white'}`}>
                      {item.title}
                    </h4>
                    {item.premium && (
                      <Crown className="w-3 h-3 text-purple-400" />
                    )}
                  </div>
                  <p className={`text-xs mt-1 ${item.completed ? 'text-green-400/70' : 'text-slate-400'}`}>
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-xs ${item.completed ? 'text-green-400' : 'text-purple-400'}`}>
                      +{item.points} points
                    </span>
                    {!item.completed && (
                      <Link
                        to={item.link}
                        className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        Start →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Completion Celebration */}
          {completedCount === checklistItems.length && (
            <div className="bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-500/30 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">🎉</div>
              <h4 className="text-green-300 font-semibold text-sm mb-1">Congratulations!</h4>
              <p className="text-green-400/70 text-xs mb-3">
                You've completed your activation checklist and earned {totalPoints} points!
              </p>
              <div className="text-xs text-slate-400">
                You're all set to build an amazing brand! 🚀
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upgrade Prompt for Free Users */}
      {!user?.subscription && !isCollapsed && (
        <div className="p-4 border-t border-slate-700">
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-3 text-center">
            <Crown className="w-5 h-5 text-purple-400 mx-auto mb-2" />
            <p className="text-purple-300 text-xs mb-2">
              Unlock all features and unlimited generations
            </p>
            <Link 
              to="/pricing" 
              className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-600 rounded-md text-white text-xs font-medium hover:shadow-lg transition-all duration-200"
            >
              Upgrade Now
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivationChecklist;