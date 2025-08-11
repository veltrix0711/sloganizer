import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, Loader2, AlertCircle, CheckCircle, Rocket, Sparkles, Star, Zap } from 'lucide-react'
import { useAuth } from '../services/authContext'

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long'
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)

    try {
      const result = await signUp(formData.email, formData.password, {
        firstName: formData.firstName,
        lastName: formData.lastName
      })
      
      if (result.success) {
        if (result.needsConfirmation) {
          // Show success message about email confirmation
          navigate('/login', {
            state: {
              message: 'Please check your email to confirm your account before signing in.'
            }
          })
        } else {
          // User is automatically signed in
          navigate('/dashboard')
        }
      }
    } catch (error) {
      console.error('Sign up error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const passwordStrength = () => {
    const password = formData.password
    if (password.length === 0) return { strength: 0, text: '' }
    if (password.length < 6) return { strength: 25, text: 'Too short' }
    if (password.length < 8) return { strength: 50, text: 'Fair' }
    if (password.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return { strength: 100, text: 'Strong' }
    }
    return { strength: 75, text: 'Good' }
  }

  const { strength, text: strengthText } = passwordStrength()

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>
      <div className="relative sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-cyan-600 rounded-xl flex items-center justify-center shadow-2xl shadow-green-500/25">
              <Star className="h-8 w-8 text-white" />
            </div>
          </div>
          
          <h2 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-green-400 via-cyan-500 to-purple-600 bg-clip-text text-transparent">
              Launch Your Journey
            </span>
          </h2>
          <p className="text-lg text-slate-300">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>

      <div className="relative mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-bold text-white mb-3">
                  First name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    className={`w-full pl-10 pr-4 py-3 bg-slate-700/50 border rounded-lg text-white placeholder-slate-400 focus:ring-1 transition-all duration-200 ${
                      errors.firstName 
                        ? 'border-red-500 focus:border-red-400 focus:ring-red-400/50' 
                        : 'border-slate-600 focus:border-cyan-500 focus:ring-cyan-500'
                    }`}
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>
                {errors.firstName && (
                  <p className="text-red-400 text-sm mt-2 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.firstName}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-bold text-white mb-3">
                  Last name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-200"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-white mb-3">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className={`w-full pl-10 pr-4 py-3 bg-slate-700/50 border rounded-lg text-white placeholder-slate-400 focus:ring-1 transition-all duration-200 ${
                    errors.email 
                      ? 'border-red-500 focus:border-red-400 focus:ring-red-400/50' 
                      : 'border-slate-600 focus:border-cyan-500 focus:ring-cyan-500'
                  }`}
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-sm mt-2 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-white mb-3">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  className={`w-full pl-10 pr-4 py-3 bg-slate-700/50 border rounded-lg text-white placeholder-slate-400 focus:ring-1 transition-all duration-200 ${
                    errors.password 
                      ? 'border-red-500 focus:border-red-400 focus:ring-red-400/50' 
                      : 'border-slate-600 focus:border-cyan-500 focus:ring-cyan-500'
                  }`}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              
              {/* Password strength indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-slate-400">Password strength:</span>
                    <span className={`text-xs font-medium ${
                      strength < 50 ? 'text-red-400' : 
                      strength < 75 ? 'text-yellow-400' : 
                      'text-green-400'
                    }`}>
                      {strengthText}
                    </span>
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        strength < 50 ? 'bg-gradient-to-r from-red-500 to-red-600' : 
                        strength < 75 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 
                        'bg-gradient-to-r from-green-400 to-cyan-500'
                      }`}
                      style={{ width: `${strength}%` }}
                    />
                  </div>
                </div>
              )}
              
              {errors.password && (
                <p className="text-red-400 text-sm mt-2 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-bold text-white mb-3">
                Confirm password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  className={`w-full pl-10 pr-12 py-3 bg-slate-700/50 border rounded-lg text-white placeholder-slate-400 focus:ring-1 transition-all duration-200 ${
                    errors.confirmPassword 
                      ? 'border-red-500 focus:border-red-400 focus:ring-red-400/50' 
                      : 'border-slate-600 focus:border-cyan-500 focus:ring-cyan-500'
                  }`}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                )}
              </div>
              {errors.confirmPassword && (
                <p className="text-red-400 text-sm mt-2 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-cyan-600 rounded-lg font-bold text-white shadow-xl shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          {/* Terms and Privacy */}
          <p className="mt-8 text-xs text-slate-400 text-center">
            By creating an account, you agree to our{' '}
            <a href="/terms" className="text-cyan-400 hover:text-cyan-300 transition-colors">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-cyan-400 hover:text-cyan-300 transition-colors">
              Privacy Policy
            </a>
            .
          </p>
        </div>

        {/* Benefits */}
        <div className="mt-12 text-center">
          <p className="text-lg text-slate-300 mb-6">
            Launch your brand with these free features:
          </p>
          <div className="grid grid-cols-1 gap-4 text-sm">
            <div className="flex items-center justify-center bg-slate-800/30 rounded-lg p-3 border border-slate-700">
              <Zap className="h-5 w-5 text-green-400 mr-3" />
              <span className="text-slate-300 font-medium">Complete brand creation suite</span>
            </div>
            <div className="flex items-center justify-center bg-slate-800/30 rounded-lg p-3 border border-slate-700">
              <Star className="h-5 w-5 text-cyan-400 mr-3" />
              <span className="text-slate-300 font-medium">Save and organize favorites</span>
            </div>
            <div className="flex items-center justify-center bg-slate-800/30 rounded-lg p-3 border border-slate-700">
              <Sparkles className="h-5 w-5 text-purple-400 mr-3" />
              <span className="text-slate-300 font-medium">AI-powered content generation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUpPage