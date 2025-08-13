import React, { useState, useEffect } from 'react';
import { Eye, Sparkles, CheckCircle, AlertCircle, Globe } from 'lucide-react';

const ReviewLaunchStep = ({ formData, updateFormData, errors }) => {
  const [completionScore, setCompletionScore] = useState(0);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    calculateCompletionScore();
    generateSuggestions();
  }, [formData]);

  const calculateCompletionScore = () => {
    let score = 0;
    let totalFields = 0;

    // Basic Information (20 points)
    totalFields += 5;
    if (formData.name) score += 4;
    if (formData.tagline) score += 3;
    if (formData.mission) score += 4;
    if (formData.industry) score += 4;
    if (formData.core_values?.length > 0) score += 5;

    // Visual Identity (15 points)
    totalFields += 3;
    if (formData.primary_color) score += 5;
    if (formData.primary_font) score += 5;
    if (formData.logo_style) score += 5;

    // Target Audience (20 points)
    totalFields += 4;
    if (formData.primary_demographics?.age_range) score += 5;
    if (formData.psychographics?.interests?.length > 0) score += 5;
    if (formData.pain_points?.length > 0) score += 5;
    if (formData.market_positioning) score += 5;

    // Business Details (15 points)
    totalFields += 3;
    if (formData.business_model) score += 5;
    if (formData.usp) score += 5;
    if (formData.products_services?.length > 0) score += 5;

    // Voice & Messaging (15 points)
    totalFields += 3;
    if (formData.brand_personality?.length > 0) score += 5;
    if (formData.tone_of_voice) score += 5;
    if (formData.key_messages?.length > 0) score += 5;

    // Marketing Strategy (15 points)
    totalFields += 3;
    if (formData.marketing_channels?.length > 0) score += 5;
    if (formData.content_types?.length > 0) score += 5;
    if (formData.campaign_goals?.length > 0) score += 5;

    const percentage = Math.round((score / (totalFields * 5)) * 100);
    setCompletionScore(percentage);
  };

  const generateSuggestions = () => {
    const newSuggestions = [];

    // Basic Information suggestions
    if (!formData.vision) {
      newSuggestions.push({
        type: 'missing',
        category: 'Basic Information',
        message: 'Consider adding a vision statement to inspire your team and customers.'
      });
    }

    if (!formData.brand_story) {
      newSuggestions.push({
        type: 'missing',
        category: 'Basic Information',
        message: 'A compelling brand story helps customers connect emotionally with your brand.'
      });
    }

    // Visual Identity suggestions
    if (!formData.color_palette_secondary || formData.color_palette_secondary.length === 0) {
      newSuggestions.push({
        type: 'enhancement',
        category: 'Visual Identity',
        message: 'Add secondary colors to create a more comprehensive color palette.'
      });
    }

    // Target Audience suggestions
    if (!formData.secondary_demographics?.age_range) {
      newSuggestions.push({
        type: 'enhancement',
        category: 'Target Audience',
        message: 'Define secondary demographics to expand your market reach.'
      });
    }

    if (!formData.competitors || formData.competitors.length === 0) {
      newSuggestions.push({
        type: 'missing',
        category: 'Target Audience',
        message: 'Competitor analysis is crucial for positioning your brand effectively.'
      });
    }

    // Voice & Messaging suggestions
    if (!formData.brand_guidelines?.dos?.length && !formData.brand_guidelines?.donts?.length) {
      newSuggestions.push({
        type: 'missing',
        category: 'Voice & Messaging',
        message: 'Brand guidelines help maintain consistency across all communications.'
      });
    }

    // Marketing Strategy suggestions
    if (!formData.marketing_budget_range) {
      newSuggestions.push({
        type: 'enhancement',
        category: 'Marketing Strategy',
        message: 'Setting a budget range helps plan realistic marketing activities.'
      });
    }

    if (!formData.partnership_opportunities || formData.partnership_opportunities.length === 0) {
      newSuggestions.push({
        type: 'enhancement',
        category: 'Marketing Strategy',
        message: 'Partnership opportunities can significantly expand your reach and credibility.'
      });
    }

    setSuggestions(newSuggestions);
  };

  const getCompletionColor = () => {
    if (completionScore >= 80) return 'text-green-600';
    if (completionScore >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCompletionBgColor = () => {
    if (completionScore >= 80) return 'bg-green-600';
    if (completionScore >= 60) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  return (
    <div className="space-y-8">
      {/* Completion Score */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xl font-semibold text-gray-900 flex items-center">
            <CheckCircle className="w-6 h-6 mr-2 text-blue-600" />
            Brand Profile Completion
          </h4>
          <div className={`text-2xl font-bold ${getCompletionColor()}`}>
            {completionScore}%
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div 
            className={`h-3 rounded-full transition-all duration-300 ${getCompletionBgColor()}`}
            style={{ width: `${completionScore}%` }}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <p className="font-medium text-gray-700">Readiness Level</p>
            <p className={`text-lg font-semibold ${getCompletionColor()}`}>
              {completionScore >= 80 ? 'Excellent' : 
               completionScore >= 60 ? 'Good' : 'Needs Work'}
            </p>
          </div>
          <div className="text-center">
            <p className="font-medium text-gray-700">Missing Fields</p>
            <p className="text-lg font-semibold text-gray-600">
              {suggestions.filter(s => s.type === 'missing').length}
            </p>
          </div>
          <div className="text-center">
            <p className="font-medium text-gray-700">Enhancements</p>
            <p className="text-lg font-semibold text-gray-600">
              {suggestions.filter(s => s.type === 'enhancement').length}
            </p>
          </div>
        </div>
      </div>

      {/* AI Analysis Preview */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
          AI Brand Analysis Preview
        </h4>
        
        <div className="space-y-4">
          <div className="p-4 bg-purple-50 rounded-lg">
            <h5 className="font-medium text-purple-900 mb-2">Brand Personality Analysis</h5>
            <p className="text-purple-800 text-sm">
              {formData.brand_personality?.length > 0 ? (
                `Your brand personality combines ${formData.brand_personality.slice(0, 3).join(', ')}${formData.brand_personality.length > 3 ? ' and more' : ''} traits, suggesting a ${formData.tone_of_voice || 'balanced'} approach to market communication.`
              ) : (
                'Complete your brand personality selection to see AI analysis here.'
              )}
            </p>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <h5 className="font-medium text-blue-900 mb-2">Market Position Insights</h5>
            <p className="text-blue-800 text-sm">
              {formData.market_positioning && formData.industry ? (
                `Your ${formData.market_positioning} positioning in the ${formData.industry} industry suggests opportunities for ${formData.usp ? 'differentiation based on your unique value proposition' : 'developing unique competitive advantages'}.`
              ) : (
                'Complete your market positioning and industry details to see insights here.'
              )}
            </p>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <h5 className="font-medium text-green-900 mb-2">Marketing Channel Recommendations</h5>
            <p className="text-green-800 text-sm">
              {formData.marketing_channels?.length > 0 && formData.primary_demographics?.age_range ? (
                `Your selected channels align well with your ${formData.primary_demographics.age_range} target demographic. Consider focusing on ${formData.marketing_channels[0]} as your primary channel.`
              ) : (
                'Complete your marketing channels and target demographics to see recommendations here.'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Suggestions & Improvements */}
      {suggestions.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-orange-600" />
            Suggestions for Improvement
          </h4>
          
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg border-l-4 ${
                  suggestion.type === 'missing' 
                    ? 'bg-red-50 border-red-400' 
                    : 'bg-yellow-50 border-yellow-400'
                }`}
              >
                <div className="flex items-start">
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      suggestion.type === 'missing' ? 'text-red-800' : 'text-yellow-800'
                    }`}>
                      {suggestion.category}
                    </p>
                    <p className={`text-sm mt-1 ${
                      suggestion.type === 'missing' ? 'text-red-700' : 'text-yellow-700'
                    }`}>
                      {suggestion.message}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                    suggestion.type === 'missing' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {suggestion.type === 'missing' ? 'Missing' : 'Enhancement'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Brand Overview */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Eye className="w-5 h-5 mr-2 text-gray-600" />
          Brand Overview
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="space-y-4">
            <div>
              <h5 className="font-medium text-gray-900 mb-2">Basic Information</h5>
              <div className="space-y-1 text-gray-600">
                <p><span className="font-medium">Name:</span> {formData.name || 'Not specified'}</p>
                <p><span className="font-medium">Industry:</span> {formData.industry || 'Not specified'}</p>
                <p><span className="font-medium">Stage:</span> {formData.growth_stage || 'Not specified'}</p>
                <p><span className="font-medium">Model:</span> {formData.business_model || 'Not specified'}</p>
              </div>
            </div>

            <div>
              <h5 className="font-medium text-gray-900 mb-2">Target Audience</h5>
              <div className="space-y-1 text-gray-600">
                <p><span className="font-medium">Age:</span> {formData.primary_demographics?.age_range || 'Not specified'}</p>
                <p><span className="font-medium">Location:</span> {formData.primary_demographics?.location || 'Not specified'}</p>
                <p><span className="font-medium">Positioning:</span> {formData.market_positioning || 'Not specified'}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h5 className="font-medium text-gray-900 mb-2">Brand Voice</h5>
              <div className="space-y-1 text-gray-600">
                <p><span className="font-medium">Tone:</span> {formData.tone_of_voice || 'Not specified'}</p>
                <p><span className="font-medium">Style:</span> {formData.communication_style || 'Not specified'}</p>
                <p><span className="font-medium">Personality:</span> {
                  formData.brand_personality?.length > 0 
                    ? formData.brand_personality.slice(0, 3).join(', ') + (formData.brand_personality.length > 3 ? '...' : '')
                    : 'Not specified'
                }</p>
              </div>
            </div>

            <div>
              <h5 className="font-medium text-gray-900 mb-2">Marketing</h5>
              <div className="space-y-1 text-gray-600">
                <p><span className="font-medium">Channels:</span> {
                  formData.marketing_channels?.length > 0 
                    ? formData.marketing_channels.length + ' selected'
                    : 'Not specified'
                }</p>
                <p><span className="font-medium">Budget:</span> {formData.marketing_budget_range || 'Not specified'}</p>
                <p><span className="font-medium">Goals:</span> {
                  formData.campaign_goals?.length > 0 
                    ? formData.campaign_goals.length + ' selected'
                    : 'Not specified'
                }</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Globe className="w-5 h-5 mr-2 text-gray-600" />
          Online Presence
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website URL
            </label>
            <input
              type="url"
              value={formData.website_url || ''}
              onChange={(e) => updateFormData('website_url', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://yourwebsite.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Set as Default Profile
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_default || false}
                onChange={(e) => updateFormData('is_default', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Use this as my primary brand profile
              </span>
            </label>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Social Media Links
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(formData.social_links || {}).map(([platform, url]) => (
              <div key={platform}>
                <label className="block text-sm text-gray-600 mb-1 capitalize">
                  {platform}
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => updateFormData('social_links', {
                    ...formData.social_links,
                    [platform]: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`Your ${platform} URL`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ready to Launch */}
      <div className={`p-6 rounded-lg ${
        completionScore >= 70 
          ? 'bg-green-50 border border-green-200' 
          : 'bg-yellow-50 border border-yellow-200'
      }`}>
        <div className="flex items-center mb-3">
          {completionScore >= 70 ? (
            <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
          ) : (
            <AlertCircle className="w-6 h-6 text-yellow-600 mr-2" />
          )}
          <h4 className={`text-lg font-medium ${
            completionScore >= 70 ? 'text-green-900' : 'text-yellow-900'
          }`}>
            {completionScore >= 70 ? 'Ready to Launch!' : 'Almost Ready'}
          </h4>
        </div>
        
        <p className={`text-sm ${
          completionScore >= 70 ? 'text-green-800' : 'text-yellow-800'
        }`}>
          {completionScore >= 70 
            ? 'Your brand profile is comprehensive and ready for AI-powered analysis and content generation. You can always come back and add more details later.'
            : 'Your brand profile has good coverage, but consider addressing the missing fields above for a more complete analysis.'
          }
        </p>
      </div>
    </div>
  );
};

export default ReviewLaunchStep;