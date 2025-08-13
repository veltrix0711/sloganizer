import React, { useState } from 'react';
import { Megaphone, Calendar, Target, DollarSign, Users, Plus, X } from 'lucide-react';

const MARKETING_CHANNELS = [
  { value: 'social_media', label: 'Social Media Marketing', description: 'Instagram, Facebook, LinkedIn, Twitter' },
  { value: 'content_marketing', label: 'Content Marketing', description: 'Blogs, videos, podcasts, guides' },
  { value: 'email_marketing', label: 'Email Marketing', description: 'Newsletters, campaigns, automation' },
  { value: 'paid_advertising', label: 'Paid Advertising', description: 'Google Ads, Facebook Ads, display ads' },
  { value: 'seo', label: 'SEO & Organic Search', description: 'Search engine optimization' },
  { value: 'influencer', label: 'Influencer Marketing', description: 'Partnerships with content creators' },
  { value: 'pr', label: 'Public Relations', description: 'Media outreach, press releases' },
  { value: 'events', label: 'Events & Conferences', description: 'Trade shows, webinars, networking' },
  { value: 'partnerships', label: 'Strategic Partnerships', description: 'Business collaborations' },
  { value: 'referral', label: 'Referral Programs', description: 'Word-of-mouth, customer referrals' }
];

const CONTENT_TYPES = [
  'Blog posts', 'Videos', 'Infographics', 'Podcasts', 'Webinars',
  'Case studies', 'White papers', 'Social media posts', 'Email newsletters',
  'User-generated content', 'Interactive content', 'Live streams'
];

const CAMPAIGN_GOALS = [
  'Brand awareness', 'Lead generation', 'Customer acquisition', 'Customer retention',
  'Product launches', 'Sales growth', 'Community building', 'Thought leadership',
  'Market education', 'Competitive positioning'
];

const BUDGET_RANGES = [
  'Under $1k/month', '$1k-$5k/month', '$5k-$10k/month', '$10k-$25k/month',
  '$25k-$50k/month', '$50k+/month'
];

const PLATFORMS = {
  'Instagram': ['Daily', '3-4x/week', '2-3x/week', 'Weekly'],
  'LinkedIn': ['Daily', '3-4x/week', '2-3x/week', 'Weekly'],
  'Twitter': ['Multiple daily', 'Daily', '3-4x/week', '2-3x/week'],
  'Facebook': ['Daily', '3-4x/week', '2-3x/week', 'Weekly'],
  'TikTok': ['Daily', '3-4x/week', '2-3x/week', 'Weekly'],
  'YouTube': ['Weekly', 'Bi-weekly', 'Monthly'],
  'Pinterest': ['Daily', '3-4x/week', 'Weekly']
};

const MarketingStrategyStep = ({ formData, updateFormData, errors }) => {
  const [newPartnership, setNewPartnership] = useState('');
  const [newSeasonal, setNewSeasonal] = useState('');

  const toggleMarketingChannel = (channel) => {
    const currentChannels = formData.marketing_channels || [];
    if (currentChannels.includes(channel)) {
      updateFormData('marketing_channels', currentChannels.filter(c => c !== channel));
    } else {
      updateFormData('marketing_channels', [...currentChannels, channel]);
    }
  };

  const toggleContentType = (type) => {
    const currentTypes = formData.content_types || [];
    if (currentTypes.includes(type)) {
      updateFormData('content_types', currentTypes.filter(t => t !== type));
    } else {
      updateFormData('content_types', [...currentTypes, type]);
    }
  };

  const toggleCampaignGoal = (goal) => {
    const currentGoals = formData.campaign_goals || [];
    if (currentGoals.includes(goal)) {
      updateFormData('campaign_goals', currentGoals.filter(g => g !== goal));
    } else {
      updateFormData('campaign_goals', [...currentGoals, goal]);
    }
  };

  const updatePostingFrequency = (platform, frequency) => {
    const currentFrequency = formData.posting_frequency || {};
    updateFormData('posting_frequency', {
      ...currentFrequency,
      [platform]: frequency
    });
  };

  const addPartnership = () => {
    const partnership = newPartnership.trim();
    if (partnership) {
      const currentPartnerships = formData.partnership_opportunities || [];
      updateFormData('partnership_opportunities', [...currentPartnerships, partnership]);
      setNewPartnership('');
    }
  };

  const removePartnership = (index) => {
    const currentPartnerships = formData.partnership_opportunities || [];
    updateFormData('partnership_opportunities', currentPartnerships.filter((_, i) => i !== index));
  };

  const addSeasonal = () => {
    const seasonal = newSeasonal.trim();
    if (seasonal) {
      const currentSeasonal = formData.seasonal_considerations || [];
      updateFormData('seasonal_considerations', [...currentSeasonal, seasonal]);
      setNewSeasonal('');
    }
  };

  const removeSeasonal = (index) => {
    const currentSeasonal = formData.seasonal_considerations || [];
    updateFormData('seasonal_considerations', currentSeasonal.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-8">
      {/* Marketing Channels */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Megaphone className="w-5 h-5 mr-2 text-blue-600" />
          Primary Marketing Channels
        </h4>
        
        <p className="text-gray-600 mb-4">
          Select the marketing channels you plan to use (choose 3-5 for focus):
        </p>
        
        <div className="space-y-3">
          {MARKETING_CHANNELS.map(channel => (
            <button
              key={channel.value}
              type="button"
              onClick={() => toggleMarketingChannel(channel.value)}
              className={`w-full p-4 text-left border-2 rounded-lg transition-colors ${
                formData.marketing_channels?.includes(channel.value)
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h5 className={`font-medium ${
                    formData.marketing_channels?.includes(channel.value) ? 'text-blue-800' : 'text-gray-900'
                  }`}>
                    {channel.label}
                  </h5>
                  <p className={`text-sm mt-1 ${
                    formData.marketing_channels?.includes(channel.value) ? 'text-blue-600' : 'text-gray-600'
                  }`}>
                    {channel.description}
                  </p>
                </div>
                {formData.marketing_channels?.includes(channel.value) && (
                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                    <X className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
        
        {errors.marketing_channels && (
          <p className="mt-2 text-sm text-red-600">{errors.marketing_channels}</p>
        )}
      </div>

      {/* Content Strategy */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">
          Content Strategy
        </h4>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Content Types
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {CONTENT_TYPES.map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleContentType(type)}
                  className={`p-3 text-sm border-2 rounded-lg transition-colors ${
                    formData.content_types?.includes(type)
                      ? 'bg-green-50 border-green-200 text-green-800'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Posting Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              Posting Frequency by Platform
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(PLATFORMS).map(([platform, frequencies]) => (
                <div key={platform} className="space-y-2">
                  <h5 className="font-medium text-gray-900">{platform}</h5>
                  <div className="space-y-1">
                    {frequencies.map(frequency => (
                      <button
                        key={frequency}
                        type="button"
                        onClick={() => updatePostingFrequency(platform, frequency)}
                        className={`w-full p-2 text-sm text-left border rounded transition-colors ${
                          formData.posting_frequency?.[platform] === frequency
                            ? 'bg-blue-50 border-blue-200 text-blue-800'
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {frequency}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Budget & Goals */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <DollarSign className="w-5 h-5 mr-2 text-blue-600" />
          Budget & Goals
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Marketing Budget Range
            </label>
            <div className="space-y-2">
              {BUDGET_RANGES.map(range => (
                <button
                  key={range}
                  type="button"
                  onClick={() => updateFormData('marketing_budget_range', range)}
                  className={`w-full p-3 text-left border-2 rounded-lg transition-colors ${
                    formData.marketing_budget_range === range
                      ? 'bg-green-50 border-green-200 text-green-800'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
              <Target className="w-4 h-4 mr-1" />
              Campaign Goals
            </label>
            <div className="space-y-2">
              {CAMPAIGN_GOALS.map(goal => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => toggleCampaignGoal(goal)}
                  className={`w-full p-3 text-left border-2 rounded-lg transition-colors ${
                    formData.campaign_goals?.includes(goal)
                      ? 'bg-orange-50 border-orange-200 text-orange-800'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {goal}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Partnership Opportunities */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-blue-600" />
          Partnership Opportunities
        </h4>
        
        <div className="space-y-4">
          {formData.partnership_opportunities && formData.partnership_opportunities.map((partnership, index) => (
            <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
              <span className="flex-1 text-gray-900">{partnership}</span>
              <button
                type="button"
                onClick={() => removePartnership(index)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={newPartnership}
                onChange={(e) => setNewPartnership(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addPartnership();
                  }
                }}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Local businesses, Industry influencers, Complementary brands"
              />
              <button
                type="button"
                onClick={addPartnership}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Seasonal Considerations */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">
          Seasonal Considerations
        </h4>
        
        <div className="space-y-4">
          {formData.seasonal_considerations && formData.seasonal_considerations.map((seasonal, index) => (
            <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
              <span className="flex-1 text-gray-900">{seasonal}</span>
              <button
                type="button"
                onClick={() => removeSeasonal(index)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={newSeasonal}
                onChange={(e) => setNewSeasonal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSeasonal();
                  }
                }}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Holiday campaigns, Back-to-school season, Industry conferences"
              />
              <button
                type="button"
                onClick={addSeasonal}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Marketing Strategy Summary */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">
          Marketing Strategy Summary
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <p className="font-medium text-gray-700 mb-2">Primary Channels:</p>
            <div className="space-y-1">
              {formData.marketing_channels?.length > 0 ? (
                formData.marketing_channels.map(channel => (
                  <p key={channel} className="text-gray-600">
                    • {MARKETING_CHANNELS.find(c => c.value === channel)?.label}
                  </p>
                ))
              ) : (
                <p className="text-gray-500">No channels selected</p>
              )}
            </div>
          </div>
          
          <div>
            <p className="font-medium text-gray-700 mb-2">Content Types:</p>
            <div className="space-y-1">
              {formData.content_types?.length > 0 ? (
                formData.content_types.slice(0, 5).map(type => (
                  <p key={type} className="text-gray-600">• {type}</p>
                ))
              ) : (
                <p className="text-gray-500">No content types selected</p>
              )}
              {formData.content_types?.length > 5 && (
                <p className="text-gray-500">... and {formData.content_types.length - 5} more</p>
              )}
            </div>
          </div>
          
          <div>
            <p className="font-medium text-gray-700 mb-2">Budget Range:</p>
            <p className="text-gray-600">
              {formData.marketing_budget_range || 'Not specified'}
            </p>
          </div>
          
          <div>
            <p className="font-medium text-gray-700 mb-2">Primary Goals:</p>
            <div className="space-y-1">
              {formData.campaign_goals?.length > 0 ? (
                formData.campaign_goals.slice(0, 3).map(goal => (
                  <p key={goal} className="text-gray-600">• {goal}</p>
                ))
              ) : (
                <p className="text-gray-500">No goals selected</p>
              )}
              {formData.campaign_goals?.length > 3 && (
                <p className="text-gray-500">... and {formData.campaign_goals.length - 3} more</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingStrategyStep;