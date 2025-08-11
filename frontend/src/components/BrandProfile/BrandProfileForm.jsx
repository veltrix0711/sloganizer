import React, { useState } from 'react';
import { X, Palette, Type, Users, Building, Globe, Hash } from 'lucide-react';

const TONE_OPTIONS = [
  'professional',
  'friendly', 
  'witty',
  'premium',
  'innovative',
  'bold',
  'minimalist',
  'playful'
];

const PERSONALITY_TRAITS = [
  'Trustworthy',
  'Innovative',
  'Professional',
  'Creative', 
  'Reliable',
  'Modern',
  'Friendly',
  'Bold',
  'Sophisticated',
  'Authentic',
  'Energetic',
  'Minimalist'
];

const BrandProfileForm = ({ profile, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    tagline: profile?.tagline || '',
    mission: profile?.mission || '',
    primary_color: profile?.primary_color || '#3B82F6',
    secondary_color: profile?.secondary_color || '#6B7280',
    accent_color: profile?.accent_color || '#F59E0B',
    primary_font: profile?.primary_font || 'Inter',
    secondary_font: profile?.secondary_font || 'Inter',
    tone_of_voice: profile?.tone_of_voice || 'professional',
    target_audience: profile?.target_audience || '',
    brand_personality: profile?.brand_personality || [],
    industry: profile?.industry || '',
    niche_tags: profile?.niche_tags || [],
    website_url: profile?.website_url || '',
    social_links: profile?.social_links || {
      instagram: '',
      linkedin: '',
      twitter: '',
      facebook: '',
      tiktok: ''
    },
    is_default: profile?.is_default || false
  });

  const [newTag, setNewTag] = useState('');
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

  const handleSocialLinkChange = (platform, value) => {
    setFormData(prev => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [platform]: value
      }
    }));
  };

  const handlePersonalityToggle = (trait) => {
    setFormData(prev => ({
      ...prev,
      brand_personality: prev.brand_personality.includes(trait)
        ? prev.brand_personality.filter(t => t !== trait)
        : [...prev.brand_personality, trait]
    }));
  };

  const addNicheTag = () => {
    const tag = newTag.trim();
    if (tag && !formData.niche_tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        niche_tags: [...prev.niche_tags, tag]
      }));
      setNewTag('');
    }
  };

  const removeNicheTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      niche_tags: prev.niche_tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Brand name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Brand name must be at least 2 characters';
    }

    if (formData.website_url && !isValidUrl(formData.website_url)) {
      newErrors.website_url = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Clean up form data
    const submitData = {
      ...formData,
      name: formData.name.trim(),
      tagline: formData.tagline.trim() || null,
      mission: formData.mission.trim() || null,
      target_audience: formData.target_audience.trim() || null,
      website_url: formData.website_url.trim() || null,
      social_links: Object.fromEntries(
        Object.entries(formData.social_links)
          .filter(([key, value]) => value.trim())
          .map(([key, value]) => [key, value.trim()])
      )
    };

    onSubmit(submitData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {profile ? 'Edit Brand Profile' : 'Create Brand Profile'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter brand name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tagline
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => handleInputChange('tagline', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your brand tagline"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mission Statement
              </label>
              <textarea
                value={formData.mission}
                onChange={(e) => handleInputChange('mission', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe your brand's mission and purpose"
              />
            </div>
          </div>

          {/* Brand Identity */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Palette className="w-5 h-5 mr-2" />
              Brand Identity
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.primary_color}
                    onChange={(e) => handleInputChange('primary_color', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.primary_color}
                    onChange={(e) => handleInputChange('primary_color', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secondary Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.secondary_color}
                    onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.secondary_color}
                    onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="#6B7280"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Accent Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.accent_color}
                    onChange={(e) => handleInputChange('accent_color', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.accent_color}
                    onChange={(e) => handleInputChange('accent_color', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="#F59E0B"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Type className="w-4 h-4 mr-1" />
                  Primary Font
                </label>
                <select
                  value={formData.primary_font}
                  onChange={(e) => handleInputChange('primary_font', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Inter">Inter</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Arial">Arial</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Lato">Lato</option>
                  <option value="Montserrat">Montserrat</option>
                  <option value="Poppins">Poppins</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secondary Font
                </label>
                <select
                  value={formData.secondary_font}
                  onChange={(e) => handleInputChange('secondary_font', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Inter">Inter</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Arial">Arial</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Lato">Lato</option>
                  <option value="Montserrat">Montserrat</option>
                  <option value="Poppins">Poppins</option>
                </select>
              </div>
            </div>
          </div>

          {/* Brand Voice & Personality */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Brand Voice & Personality
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tone of Voice
                </label>
                <select
                  value={formData.tone_of_voice}
                  onChange={(e) => handleInputChange('tone_of_voice', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {TONE_OPTIONS.map(tone => (
                    <option key={tone} value={tone}>
                      {tone.charAt(0).toUpperCase() + tone.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Audience
                </label>
                <input
                  type="text"
                  value={formData.target_audience}
                  onChange={(e) => handleInputChange('target_audience', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Small business owners, Tech professionals"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Brand Personality Traits
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {PERSONALITY_TRAITS.map(trait => (
                  <label
                    key={trait}
                    className="flex items-center cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.brand_personality.includes(trait)}
                      onChange={() => handlePersonalityToggle(trait)}
                      className="sr-only"
                    />
                    <div className={`px-3 py-2 rounded-md text-sm font-medium text-center w-full transition-colors ${
                      formData.brand_personality.includes(trait)
                        ? 'bg-blue-100 text-blue-800 border-2 border-blue-200'
                        : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                    }`}>
                      {trait}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Industry & Category */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Building className="w-5 h-5 mr-2" />
              Industry & Category
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry
                </label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Technology, Healthcare, Retail"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Hash className="w-4 h-4 mr-1" />
                  Niche Tags
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addNicheTag();
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add a tag and press Enter"
                  />
                  <button
                    type="button"
                    onClick={addNicheTag}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    Add
                  </button>
                </div>
                {formData.niche_tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.niche_tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeNicheTag(tag)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Links & Social */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              Links & Social Media
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website URL
                </label>
                <input
                  type="url"
                  value={formData.website_url}
                  onChange={(e) => handleInputChange('website_url', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.website_url ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="https://yourwebsite.com"
                />
                {errors.website_url && (
                  <p className="mt-1 text-sm text-red-600">{errors.website_url}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
                <input
                  type="text"
                  value={formData.social_links.instagram}
                  onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="@username or full URL"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                <input
                  type="text"
                  value={formData.social_links.linkedin}
                  onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Company or profile URL"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Twitter</label>
                <input
                  type="text"
                  value={formData.social_links.twitter}
                  onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="@username or full URL"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
                <input
                  type="text"
                  value={formData.social_links.facebook}
                  onChange={(e) => handleSocialLinkChange('facebook', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Page URL"
                />
              </div>
            </div>
          </div>

          {/* Settings */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_default}
                onChange={(e) => handleInputChange('is_default', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Set as default brand profile</span>
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {profile ? 'Update Profile' : 'Create Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BrandProfileForm;