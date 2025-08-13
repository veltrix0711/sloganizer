import React, { useState } from 'react';
import { 
  Edit3, 
  Palette, 
  Type, 
  Users, 
  Building, 
  Globe,
  Instagram,
  Linkedin,
  Twitter,
  Facebook,
  Star,
  ExternalLink,
  Brain,
  Sparkles,
  BarChart3,
  MessageSquare
} from 'lucide-react';
import BrandDashboard from '../BrandAnalysis/BrandDashboard';
import AnalysisResults from '../BrandAnalysis/AnalysisResults';
import ContentSuggestions from '../BrandAnalysis/ContentSuggestions';
import VoiceTrainingTab from '../VoiceTraining/VoiceTrainingTab';

const BrandProfileCard = ({ profile, onEdit }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [analysisResults, setAnalysisResults] = useState(null);
  
  const {
    name,
    tagline,
    mission,
    primary_color,
    secondary_color,
    accent_color,
    primary_font,
    secondary_font,
    tone_of_voice,
    target_audience,
    brand_personality = [],
    industry,
    niche_tags = [],
    website_url,
    social_links = {},
    is_default,
    brand_assets = [],
    // AI analysis fields
    brand_health_score,
    ai_recommendations,
    strengths,
    opportunities,
    weaknesses,
    threats
  } = profile;

  const primaryLogo = brand_assets?.find(asset => asset.asset_type === 'logo' && asset.is_primary);

  const formatSocialUrl = (platform, value) => {
    if (!value) return null;
    
    if (value.startsWith('http')) return value;
    
    const platformUrls = {
      instagram: 'https://instagram.com/',
      linkedin: 'https://linkedin.com/in/',
      twitter: 'https://twitter.com/',
      facebook: 'https://facebook.com/'
    };
    
    const baseUrl = platformUrls[platform];
    if (!baseUrl) return value;
    
    const username = value.replace('@', '');
    return baseUrl + username;
  };

  const getSocialIcon = (platform) => {
    const icons = {
      instagram: Instagram,
      linkedin: Linkedin,
      twitter: Twitter,
      facebook: Facebook
    };
    return icons[platform] || Globe;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            {primaryLogo ? (
              <img
                src={primaryLogo.file_url}
                alt={`${name} logo`}
                className="w-16 h-16 object-contain border border-gray-200 rounded-lg"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center">
                <Building className="w-8 h-8 text-gray-400" />
              </div>
            )}
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
                {is_default && (
                  <Star className="w-5 h-5 text-yellow-500 fill-current" title="Default profile" />
                )}
              </div>
              {tagline && (
                <p className="text-lg text-gray-600 mt-1">{tagline}</p>
              )}
              {mission && (
                <p className="text-sm text-gray-500 mt-2 max-w-2xl">{mission}</p>
              )}
            </div>
          </div>
          
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Edit3 className="w-4 h-4" />
            Edit Profile
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {[
            { id: 'overview', name: 'Overview', icon: Building },
            { id: 'dashboard', name: 'AI Dashboard', icon: Brain },
            { id: 'voice', name: 'Voice Training', icon: MessageSquare },
            { id: 'analysis', name: 'Analysis', icon: BarChart3 },
            { id: 'content', name: 'Content Ideas', icon: Sparkles }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-8">
        {/* Brand Colors */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Palette className="w-5 h-5 mr-2" />
            Brand Colors
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {primary_color && (
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-lg border border-gray-200"
                  style={{ backgroundColor: primary_color }}
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">Primary</p>
                  <p className="text-sm text-gray-500">{primary_color}</p>
                </div>
              </div>
            )}
            
            {secondary_color && (
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-lg border border-gray-200"
                  style={{ backgroundColor: secondary_color }}
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">Secondary</p>
                  <p className="text-sm text-gray-500">{secondary_color}</p>
                </div>
              </div>
            )}
            
            {accent_color && (
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-lg border border-gray-200"
                  style={{ backgroundColor: accent_color }}
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">Accent</p>
                  <p className="text-sm text-gray-500">{accent_color}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Typography */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Type className="w-5 h-5 mr-2" />
            Typography
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-900 mb-2">Primary Font</p>
              <div 
                className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                style={{ fontFamily: primary_font }}
              >
                <p className="text-lg">The quick brown fox jumps over the lazy dog</p>
                <p className="text-sm text-gray-600 mt-1">{primary_font}</p>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-900 mb-2">Secondary Font</p>
              <div 
                className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                style={{ fontFamily: secondary_font }}
              >
                <p className="text-lg">The quick brown fox jumps over the lazy dog</p>
                <p className="text-sm text-gray-600 mt-1">{secondary_font}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Brand Voice & Personality */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Brand Voice & Personality
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-900 mb-2">Tone of Voice</p>
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {tone_of_voice?.charAt(0).toUpperCase() + tone_of_voice?.slice(1)}
              </span>
            </div>
            
            {target_audience && (
              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">Target Audience</p>
                <p className="text-sm text-gray-600">{target_audience}</p>
              </div>
            )}
          </div>

          {brand_personality.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-900 mb-3">Personality Traits</p>
              <div className="flex flex-wrap gap-2">
                {brand_personality.map((trait) => (
                  <span
                    key={trait}
                    className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Industry & Tags */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Building className="w-5 h-5 mr-2" />
            Industry & Category
          </h3>
          <div className="space-y-4">
            {industry && (
              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">Industry</p>
                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  {industry}
                </span>
              </div>
            )}

            {niche_tags.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-900 mb-3">Niche Tags</p>
                <div className="flex flex-wrap gap-2">
                  {niche_tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Links & Social Media */}
        {(website_url || Object.values(social_links).some(link => link)) && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              Links & Social Media
            </h3>
            <div className="space-y-4">
              {website_url && (
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-2">Website</p>
                  <a
                    href={website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
                  >
                    {website_url}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}

              {Object.entries(social_links).some(([platform, url]) => url) && (
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-3">Social Media</p>
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(social_links).map(([platform, url]) => {
                      if (!url) return null;
                      
                      const Icon = getSocialIcon(platform);
                      const formattedUrl = formatSocialUrl(platform, url);
                      
                      return (
                        <a
                          key={platform}
                          href={formattedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700"
                        >
                          <Icon className="w-4 h-4" />
                          {platform.charAt(0).toUpperCase() + platform.slice(1)}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Brand Assets Preview */}
        {brand_assets && brand_assets.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Brand Assets</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {brand_assets.slice(0, 8).map((asset) => (
                <div key={asset.id} className="relative">
                  <img
                    src={asset.file_url}
                    alt={asset.file_name}
                    className="w-full h-24 object-cover border border-gray-200 rounded-lg"
                  />
                  <div className="absolute bottom-2 left-2">
                    <span className="inline-block px-2 py-1 bg-black bg-opacity-75 text-white text-xs rounded">
                      {asset.asset_type}
                    </span>
                  </div>
                  {asset.is_primary && (
                    <div className="absolute top-2 right-2">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            {brand_assets.length > 8 && (
              <p className="text-sm text-gray-500 mt-3">
                And {brand_assets.length - 8} more assets...
              </p>
            )}
          </div>
        )}
          </div>
        )}

        {activeTab === 'dashboard' && (
          <BrandDashboard 
            brandProfile={profile}
            onAnalyze={(results) => setAnalysisResults(results)}
            onGenerateContent={(type) => setActiveTab('content')}
          />
        )}

        {activeTab === 'voice' && (
          <VoiceTrainingTab 
            brandProfile={profile}
            onUpdate={() => {
              // Could add callback to refresh profile data if needed
            }}
          />
        )}

        {activeTab === 'analysis' && (
          <div>
            {analysisResults || (brand_health_score && ai_recommendations) ? (
              <AnalysisResults
                analysis={{
                  brand_health_summary: analysisResults?.analysis?.brand_health_summary || "Analysis completed",
                  strengths: strengths || analysisResults?.analysis?.strengths || [],
                  opportunities: opportunities || analysisResults?.analysis?.opportunities || [],
                  weaknesses: weaknesses || analysisResults?.analysis?.weaknesses || [],
                  threats: threats || analysisResults?.analysis?.threats || [],
                  market_insights: analysisResults?.analysis?.market_insights || {}
                }}
                healthScore={brand_health_score || analysisResults?.healthScore || 0}
                recommendations={ai_recommendations || analysisResults?.recommendations || []}
                actionItems={analysisResults?.actionItems || []}
              />
            ) : (
              <div className="text-center py-12">
                <Brain className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Analysis Available</h3>
                <p className="text-gray-600 mb-6">
                  Run an AI analysis from the Dashboard tab to see detailed insights here.
                </p>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Go to Dashboard
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'content' && (
          <ContentSuggestions brandProfile={profile} />
        )}
      </div>
    </div>
  );
};

export default BrandProfileCard;