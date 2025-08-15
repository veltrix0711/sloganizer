import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Check, 
  Rocket, 
  Sparkles, 
  Crown, 
  Building, 
  Zap, 
  ArrowRight,
  Star,
  Clock,
  Users,
  Globe,
  Shield,
  TrendingUp
} from 'lucide-react'
import { useAuth } from '../services/authContext'
import api from '../services/api'
import toast from 'react-hot-toast'

const NewPricingPage = () => {
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(null)
  const [currentPlan, setCurrentPlan] = useState(null)
  const [selectedProTier, setSelectedProTier] = useState('PRO_500')

  useEffect(() => {
    if (user) {
      fetchCurrentSubscription()
    } else {
      setCurrentPlan(null)
    }
  }, [user, profile])

  // Map subscription tiers to plan codes
  const getUserPlanCode = () => {
    const tier = currentPlan || profile?.subscription_plan
    if (!tier) return null
    
    const tierMapping = {
      'free': 'STARTER',
      'pro': 'PRO_500',
      'pro_500': 'PRO_500', 
      'pro-500': 'PRO_500',
      'agency': 'AGENCY',
      'premium': 'AGENCY'
    }
    
    return tierMapping[tier.toLowerCase()] || null
  }

  const userPlanCode = getUserPlanCode()
  console.log('User plan code:', userPlanCode, 'from tier:', currentPlan || profile?.subscription_plan)

  const fetchCurrentSubscription = async () => {
    try {
      // Use profile data first if available for faster loading
      if (profile?.subscription_plan) {
        setCurrentPlan(profile.subscription_plan)
        return
      }
      
      const response = await api.getSubscriptionStatus()
      if (response.success && response.subscription) {
        console.log('Subscription response:', response.subscription)
        setCurrentPlan(response.subscription.tier || response.subscription.plan)
      }
    } catch (error) {
      console.error('Error fetching subscription:', error)
      // Fallback to profile data
      if (profile?.subscription_plan) {
        setCurrentPlan(profile.subscription_plan)
      }
    }
  }

  const handlePlanSelect = async (planCode) => {
    if (!user) {
      window.location.href = '/signup'
      return
    }

    if (planCode === 'AGENCY') {
      window.location.href = '/contact-sales'
      return
    }

    setLoading(planCode)

    try {
      const response = await api.createBillingCheckout({
        planCode,
        successUrl: window.location.origin + '/billing/success',
        cancelUrl: window.location.origin + '/pricing'
      })

      if (response.success && response.url) {
        window.location.href = response.url
      } else {
        throw new Error('Failed to create checkout session')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('Failed to start checkout. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  const plans = {
    starter: {
      name: 'Starter Pack',
      code: 'STARTER',
      price: 0,
      originalPrice: 9.99,
      period: 'for 7 days',
      trialText: 'then $9.99/month',
      description: 'Launch your brand kit and start posting—free for 7 days, then $9.99.',
      icon: <Rocket className="h-6 w-6" />,
      gradient: 'from-electric to-teal',
      glowColor: 'shadow-glow-blue',
      features: [
        { text: '1 brand', icon: <Building className="h-4 w-4" /> },
        { text: '5 social connections', icon: <Globe className="h-4 w-4" />, 
          tooltip: 'X, Instagram, TikTok, Facebook, Pinterest' },
        { text: '200 scheduled posts/month', icon: <TrendingUp className="h-4 w-4" /> },
        { text: '200 AI credits/month', icon: <Sparkles className="h-4 w-4" /> },
        { text: 'Brand Kit (colors, fonts, logos)', icon: <Star className="h-4 w-4" /> },
        { text: 'Smart Scheduler', icon: <Clock className="h-4 w-4" /> },
        { text: 'Basic analytics', icon: <TrendingUp className="h-4 w-4" /> },
        { text: 'Template Marketplace access', icon: <Star className="h-4 w-4" /> },
      ],
      comingSoon: [],
      cta: 'Start 7-day free trial',
      popular: false,
    }
  }

  const proPlans = {
    PRO_50: {
      name: 'Pro-50',
      price: 29.99,
      features: {
        brands: '1–2',
        socials: '8',
        posts: '1,000',
        credits: '1,000',
        videoMinutes: '60',
        seats: '2',
        websites: '1'
      }
    },
    PRO_200: {
      name: 'Pro-200', 
      price: 49.99,
      features: {
        brands: '3',
        socials: '12', 
        posts: '2,500',
        credits: '2,500',
        videoMinutes: '150',
        seats: '4',
        websites: '3'
      }
    },
    PRO_500: {
      name: 'Pro-500',
      price: 79.99,
      features: {
        brands: '5',
        socials: '15',
        posts: '5,000', 
        credits: '5,000',
        videoMinutes: '300',
        seats: '6',
        websites: '5'
      }
    }
  }

  const selectedPro = proPlans[selectedProTier]

  return (
    <div className="min-h-screen bg-night py-16 relative overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-electric/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-teal/5 rounded-full blur-3xl animate-float delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-orange/5 rounded-full blur-3xl animate-float delay-2000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-grad-surge rounded-xl flex items-center justify-center shadow-glow-teal">
              <Building className="h-8 w-8 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-gradient-quantum">
              Launch Plans
            </span>
          </h1>
          
          <p className="text-xl text-body max-w-4xl mx-auto leading-relaxed">
            Choose the perfect plan to launch your brand. From startup exploration to enterprise-grade 
            branding solutions — we've got your growth covered.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          
          {/* Starter Plan */}
          <div className="card-primary group hover:shadow-glow-blue">
            {/* Current Plan Badge */}
            {userPlanCode === 'STARTER' && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-green-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                  ✓ Current Plan
                </span>
              </div>
            )}
            
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-grad-surge rounded-xl flex items-center justify-center mx-auto mb-6 shadow-glow-blue">
                {plans.starter.icon}
              </div>
              
              <h3 className="text-2xl font-bold text-heading mb-3">{plans.starter.name}</h3>
              
              <div className="flex items-center justify-center mb-4">
                <span className="text-5xl font-bold text-heading">${plans.starter.price}</span>
                <span className="text-body ml-2 text-lg">{plans.starter.period}</span>
              </div>
              
              {plans.starter.trialText && (
                <p className="text-muted text-sm mb-4">{plans.starter.trialText}</p>
              )}
              
              <p className="text-body text-lg">{plans.starter.description}</p>
            </div>
            
            {/* Features */}
            <ul className="space-y-4 mb-10">
              {plans.starter.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Check className="h-5 w-5 text-teal mr-4 flex-shrink-0" />
                  <span className="text-body">{feature.text}</span>
                </li>
              ))}
            </ul>
            
            {/* Coming Soon */}
            {plans.starter.comingSoon && plans.starter.comingSoon.length > 0 && (
              <div className="mb-8">
                <h4 className="text-sm font-bold text-orange mb-3 flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Coming Soon
                </h4>
                <ul className="space-y-2">
                  {plans.starter.comingSoon.map((item, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <div className="w-4 h-4 rounded-full bg-orange/20 border border-orange/40 mr-3 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange"></div>
                      </div>
                      <span className="text-muted">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* CTA Button */}
            <button
              onClick={() => handlePlanSelect(plans.starter.code)}
              disabled={loading === plans.starter.code || userPlanCode === 'STARTER'}
              className={`w-full group py-4 px-6 rounded-xl font-bold text-white transition-all duration-300 ${
                userPlanCode === 'STARTER'
                  ? 'bg-green-600 cursor-default'
                  : 'bg-gradient-to-r from-cyan-500 to-purple-600 hover:scale-105 shadow-lg'
              }`}
            >
              {loading === plans.starter.code ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Starting trial...
                </div>
              ) : userPlanCode === 'STARTER' ? (
                <div className="flex items-center justify-center">
                  <Check className="h-5 w-5 mr-2" />
                  Current Plan
                </div>
              ) : (
                <>
                  {plans.starter.cta}
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
            
            <p className="text-muted text-xs text-center mt-4">
              No credit card required for trial
            </p>
          </div>

          {/* Pro Plan (with slider) */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 group hover:border-cyan-500/50 relative transform lg:scale-105 transition-all duration-500">
            {/* Most Popular or Current Plan Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              {userPlanCode === 'PRO_500' || userPlanCode === 'PRO_50' || userPlanCode === 'PRO_200' ? (
                <span className="bg-green-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                  ✓ Current Plan
                </span>
              ) : (
                <span className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                  🚀 Most Popular
                </span>
              )}
            </div>
            
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-grad-quantum rounded-xl flex items-center justify-center mx-auto mb-6 shadow-glow-orange">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-heading mb-6">Pro (Usage-Based)</h3>
              
              {/* Pro Tier Selector */}
              <div className="mb-6">
                <div className="flex items-center justify-center space-x-4 mb-4">
                  {Object.entries(proPlans).map(([code, plan]) => (
                    <button
                      key={code}
                      onClick={() => setSelectedProTier(code)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        selectedProTier === code
                          ? 'bg-teal text-white shadow-glow-teal'
                          : 'text-muted hover:text-body bg-space'
                      }`}
                    >
                      {plan.name}
                    </button>
                  ))}
                </div>
                
                <div className="flex items-center justify-center mb-4">
                  <span className="text-5xl font-bold text-heading">${selectedPro.price}</span>
                  <span className="text-body ml-2 text-lg">/month</span>
                </div>
              </div>
              
              <p className="text-body text-lg">
                Scale content & video with higher limits, analytics, and approvals.
              </p>
            </div>
            
            {/* Pro Features Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="text-center p-3 bg-space/50 rounded-lg">
                <div className="text-teal font-bold text-lg">{selectedPro.features.brands}</div>
                <div className="text-muted text-sm">brands</div>
              </div>
              <div className="text-center p-3 bg-space/50 rounded-lg">
                <div className="text-teal font-bold text-lg">{selectedPro.features.socials}</div>
                <div className="text-muted text-sm">socials</div>
              </div>
              <div className="text-center p-3 bg-space/50 rounded-lg">
                <div className="text-teal font-bold text-lg">{selectedPro.features.posts}</div>
                <div className="text-muted text-sm">posts/mo</div>
              </div>
              <div className="text-center p-3 bg-space/50 rounded-lg">
                <div className="text-teal font-bold text-lg">{selectedPro.features.credits}</div>
                <div className="text-muted text-sm">AI credits</div>
              </div>
              <div className="text-center p-3 bg-space/50 rounded-lg">
                <div className="text-teal font-bold text-lg">{selectedPro.features.videoMinutes}</div>
                <div className="text-muted text-sm">video min</div>
              </div>
              <div className="text-center p-3 bg-space/50 rounded-lg">
                <div className="text-teal font-bold text-lg">{selectedPro.features.seats}</div>
                <div className="text-muted text-sm">seats</div>
              </div>
            </div>
            
            {/* Pro Features List */}
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <Check className="h-5 w-5 text-teal mr-3" />
                <span className="text-body">Quick Ads & Marketing Plan</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-teal mr-3" />
                <span className="text-body">API/Webhooks Access</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-teal mr-3" />
                <span className="text-body">AI Strategy Tools</span>
              </li>
              {selectedProTier !== 'PRO_50' && (
                <>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-teal mr-3" />
                    <span className="text-body">A/B Tests & Advanced Analytics</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-teal mr-3" />
                    <span className="text-body">Approvals Workflow</span>
                  </li>
                </>
              )}
              {selectedProTier === 'PRO_500' && (
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-teal mr-3" />
                  <span className="text-body">Priority Posting Queue</span>
                </li>
              )}
            </ul>
            
            {/* Coming Soon */}
            <div className="mb-8">
              <h4 className="text-sm font-bold text-orange mb-3 flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Coming Soon
              </h4>
              <div className="text-sm text-muted">
                Website Builder + Hosting ({selectedPro.features.websites} site{selectedPro.features.websites !== '1' ? 's' : ''})
              </div>
            </div>
            
            {/* CTA Button */}
            <button
              onClick={() => handlePlanSelect(selectedProTier)}
              disabled={loading === selectedProTier || (userPlanCode === 'PRO_500' || userPlanCode === 'PRO_50' || userPlanCode === 'PRO_200')}
              className={`w-full group py-4 px-6 rounded-xl font-bold text-white transition-all duration-300 ${
                userPlanCode === 'PRO_500' || userPlanCode === 'PRO_50' || userPlanCode === 'PRO_200'
                  ? 'bg-green-600 cursor-default'
                  : 'bg-gradient-to-r from-cyan-500 to-purple-600 hover:scale-105 shadow-lg'
              }`}
            >
              {loading === selectedProTier ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Redirecting...
                </div>
              ) : (userPlanCode === 'PRO_500' || userPlanCode === 'PRO_50' || userPlanCode === 'PRO_200') ? (
                <div className="flex items-center justify-center">
                  <Check className="h-5 w-5 mr-2" />
                  Current Plan
                </div>
              ) : (
                <>
                  Choose {selectedPro.name}
                  <Zap className="h-5 w-5 ml-2 group-hover:rotate-12 transition-transform" />
                </>
              )}
            </button>
          </div>

          {/* Agency Plan */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 group hover:border-orange-500/50 transition-all duration-500 relative">
            {/* Current Plan Badge for Agency */}
            {userPlanCode === 'AGENCY' && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-green-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                  ✓ Current Plan
                </span>
              </div>
            )}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-grad-heat rounded-xl flex items-center justify-center mx-auto mb-6 shadow-glow-orange">
                <Crown className="h-8 w-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-heading mb-3">Agency Command</h3>
              
              <div className="flex items-center justify-center mb-4">
                <span className="text-3xl font-bold text-heading">Contact Sales</span>
              </div>
              
              <div className="text-muted text-sm mb-4">from $150/month</div>
              
              <p className="text-body text-lg">
                White-label, pooled credits, SSO, priority SLA—tailored to your volume.
              </p>
            </div>
            
            {/* Agency Features */}
            <ul className="space-y-4 mb-10">
              <li className="flex items-center">
                <Check className="h-5 w-5 text-orange mr-4 flex-shrink-0" />
                <span className="text-body">Unlimited brands & pooled credits</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-orange mr-4 flex-shrink-0" />
                <span className="text-body">White-label branding</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-orange mr-4 flex-shrink-0" />
                <span className="text-body">SSO/SAML & audit logs</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-orange mr-4 flex-shrink-0" />
                <span className="text-body">Priority SLA & higher API limits</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-orange mr-4 flex-shrink-0" />
                <span className="text-body">Team approvals & roles</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-orange mr-4 flex-shrink-0" />
                <span className="text-body">Full AI Strategy Tools Suite</span>
              </li>
            </ul>
            
            {/* Coming Soon */}
            <div className="mb-8">
              <h4 className="text-sm font-bold text-orange mb-3 flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Coming Soon
              </h4>
              <div className="text-sm text-muted">
                Personal On-Call Assistant (human+AI concierge)
              </div>
            </div>
            
            {/* CTA Button */}
            {userPlanCode === 'AGENCY' ? (
              <button
                disabled
                className="w-full py-4 px-6 rounded-xl font-bold text-white bg-green-600 cursor-default flex items-center justify-center"
              >
                <Check className="h-5 w-5 mr-2" />
                Current Plan
              </button>
            ) : (
              <Link
                to="/contact-sales"
                className="w-full py-4 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-orange-500 to-red-600 hover:scale-105 shadow-lg transition-all duration-300 group flex items-center justify-center"
              >
                Contact Sales
                <Users className="h-5 w-5 ml-2 group-hover:scale-110 transition-transform" />
              </Link>
            )}
          </div>
        </div>

        {/* Add-ons Section */}
        <div className="max-w-4xl mx-auto mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-heading mb-4">
              Need more? <span className="text-gradient-heat">Add-ons available</span>
            </h2>
            <p className="text-body text-lg">
              Self-serve add-ons for Starter and Pro plans
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-space/30 rounded-lg border border-electric/10">
              <div className="text-electric font-bold">+500 credits</div>
              <div className="text-muted text-sm">$5</div>
            </div>
            <div className="text-center p-4 bg-space/30 rounded-lg border border-electric/10">
              <div className="text-electric font-bold">+60 video min</div>
              <div className="text-muted text-sm">$8</div>
            </div>
            <div className="text-center p-4 bg-space/30 rounded-lg border border-electric/10">
              <div className="text-electric font-bold">+1,000 posts</div>
              <div className="text-muted text-sm">$5</div>
            </div>
            <div className="text-center p-4 bg-space/30 rounded-lg border border-electric/10">
              <div className="text-electric font-bold">Extra brand</div>
              <div className="text-muted text-sm">$5/mo</div>
            </div>
            <div className="text-center p-4 bg-space/30 rounded-lg border border-electric/10">
              <div className="text-electric font-bold">Extra seat</div>
              <div className="text-muted text-sm">$3/mo</div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-heading mb-4">
              Frequently Asked <span className="text-gradient-surge">Questions</span>
            </h2>
            <p className="text-body text-lg">
              Everything you need to know about LaunchZone pricing
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card-accent">
              <h3 className="font-bold text-heading mb-3">Can I switch plans anytime?</h3>
              <p className="text-body">Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately and we'll pro-rate your billing.</p>
            </div>
            
            <div className="card-accent">
              <h3 className="font-bold text-heading mb-3">Do you offer refunds?</h3>
              <p className="text-body">We offer a 30-day money-back guarantee. If you're not satisfied, contact us for a full refund.</p>
            </div>
            
            <div className="card-accent">
              <h3 className="font-bold text-heading mb-3">What counts as an AI credit?</h3>
              <p className="text-body">1 post copy = 1 credit, 1 thumbnail = 5 credits, 1 logo = 10 credits, 1 video minute = 20 credits.</p>
            </div>
            
            <div className="card-accent">
              <h3 className="font-bold text-heading mb-3">Can I add more team members?</h3>
              <p className="text-body">Yes! Pro plans include team seats, and you can add extra seats for $3/month each.</p>
            </div>
          </div>
          
          <div className="text-center mt-16">
            <p className="text-muted mb-6">Still have questions?</p>
            <Link
              to="/contact-sales"
              className="btn-secondary"
            >
              <Shield className="h-5 w-5 mr-2" />
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewPricingPage