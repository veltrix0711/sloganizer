import React, { useState, useEffect } from 'react';
import { useAuth } from '../../services/authContext';
import { supabase } from '../../services/supabase';
import toast from 'react-hot-toast';
import { 
  Share2, 
  Loader2, 
  Calendar, 
  Edit3, 
  Trash2, 
  Copy,
  Check,
  Send,
  Clock,
  Hash,
  Filter,
  MessageSquare
} from 'lucide-react';
import SocialPostForm from './SocialPostForm';
import PostCard from './PostCard';
import BrandProfileSelector from '../BrandProfile/BrandProfileSelector';

const PLATFORMS = {
  instagram: { name: 'Instagram', color: 'bg-pink-500', icon: '📷' },
  linkedin: { name: 'LinkedIn', color: 'bg-blue-600', icon: '💼' },
  twitter: { name: 'Twitter', color: 'bg-blue-400', icon: '🐦' },
  facebook: { name: 'Facebook', color: 'bg-blue-700', icon: '📘' },
  tiktok: { name: 'TikTok', color: 'bg-black', icon: '🎵' }
};

const SocialPostsGenerator = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [filters, setFilters] = useState({
    platform: 'all',
    isDraft: 'all',
    search: ''
  });

  useEffect(() => {
    if (user) {
      loadPosts();
    }
  }, [user, selectedProfile, filters]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: '20',
        offset: '0'
      });

      if (selectedProfile) {
        params.append('brandProfileId', selectedProfile.id);
      }

      if (filters.platform !== 'all') {
        params.append('platform', filters.platform);
      }

      if (filters.isDraft !== 'all') {
        params.append('isDraft', filters.isDraft);
      }

      const response = await fetch(`/api/social/posts?${params}`, {
        headers: {
          'Authorization': `Bearer ${await supabase.auth.getSession().then(s => s.data.session?.access_token)}`,
        },
      });

      if (!response.ok) throw new Error('Failed to load posts');

      const data = await response.json();
      let filteredPosts = data.posts || [];

      // Apply search filter on frontend
      if (filters.search) {
        filteredPosts = filteredPosts.filter(post => 
          post.content.toLowerCase().includes(filters.search.toLowerCase()) ||
          post.hashtags?.some(tag => tag.toLowerCase().includes(filters.search.toLowerCase()))
        );
      }

      setPosts(filteredPosts);

    } catch (error) {
      console.error('Load posts error:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (formData) => {
    try {
      setGenerating(true);
      
      const payload = {
        ...formData,
        brandProfileId: selectedProfile?.id
      };

      const response = await fetch('/api/social/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await supabase.auth.getSession().then(s => s.data.session?.access_token)}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to generate posts');

      const data = await response.json();
      
      if (data.success) {
        toast.success(`Generated ${data.posts.length} social media posts!`);
        // Add new posts to the beginning of the list
        setPosts(prev => [...data.posts, ...prev]);
      } else {
        throw new Error(data.error || 'Generation failed');
      }

    } catch (error) {
      console.error('Post generation error:', error);
      toast.error(error.message || 'Failed to generate posts');
    } finally {
      setGenerating(false);
    }
  };

  const handleUpdatePost = async (postId, updates) => {
    try {
      const response = await fetch(`/api/social/posts/${postId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await supabase.auth.getSession().then(s => s.data.session?.access_token)}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error('Failed to update post');

      const data = await response.json();
      
      // Update the post in the list
      setPosts(prev => 
        prev.map(post => 
          post.id === postId 
            ? { ...post, ...data.post }
            : post
        )
      );

      toast.success('Post updated successfully');

    } catch (error) {
      console.error('Update post error:', error);
      toast.error('Failed to update post');
    }
  };

  const handleSchedulePost = async (postId, scheduledFor) => {
    try {
      const response = await fetch(`/api/social/posts/${postId}/schedule`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await supabase.auth.getSession().then(s => s.data.session?.access_token)}`,
        },
        body: JSON.stringify({ scheduledFor }),
      });

      if (!response.ok) throw new Error('Failed to schedule post');

      const data = await response.json();
      
      // Update the post in the list
      setPosts(prev => 
        prev.map(post => 
          post.id === postId 
            ? { ...post, ...data.post }
            : post
        )
      );

      toast.success('Post scheduled successfully');

    } catch (error) {
      console.error('Schedule post error:', error);
      toast.error('Failed to schedule post');
    }
  };

  const handlePublishPost = async (postId) => {
    try {
      const response = await fetch(`/api/social/posts/${postId}/publish`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${await supabase.auth.getSession().then(s => s.data.session?.access_token)}`,
        },
      });

      if (!response.ok) throw new Error('Failed to mark as published');

      const data = await response.json();
      
      // Update the post in the list
      setPosts(prev => 
        prev.map(post => 
          post.id === postId 
            ? { ...post, ...data.post }
            : post
        )
      );

      toast.success('Post marked as published');

    } catch (error) {
      console.error('Publish post error:', error);
      toast.error('Failed to mark as published');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      const response = await fetch(`/api/social/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${await supabase.auth.getSession().then(s => s.data.session?.access_token)}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete post');

      setPosts(prev => prev.filter(post => post.id !== postId));
      toast.success('Post deleted successfully');

    } catch (error) {
      console.error('Delete post error:', error);
      toast.error('Failed to delete post');
    }
  };

  const updateFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getPostStats = () => {
    const stats = {
      total: posts.length,
      drafts: posts.filter(p => p.is_draft).length,
      published: posts.filter(p => p.posted_at).length,
      scheduled: posts.filter(p => p.scheduled_for && !p.posted_at).length
    };
    
    // Platform breakdown
    Object.keys(PLATFORMS).forEach(platform => {
      stats[platform] = posts.filter(p => p.platform === platform).length;
    });

    return stats;
  };

  const stats = getPostStats();

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Share2 className="w-8 h-8 text-blue-600" />
              Social Media Posts
            </h1>
            <p className="text-gray-600 mt-2">
              Generate platform-specific social media content with AI
            </p>
          </div>
          <div className="flex items-center gap-4">
            <BrandProfileSelector
              selectedProfile={selectedProfile}
              onProfileChange={setSelectedProfile}
              allowNone={true}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-500">Total Posts</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-yellow-600">{stats.drafts}</div>
            <div className="text-sm text-gray-500">Drafts</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-blue-600">{stats.scheduled}</div>
            <div className="text-sm text-gray-500">Scheduled</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-green-600">{stats.published}</div>
            <div className="text-sm text-gray-500">Published</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-pink-600">{stats.instagram}</div>
            <div className="text-sm text-gray-500">Instagram</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-blue-700">{stats.linkedin}</div>
            <div className="text-sm text-gray-500">LinkedIn</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Generation Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Generate Posts</h2>
            <SocialPostForm
              onGenerate={handleGenerate}
              generating={generating}
              selectedProfile={selectedProfile}
            />
          </div>
        </div>

        {/* Posts List */}
        <div className="lg:col-span-2">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                <select
                  value={filters.platform}
                  onChange={(e) => updateFilter('platform', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Platforms</option>
                  {Object.entries(PLATFORMS).map(([key, platform]) => (
                    <option key={key} value={key}>
                      {platform.icon} {platform.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.isDraft}
                  onChange={(e) => updateFilter('isDraft', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Posts</option>
                  <option value="true">Drafts Only</option>
                  <option value="false">Published/Scheduled</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  placeholder="Search posts..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Posts */}
          {loading && posts.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No posts found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filters.platform !== 'all' || filters.isDraft !== 'all' || filters.search
                  ? 'Try adjusting your filters or generate new posts.'
                  : 'Start by generating your first social media posts.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  platform={PLATFORMS[post.platform]}
                  onUpdate={handleUpdatePost}
                  onSchedule={handleSchedulePost}
                  onPublish={handlePublishPost}
                  onDelete={handleDeletePost}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SocialPostsGenerator;