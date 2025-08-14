import { useState, useEffect } from 'react'
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Users, 
  MessageSquare,
  PieChart,
  BarChart3,
  Lightbulb,
  Zap,
  Play,
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Star,
  Rocket
} from 'lucide-react'
import { useAuth } from '../services/authContext'
import api from '../services/api'
import toast from 'react-hot-toast'

const AIStrategyToolsPage = () => {
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('competitor-analysis')
  const [analysisData, setAnalysisData] = useState(null)
  const [strategyResults, setStrategyResults] = useState(null)
  const [formData, setFormData] = useState({
    businessName: '',
    industry: '',
    targetAudience: '',
    competitors: '',
    goals: '',
    timeframe: '3-months',
    budget: 'medium'
  })

  const strategyTools = [
    {
      id: 'competitor-analysis',
      name: 'Competitor Analysis',
      icon: <Target className="h-6 w-6" />,
      description: 'AI-powered analysis of your competitors\' messaging strategies',
      tier: 'free'
    },
    {
      id: 'brand-positioning',
      name: 'Brand Positioning',
      icon: <TrendingUp className="h-6 w-6" />,
      description: 'Develop unique positioning strategies based on market gaps',
      tier: 'pro'
    },
    {
      id: 'audience-insights',
      name: 'Audience Insights',
      icon: <Users className="h-6 w-6" />,
      description: 'Deep dive into your target audience preferences and behaviors',
      tier: 'pro'
    },
    {
      id: 'messaging-optimization',
      name: 'Messaging Optimization',
      icon: <MessageSquare className="h-6 w-6" />,
      description: 'Optimize your messaging for maximum impact and engagement',
      tier: 'free'
    },
    {
      id: 'market-trends',
      name: 'Market Trends',
      icon: <BarChart3 className="h-6 w-6" />,
      description: 'Identify emerging trends and opportunities in your market',
      tier: 'enterprise'
    },
    {
      id: 'strategy-roadmap',
      name: 'Strategy Roadmap',
      icon: <Rocket className="h-6 w-6" />,
      description: 'Complete strategic roadmap with actionable recommendations',
      tier: 'enterprise'
    }
  ]

  const canUseTool = (tool) => {
    if (tool.tier === 'free') return true
    if (!profile) return false
    
    const userTier = profile.subscription_plan
    if (userTier === 'agency' || userTier === 'premium') return true
    if (userTier === 'pro' && (tool.tier === 'pro' || tool.tier === 'free')) return true
    
    return false
  }

  const handleAnalysisSubmit = async (toolId) => {
    if (!user) {
      toast.error('Please sign in to use AI Strategy Tools')
      return
    }

    if (!canUseTool(strategyTools.find(t => t.id === toolId))) {
      toast.error('This tool requires a higher subscription plan')
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/api/ai-strategy/analyze', {
        toolId,
        formData,
        email: user.email
      })

      if (response.success) {
        setAnalysisData(response.analysis)
        setStrategyResults(response.strategy)
        toast.success('Analysis completed!')
      }
    } catch (error) {
      console.error('Analysis error:', error)
      toast.error('Failed to complete analysis')
    } finally {
      setLoading(false)
    }
  }

  const handleExportStrategy = async (format) => {
    try {
      const response = await api.post('/api/ai-strategy/export', {
        format,
        data: strategyResults,
        email: user.email
      })

      if (response.success) {
        toast.success(`Strategy exported as ${format.toUpperCase()}`)
      }
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export strategy')
    }
  }

  const activeTool = strategyTools.find(tool => tool.id === activeTab)

  return (
    <div className="min-h-screen bg-night py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-grad-quantum rounded-2xl mb-6">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-heading mb-4">AI Strategy Tools</h1>
          <p className="text-xl text-body max-w-3xl mx-auto">
            Leverage advanced AI to develop comprehensive marketing strategies, 
            analyze competitors, and optimize your brand positioning
          </p>
        </div>

        {/* Tool Tabs */}
        <div className="card-primary mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {strategyTools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => setActiveTab(tool.id)}
                disabled={!canUseTool(tool)}
                className={`p-6 rounded-xl border-2 text-left transition-all duration-200 relative ${
                  activeTab === tool.id
                    ? 'border-electric bg-electric/10'
                    : canUseTool(tool)
                    ? 'border-slate-600 hover:border-electric/50 hover:bg-slate-700/30'
                    : 'border-slate-700 bg-slate-700/50 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-3 rounded-lg ${
                    activeTab === tool.id ? 'bg-electric text-white' : 'bg-slate-700 text-muted'
                  }`}>
                    {tool.icon}
                  </div>
                  {!canUseTool(tool) && (
                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                      {tool.tier}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-heading mb-2">{tool.name}</h3>
                <p className="text-sm text-muted">{tool.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Form */}
          <div className="lg:col-span-1">
            <div className="card-primary sticky top-8">
              <h3 className="text-xl font-bold text-heading mb-6 flex items-center">
                {activeTool?.icon}
                <span className="ml-3">{activeTool?.name}</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="form-label">Business Name</label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                    className="form-input"
                    placeholder="Enter your business name"
                  />
                </div>

                <div>
                  <label className="form-label">Industry</label>
                  <select
                    value={formData.industry}
                    onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                    className="form-input"
                  >
                    <option value="">Select industry</option>
                    <option value="technology">Technology</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="finance">Finance</option>
                    <option value="ecommerce">E-commerce</option>
                    <option value="education">Education</option>
                    <option value="food">Food & Beverage</option>
                    <option value="fashion">Fashion</option>
                    <option value="automotive">Automotive</option>
                    <option value="real-estate">Real Estate</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Target Audience</label>
                  <textarea
                    value={formData.targetAudience}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                    className="form-input h-20"
                    placeholder="Describe your target audience demographics, interests, and behaviors"
                  />
                </div>

                <div>
                  <label className="form-label">Key Competitors</label>
                  <textarea
                    value={formData.competitors}
                    onChange={(e) => setFormData(prev => ({ ...prev, competitors: e.target.value }))}
                    className="form-input h-20"
                    placeholder="List your main competitors (company names or websites)"
                  />
                </div>

                <div>
                  <label className="form-label">Business Goals</label>
                  <textarea
                    value={formData.goals}
                    onChange={(e) => setFormData(prev => ({ ...prev, goals: e.target.value }))}
                    className="form-input h-20"
                    placeholder="What are your main business objectives?"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Timeframe</label>
                    <select
                      value={formData.timeframe}
                      onChange={(e) => setFormData(prev => ({ ...prev, timeframe: e.target.value }))}
                      className="form-input"
                    >
                      <option value="1-month">1 Month</option>
                      <option value="3-months">3 Months</option>
                      <option value="6-months">6 Months</option>
                      <option value="1-year">1 Year</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Budget Range</label>
                    <select
                      value={formData.budget}
                      onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                      className="form-input"
                    >
                      <option value="small">Small ($1K-$5K)</option>
                      <option value="medium">Medium ($5K-$25K)</option>
                      <option value="large">Large ($25K+)</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => handleAnalysisSubmit(activeTab)}
                  disabled={loading || !canUseTool(activeTool)}
                  className={`w-full btn-primary flex items-center justify-center ${
                    !canUseTool(activeTool) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Run Analysis
                    </>
                  )}
                </button>

                {!canUseTool(activeTool) && (
                  <button
                    onClick={() => window.location.href = '/pricing'}
                    className="w-full btn-secondary flex items-center justify-center"
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Upgrade to Use This Tool
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-2">
            {!analysisData && !loading && (
              <div className="card-primary text-center py-12">
                <div className="w-16 h-16 bg-grad-quantum rounded-xl flex items-center justify-center mx-auto mb-6">
                  <Lightbulb className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-heading mb-2">Ready to Analyze</h3>
                <p className="text-body mb-6">
                  Fill out the form and click "Run Analysis" to get AI-powered strategic insights
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                  <div className="flex items-center text-sm text-muted">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
                    Competitive Intelligence
                  </div>
                  <div className="flex items-center text-sm text-muted">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
                    Market Positioning
                  </div>
                  <div className="flex items-center text-sm text-muted">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
                    Action Plan
                  </div>
                </div>
              </div>
            )}

            {loading && (
              <div className="card-primary text-center py-12">
                <div className="w-16 h-16 bg-grad-quantum rounded-xl flex items-center justify-center mx-auto mb-6">
                  <RefreshCw className="h-8 w-8 text-white animate-spin" />
                </div>
                <h3 className="text-xl font-bold text-heading mb-2">Analyzing Your Strategy</h3>
                <p className="text-body">
                  Our AI is processing your information and generating strategic insights...
                </p>
              </div>
            )}

            {analysisData && (
              <div className="space-y-6">
                {/* Analysis Summary */}
                <div className="card-primary">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-heading">Analysis Summary</h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleExportStrategy('pdf')}
                        className="btn-secondary btn-small flex items-center"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        PDF
                      </button>
                      <button
                        onClick={() => handleExportStrategy('json')}
                        className="btn-secondary btn-small flex items-center"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Data
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <Target className="h-6 w-6 text-green-400" />
                      </div>
                      <p className="text-2xl font-bold text-heading">87%</p>
                      <p className="text-sm text-muted">Market Opportunity</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <TrendingUp className="h-6 w-6 text-blue-400" />
                      </div>
                      <p className="text-2xl font-bold text-heading">12</p>
                      <p className="text-sm text-muted">Strategic Recommendations</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <Users className="h-6 w-6 text-purple-400" />
                      </div>
                      <p className="text-2xl font-bold text-heading">3.2M</p>
                      <p className="text-sm text-muted">Potential Reach</p>
                    </div>
                  </div>

                  <div className="prose prose-invert max-w-none">
                    <p className="text-body">
                      Based on our analysis of your business and competitive landscape, 
                      we've identified significant opportunities for growth in your target market. 
                      Your unique positioning as a {formData.industry} company targeting 
                      {formData.targetAudience} provides several strategic advantages.
                    </p>
                  </div>
                </div>

                {/* Key Insights */}
                <div className="card-primary">
                  <h3 className="text-xl font-bold text-heading mb-6">Key Strategic Insights</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4 p-4 bg-space/30 rounded-lg">
                      <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-heading mb-1">Competitive Advantage</h4>
                        <p className="text-body text-sm">
                          Your focus on {formData.targetAudience} gives you a unique edge in the market. 
                          Competitors are primarily targeting broader audiences, leaving gaps for specialized messaging.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 p-4 bg-space/30 rounded-lg">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="h-4 w-4 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-heading mb-1">Market Opportunity</h4>
                        <p className="text-body text-sm">
                          The {formData.industry} sector is experiencing 23% growth. 
                          Now is an optimal time to strengthen your market position.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 p-4 bg-space/30 rounded-lg">
                      <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="h-4 w-4 text-purple-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-heading mb-1">Messaging Optimization</h4>
                        <p className="text-body text-sm">
                          Focus on emotional benefits rather than features. 
                          Your audience responds 40% better to value-driven messaging.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Plan */}
                <div className="card-primary">
                  <h3 className="text-xl font-bold text-heading mb-6">Recommended Action Plan</h3>
                  <div className="space-y-4">
                    {['Immediate Actions (1-30 days)', 'Short-term Goals (1-3 months)', 'Long-term Strategy (3-12 months)'].map((phase, index) => (
                      <div key={index} className="border border-electric/20 rounded-lg p-4">
                        <h4 className="font-semibold text-heading mb-3 flex items-center">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs mr-3 ${
                            index === 0 ? 'bg-red-500/20 text-red-400' :
                            index === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {index + 1}
                          </span>
                          {phase}
                        </h4>
                        <ul className="space-y-2 text-sm text-body">
                          <li className="flex items-start">
                            <ArrowRight className="h-4 w-4 mr-2 mt-0.5 text-electric flex-shrink-0" />
                            Implement new messaging strategy across all channels
                          </li>
                          <li className="flex items-start">
                            <ArrowRight className="h-4 w-4 mr-2 mt-0.5 text-electric flex-shrink-0" />
                            Launch targeted campaigns for {formData.targetAudience}
                          </li>
                          <li className="flex items-start">
                            <ArrowRight className="h-4 w-4 mr-2 mt-0.5 text-electric flex-shrink-0" />
                            Monitor competitor responses and adjust strategy
                          </li>
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pro Upgrade CTA */}
        {profile?.subscription_plan === 'free' && (
          <div className="mt-12">
            <div className="card-accent bg-grad-quantum text-center">
              <div className="flex items-center justify-center mb-4">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Unlock Advanced AI Strategy Tools</h3>
              <p className="text-white/90 mb-6">
                Get access to competitor intelligence, brand positioning, and comprehensive strategy roadmaps
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => window.location.href = '/pricing'}
                  className="btn-primary"
                >
                  Upgrade to Pro
                </button>
                <button className="btn-secondary">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AIStrategyToolsPage