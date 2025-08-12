import { useState } from 'react'
import { 
  Building, 
  Users, 
  Globe, 
  Zap, 
  Shield, 
  ArrowRight,
  CheckCircle,
  Star,
  Crown,
  TrendingUp
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'

const ContactSalesPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    companyDomain: '',
    brandsCount: '',
    seats: '',
    monthlyPosts: '',
    videoMinutes: '',
    mustHaves: [],
    integrations: [],
    goals: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const mustHaveOptions = [
    'SSO/SAML Authentication',
    'White-label branding',
    'Audit logs',
    'Priority SLA',
    'Custom integrations',
    'Dedicated support'
  ]

  const integrationOptions = [
    'Meta/Facebook Ads',
    'Google Ads',
    'Slack',
    'Microsoft Teams',
    'Zapier',
    'n8n',
    'HubSpot',
    'Salesforce'
  ]

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCheckboxChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.company) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await api.post('/sales/contact', formData)
      
      if (response.data.success) {
        toast.success('Thank you! Our team will contact you within 24 hours.')
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          company: '',
          companyDomain: '',
          brandsCount: '',
          seats: '',
          monthlyPosts: '',
          videoMinutes: '',
          mustHaves: [],
          integrations: [],
          goals: ''
        })
      }
    } catch (error) {
      console.error('Contact sales error:', error)
      toast.error('Failed to submit form. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const agencyFeatures = [
    {
      icon: <Building className="h-6 w-6" />,
      title: 'Unlimited Brands',
      description: 'Manage unlimited brand profiles with pooled credits across all accounts'
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Team Collaboration',
      description: 'Advanced roles, approvals workflow, and team management tools'
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Enterprise Security',
      description: 'SSO/SAML, audit logs, and enterprise-grade security features'
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: 'Higher API Limits',
      description: 'Increased API rate limits and priority processing for your requests'
    },
    {
      icon: <Star className="h-6 w-6" />,
      title: 'White-label',
      description: 'Complete white-label solution with your branding and domain'
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: 'Priority SLA',
      description: '99.9% uptime SLA with dedicated support and priority processing'
    }
  ]

  return (
    <div className="min-h-screen bg-night py-16 relative overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-electric/5 rounded-full blur-3xl animate-float delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-teal/5 rounded-full blur-3xl animate-float delay-2000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-grad-heat rounded-xl flex items-center justify-center shadow-glow-orange">
              <Crown className="h-10 w-10 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-gradient-heat">
              Agency Command
            </span>
          </h1>
          
          <p className="text-xl text-body max-w-3xl mx-auto leading-relaxed mb-8">
            Enterprise-grade brand management platform designed for agencies, 
            enterprises, and high-volume teams.
          </p>
          
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-muted">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-teal mr-2" />
              <span>From $150/month</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-teal mr-2" />
              <span>Custom pricing available</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-teal mr-2" />
              <span>White-label ready</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">
          {/* Contact Form */}
          <div className="card-primary">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-heading mb-4">Get Agency Pricing</h2>
              <p className="text-body">
                Tell us about your needs and we'll create a custom solution for your team.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-heading mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="input-primary"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-heading mb-2">
                    Work Email *
                  </label>
                  <input
                    type="email"
                    required
                    className="input-primary"
                    placeholder="john@company.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-heading mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="input-primary"
                    placeholder="Acme Agency"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-heading mb-2">
                    Company Domain
                  </label>
                  <input
                    type="text"
                    className="input-primary"
                    placeholder="acme-agency.com"
                    value={formData.companyDomain}
                    onChange={(e) => handleInputChange('companyDomain', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-heading mb-2">
                    Number of Brands
                  </label>
                  <select
                    className="input-primary"
                    value={formData.brandsCount}
                    onChange={(e) => handleInputChange('brandsCount', e.target.value)}
                  >
                    <option value="">Select range</option>
                    <option value="5-10">5-10 brands</option>
                    <option value="10-25">10-25 brands</option>
                    <option value="25-50">25-50 brands</option>
                    <option value="50-100">50-100 brands</option>
                    <option value="100+">100+ brands</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-heading mb-2">
                    Team Size (Seats)
                  </label>
                  <select
                    className="input-primary"
                    value={formData.seats}
                    onChange={(e) => handleInputChange('seats', e.target.value)}
                  >
                    <option value="">Select range</option>
                    <option value="5-10">5-10 seats</option>
                    <option value="10-25">10-25 seats</option>
                    <option value="25-50">25-50 seats</option>
                    <option value="50-100">50-100 seats</option>
                    <option value="100+">100+ seats</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-heading mb-2">
                    Monthly Posts Volume
                  </label>
                  <select
                    className="input-primary"
                    value={formData.monthlyPosts}
                    onChange={(e) => handleInputChange('monthlyPosts', e.target.value)}
                  >
                    <option value="">Select range</option>
                    <option value="1k-5k">1k-5k posts</option>
                    <option value="5k-10k">5k-10k posts</option>
                    <option value="10k-25k">10k-25k posts</option>
                    <option value="25k-50k">25k-50k posts</option>
                    <option value="50k+">50k+ posts</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-heading mb-2">
                    Video Minutes/Month
                  </label>
                  <select
                    className="input-primary"
                    value={formData.videoMinutes}
                    onChange={(e) => handleInputChange('videoMinutes', e.target.value)}
                  >
                    <option value="">Select range</option>
                    <option value="100-500">100-500 minutes</option>
                    <option value="500-1000">500-1,000 minutes</option>
                    <option value="1000-2500">1,000-2,500 minutes</option>
                    <option value="2500+">2,500+ minutes</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-heading mb-3">
                  Must-have features
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {mustHaveOptions.map((option) => (
                    <label key={option} className="flex items-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-electric bg-space border-muted rounded focus:ring-electric focus:ring-2"
                        checked={formData.mustHaves.includes(option)}
                        onChange={() => handleCheckboxChange('mustHaves', option)}
                      />
                      <span className="ml-3 text-body text-sm">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-heading mb-3">
                  Required integrations
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {integrationOptions.map((option) => (
                    <label key={option} className="flex items-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-electric bg-space border-muted rounded focus:ring-electric focus:ring-2"
                        checked={formData.integrations.includes(option)}
                        onChange={() => handleCheckboxChange('integrations', option)}
                      />
                      <span className="ml-3 text-body text-sm">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-heading mb-2">
                  Goals & Additional Requirements
                </label>
                <textarea
                  className="input-primary min-h-[120px] resize-y"
                  placeholder="Tell us about your specific goals, timeline, and any other requirements..."
                  value={formData.goals}
                  onChange={(e) => handleInputChange('goals', e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-accent w-full group"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Sending Request...
                  </div>
                ) : (
                  <>
                    Get Custom Pricing
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 p-4 bg-teal/5 border border-teal/20 rounded-lg">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-teal mr-3 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-heading font-medium mb-1">Response within 24 hours</p>
                  <p className="text-body">Our team will review your requirements and prepare a custom proposal.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Features List */}
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-heading mb-4">Enterprise Features</h2>
              <p className="text-body">
                Everything in Pro-500, plus enterprise-grade features for large teams and agencies.
              </p>
            </div>

            <div className="space-y-6">
              {agencyFeatures.map((feature, index) => (
                <div key={index} className="flex items-start group">
                  <div className="w-12 h-12 bg-grad-quantum rounded-lg flex items-center justify-center mr-4 flex-shrink-0 shadow-glow-orange group-hover:shadow-glow-orange-lg transition-all duration-300">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-heading mb-2">{feature.title}</h3>
                    <p className="text-body">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 p-6 bg-grad-quantum rounded-xl">
              <div className="text-center text-white">
                <h3 className="text-xl font-bold mb-2">Coming Soon</h3>
                <div className="flex items-center justify-center mb-3">
                  <Users className="h-6 w-6 mr-2" />
                  <span className="font-medium">Personal On-Call Assistant</span>
                </div>
                <p className="text-sm opacity-90">
                  Human + AI concierge service for hands-off brand management
                </p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <div className="inline-flex items-center px-4 py-2 bg-space/50 rounded-full text-sm text-muted border border-electric/20">
                <TrendingUp className="h-4 w-4 mr-2" />
                Trusted by 500+ agencies worldwide
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactSalesPage