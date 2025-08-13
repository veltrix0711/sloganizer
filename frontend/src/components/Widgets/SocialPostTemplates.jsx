import React, { useState } from 'react';
import { Share2, Copy, Instagram, Linkedin, Twitter, Facebook, Sparkles, Crown } from 'lucide-react';
import toast from 'react-hot-toast';

const SocialPostTemplates = ({ user, businessName, industry, brandProfile }) => {
  const [selectedPlatform, setSelectedPlatform] = useState('instagram');
  const [postType, setPostType] = useState('announcement');
  const [customPrompt, setCustomPrompt] = useState('');
  const [generatedPost, setGeneratedPost] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const platforms = {
    instagram: {
      name: 'Instagram',
      icon: Instagram,
      color: 'from-pink-500 to-purple-600',
      charLimit: 2200,
      features: ['hashtags', 'emojis', 'visual']
    },
    linkedin: {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'from-blue-600 to-blue-700',
      charLimit: 3000,
      features: ['professional', 'industry_insights', 'networking']
    },
    twitter: {
      name: 'Twitter/X',
      icon: Twitter,
      color: 'from-blue-400 to-blue-500',
      charLimit: 280,
      features: ['concise', 'trending', 'hashtags']
    },
    facebook: {
      name: 'Facebook',
      icon: Facebook,
      color: 'from-blue-700 to-blue-800',
      charLimit: 8000,
      features: ['community', 'storytelling', 'engagement']
    }
  };

  const postTypes = {
    announcement: {
      name: 'Product/Service Announcement',
      description: 'Introduce new offerings to your audience'
    },
    engagement: {
      name: 'Engagement Post',
      description: 'Build community with questions and polls'
    },
    educational: {
      name: 'Educational Content',
      description: 'Share knowledge and establish expertise'
    },
    promotional: {
      name: 'Promotional Campaign',
      description: 'Drive sales and conversions'
    },
    company_update: {
      name: 'Company Update',
      description: 'Share news and milestones'
    },
    behind_scenes: {
      name: 'Behind the Scenes',
      description: 'Show your company culture and process'
    }
  };

  const industryTemplates = {
    technology: {
      announcement: "🚀 Excited to introduce {businessName}'s latest innovation! Our new {product/service} is designed to {benefit}. Perfect for {target_audience} looking to {solution}. #TechInnovation #Innovation",
      engagement: "Tech leaders, what's the biggest challenge you're facing in {current_year}? Share your thoughts below! 👇 We're always looking to understand our community better. #TechCommunity #Innovation",
      educational: "💡 Did you know? {industry_fact}. At {businessName}, we believe in {value_proposition}. Here's how we're making a difference: {explanation}. #TechEducation #KnowledgeSharing"
    },
    healthcare: {
      announcement: "🏥 We're proud to announce {businessName}'s new {service/product}! Focused on improving {health_outcome} for {patient_group}. Your health is our priority. #Healthcare #WellBeing",
      engagement: "Healthcare professionals, what wellness tip has made the biggest impact in your practice? Share your insights! 🩺 #HealthcareCommunity #Wellness",
      educational: "📚 Health Tip: {health_tip}. At {businessName}, we're committed to {mission}. Learn more about {topic}: {explanation}. #HealthEducation #Wellness"
    },
    food: {
      announcement: "🍽️ Introducing {businessName}'s newest {menu_item/product}! Made with {ingredients/quality} and crafted for {target_audience}. Taste the difference! #FoodLovers #Quality",
      engagement: "Food lovers! What's your go-to comfort food? Share a photo and tag us! 📸 We love seeing what makes our community happy. #FoodCommunity #ComfortFood",
      educational: "👨‍🍳 Chef's Tip: {cooking_tip}. At {businessName}, we believe {food_philosophy}. Here's how we {process/approach}: {explanation}. #CookingTips #FoodKnowledge"
    },
    retail: {
      announcement: "🛍️ New arrivals at {businessName}! Discover our latest {product_category} perfect for {season/occasion}. Shop now and {offer/benefit}! #Shopping #NewArrivals",
      engagement: "Shoppers, what's your favorite {product_category}? Drop a comment and tell us your style! 💬 We love hearing from our community. #Shopping #Style",
      educational: "🛒 Shopping Tip: {shopping_tip}. At {businessName}, we {value_proposition}. Here's what makes us different: {explanation}. #ShoppingTips #Quality"
    }
  };

  const generatePost = async () => {
    if (!businessName?.trim()) {
      toast.error('Please enter a business name first');
      return;
    }

    setIsGenerating(true);
    try {
      // Get industry-specific template
      const businessIndustry = industry || 'general';
      const templates = industryTemplates[businessIndustry] || industryTemplates.technology;
      let baseTemplate = templates[postType] || templates.announcement;

      // Customize template based on input
      let customizedPost = baseTemplate
        .replace(/{businessName}/g, businessName)
        .replace(/{current_year}/g, new Date().getFullYear())
        .replace(/{product\/service}/g, customPrompt || 'solution')
        .replace(/{benefit}/g, 'transform your business')
        .replace(/{target_audience}/g, 'businesses')
        .replace(/{solution}/g, 'streamline operations');

      // Platform-specific customizations
      const platform = platforms[selectedPlatform];
      
      if (selectedPlatform === 'twitter' && customizedPost.length > platform.charLimit) {
        // Shorten for Twitter
        customizedPost = customizedPost.substring(0, platform.charLimit - 20) + '... 🧵';
      }

      if (selectedPlatform === 'linkedin') {
        // Add professional tone
        customizedPost += '\n\nWhat are your thoughts on this? I\'d love to hear your perspective in the comments.';
      }

      if (selectedPlatform === 'instagram') {
        // Add relevant hashtags
        const hashtags = '\n\n#Business #Innovation #Growth #Success #Entrepreneur #Quality #Community #Excellence';
        if ((customizedPost + hashtags).length <= platform.charLimit) {
          customizedPost += hashtags;
        }
      }

      setGeneratedPost(customizedPost);
      
    } catch (error) {
      toast.error('Failed to generate post');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyPost = async () => {
    try {
      await navigator.clipboard.writeText(generatedPost);
      toast.success('Post copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy post');
    }
  };

  const currentPlatform = platforms[selectedPlatform];
  const PlatformIcon = currentPlatform.icon;

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center">
          <Share2 className="w-5 h-5 mr-2 text-green-400" />
          Professional Social Posts
        </h3>
        {!user && (
          <Crown className="w-5 h-5 text-purple-400" />
        )}
      </div>

      <div className="space-y-6">
        {/* Platform Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-3">Platform</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(platforms).map(([key, platform]) => {
              const Icon = platform.icon;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedPlatform(key)}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                    selectedPlatform === key
                      ? 'border-white bg-white/10'
                      : 'border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <Icon className={`w-6 h-6 mx-auto mb-2 ${
                    selectedPlatform === key ? 'text-white' : 'text-slate-400'
                  }`} />
                  <p className={`text-xs ${
                    selectedPlatform === key ? 'text-white' : 'text-slate-400'
                  }`}>
                    {platform.name}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Post Type Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-3">Post Type</label>
          <select
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all duration-200"
            value={postType}
            onChange={(e) => setPostType(e.target.value)}
          >
            {Object.entries(postTypes).map(([key, type]) => (
              <option key={key} value={key}>
                {type.name} - {type.description}
              </option>
            ))}
          </select>
        </div>

        {/* Custom Input */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Additional Details (Optional)
          </label>
          <input
            type="text"
            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all duration-200"
            placeholder="e.g., new product launch, summer sale, team achievement..."
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            maxLength={100}
          />
        </div>

        {/* Platform Info */}
        <div className={`bg-gradient-to-r ${currentPlatform.color} bg-opacity-10 border border-opacity-30 rounded-lg p-4`}>
          <div className="flex items-center gap-3 mb-2">
            <PlatformIcon className="w-5 h-5 text-white" />
            <h4 className="text-white font-medium">{currentPlatform.name} Guidelines</h4>
          </div>
          <div className="text-sm text-slate-300 space-y-1">
            <p>Character limit: {currentPlatform.charLimit.toLocaleString()}</p>
            <p>Best practices: {currentPlatform.features.join(', ')}</p>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={generatePost}
          disabled={isGenerating || !businessName?.trim()}
          className="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg font-bold text-white shadow-xl shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isGenerating ? (
            <>
              <Sparkles className="w-5 h-5 mr-2 animate-spin" />
              Generating Professional Post...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Generate {currentPlatform.name} Post
            </>
          )}
        </button>

        {/* Generated Post */}
        {generatedPost && (
          <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-medium flex items-center">
                <PlatformIcon className="w-4 h-4 mr-2" />
                Generated {currentPlatform.name} Post
              </h4>
              <button
                onClick={copyPost}
                className="flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors text-sm"
              >
                <Copy className="w-3 h-3" />
                Copy
              </button>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <p className="text-white whitespace-pre-wrap text-sm leading-relaxed">
                {generatedPost}
              </p>
              <div className="mt-3 pt-3 border-t border-slate-600 flex justify-between text-xs text-slate-400">
                <span>Characters: {generatedPost.length}/{currentPlatform.charLimit}</span>
                <span className={generatedPost.length > currentPlatform.charLimit ? 'text-red-400' : 'text-green-400'}>
                  {generatedPost.length <= currentPlatform.charLimit ? '✓ Within limit' : '⚠ Over limit'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <h4 className="text-blue-300 font-medium mb-2">💡 Pro Tips</h4>
          <ul className="text-blue-200/80 text-sm space-y-1">
            <li>• Customize the generated content to match your unique voice</li>
            <li>• Add relevant industry hashtags for better reach</li>
            <li>• Include a clear call-to-action to drive engagement</li>
            <li>• Post consistently to build audience engagement</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SocialPostTemplates;