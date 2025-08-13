import { Check, Rocket, Sparkles, Crown, Building } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../services/authContext'
import api from '../services/api'
import toast from 'react-hot-toast'

const PricingPage = () => {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(null)

  // Handle Stripe redirect
  const redirectToStripe = async (sessionId) => {
    try {
      const stripe = window.Stripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
      const { error } = await stripe.redirectToCheckout({
        sessionId: sessionId
      })
      
      if (error) {
        console.error('Stripe redirect error:', error)
        toast.error('Failed to redirect to checkout')
      }
    } catch (error) {
      console.error('Stripe setup error:', error)
      toast.error('Payment system error')
    }
  }

  // Check if user is subscribed to a plan
  const isSubscribedToPlan = (planName) => {
    if (!profile || !profile.subscription_tier) return false
    const currentPlan = profile.subscription_tier.toLowerCase()
    const checkPlan = planName.toLowerCase()
    
    // Map plan names to subscription tiers
    const planMapping = {
      'starter': 'free',
      'professional': 'pro', 
      'enterprise': 'agency'
    }
    
    return currentPlan === (planMapping[checkPlan] || checkPlan)
  }

  // Handle subscription plan selection
  const handlePlanSelect = async (planName) => {
    if (planName === 'Starter') {
      if (user) {
        navigate('/dashboard')
      } else {
        navigate('/signup')
      }
      return
    }

    // If user is already subscribed to this plan, do nothing
    if (isSubscribedToPlan(planName)) {
      return
    }

    if (!user) {
      navigate('/signup')
      return
    }

    try {
      setLoading(planName)
      
      console.log('Starting checkout process for plan:', planName)
      console.log('User:', user)

      // Get the price ID for the plan from backend
      const plansResponse = await api.getSubscriptionPlans()
      console.log('Available plans from backend:', plansResponse.plans)
      
      // Match by plan ID instead of name (Professional -> pro, Enterprise -> agency)
      const planMapping = {
        'professional': 'pro',
        'enterprise': 'agency'
      }
      const planId = planMapping[planName.toLowerCase()] || planName.toLowerCase()
      const selectedPlan = plansResponse.plans.find(plan => 
        plan.id === planId
      )
      
      if (!selectedPlan) {
        throw new Error(`Plan "${planName}" not found`)
      }

      const priceId = selectedPlan.pricing.monthly.priceId
      console.log('Using price ID from backend:', priceId)

      // Create checkout session via backend
      const sessionResponse = await api.createCheckoutSession(priceId, planName)
      console.log('Backend session response:', sessionResponse)

      // Load Stripe.js if not already loaded
      if (!window.Stripe) {
        console.log('Loading Stripe.js...')
        const script = document.createElement('script')
        script.src = 'https://js.stripe.com/v3/'
        await new Promise((resolve, reject) => {
          script.onload = () => {
            console.log('Stripe.js loaded successfully')
            resolve()
          }
          script.onerror = (error) => {
            console.error('Failed to load Stripe.js:', error)
            reject(error)
          }
          document.head.appendChild(script)
        })
      }

      // Create Stripe instance and redirect to checkout
      const stripe = window.Stripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
      
      if (!stripe) {
        throw new Error('Failed to initialize Stripe')
      }
      
      console.log('Redirecting to Stripe checkout with session:', sessionResponse.sessionId)
      
      const { error } = await stripe.redirectToCheckout({
        sessionId: sessionResponse.sessionId
      })
      
      if (error) {
        console.error('Stripe checkout error:', error)
        toast.error('Payment system error: ' + error.message)
      }
      
    } catch (error) {
      console.error('Checkout error details:', error)
      toast.error('Checkout failed: ' + (error.message || 'Unknown error'))
    } finally {
      setLoading(null)
    }
  }

  const plans = [
    {
      name: 'Starter',
      price: '$0',
      period: '/month',
      description: 'Perfect for exploring your brand potential',
      icon: <Rocket className="h-6 w-6" />,
      features: [
        '3 brand profiles',
        '10 name generations per month',
        'Basic logo templates',
        '5 social posts per month',
        'Standard brand kit exports',
        'Community support'
      ],
      cta: 'Launch Free',
      popular: false,
      gradient: 'from-slate-600 to-slate-700'
    },
    {
      name: 'Professional',
      price: '$29.99',
      period: '/month',
      description: 'Complete brand creation for growing businesses',
      icon: <Sparkles className="h-6 w-6" />,
      features: [
        'Unlimited brand profiles',
        '100 name generations per month',
        'AI-powered logo generation',
        '50 social posts per month',
        'Premium brand kit exports',
        'Domain checking included',
        'Priority email support'
      ],
      cta: 'Launch Pro',
      popular: true,
      gradient: 'from-cyan-500 to-purple-600'
    },
    {
      name: 'Enterprise',
      price: '$79.99',
      period: '/month',
      description: 'Advanced branding for agencies and large teams',
      icon: <Crown className="h-6 w-6" />,
      features: [
        'Everything in Professional',
        'Unlimited generations',
        'Advanced AI models',
        'White-label brand kits',
        'Team collaboration tools',
        'API access',
        'Custom integrations',
        'Dedicated account manager'
      ],
      cta: 'Launch Enterprise',
      popular: false,
      gradient: 'from-orange-500 to-red-600'
    }
  ]

  return (
    <div className="min-h-screen bg-slate-900 py-16">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-xl flex items-center justify-center shadow-2xl shadow-cyan-500/25">
              <Building className="h-8 w-8 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              Launch Plans
            </span>
          </h1>
          
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Choose the perfect plan to launch your brand. From startup exploration to enterprise-grade 
            branding solutions - we've got your growth covered.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`group relative bg-slate-800/50 backdrop-blur-sm border rounded-2xl p-8 transition-all duration-500 hover:scale-105 ${
                plan.popular 
                  ? 'border-cyan-500/50 shadow-2xl shadow-cyan-500/20 scale-105' 
                  : 'border-slate-700 hover:border-slate-600'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg shadow-cyan-500/25">
                    🚀 Most Popular
                  </span>
                </div>
              )}
              
              {/* Glow effect */}
              <div className={`absolute inset-0 bg-gradient-to-r ${plan.gradient} rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
              
              <div className="relative">
                {/* Icon and title */}
                <div className="text-center mb-8">
                  <div className={`w-16 h-16 bg-gradient-to-r ${plan.gradient} rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-${plan.popular ? 'cyan' : 'slate'}-500/25`}>
                    <div className="text-white">
                      {plan.icon}
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-3">{plan.name}</h3>
                  
                  <div className="flex items-center justify-center mb-4">
                    <span className="text-5xl font-bold text-white">{plan.price}</span>
                    <span className="text-slate-400 ml-2 text-lg">{plan.period}</span>
                  </div>
                  
                  <p className="text-slate-300 text-lg">{plan.description}</p>
                </div>
                
                {/* Features */}
                <ul className="space-y-4 mb-10">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="h-5 w-5 text-green-400 mr-4 flex-shrink-0" />
                      <span className="text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {/* CTA Button */}
                <button
                  onClick={() => handlePlanSelect(plan.name)}
                  disabled={loading === plan.name || isSubscribedToPlan(plan.name)}
                  className={`w-full py-4 px-6 rounded-xl font-bold text-white transition-all duration-300 ${
                    isSubscribedToPlan(plan.name)
                      ? 'bg-green-600 shadow-lg shadow-green-500/25'
                      : plan.popular
                      ? `bg-gradient-to-r ${plan.gradient} shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105`
                      : `bg-gradient-to-r ${plan.gradient} shadow-lg hover:shadow-xl hover:scale-105`
                  } ${loading === plan.name ? 'opacity-50 cursor-not-allowed' : ''} ${
                    isSubscribedToPlan(plan.name) ? 'cursor-default' : ''
                  }`}
                >
                  {loading === plan.name ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Launching...
                    </div>
                  ) : isSubscribedToPlan(plan.name) ? (
                    <div className="flex items-center justify-center">
                      <Check className="h-5 w-5 mr-2" />
                      Current Plan
                    </div>
                  ) : (
                    plan.cta
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Frequently Asked <span className="bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">Questions</span>
            </h2>
            <p className="text-slate-300 text-lg">
              Everything you need to know about launching your brand with LaunchZone
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <h3 className="font-bold text-white mb-3">Can I switch plans anytime?</h3>
              <p className="text-slate-300">Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately and we'll pro-rate your billing.</p>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <h3 className="font-bold text-white mb-3">Do you offer refunds?</h3>
              <p className="text-slate-300">We offer a 30-day money-back guarantee. If you're not satisfied, contact us for a full refund.</p>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <h3 className="font-bold text-white mb-3">What's included in brand kits?</h3>
              <p className="text-slate-300">Complete brand guidelines, logo files, color palettes, typography recommendations, and social media templates.</p>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <h3 className="font-bold text-white mb-3">Can I export my brand assets?</h3>
              <p className="text-slate-300">Absolutely! Download your logos, brand guides, and assets in multiple formats including PNG, SVG, and PDF.</p>
            </div>
          </div>
          
          <div className="text-center mt-16">
            <p className="text-slate-400 mb-6">Still have questions?</p>
            <Link
              to="/contact"
              className="inline-flex items-center px-6 py-3 bg-slate-800/50 border border-slate-600 rounded-lg font-medium text-slate-300 hover:text-cyan-400 hover:border-cyan-500/50 transition-all duration-300"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PricingPage