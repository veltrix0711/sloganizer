import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, Rocket, User, LogOut, Heart, Settings, Building } from 'lucide-react'
import { useAuth } from '../services/authContext'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const { user, signOut, profile } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    setIsUserMenuOpen(false)
    navigate('/')
  }

  const isActivePath = (path) => {
    return location.pathname === path
  }

  const navigationItems = [
    { name: 'Home', href: '/', public: true },
    { name: 'Generate', href: '/generate', public: true },
    { name: 'Pricing', href: '/pricing', public: true },
    { name: 'Dashboard', href: '/dashboard', private: true },
    { name: 'Brand Suite', href: '/brand-suite', private: true },
    { name: 'Social Media', href: '/social-media', private: true },
    { name: 'Favorites', href: '/favorites', private: true }
  ]

  const filteredNavItems = navigationItems.filter(item => 
    item.public || (item.private && user)
  )

  return (
    <nav className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50 shadow-2xl shadow-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/25 group-hover:shadow-cyan-500/40 transition-all duration-300">
                <Rocket className="h-5 w-5 text-white" />
              </div>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              LaunchZone
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {filteredNavItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium transition-all duration-300 relative group ${
                  isActivePath(item.href)
                    ? 'text-cyan-400'
                    : 'text-slate-300 hover:text-cyan-400'
                }`}
              >
                {item.name}
                {isActivePath(item.href) && (
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"></div>
                )}
                {!isActivePath(item.href) && (
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                )}
              </Link>
            ))}
          </div>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-sm bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600 hover:border-cyan-500/50 rounded-full px-4 py-2 transition-all duration-300"
                >
                  <User className="h-4 w-4 text-slate-300" />
                  <span className="text-slate-300 font-medium">
                    {user.email?.split('@')[0]}
                  </span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-slate-800/95 backdrop-blur-sm rounded-xl shadow-2xl shadow-black/20 border border-slate-700 py-2">
                    <div className="px-4 py-3 border-b border-slate-600">
                      <p className="text-sm font-medium text-white">
                        {user.email}
                      </p>
                      <p className="text-xs text-slate-400 capitalize">
                        {(profile?.subscription_tier === 'pro' || profile?.subscription_tier === 'pro_500' || profile?.subscription_tier === 'pro-500') ? 'Professional' : 
                         (profile?.subscription_tier === 'agency' || profile?.subscription_tier === 'premium') ? 'Enterprise' : 
                         'Starter'} plan
                      </p>
                    </div>
                    
                    <Link
                      to="/dashboard"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-slate-300 hover:text-cyan-400 hover:bg-slate-700/50 transition-all duration-200"
                    >
                      <Settings className="h-4 w-4 mr-3" />
                      Dashboard
                    </Link>
                    
                    <Link
                      to="/brand-suite"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-slate-300 hover:text-cyan-400 hover:bg-slate-700/50 transition-all duration-200"
                    >
                      <Building className="h-4 w-4 mr-3" />
                      Brand Suite
                    </Link>
                    
                    <Link
                      to="/favorites"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-slate-300 hover:text-cyan-400 hover:bg-slate-700/50 transition-all duration-200"
                    >
                      <Heart className="h-4 w-4 mr-3" />
                      Favorites
                    </Link>
                    
                    <Link
                      to="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-slate-300 hover:text-cyan-400 hover:bg-slate-700/50 transition-all duration-200"
                    >
                      <User className="h-4 w-4 mr-3" />
                      Profile
                    </Link>
                    
                    <div className="my-2 border-t border-slate-600"></div>
                    
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors duration-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg font-semibold text-white text-sm shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 hover:scale-105"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-cyan-400 hover:bg-slate-800/50 transition-all duration-200"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-slate-700 py-4">
            <div className="flex flex-col space-y-4">
              {filteredNavItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-base font-medium transition-colors duration-200 ${
                    isActivePath(item.href)
                      ? 'text-cyan-400'
                      : 'text-slate-300 hover:text-cyan-400'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              
              {user ? (
                <div className="pt-4 border-t border-slate-700">
                  <div className="mb-4">
                    <p className="text-sm font-medium text-white">
                      {user.email}
                    </p>
                    <p className="text-xs text-slate-400 capitalize">
                      {(profile?.subscription_tier === 'pro' || profile?.subscription_tier === 'pro_500' || profile?.subscription_tier === 'pro-500') ? 'Professional' : 
                       (profile?.subscription_tier === 'agency' || profile?.subscription_tier === 'premium') ? 'Enterprise' : 
                       'Starter'} plan
                    </p>
                  </div>
                  
                  <div className="flex flex-col space-y-3">
                    <Link
                      to="/brand-suite"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center text-sm text-slate-300 hover:text-cyan-400 transition-colors duration-200"
                    >
                      <Building className="h-4 w-4 mr-2" />
                      Brand Suite
                    </Link>
                    
                    <Link
                      to="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center text-sm text-slate-300 hover:text-cyan-400 transition-colors duration-200"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Link>
                    
                    <button
                      onClick={handleSignOut}
                      className="flex items-center text-sm text-red-400 hover:text-red-300 transition-colors duration-200"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-4 border-t border-slate-700 flex flex-col space-y-3">
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-base font-medium text-slate-300 hover:text-cyan-400 transition-colors duration-200"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg font-semibold text-white text-center shadow-lg shadow-cyan-500/25"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar