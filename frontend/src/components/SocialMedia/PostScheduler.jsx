import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Send, 
  Save, 
  Instagram, 
  Linkedin, 
  Twitter, 
  Facebook,
  Image as ImageIcon,
  Hash,
  Sparkles,
  Eye,
  X
} from 'lucide-react';
import { useAuth } from '../../services/authContext';
import toast from 'react-hot-toast';

const PostScheduler = ({ onClose }) => {
  const { user } = useAuth();
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [postContent, setPostContent] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [scheduledDateTime, setScheduledDateTime] = useState('');
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const platformIcons = {
    instagram: Instagram,
    linkedin: Linkedin,
    twitter: Twitter,
    facebook: Facebook
  };

  const platformColors = {
    instagram: 'from-pink-500 to-purple-600',
    linkedin: 'from-blue-600 to-blue-700',
    twitter: 'from-blue-400 to-blue-500',
    facebook: 'from-blue-700 to-blue-800'
  };

  const platformLimits = {
    instagram: 2200,
    linkedin: 3000,
    twitter: 280,
    facebook: 8000
  };

  useEffect(() => {
    loadConnectedAccounts();
    
    // Set default date/time to 1 hour from now
    const defaultDateTime = new Date();
    defaultDateTime.setHours(defaultDateTime.getHours() + 1);
    setScheduledDateTime(defaultDateTime.toISOString().slice(0, 16));
  }, []);

  const loadConnectedAccounts = async () => {
    try {
      const response = await fetch('/api/social-media/accounts', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setConnectedAccounts(data.accounts || []);
      }
    } catch (error) {
      console.error('Error loading connected accounts:', error);
    }
  };

  const generateContent = async (platform, contentType = 'promotional') => {
    setIsGeneratingContent(true);
    try {
      const response = await fetch('/api/social-media/content/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          platform,
          contentType,
          businessName: user?.business_name || 'Your Business',
          industry: user?.industry || 'business',
          targetAudience: user?.target_audience || 'customers'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setPostContent(data.content);
        toast.success('Content generated successfully!');
      } else {
        toast.error('Failed to generate content');
      }
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error('Failed to generate content');
    } finally {
      setIsGeneratingContent(false);
    }
  };

  const schedulePost = async () => {
    if (!postContent.trim()) {
      toast.error('Please enter post content');
      return;
    }

    if (selectedAccounts.length === 0) {
      toast.error('Please select at least one account');
      return;
    }

    if (!scheduledDateTime) {
      toast.error('Please select a date and time');
      return;
    }

    const scheduledDate = new Date(scheduledDateTime);
    if (scheduledDate <= new Date()) {
      toast.error('Scheduled time must be in the future');
      return;
    }

    setIsScheduling(true);
    try {
      const hashtagArray = hashtags
        .split(/[#\s,]+/)
        .filter(tag => tag.trim())
        .map(tag => tag.replace('#', ''));

      // Schedule post for each selected account
      const promises = selectedAccounts.map(accountId =>
        fetch('/api/social-media/posts/schedule', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            socialAccountId: accountId,
            contentText: postContent,
            hashtags: hashtagArray,
            scheduledFor: scheduledDateTime,
            createdFrom: 'manual'
          })
        })
      );

      const results = await Promise.all(promises);
      const successCount = results.filter(result => result.ok).length;
      
      if (successCount === selectedAccounts.length) {
        toast.success(`Post scheduled for ${successCount} account(s)!`);
        onClose?.();
      } else {
        toast.error(`Only ${successCount} of ${selectedAccounts.length} posts were scheduled`);
      }
    } catch (error) {
      console.error('Error scheduling post:', error);
      toast.error('Failed to schedule post');
    } finally {
      setIsScheduling(false);
    }
  };

  const toggleAccountSelection = (accountId) => {
    setSelectedAccounts(prev => 
      prev.includes(accountId)
        ? prev.filter(id => id !== accountId)
        : [...prev, accountId]
    );
  };

  const getCharacterLimit = () => {
    if (selectedAccounts.length === 0) return 2200;
    
    const selectedPlatforms = connectedAccounts
      .filter(account => selectedAccounts.includes(account.id))
      .map(account => account.platform);
    
    return Math.min(...selectedPlatforms.map(platform => platformLimits[platform]));
  };

  const isOverLimit = postContent.length > getCharacterLimit();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">Schedule Post</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Account Selection */}
          <div>
            <label className="block text-sm font-medium text-white mb-3">
              Select Accounts to Post To
            </label>
            {connectedAccounts.length === 0 ? (
              <div className="text-center py-8 bg-slate-700/30 rounded-lg">
                <p className="text-slate-400">No connected accounts found</p>
                <p className="text-slate-500 text-sm mt-1">
                  Connect your social media accounts first
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {connectedAccounts.map(account => {
                  const Icon = platformIcons[account.platform];
                  const isSelected = selectedAccounts.includes(account.id);
                  
                  return (
                    <button
                      key={account.id}
                      onClick={() => toggleAccountSelection(account.id)}
                      className={`flex items-center p-4 rounded-lg border-2 transition-all duration-200 ${
                        isSelected
                          ? 'border-cyan-500 bg-cyan-500/10'
                          : 'border-slate-600 hover:border-slate-500 bg-slate-700/30'
                      }`}
                    >
                      <div className={`w-10 h-10 bg-gradient-to-r ${platformColors[account.platform]} rounded-lg flex items-center justify-center mr-3`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-white font-medium">{account.account_name}</p>
                        <p className="text-slate-400 text-sm capitalize">{account.platform}</p>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Content Generation */}
          {selectedAccounts.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-white mb-3">
                Quick Content Generation
              </label>
              <div className="flex flex-wrap gap-2">
                {['promotional', 'engagement', 'educational'].map(type => (
                  <button
                    key={type}
                    onClick={() => {
                      const selectedPlatform = connectedAccounts.find(
                        account => selectedAccounts.includes(account.id)
                      )?.platform;
                      generateContent(selectedPlatform, type);
                    }}
                    disabled={isGeneratingContent}
                    className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50 flex items-center"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Post Content */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-white">
                Post Content
              </label>
              <div className="text-sm">
                <span className={`${isOverLimit ? 'text-red-400' : 'text-slate-400'}`}>
                  {postContent.length}
                </span>
                <span className="text-slate-500">/{getCharacterLimit()}</span>
              </div>
            </div>
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="What's happening? Share your thoughts..."
              className={`w-full h-32 px-4 py-3 bg-slate-700/50 border rounded-lg text-white placeholder-slate-400 focus:ring-1 transition-all duration-200 ${
                isOverLimit
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-slate-600 focus:border-cyan-500 focus:ring-cyan-500'
              }`}
              disabled={isGeneratingContent}
            />
            {isOverLimit && (
              <p className="text-red-400 text-sm mt-2">
                Content exceeds character limit for selected platforms
              </p>
            )}
          </div>

          {/* Hashtags */}
          <div>
            <label className="block text-sm font-medium text-white mb-3">
              Hashtags (Optional)
            </label>
            <div className="flex items-center">
              <Hash className="w-5 h-5 text-slate-400 mr-2" />
              <input
                type="text"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                placeholder="innovation marketing business"
                className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-200"
              />
            </div>
            <p className="text-slate-400 text-sm mt-2">
              Separate hashtags with spaces or commas
            </p>
          </div>

          {/* Schedule DateTime */}
          <div>
            <label className="block text-sm font-medium text-white mb-3">
              Schedule Date & Time
            </label>
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-slate-400 mr-2" />
              <input
                type="datetime-local"
                value={scheduledDateTime}
                onChange={(e) => setScheduledDateTime(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-200"
              />
            </div>
          </div>

          {/* Preview */}
          {postContent && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-white">
                  Preview
                </label>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center text-cyan-400 hover:text-cyan-300 text-sm"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  {showPreview ? 'Hide' : 'Show'} Preview
                </button>
              </div>
              
              {showPreview && (
                <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
                  <div className="space-y-3">
                    {selectedAccounts.map(accountId => {
                      const account = connectedAccounts.find(a => a.id === accountId);
                      const Icon = platformIcons[account.platform];
                      
                      return (
                        <div key={accountId} className="border border-slate-600 rounded-lg p-4">
                          <div className="flex items-center mb-3">
                            <div className={`w-8 h-8 bg-gradient-to-r ${platformColors[account.platform]} rounded-lg flex items-center justify-center mr-2`}>
                              <Icon className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-white font-medium">{account.account_name}</span>
                            <span className="text-slate-400 text-sm ml-2 capitalize">
                              • {account.platform}
                            </span>
                          </div>
                          
                          <p className="text-white whitespace-pre-wrap mb-2">
                            {postContent}
                          </p>
                          
                          {hashtags && (
                            <div className="flex flex-wrap gap-1">
                              {hashtags.split(/[#\s,]+/).filter(tag => tag.trim()).map((tag, index) => (
                                <span key={index} className="text-cyan-400 text-sm">
                                  #{tag.replace('#', '')}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-700">
          <div className="text-slate-400 text-sm">
            {selectedAccounts.length > 0 && (
              <span>Scheduling for {selectedAccounts.length} account(s)</span>
            )}
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-3 text-slate-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={schedulePost}
              disabled={
                isScheduling || 
                !postContent.trim() || 
                selectedAccounts.length === 0 || 
                !scheduledDateTime ||
                isOverLimit
              }
              className="flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isScheduling ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Schedule Post
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostScheduler;