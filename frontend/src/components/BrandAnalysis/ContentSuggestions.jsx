import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Copy, 
  Heart, 
  CheckCircle, 
  RefreshCw, 
  Filter,
  Instagram,
  Linkedin,
  Twitter,
  Globe,
  Star,
  ThumbsUp,
  Calendar,
  Hash
} from 'lucide-react';
import { apiRequest } from '../../utils/api';
import toast from 'react-hot-toast';

const ContentSuggestions = ({ brandProfile }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedType, setSelectedType] = useState('social_post');
  const [selectedPlatform, setSelectedPlatform] = useState('all');

  const suggestionTypes = [
    { value: 'social_post', label: 'Social Media Posts', icon: Instagram },
    { value: 'blog_topic', label: 'Blog Topics', icon: Globe },
    { value: 'campaign_idea', label: 'Campaign Ideas', icon: Sparkles },
    { value: 'email_campaign', label: 'Email Campaigns', icon: Calendar }
  ];

  const platforms = [
    { value: 'all', label: 'All Platforms' },
    { value: 'instagram', label: 'Instagram', icon: Instagram },
    { value: 'linkedin', label: 'LinkedIn', icon: Linkedin },
    { value: 'twitter', label: 'Twitter', icon: Twitter }
  ];

  useEffect(() => {
    if (brandProfile?.id) {
      loadSuggestions();
    }
  }, [brandProfile, selectedType]);

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      const data = await apiRequest(
        `/api/brand-analysis/content-suggestions/${brandProfile.id}?type=${selectedType}&includeUsed=false`
      );
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Load suggestions error:', error);
      toast.error('Failed to load content suggestions');
    } finally {
      setLoading(false);
    }
  };

  const generateNewSuggestions = async () => {
    try {
      setGenerating(true);
      const data = await apiRequest(`/api/brand-analysis/content-suggestions/${brandProfile.id}`, {
        method: 'POST',
        body: JSON.stringify({
          suggestionType: selectedType,
          count: 5
        })
      });
      
      toast.success(`Generated ${data.suggestions?.length || 0} new content ideas!`);
      loadSuggestions(); // Refresh the list
      
    } catch (error) {
      console.error('Generate suggestions error:', error);
      toast.error('Failed to generate content suggestions');
    } finally {
      setGenerating(false);
    }
  };

  const markAsUsed = async (suggestionId, rating = null) => {
    try {
      await apiRequest(`/api/brand-analysis/content-suggestions/${suggestionId}/use`, {
        method: 'PATCH',
        body: JSON.stringify({ rating })
      });
      
      toast.success('Marked as used!');
      loadSuggestions(); // Refresh to remove from list
      
    } catch (error) {
      console.error('Mark as used error:', error);
      toast.error('Failed to mark as used');
    }
  };

  const toggleFavorite = async (suggestionId, isFavorite) => {
    try {
      await apiRequest(`/api/brand-analysis/content-suggestions/${suggestionId}/favorite`, {
        method: 'PATCH',
        body: JSON.stringify({ isFavorite: !isFavorite })
      });
      
      toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
      loadSuggestions(); // Refresh to update favorite status
      
    } catch (error) {
      console.error('Toggle favorite error:', error);
      toast.error('Failed to update favorite status');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'instagram': return <Instagram className="w-4 h-4" />;
      case 'linkedin': return <Linkedin className="w-4 h-4" />;
      case 'twitter': return <Twitter className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  const getEngagementColor = (potential) => {
    switch (potential) {
      case 'high': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'educational': return 'text-blue-600 bg-blue-50';
      case 'promotional': return 'text-purple-600 bg-purple-50';
      case 'entertaining': return 'text-orange-600 bg-orange-50';
      case 'inspirational': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredSuggestions = selectedPlatform === 'all' 
    ? suggestions 
    : suggestions.filter(s => s.target_platform === selectedPlatform);

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">AI Content Suggestions</h2>
            <p className="text-gray-600">AI-generated content ideas tailored to your brand</p>
          </div>
          <button
            onClick={generateNewSuggestions}
            disabled={generating}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {generating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate New Ideas
              </>
            )}
          </button>
        </div>

        {/* Type and Platform Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Content Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {suggestionTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Platform Filter</label>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {platforms.map(platform => (
                <option key={platform.value} value={platform.value}>{platform.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Suggestions Grid */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      ) : filteredSuggestions.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <Sparkles className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Content Suggestions</h3>
          <p className="text-gray-600 mb-6">
            Generate AI-powered content ideas to get started with your content strategy.
          </p>
          <button
            onClick={generateNewSuggestions}
            disabled={generating}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {generating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Ideas
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredSuggestions.map((suggestion) => (
            <div key={suggestion.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-2">{suggestion.title}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    {suggestion.target_platform && (
                      <div className="flex items-center text-sm text-gray-600">
                        {getPlatformIcon(suggestion.target_platform)}
                        <span className="ml-1 capitalize">{suggestion.target_platform}</span>
                      </div>
                    )}
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getCategoryColor(suggestion.content_category)}`}>
                      {suggestion.content_category}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getEngagementColor('high')}`}>
                      High Engagement
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => toggleFavorite(suggestion.id, suggestion.is_favorite)}
                  className={`p-1 rounded ${suggestion.is_favorite ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                >
                  <Heart className={`w-5 h-5 ${suggestion.is_favorite ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Content */}
              <div className="space-y-3">
                <p className="text-gray-700 text-sm">{suggestion.description}</p>
                
                {suggestion.content_preview && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-800 font-medium mb-2">Content Preview:</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{suggestion.content_preview}</p>
                  </div>
                )}

                {suggestion.hashtags && suggestion.hashtags.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-gray-400" />
                    <div className="flex flex-wrap gap-1">
                      {suggestion.hashtags.map((hashtag, index) => (
                        <span key={index} className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          {hashtag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {suggestion.call_to_action && (
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      <strong>CTA:</strong> {suggestion.call_to_action}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => copyToClipboard(suggestion.content_preview || suggestion.title)}
                  className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </button>
                
                <button
                  onClick={() => markAsUsed(suggestion.id, 5)}
                  className="flex items-center px-3 py-1 text-sm text-green-600 hover:text-green-800 border border-green-300 rounded hover:bg-green-50 transition-colors"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Mark Used
                </button>

                <button
                  className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded hover:bg-blue-50 transition-colors ml-auto"
                >
                  <ThumbsUp className="w-4 h-4 mr-1" />
                  Rate
                </button>
              </div>

              {/* Metadata */}
              <div className="text-xs text-gray-400 mt-3">
                Generated {new Date(suggestion.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {filteredSuggestions.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Content Summary</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{filteredSuggestions.length}</div>
              <div className="text-sm text-gray-600">Total Ideas</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {filteredSuggestions.filter(s => s.estimated_engagement_score > 80).length}
              </div>
              <div className="text-sm text-gray-600">High Potential</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {filteredSuggestions.filter(s => s.is_favorite).length}
              </div>
              <div className="text-sm text-gray-600">Favorites</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {new Set(filteredSuggestions.map(s => s.target_platform)).size}
              </div>
              <div className="text-sm text-gray-600">Platforms</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentSuggestions;