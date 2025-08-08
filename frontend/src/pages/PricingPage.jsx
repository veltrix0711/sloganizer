import { Check, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'

const PricingPage = () => {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: '/month',
      description: 'Perfect for trying out our service',
      features: [
        '5 slogan generations per month',
        'Basic personality options',
        'Text export only',
        'Community support'
      ],
      cta: 'Get Started',
      popular: false
    },
    {
      name: 'Pro',
      price: '$19.99',
      period: '/month',
      description: 'Best for small businesses and startups',
      features: [
        '100 slogan generations per month',
        'All personality options',
        'PDF, CSV, TXT export',
        'Favorites management',
        'Email support'
      ],
      cta: 'Start Pro Trial',
      popular: true
    },
    {
      name: 'Agency',
      price: '$49.99',
      period: '/month',
      description: 'For marketing agencies and large teams',
      features: [
        '1000 slogan generations per month',
        'Advanced AI models',
        'All export formats',
        'Priority support',
        'API access',
        'Team collaboration'
      ],
      cta: 'Contact Sales',
      popular: false
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start free and upgrade as your business grows. All plans include our core slogan generation features.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`card relative ${
                plan.popular ? 'border-2 border-primary-500 shadow-lg scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="flex items-center justify-center mb-2">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500 ml-1">{plan.period}</span>
                </div>
                <p className="text-gray-600">{plan.description}</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button
                className={`btn w-full ${
                  plan.popular ? 'btn-brand' : 'btn-outline'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-2">
                Can I change plans anytime?
              </h3>
              <p className="text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
              </p>
            </div>
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-2">
                What happens to my saved slogans if I downgrade?
              </h3>
              <p className="text-gray-600">
                All your saved slogans remain accessible regardless of your plan. You'll only be limited in generating new slogans based on your plan limits.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PricingPage