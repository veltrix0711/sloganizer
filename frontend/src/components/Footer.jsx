import { Link } from 'react-router-dom'
import { Zap, Twitter, Github, Mail } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-brand-500 to-primary-600 rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                Launchzone
              </span>
            </Link>
            <p className="text-gray-600 mb-4 max-w-md">
              Generate creative marketing slogans with AI. Perfect for businesses 
              looking to create memorable brand messages that resonate with their audience.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://github.com/veltrix0711/sloganizer"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="mailto:support@sloganizer.app"
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Product
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/generate" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
                  Generate Slogans
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/favorites" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
                  Favorites
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Support
            </h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="mailto:help@sloganizer.app" 
                  className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a 
                  href="mailto:contact@sloganizer.app" 
                  className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a 
                  href="/privacy" 
                  className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a 
                  href="/terms" 
                  className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            © {currentYear} Launchzone. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <span className="text-xs text-gray-400">
              Made with ❤️ for entrepreneurs
            </span>
            <span className="text-xs text-gray-400">
              Powered by Claude AI
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer