import React, { useState, useEffect } from 'react';
import { 
  Instagram, 
  Linkedin, 
  Twitter, 
  Facebook, 
  Calendar, 
  Clock, 
  Users, 
  TrendingUp, 
  Plus,
  Settings,
  BarChart3,
  Send,
  Edit3,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../services/authContext';
import toast from 'react-hot-toast';

const SocialMediaDashboard = () => {
  const { user } = useAuth();
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadConnectedAccounts(),
        loadScheduledPosts(),
        loadAnalytics()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

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

  const loadScheduledPosts = async () => {
    try {
      const response = await fetch('/api/social-media/posts/scheduled?limit=10', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setScheduledPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Error loading scheduled posts:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await fetch('/api/social-media/analytics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics || null);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const disconnectAccount = async (accountId) => {
    try {
      const response = await fetch(`/api/social-media/accounts/${accountId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        toast.success('Account disconnected successfully');
        loadConnectedAccounts();
      } else {
        toast.error('Failed to disconnect account');
      }
    } catch (error) {
      console.error('Error disconnecting account:', error);
      toast.error('Failed to disconnect account');
    }
  };

  const deleteScheduledPost = async (postId) => {
    try {
      const response = await fetch(`/api/social-media/posts/scheduled/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        toast.success('Post deleted successfully');
        loadScheduledPosts();
      } else {
        toast.error('Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Social Media Manager</h1>
          <p className="text-slate-300">Connect, schedule, and analyze your social media presence</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-slate-800/50 rounded-lg p-1">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'accounts', label: 'Connected Accounts', icon: Users },
            { id: 'scheduled', label: 'Scheduled Posts', icon: Calendar },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 rounded-md transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-cyan-500 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Connected Accounts</p>
                    <p className="text-2xl font-bold text-white">{connectedAccounts.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-cyan-400" />
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Scheduled Posts</p>
                    <p className="text-2xl font-bold text-white">{scheduledPosts.length}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-green-400" />
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total Engagement</p>
                    <p className="text-2xl font-bold text-white">
                      {analytics?.summary?.totalLikes + analytics?.summary?.totalComments || 0}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-400" />
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Avg. Engagement Rate</p>
                    <p className="text-2xl font-bold text-white">
                      {analytics?.summary?.averageEngagementRate || 0}%
                    </p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-orange-400" />
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Connected Accounts Preview */}
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Connected Accounts</h3>
                  <button
                    onClick={() => setActiveTab('accounts')}
                    className="text-cyan-400 hover:text-cyan-300 text-sm"
                  >
                    View All →
                  </button>
                </div>
                
                {connectedAccounts.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No accounts connected yet</p>
                    <button className="mt-4 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors">
                      Connect Account
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {connectedAccounts.slice(0, 3).map(account => {
                      const Icon = platformIcons[account.platform];
                      return (
                        <div key={account.id} className="flex items-center p-3 bg-slate-700/30 rounded-lg">
                          <div className={`w-10 h-10 bg-gradient-to-r ${platformColors[account.platform]} rounded-lg flex items-center justify-center mr-3`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-medium">{account.account_name}</p>
                            <p className="text-slate-400 text-sm capitalize">{account.platform}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-slate-400">
                              {account.follower_count?.toLocaleString() || 0} followers
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Upcoming Posts Preview */}
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Upcoming Posts</h3>
                  <button
                    onClick={() => setActiveTab('scheduled')}
                    className="text-cyan-400 hover:text-cyan-300 text-sm"
                  >
                    View All →
                  </button>
                </div>
                
                {scheduledPosts.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No posts scheduled</p>
                    <button className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                      Schedule Post
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {scheduledPosts.slice(0, 3).map(post => {
                      const Icon = platformIcons[post.social_accounts?.platform];
                      return (
                        <div key={post.id} className="p-3 bg-slate-700/30 rounded-lg">
                          <div className="flex items-center mb-2">
                            <Icon className="w-4 h-4 text-slate-400 mr-2" />
                            <span className="text-slate-300 text-sm capitalize">
                              {post.social_accounts?.platform}
                            </span>
                            <Clock className="w-4 h-4 text-slate-500 ml-auto mr-1" />
                            <span className="text-slate-400 text-xs">
                              {formatDate(post.scheduled_for)}
                            </span>
                          </div>
                          <p className="text-white text-sm line-clamp-2">
                            {post.content_text}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Connected Accounts Tab */}
        {activeTab === 'accounts' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Connected Accounts</h2>
              <button className="flex items-center px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors">
                <Plus className="w-4 h-4 mr-2" />
                Connect Account
              </button>
            </div>

            {connectedAccounts.length === 0 ? (
              <div className="bg-slate-800/50 rounded-xl p-12 text-center border border-slate-700">
                <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Connected Accounts</h3>
                <p className="text-slate-400 mb-6">
                  Connect your social media accounts to start scheduling posts and tracking analytics
                </p>
                <button className="px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors">
                  Connect Your First Account
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {connectedAccounts.map(account => {
                  const Icon = platformIcons[account.platform];
                  return (
                    <div key={account.id} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                      <div className="flex items-center mb-4">
                        <div className={`w-12 h-12 bg-gradient-to-r ${platformColors[account.platform]} rounded-lg flex items-center justify-center mr-3`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-medium">{account.account_name}</h3>
                          <p className="text-slate-400 text-sm capitalize">{account.platform}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button className="p-2 text-slate-400 hover:text-white transition-colors">
                            <Settings className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => disconnectAccount(account.id)}
                            className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-slate-400 text-sm">Followers</span>
                          <span className="text-white font-medium">
                            {account.follower_count?.toLocaleString() || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 text-sm">Status</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            account.connection_status === 'connected' 
                              ? 'bg-green-500/20 text-green-300'
                              : 'bg-red-500/20 text-red-300'
                          }`}>
                            {account.connection_status}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 text-sm">Last Sync</span>
                          <span className="text-white text-sm">
                            {new Date(account.last_sync_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Scheduled Posts Tab */}
        {activeTab === 'scheduled' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Scheduled Posts</h2>
              <button className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                <Plus className="w-4 h-4 mr-2" />
                Schedule Post
              </button>
            </div>

            {scheduledPosts.length === 0 ? (
              <div className="bg-slate-800/50 rounded-xl p-12 text-center border border-slate-700">
                <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Scheduled Posts</h3>
                <p className="text-slate-400 mb-6">
                  Schedule your first post to start automating your social media presence
                </p>
                <button className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                  Create Your First Post
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {scheduledPosts.map(post => {
                  const Icon = platformIcons[post.social_accounts?.platform];
                  return (
                    <div key={post.id} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 bg-gradient-to-r ${platformColors[post.social_accounts?.platform]} rounded-lg flex items-center justify-center mr-3`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-white font-medium">
                              {post.social_accounts?.account_name}
                            </h3>
                            <p className="text-slate-400 text-sm capitalize">
                              {post.social_accounts?.platform}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            post.post_status === 'scheduled' 
                              ? 'bg-blue-500/20 text-blue-300'
                              : post.post_status === 'posted'
                              ? 'bg-green-500/20 text-green-300'
                              : 'bg-red-500/20 text-red-300'
                          }`}>
                            {post.post_status}
                          </span>
                          <button className="p-2 text-slate-400 hover:text-white transition-colors">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => deleteScheduledPost(post.id)}
                            className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-white mb-2">{post.content_text}</p>
                        {post.hashtags && post.hashtags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {post.hashtags.map((hashtag, index) => (
                              <span key={index} className="text-cyan-400 text-sm">
                                #{hashtag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-slate-400">
                          <Clock className="w-4 h-4 mr-1" />
                          Scheduled for {formatDate(post.scheduled_for)}
                        </div>
                        <div className="text-slate-400">
                          Created {new Date(post.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Analytics Overview</h2>
            
            {!analytics || Object.keys(analytics.summary || {}).length === 0 ? (
              <div className="bg-slate-800/50 rounded-xl p-12 text-center border border-slate-700">
                <BarChart3 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Analytics Data</h3>
                <p className="text-slate-400 mb-6">
                  Connect your accounts and start posting to see analytics data
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                  <h3 className="text-slate-400 text-sm mb-2">Total Likes</h3>
                  <p className="text-2xl font-bold text-white">
                    {analytics.summary.totalLikes?.toLocaleString() || 0}
                  </p>
                </div>
                
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                  <h3 className="text-slate-400 text-sm mb-2">Total Comments</h3>
                  <p className="text-2xl font-bold text-white">
                    {analytics.summary.totalComments?.toLocaleString() || 0}
                  </p>
                </div>
                
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                  <h3 className="text-slate-400 text-sm mb-2">Total Reach</h3>
                  <p className="text-2xl font-bold text-white">
                    {analytics.summary.totalReach?.toLocaleString() || 0}
                  </p>
                </div>
                
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                  <h3 className="text-slate-400 text-sm mb-2">Engagement Rate</h3>
                  <p className="text-2xl font-bold text-white">
                    {analytics.summary.averageEngagementRate || 0}%
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialMediaDashboard;