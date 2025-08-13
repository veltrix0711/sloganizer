import React, { useState } from 'react';
import { Crown, Rocket, FileText, Target, TrendingUp, Download, Loader2, CheckCircle, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const CompleteBrandGenerator = ({ user, brandProfile }) => {
  const [businessDetails, setBusinessDetails] = useState({
    businessName: brandProfile?.name || '',
    industry: brandProfile?.industry || '',
    targetMarket: brandProfile?.target_audience || '',
    uniqueValue: '',
    businessModel: 'service',
    fundingGoal: '',
    timeframe: '6months'
  });

  const [generationStep, setGenerationStep] = useState('idle'); // idle, generating, complete
  const [generatedSuite, setGeneratedSuite] = useState(null);
  const [currentlyGenerating, setCurrentlyGenerating] = useState('');

  const businessModels = {
    service: 'Service-Based Business',
    product: 'Product-Based Business',
    saas: 'Software as a Service (SaaS)',
    ecommerce: 'E-commerce/Retail',
    marketplace: 'Marketplace Platform',
    subscription: 'Subscription Model',
    consulting: 'Consulting/Agency',
    franchise: 'Franchise Business'
  };

  const timeframes = {
    '3months': '3 Months (Quick Launch)',
    '6months': '6 Months (Standard)',
    '12months': '12 Months (Comprehensive)',
    '24months': '24 Months (Long-term)'
  };

  const generateCompleteSuite = async () => {
    if (!businessDetails.businessName.trim()) {
      toast.error('Please enter your business name');
      return;
    }

    if (!businessDetails.industry) {
      toast.error('Please select your industry');
      return;
    }

    setGenerationStep('generating');
    
    try {
      const suiteData = {
        brandIdentity: null,
        businessPlan: null,
        marketingPlan: null,
        additionalAssets: null
      };

      // Step 1: Generate Brand Identity
      setCurrentlyGenerating('Brand Identity & Voice Profile');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      suiteData.brandIdentity = generateBrandIdentity();

      // Step 2: Generate Business Plan
      setCurrentlyGenerating('Comprehensive Business Plan');
      await new Promise(resolve => setTimeout(resolve, 3000));
      suiteData.businessPlan = generateBusinessPlan();

      // Step 3: Generate Marketing Plan
      setCurrentlyGenerating('Strategic Marketing Plan');
      await new Promise(resolve => setTimeout(resolve, 2500));
      suiteData.marketingPlan = generateMarketingPlan();

      // Step 4: Generate Additional Assets
      setCurrentlyGenerating('Content & Asset Library');
      await new Promise(resolve => setTimeout(resolve, 2000));
      suiteData.additionalAssets = generateAdditionalAssets();

      setGeneratedSuite(suiteData);
      setGenerationStep('complete');
      toast.success('Complete business suite generated successfully!');

    } catch (error) {
      console.error('Suite generation error:', error);
      toast.error('Failed to generate business suite');
      setGenerationStep('idle');
    }
  };

  const generateBrandIdentity = () => ({
    brandName: businessDetails.businessName,
    tagline: `${businessDetails.businessName} - Transforming ${businessDetails.industry}`,
    missionStatement: `To provide exceptional ${businessDetails.businessModel === 'service' ? 'services' : 'products'} that ${businessDetails.uniqueValue || 'deliver outstanding value'} to ${businessDetails.targetMarket || 'our customers'}.`,
    visionStatement: `To become the leading ${businessDetails.businessModel} in ${businessDetails.industry}, known for innovation, quality, and customer satisfaction.`,
    coreValues: [
      'Customer Excellence',
      'Innovation & Quality',
      'Integrity & Trust',
      'Continuous Improvement',
      'Community Impact'
    ],
    brandPersonality: ['Professional', 'Innovative', 'Reliable', 'Customer-Focused'],
    colorPalette: {
      primary: '#2563EB',
      secondary: '#7C3AED',
      accent: '#059669',
      neutral: '#374151'
    },
    voiceCharacteristics: {
      tone: 'Professional yet approachable',
      style: 'Clear and confident',
      personality: 'Knowledgeable and helpful'
    }
  });

  const generateBusinessPlan = () => ({
    executiveSummary: `${businessDetails.businessName} is a ${businessDetails.businessModel} focused on ${businessDetails.industry}. Our unique value proposition centers on ${businessDetails.uniqueValue || 'delivering exceptional value'} to ${businessDetails.targetMarket || 'our target market'}.`,
    
    marketAnalysis: {
      industryOverview: `The ${businessDetails.industry} industry presents significant opportunities for growth and innovation.`,
      targetMarket: businessDetails.targetMarket || 'Primary demographic seeking quality solutions',
      competitiveAdvantage: businessDetails.uniqueValue || 'Superior customer service and innovative approach',
      marketSize: 'Expanding market with strong growth potential'
    },
    
    productsServices: {
      description: `Our ${businessDetails.businessModel === 'product' ? 'products' : 'services'} are designed to meet the specific needs of ${businessDetails.targetMarket || 'our customers'}.`,
      features: [
        'High-quality delivery',
        'Customer-centric approach',
        'Competitive pricing',
        'Reliable support'
      ],
      pricing: 'Competitive pricing strategy aligned with market standards'
    },
    
    marketingStrategy: {
      brandPositioning: 'Premium quality with accessible pricing',
      channels: ['Digital Marketing', 'Social Media', 'Content Marketing', 'Networking'],
      customerAcquisition: 'Multi-channel approach focusing on digital presence and referrals'
    },
    
    operationalPlan: {
      businessModel: businessModels[businessDetails.businessModel],
      keyProcesses: [
        'Customer onboarding',
        'Service/product delivery',
        'Quality assurance',
        'Customer support'
      ],
      technology: 'Modern tools and platforms to ensure efficiency'
    },
    
    financialProjections: {
      timeline: timeframes[businessDetails.timeframe],
      fundingNeeds: businessDetails.fundingGoal || 'Self-funded with reinvestment strategy',
      revenueModel: `${businessDetails.businessModel} revenue model with scalable growth potential`,
      breakEven: 'Projected break-even within 12-18 months'
    }
  });

  const generateMarketingPlan = () => ({
    objectives: [
      'Build brand awareness in target market',
      'Acquire first 100 customers within 6 months',
      'Establish strong online presence',
      'Generate positive customer reviews and testimonials'
    ],
    
    targetAudience: {
      primary: businessDetails.targetMarket || 'Primary demographic',
      demographics: 'Age 25-55, professionals and decision-makers',
      psychographics: 'Quality-conscious, value-driven, technology-savvy',
      painPoints: 'Seeking reliable solutions with excellent customer service'
    },
    
    channels: {
      digital: {
        website: 'Professional website with SEO optimization',
        socialMedia: ['LinkedIn', 'Instagram', 'Facebook', 'Twitter'],
        contentMarketing: 'Blog posts, videos, case studies, whitepapers',
        emailMarketing: 'Nurture campaigns and newsletters',
        paidAdvertising: 'Google Ads, social media ads, retargeting'
      },
      traditional: {
        networking: 'Industry events and conferences',
        partnerships: 'Strategic business partnerships',
        referrals: 'Customer referral program',
        pr: 'Press releases and media outreach'
      }
    },
    
    contentStrategy: {
      themes: ['Industry expertise', 'Customer success', 'Innovation', 'Quality'],
      formats: ['Blog articles', 'Social media posts', 'Videos', 'Infographics', 'Case studies'],
      frequency: 'Consistent posting schedule across all platforms'
    },
    
    campaigns: [
      {
        name: 'Launch Campaign',
        duration: '3 months',
        goal: 'Brand awareness and initial customer acquisition',
        tactics: ['Social media blitz', 'Content marketing', 'Networking', 'PR outreach']
      },
      {
        name: 'Growth Campaign',
        duration: '6 months',
        goal: 'Scale customer acquisition and retention',
        tactics: ['Paid advertising', 'Referral program', 'Partnerships', 'Email marketing']
      }
    ],
    
    budget: {
      total: 'Allocated based on business model and goals',
      breakdown: {
        digital: '60% - Website, ads, tools, content creation',
        traditional: '25% - Events, networking, partnerships',
        tools: '15% - Marketing software and analytics'
      }
    },
    
    metrics: [
      'Website traffic and conversions',
      'Social media engagement and followers',
      'Lead generation and conversion rates',
      'Customer acquisition cost (CAC)',
      'Customer lifetime value (CLV)',
      'Brand awareness and sentiment'
    ]
  });

  const generateAdditionalAssets = () => ({
    contentLibrary: {
      slogans: [
        `${businessDetails.businessName} - Excellence in ${businessDetails.industry}`,
        `Your Partner in ${businessDetails.industry} Success`,
        `Innovation Meets Excellence`,
        `Quality You Can Trust`,
        `Transforming ${businessDetails.industry}, One Client at a Time`
      ],
      socialMediaPosts: [
        `🚀 Welcome to ${businessDetails.businessName}! We're excited to bring you exceptional ${businessDetails.businessModel} in ${businessDetails.industry}. #Innovation #Quality`,
        `💡 At ${businessDetails.businessName}, we believe in ${businessDetails.uniqueValue || 'delivering outstanding value'}. Here's how we make a difference... #CustomerFirst`,
        `🎯 Looking for reliable ${businessDetails.industry} solutions? ${businessDetails.businessName} has you covered. Let's discuss your needs! #Solutions #Professional`
      ],
      emailTemplates: [
        {
          subject: `Welcome to ${businessDetails.businessName}!`,
          content: `Thank you for choosing ${businessDetails.businessName}. We're committed to delivering exceptional results...`
        },
        {
          subject: `Your ${businessDetails.businessName} Update`,
          content: `We wanted to keep you informed about your project progress and next steps...`
        }
      ]
    },
    
    businessDocuments: [
      'Professional email signatures',
      'Letterhead templates',
      'Proposal templates',
      'Invoice templates',
      'Contract templates',
      'Presentation templates'
    ],
    
    digitalAssets: [
      'Logo variations (horizontal, vertical, icon)',
      'Social media profile images',
      'Website header graphics',
      'Business card designs',
      'Brochure layouts',
      'Favicon and app icons'
    ],
    
    launchChecklist: [
      'Complete brand identity implementation',
      'Build professional website',
      'Set up social media profiles',
      'Create business documentation',
      'Establish payment and invoicing systems',
      'Launch marketing campaigns',
      'Network and build partnerships',
      'Collect and showcase testimonials'
    ]
  });

  const downloadSuite = () => {
    if (!generatedSuite) return;
    
    const suiteData = JSON.stringify(generatedSuite, null, 2);
    const blob = new Blob([suiteData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${businessDetails.businessName}-complete-business-suite.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Business suite downloaded!');
  };

  // Check if user has Pro-500 access
  const hasProAccess = user?.subscription?.plan_code === 'AGENCY' || user?.subscription_tier === 'pro-500';

  if (!hasProAccess) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-2xl text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Crown className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-4">
          Complete Business Suite Generator
        </h3>
        <p className="text-slate-300 mb-6 leading-relaxed">
          Generate a comprehensive business package including brand identity, business plan, 
          marketing strategy, and content library - all tailored to your business.
        </p>
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 mb-6">
          <h4 className="text-purple-300 font-semibold mb-2">🚀 Pro-500 Exclusive Feature</h4>
          <p className="text-purple-200/80 text-sm">
            This powerful tool is available exclusively to Pro-500 subscribers.
          </p>
        </div>
        <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200">
          Upgrade to Pro-500
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-white flex items-center">
            <Rocket className="w-6 h-6 mr-3 text-purple-400" />
            Complete Business Suite Generator
          </h3>
          <p className="text-slate-300 mt-2">
            Generate everything you need to launch your business successfully
          </p>
        </div>
        <Crown className="w-8 h-8 text-purple-400" />
      </div>

      {generationStep === 'idle' && (
        <div className="space-y-6">
          {/* Business Details Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Business Name *</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-200"
                placeholder="Your business name"
                value={businessDetails.businessName}
                onChange={(e) => setBusinessDetails(prev => ({ ...prev, businessName: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Industry *</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-200"
                placeholder="e.g., Technology, Healthcare, Consulting"
                value={businessDetails.industry}
                onChange={(e) => setBusinessDetails(prev => ({ ...prev, industry: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Target Market</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-200"
                placeholder="e.g., Small businesses, Tech professionals"
                value={businessDetails.targetMarket}
                onChange={(e) => setBusinessDetails(prev => ({ ...prev, targetMarket: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Business Model</label>
              <select
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-200"
                value={businessDetails.businessModel}
                onChange={(e) => setBusinessDetails(prev => ({ ...prev, businessModel: e.target.value }))}
              >
                {Object.entries(businessModels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Unique Value Proposition</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-200"
                placeholder="What makes you unique?"
                value={businessDetails.uniqueValue}
                onChange={(e) => setBusinessDetails(prev => ({ ...prev, uniqueValue: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Launch Timeline</label>
              <select
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-200"
                value={businessDetails.timeframe}
                onChange={(e) => setBusinessDetails(prev => ({ ...prev, timeframe: e.target.value }))}
              >
                {Object.entries(timeframes).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* What's Included */}
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-6">
            <h4 className="text-purple-300 font-semibold mb-4 flex items-center">
              <Sparkles className="w-5 h-5 mr-2" />
              Your Complete Business Suite Will Include:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center text-purple-200">
                  <Target className="w-4 h-4 mr-2" />
                  <span className="text-sm">Complete Brand Identity</span>
                </div>
                <div className="flex items-center text-purple-200">
                  <FileText className="w-4 h-4 mr-2" />
                  <span className="text-sm">Comprehensive Business Plan</span>
                </div>
                <div className="flex items-center text-purple-200">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  <span className="text-sm">Strategic Marketing Plan</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center text-purple-200">
                  <Sparkles className="w-4 h-4 mr-2" />
                  <span className="text-sm">Content & Asset Library</span>
                </div>
                <div className="flex items-center text-purple-200">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span className="text-sm">Launch Checklist</span>
                </div>
                <div className="flex items-center text-purple-200">
                  <Download className="w-4 h-4 mr-2" />
                  <span className="text-sm">Professional Templates</span>
                </div>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={generateCompleteSuite}
            disabled={!businessDetails.businessName.trim() || !businessDetails.industry.trim()}
            className="w-full py-4 px-6 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg font-bold text-white shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <Rocket className="w-6 h-6 mr-3" />
            Generate Complete Business Suite
          </button>
        </div>
      )}

      {generationStep === 'generating' && (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">
            Generating Your Complete Business Suite
          </h3>
          <p className="text-purple-300 mb-6">
            Currently generating: <span className="font-semibold">{currentlyGenerating}</span>
          </p>
          <div className="max-w-md mx-auto">
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full transition-all duration-1000 animate-pulse" style={{ width: '60%' }} />
            </div>
          </div>
          <p className="text-slate-400 text-sm mt-4">
            This may take a few minutes as we create your comprehensive business package...
          </p>
        </div>
      )}

      {generationStep === 'complete' && generatedSuite && (
        <div className="space-y-6">
          <div className="text-center bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-6">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-green-300 mb-2">
              Business Suite Generated Successfully!
            </h3>
            <p className="text-green-200/80">
              Your complete business package is ready for download and implementation.
            </p>
          </div>

          {/* Suite Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2 flex items-center">
                <Target className="w-4 h-4 mr-2 text-purple-400" />
                Brand Identity
              </h4>
              <p className="text-slate-300 text-sm mb-2">
                Complete brand identity including mission, vision, values, and voice characteristics.
              </p>
              <p className="text-purple-300 text-xs">
                ✓ Brand name, tagline, mission & vision statements
              </p>
            </div>

            <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2 flex items-center">
                <FileText className="w-4 h-4 mr-2 text-blue-400" />
                Business Plan
              </h4>
              <p className="text-slate-300 text-sm mb-2">
                Comprehensive business plan with market analysis and financial projections.
              </p>
              <p className="text-blue-300 text-xs">
                ✓ Market analysis, operations, financials & strategy
              </p>
            </div>

            <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-green-400" />
                Marketing Plan
              </h4>
              <p className="text-slate-300 text-sm mb-2">
                Strategic marketing plan with campaigns, channels, and metrics.
              </p>
              <p className="text-green-300 text-xs">
                ✓ Campaigns, content strategy, budget & KPIs
              </p>
            </div>

            <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2 flex items-center">
                <Sparkles className="w-4 h-4 mr-2 text-yellow-400" />
                Content Library
              </h4>
              <p className="text-slate-300 text-sm mb-2">
                Ready-to-use content including slogans, posts, and templates.
              </p>
              <p className="text-yellow-300 text-xs">
                ✓ Slogans, social posts, emails & documents
              </p>
            </div>
          </div>

          {/* Download Button */}
          <button
            onClick={downloadSuite}
            className="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg font-bold text-white shadow-xl shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-300 hover:scale-105"
          >
            <Download className="w-5 h-5 mr-3" />
            Download Complete Business Suite
          </button>

          <div className="text-center">
            <button
              onClick={() => {
                setGenerationStep('idle');
                setGeneratedSuite(null);
              }}
              className="text-purple-400 hover:text-purple-300 text-sm transition-colors"
            >
              Generate Another Suite
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompleteBrandGenerator;