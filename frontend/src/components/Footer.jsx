import { Link } from 'react-router-dom'
import { Rocket, Twitter, Github, Mail, Building, Sparkles, Globe } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-slate-900 border-t border-slate-700 relative">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center space-x-3 mb-6 group">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/25 group-hover:shadow-cyan-500/40 transition-all duration-300">
                <Rocket className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                LaunchZone
              </span>
            </Link>
            <p className="text-slate-300 mb-6 max-w-md text-lg leading-relaxed">
              The complete AI-powered brand creation platform. From business names and logos to 
              social content and brand guidelines - launch your brand professionally.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-cyan-400 transition-colors duration-200"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://github.com/veltrix0711/sloganizer"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-cyan-400 transition-colors duration-200"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="mailto:support@sloganizer.app"
                className="text-slate-400 hover:text-cyan-400 transition-colors duration-200"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-bold text-white tracking-wider uppercase mb-6">
              <Building className="h-4 w-4 inline mr-2 text-cyan-400" />
              Platform
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/generate" className="text-slate-400 hover:text-cyan-400 transition-colors duration-200 block py-1">
                  Slogan Generator
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-slate-400 hover:text-cyan-400 transition-colors duration-200 block py-1">
                  Launch Plans
                </Link>
              </li>
              <li>
                <Link to="/brand-suite" className="text-slate-400 hover:text-cyan-400 transition-colors duration-200 block py-1">
                  Brand Suite
                </Link>
              </li>
              <li>
                <Link to="/favorites" className="text-slate-400 hover:text-cyan-400 transition-colors duration-200 block py-1">
                  My Favorites
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-bold text-white tracking-wider uppercase mb-6">
              <Sparkles className="h-4 w-4 inline mr-2 text-purple-400" />
              Support
            </h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="mailto:help@launchzone.app" 
                  className="text-slate-400 hover:text-purple-400 transition-colors duration-200 block py-1"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a 
                  href="mailto:contact@launchzone.app" 
                  className="text-slate-400 hover:text-purple-400 transition-colors duration-200 block py-1"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a 
                  href="/privacy" 
                  className="text-slate-400 hover:text-purple-400 transition-colors duration-200 block py-1"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a 
                  href="/terms" 
                  className="text-slate-400 hover:text-purple-400 transition-colors duration-200 block py-1"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-16 pt-8 border-t border-slate-700 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-400 text-sm flex items-center">
            <Globe className="h-4 w-4 mr-2 text-cyan-400" />
            © {currentYear} LaunchZone. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
            <span className="text-xs text-slate-400 flex items-center">
              <span className="text-red-400 mr-1">❤️</span>
              Made for brand creators worldwide
            </span>
            <span className="text-xs bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent font-medium">
              Powered by AI Innovation
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer