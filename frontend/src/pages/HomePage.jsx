import { Link } from 'react-router-dom'
import { ArrowRight, Zap, Target, Download, Heart, Star, CheckCircle } from 'lucide-react'

const HomePage = () => {
  const features = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: 'AI-Powered Generation',
      description: 'Advanced Claude AI creates unique, memorable slogans tailored to your brand personality and industry.'
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: 'Brand Personality Matching',
      description: 'Choose from 5 distinct personalities: Friendly, Professional, Witty, Premium, or Innovative.'
    },
    {
      icon: <Download className="h-6 w-6" />,
      title: 'Multiple Export Formats',
      description: 'Export your slogans in PDF, CSV, or TXT formats for easy sharing and collaboration.'
    },
    {
      icon: <Heart className="h-6 w-6" />,
      title: 'Favorites Management',
      description: 'Save, organize, and manage your best slogans with our intuitive favorites system.'
    }
  ]

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Marketing Director',
      company: 'TechStart Inc.',
      content: 'Marketing Sloganizer helped us create the perfect tagline for our product launch. The AI suggestions were spot-on!',
      rating: 5
    },
    {
      name: 'Mike Chen',
      role: 'Founder',
      company: 'Local Coffee Co.',
      content: 'As a small business owner, I needed catchy slogans fast. This tool delivered exactly what I was looking for.',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      role: 'Brand Manager',
      company: 'Fashion Forward',
      content: 'The variety of personality options made it easy to find slogans that matched our brand voice perfectly.',
      rating: 5
    }
  ]

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Retail', 'Food & Beverage',
    'Automotive', 'Real Estate', 'Education', 'Entertainment', 'Fitness',
    'Beauty', 'Consulting', 'Manufacturing', 'Travel', 'Legal'
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-50 via-primary-50 to-purple-50 pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Create Memorable
              <span className="gradient-text block">Marketing Slogans</span>
              with AI
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Generate creative, brand-aligned slogans in seconds. Perfect for startups, 
              marketing agencies, and established businesses looking to refresh their messaging.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                to="/generate"
                className="btn btn-brand btn-lg group"
              >
                Start Generating Free
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/pricing"
                className="btn btn-outline btn-lg"
              >
                View Pricing
              </Link>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                1 free slogan without signup
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                No credit card required
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                15+ industry templates
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to create perfect slogans
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI-powered platform combines advanced technology with marketing expertise 
              to deliver slogans that truly represent your brand.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="card card-hover text-center group"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-brand-500 to-primary-600 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Built for every industry
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our AI understands the nuances of different industries and creates 
              slogans that resonate with your target audience.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {industries.map((industry, index) => (
              <div 
                key={index}
                className="bg-white rounded-lg p-4 text-center hover:shadow-md transition-shadow duration-200 border border-gray-100"
              >
                <span className="text-sm font-medium text-gray-700">
                  {industry}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Loved by marketing professionals
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of marketers, entrepreneurs, and agencies who trust 
              Marketing Sloganizer for their creative campaigns.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card">
                <div className="flex items-center mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <p className="font-semibold text-gray-900">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-brand-600 to-primary-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to create your perfect slogan?
          </h2>
          <p className="text-xl text-brand-100 mb-8">
            Start generating professional marketing slogans in seconds. 
            No technical skills required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/generate"
              className="btn bg-white text-brand-600 hover:bg-gray-100 btn-lg font-semibold"
            >
              Generate Your First Slogan
            </Link>
            <Link
              to="/signup"
              className="btn border-2 border-white text-white hover:bg-white hover:text-brand-600 btn-lg font-semibold"
            >
              Create Free Account
            </Link>
          </div>
          <p className="text-brand-200 text-sm mt-4">
            Start with 1 free generation • No credit card required
          </p>
        </div>
      </section>
    </div>
  )
}

export default HomePage