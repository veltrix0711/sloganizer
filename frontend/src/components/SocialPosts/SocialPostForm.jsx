import React, { useState } from 'react';
import { Share2, Loader2, Lightbulb, Hash, Users, MessageSquare } from 'lucide-react';

const PLATFORMS = {
  instagram: { 
    name: 'Instagram', 
    icon: '📷', 
    maxChars: 2200, 
    hashtags: true,
    color: 'border-pink-300 bg-pink-50'
  },
  linkedin: { 
    name: 'LinkedIn', 
    icon: '💼', 
    maxChars: 3000, 
    hashtags: true,
    color: 'border-blue-300 bg-blue-50'
  },
  twitter: { 
    name: 'Twitter', 
    icon: '🐦', 
    maxChars: 280, 
    hashtags: true,
    color: 'border-blue-300 bg-blue-50'
  },
  facebook: { 
    name: 'Facebook', 
    icon: '📘', 
    maxChars: 63206, 
    hashtags: false,
    color: 'border-blue-300 bg-blue-50'
  },
  tiktok: { 
    name: 'TikTok', 
    icon: '🎵', 
    maxChars: 300, 
    hashtags: true,
    color: 'border-gray-300 bg-gray-50'
  }
};

const POST_TYPES = [
  { value: 'promotional', label: 'Promotional', description: 'Promote products or services' },
  { value: 'educational', label: 'Educational', description: 'Share tips and insights' },
  { value: 'behind_the_scenes', label: 'Behind the Scenes', description: 'Show company culture' },
  { value: 'user_generated', label: 'User Generated', description: 'Encourage audience participation' },
  { value: 'announcement', label: 'Announcement', description: 'Share news and updates' },
  { value: 'inspirational', label: 'Inspirational', description: 'Motivate and inspire' },
  { value: 'entertaining', label: 'Entertaining', description: 'Fun and shareable content' }
];

const TONE_OPTIONS = [
  'professional',
  'friendly',
  'casual',
  'witty',
  'formal',
  'enthusiastic',
  'informative',
  'conversational'
];

const TOPIC_EXAMPLES = [
  'New product launch',
  'Industry trends',
  'Company milestone',
  'Customer success story',
  'Tips and tricks',
  'Seasonal promotion',
  'Team spotlight',
  'Event announcement'
];

const SocialPostForm = ({ onGenerate, generating, selectedProfile }) => {
  const [formData, setFormData] = useState({
    platforms: ['instagram'],
    postType: 'promotional',
    topic: '',
    includeHashtags: true,
    toneOverride: '',
    count: 3
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handlePlatformToggle = (platform) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }));
    
    // Clear platform error
    if (errors.platforms) {
      setErrors(prev => ({
        ...prev,
        platforms: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (formData.platforms.length === 0) {
      newErrors.platforms = 'Select at least one platform';
    }

    if (!formData.topic.trim()) {
      newErrors.topic = 'Post topic is required';
    } else if (formData.topic.trim().length < 3) {
      newErrors.topic = 'Topic must be at least 3 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onGenerate({
      ...formData,
      topic: formData.topic.trim(),
      toneOverride: formData.toneOverride.trim() || undefined
    });
  };

  const selectedPostType = POST_TYPES.find(t => t.value === formData.postType);
  const selectedTone = formData.toneOverride || selectedProfile?.tone_of_voice || 'professional';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Brand Profile Context */}
      {selectedProfile && (
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 text-sm">
            <div 
              className="w-4 h-4 rounded"
              style={{ backgroundColor: selectedProfile.primary_color || '#3B82F6' }}
            />
            <span className="font-medium text-blue-900">
              Using context from: {selectedProfile.name}
            </span>
          </div>
          <div className="text-xs text-blue-700 mt-1 space-y-1">
            {selectedProfile.tone_of_voice && (
              <div>Tone: {selectedProfile.tone_of_voice}</div>
            )}
            {selectedProfile.target_audience && (
              <div>Audience: {selectedProfile.target_audience}</div>
            )}
          </div>
        </div>
      )}

      {/* Platform Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Target Platforms *
        </label>
        <div className="grid grid-cols-1 gap-2">
          {Object.entries(PLATFORMS).map(([key, platform]) => (
            <label
              key={key}
              className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                formData.platforms.includes(key)
                  ? `${platform.color} border-2`
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={formData.platforms.includes(key)}
                onChange={() => handlePlatformToggle(key)}
                className="sr-only"
                disabled={generating}
              />
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{platform.icon}</span>
                  <div>
                    <div className="font-medium text-gray-900">{platform.name}</div>
                    <div className="text-xs text-gray-500">
                      Max {platform.maxChars.toLocaleString()} chars
                      {platform.hashtags && ' • Hashtags supported'}
                    </div>
                  </div>
                </div>
                {formData.platforms.includes(key) && (
                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </div>
            </label>
          ))}
        </div>
        {errors.platforms && (
          <p className="mt-1 text-sm text-red-600">{errors.platforms}</p>
        )}
      </div>

      {/* Post Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Post Type
        </label>
        <select
          value={formData.postType}
          onChange={(e) => handleInputChange('postType', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={generating}
        >
          {POST_TYPES.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        {selectedPostType && (
          <p className="mt-1 text-xs text-gray-500">
            {selectedPostType.description}
          </p>
        )}
      </div>

      {/* Topic */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Post Topic *
        </label>
        <textarea
          value={formData.topic}
          onChange={(e) => handleInputChange('topic', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.topic ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="Describe what you want to post about (e.g., 'New product launch with key features')"
          rows={3}
          disabled={generating}
        />
        {errors.topic && (
          <p className="mt-1 text-sm text-red-600">{errors.topic}</p>
        )}
        
        {/* Example topics */}
        <div className="mt-2">
          <p className="text-xs text-gray-500 mb-1">Example topics:</p>
          <div className="space-y-1">
            {TOPIC_EXAMPLES.slice(0, 4).map(topic => (
              <button
                key={topic}
                type="button"
                onClick={() => handleInputChange('topic', topic)}
                className="block text-xs text-left px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors w-full"
                disabled={generating}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tone Override */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tone of Voice
        </label>
        <select
          value={formData.toneOverride}
          onChange={(e) => handleInputChange('toneOverride', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={generating}
        >
          <option value="">
            {selectedProfile?.tone_of_voice 
              ? `Use profile default (${selectedProfile.tone_of_voice})` 
              : 'Use default (professional)'
            }
          </option>
          {TONE_OPTIONS.map(tone => (
            <option key={tone} value={tone}>
              {tone.charAt(0).toUpperCase() + tone.slice(1)}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-500">
          Current tone: {selectedTone}
        </p>
      </div>

      {/* Include Hashtags */}
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.includeHashtags}
            onChange={(e) => handleInputChange('includeHashtags', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            disabled={generating}
          />
          <span className="ml-2 text-sm text-gray-700">Include hashtags</span>
        </label>
        <p className="text-xs text-gray-500 mt-1">
          {formData.includeHashtags 
            ? 'Platform-appropriate hashtags will be suggested' 
            : 'Posts will be generated without hashtags'
          }
        </p>
      </div>

      {/* Post Count */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Posts per Platform
        </label>
        <select
          value={formData.count}
          onChange={(e) => handleInputChange('count', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={generating}
        >
          <option value={1}>1 post per platform</option>
          <option value={2}>2 posts per platform</option>
          <option value={3}>3 posts per platform</option>
          <option value={5}>5 posts per platform</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Total posts: {formData.platforms.length * formData.count}
        </p>
      </div>

      {/* Generation Tips */}
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-amber-800">
            <p className="font-medium mb-1">Tips for better posts:</p>
            <ul className="space-y-1 text-xs">
              <li>• Be specific about your message and call-to-action</li>
              <li>• Consider your audience and what value you're providing</li>
              <li>• Mention any specific elements like images, links, or mentions</li>
              <li>• Each platform will get optimized content for its audience</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={generating}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {generating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating Posts...
          </>
        ) : (
          <>
            <MessageSquare className="w-4 h-4" />
            Generate Posts
          </>
        )}
      </button>

      {generating && (
        <p className="text-xs text-center text-gray-500">
          Generating {formData.platforms.length * formData.count} posts across {formData.platforms.length} platform(s)...
        </p>
      )}
    </form>
  );
};

export default SocialPostForm;