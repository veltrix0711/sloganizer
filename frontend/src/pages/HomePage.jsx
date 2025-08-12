import { Link } from 'react-router-dom'
import { 
  ArrowRight, 
  Rocket, 
  Sparkles, 
  Palette, 
  Type, 
  Share2, 
  Download,
  Star, 
  CheckCircle, 
  Zap,
  Globe,
  Building,
  TrendingUp,
  Shield
} from 'lucide-react'

const HomePage = () => {
  const features = [
    {
      icon: <Building className="h-6 w-6" />,
      title: 'Brand Identity Creation',
      description: 'Build comprehensive brand profiles with personality, colors, fonts, and voice guidelines.'
    },
    {
      icon: <Type className="h-6 w-6" />,
      title: 'Business Name Generator',
      description: 'AI-powered name generation with real-time domain availability checking.'
    },
    {
      icon: <Palette className="h-6 w-6" />,
      title: 'Logo & Visual Assets',
      description: 'Create stunning logos and brand assets that perfectly represent your vision.'
    },
    {
      icon: <Share2 className="h-6 w-6" />,
      title: 'Social Media Content',
      description: 'Generate platform-specific posts, captions, and content that engages your audience.'
    },
    {
      icon: <Download className="h-6 w-6" />,
      title: 'Complete Brand Kits',
      description: 'Export professional brand guidelines, assets, and documentation in multiple formats.'
    },
    {
      icon: <Rocket className="h-6 w-6" />,
      title: 'Launch Ready',
      description: 'Everything you need to launch your brand professionally - from concept to market.'
    }
  ]

  const testimonials = [
    {
      name: 'Alex Thompson',
      role: 'Startup Founder',
      company: 'NexaTech',
      content: 'LaunchZone took our startup from idea to market-ready brand in just 2 weeks. The complete brand kit saved us months of work.',
      rating: 5
    },
    {
      name: 'Maria Gonzalez',
      role: 'Creative Director',
      company: 'Bloom Agency',
      content: 'Our clients love the professional brand identities we create with LaunchZone. The AI suggestions are incredibly sophisticated.',
      rating: 5
    },
    {
      name: 'David Park',
      role: 'Product Manager',
      company: 'InnovateHub',
      content: 'From naming to logo design to social content - LaunchZone handles our entire brand development pipeline seamlessly.',
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
      <section className="relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-16 pb-32 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Logo/Brand Mark */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-xl flex items-center justify-center shadow-2xl shadow-cyan-500/25">
                  <Rocket className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-xl blur opacity-75 animate-pulse"></div>
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-8">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent leading-tight block">
                LAUNCHZONE
              </span>
              <span className="text-2xl md:text-3xl text-white font-light block mt-4">
                Build your brand. Launch from here.
              </span>
            </h1>

            <p className="text-xl text-slate-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              The complete AI-powered brand creation platform. From business names and logos to 
              social content and brand guidelines - everything you need to launch professionally.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Link
                to="/brand-suite"
                className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg font-semibold text-white shadow-2xl shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 hover:scale-105"
              >
                <span className="relative z-10 flex items-center justify-center">
                  Start Building Your Brand
                  <Rocket className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-purple-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              
              <Link
                to="/pricing"
                className="px-8 py-4 bg-slate-800/50 border border-slate-600 rounded-lg font-semibold text-white hover:bg-slate-700/50 hover:border-slate-500 transition-all duration-300 backdrop-blur-sm"
              >
                View Pricing
              </Link>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-slate-400">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-cyan-400 mr-2" />
                Complete Brand Suite
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-cyan-400 mr-2" />
                No credit card required
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-cyan-400 mr-2" />
                Launch in minutes
              </div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900 to-transparent"></div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-slate-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                Complete Brand Creation Suite
              </span>
            </h2>
            <p className="text-xl text-slate-300 max-w-4xl mx-auto leading-relaxed">
              From initial concept to market launch - our AI-powered platform handles every aspect 
              of professional brand development with cutting-edge technology.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group relative p-8 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl hover:border-cyan-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/10"
              >
                {/* Glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-cyan-500/25">
                    <div className="text-white">
                      {feature.icon}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  
                  <p className="text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Corner accent */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-cyan-500/10 to-transparent rounded-br-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            ))}
          </div>

          {/* Call to action in features */}
          <div className="text-center mt-16">
            <Link
              to="/brand-suite"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg font-semibold text-white shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-300 hover:scale-105 group"
            >
              <Sparkles className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
              Launch Your Brand Today
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section className="py-20 bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Built for <span className="bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">Every Industry</span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Our AI understands industry nuances and creates brands that resonate 
              perfectly with your target market and business goals.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {industries.map((industry, index) => (
              <div 
                key={index}
                className="group bg-slate-700/50 backdrop-blur-sm border border-slate-600 rounded-lg p-4 text-center hover:border-green-500/50 hover:bg-slate-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10"
              >
                <span className="text-sm font-medium text-slate-300 group-hover:text-green-400 transition-colors duration-300">
                  {industry}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Trusted by <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Innovators</span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Join thousands of entrepreneurs, marketers, and agencies launching 
              successful brands with LaunchZone's AI-powered platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="group relative p-8 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative">
                  <div className="flex items-center mb-6">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  
                  <p className="text-slate-300 mb-6 italic text-lg leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center mr-4">
                      <span className="text-white font-semibold text-sm">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-white group-hover:text-purple-400 transition-colors duration-300">
                        {testimonial.name}
                      </p>
                      <p className="text-sm text-slate-400">
                        {testimonial.role}, {testimonial.company}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-orange-500/30 to-red-500/30 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="relative max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Rocket className="h-16 w-16 text-orange-400 mx-auto mb-6 animate-bounce" />
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">
            Ready to <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">Launch</span>?
          </h2>
          
          <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Join the revolution of AI-powered brand creation. Build your complete brand identity 
            and launch professionally in minutes, not months.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
            <Link
              to="/brand-suite"
              className="group relative px-10 py-5 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl font-bold text-white text-lg shadow-2xl shadow-orange-500/30 hover:shadow-orange-500/50 transition-all duration-300 hover:scale-105"
            >
              <span className="relative z-10 flex items-center justify-center">
                <Zap className="h-6 w-6 mr-3 group-hover:rotate-12 transition-transform duration-300" />
                Launch Your Brand Now
                <TrendingUp className="h-6 w-6 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            
            <Link
              to="/signup"
              className="px-10 py-5 bg-slate-800/80 backdrop-blur-sm border-2 border-slate-600 rounded-xl font-bold text-white text-lg hover:bg-slate-700/80 hover:border-orange-400 hover:text-orange-400 transition-all duration-300"
            >
              Create Free Account
            </Link>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-8 text-slate-400">
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-green-400 mr-2" />
              No credit card required
            </div>
            <div className="flex items-center">
              <Globe className="h-5 w-5 text-blue-400 mr-2" />
              Complete brand suite included
            </div>
            <div className="flex items-center">
              <Sparkles className="h-5 w-5 text-purple-400 mr-2" />
              AI-powered creation
            </div>
          </div>
        </div>

        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900 to-transparent"></div>
      </section>
    </div>
  )
}

export default HomePage