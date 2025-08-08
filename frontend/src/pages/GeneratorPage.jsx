import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Wand2, Copy, Heart, Download, RefreshCw, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { useAuth } from '../services/authContext'
import { INDUSTRIES, BRAND_PERSONALITIES, formatPersonality, formatIndustry } from '../services/supabase'
import api from '../services/api'
import toast from 'react-hot-toast'

const GeneratorPage = () => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    businessName: '',
    industry: '',
    personality: 'professional',
    targetAudience: '',
    keywords: []
  })
  const [keywordInput, setKeywordInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedSlogans, setGeneratedSlogans] = useState([])
  const [remainingFreeGenerations, setRemainingFreeGenerations] = useState(null)
  const [error, setError] = useState('')

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setError('')
  }

  // Handle keyword management
  const addKeyword = () => {
    if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim()) && formData.keywords.length < 5) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()]
      }))
      setKeywordInput('')
    }
  }

  const removeKeyword = (keywordToRemove) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(keyword => keyword !== keywordToRemove)
    }))
  }

  const handleKeywordKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addKeyword()
    }
  }

  // Handle slogan generation
  const generateSlogans = async () => {
    if (!formData.businessName.trim()) {
      setError('Please enter your business name')
      return
    }

    if (!formData.industry) {
      setError('Please select an industry')
      return
    }

    setIsGenerating(true)
    setError('')

    try {
      const response = await api.generateSlogan({
        businessName: formData.businessName.trim(),
        industry: formData.industry,
        personality: formData.personality,
        targetAudience: (formData.targetAudience ?? '').toString().trim(),
        keywords: formData.keywords,
        userId: user?.id || null
      })

      if (response.success) {
        setGeneratedSlogans(response.data.slogans || [])
        setRemainingFreeGenerations(response.remainingFreeGenerations)
      }
    } catch (error) {
      console.error('Generation error:', error)
      if (error.details && Array.isArray(error.details)) {
        setError(error.details.join('\n'))
        toast.error(error.details.join('\n'), { duration: 7000 })
      } else {
        setError(error.message || 'Failed to generate slogans. Please try again.')
      }
      if (error.message && error.message.includes('limit')) {
        // Show upgrade prompt for free users
        if (!user) {
          toast.error('Sign up for free to get more slogans!', {
            duration: 5000
          })
        }
      }
    } finally {
      setIsGenerating(false)
    }
  }

  // Copy slogan to clipboard
  const copySlogan = async (sloganText) => {
    try {
      await navigator.clipboard.writeText(sloganText)
      toast.success('Slogan copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy slogan')
    }
  }

  // Save slogan to favorites
  const saveSlogan = async (slogan) => {
    if (!user) {
      toast.error('Please sign in to save slogans')
      return
    }

    try {
      await api.saveFavorite({
        sloganText: slogan.text,
        businessName: formData.businessName,
        industry: formData.industry,
        personality: formData.personality,
        targetAudience: formData.targetAudience || null,
        keywords: formData.keywords,
        explanation: slogan.explanation || null
      })
    } catch (error) {
      // Error handling is done in the api service
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Generate Your Perfect Marketing Slogan
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Tell us about your business and we'll create unique, memorable slogans 
            that capture your brand's personality.
          </p>
          
          {/* Free generations remaining indicator */}
          {!user && remainingFreeGenerations !== null && (
            <div className="mt-4 inline-flex items-center px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-sm text-blue-700">
              <AlertCircle className="h-4 w-4 mr-1" />
              {remainingFreeGenerations} free generation{remainingFreeGenerations !== 1 ? 's' : ''} remaining
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="card">
            <form onSubmit={(e) => { e.preventDefault(); generateSlogans(); }}>
              {/* Business Name */}
              <div className="mb-6">
                <label className="form-label">
                  Business Name *
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter your business name..."
                  value={formData.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                  maxLength={100}
                />
              </div>

              {/* Industry */}
              <div className="mb-6">
                <label className="form-label">
                  Industry *
                </label>
                <select
                  className="form-input"
                  value={formData.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                >
                  <option value="">Select your industry...</option>
                  {INDUSTRIES.map(industry => (
                    <option key={industry} value={industry}>
                      {formatIndustry(industry)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Brand Personality */}
              <div className="mb-6">
                <label className="form-label">
                  Brand Personality
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  {Object.values(BRAND_PERSONALITIES).map(personality => (
                    <label 
                      key={personality}
                      className={`relative flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                        formData.personality === personality
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="personality"
                        value={personality}
                        checked={formData.personality === personality}
                        onChange={(e) => handleInputChange('personality', e.target.value)}
                        className="sr-only"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium">
                          {formatPersonality(personality)}
                        </span>
                      </div>
                      {formData.personality === personality && (
                        <CheckCircle className="h-4 w-4 text-primary-600" />
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Target Audience */}
              <div className="mb-6">
                <label className="form-label">
                  Target Audience (Optional)
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Young professionals, Families, Tech enthusiasts..."
                  value={formData.targetAudience}
                  onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                  maxLength={200}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Help us tailor slogans to your specific audience
                </p>
              </div>

              {/* Keywords */}
              <div className="mb-8">
                <label className="form-label">
                  Keywords (Optional, max 5)
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.keywords.map((keyword, index) => (
                    <span 
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {keyword}
                      <button
                        type="button"
                        onClick={() => removeKeyword(keyword)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex">
                  <input
                    type="text"
                    className="form-input flex-1 rounded-r-none"
                    placeholder="Add a keyword..."
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyPress={handleKeywordKeyPress}
                    maxLength={50}
                    disabled={formData.keywords.length >= 5}
                  />
                  <button
                    type="button"
                    onClick={addKeyword}
                    className="px-4 py-2 bg-gray-200 text-gray-700 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!keywordInput.trim() || formData.keywords.length >= 5}
                  >
                    Add
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Words or phrases that should influence the slogan style
                </p>
              </div>

              {/* Error Display */}
              {error && (
                <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle className="h-4 w-4 inline mr-2" />
                  {error}
                </div>
              )}

              {/* Generate Button */}
              <button
                type="submit"
                disabled={isGenerating || !formData.businessName.trim() || !formData.industry}
                className="btn btn-brand w-full btn-lg group"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Generating Amazing Slogans...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
                    Generate Slogans
                  </>
                )}
              </button>

              {!user && (
                <p className="text-sm text-gray-500 text-center mt-3">
                  <Link to="/signup" className="text-primary-600 hover:text-primary-700">
                    Create a free account
                  </Link> to save favorites and get more generations
                </p>
              )}
            </form>
          </div>

          {/* Generated Slogans */}
          <div>
            {generatedSlogans.length > 0 ? (
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Generated Slogans
                  </h2>
                  <button
                    onClick={generateSlogans}
                    disabled={isGenerating}
                    className="btn btn-outline btn-sm group"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 group-hover:rotate-180 transition-transform ${isGenerating ? 'animate-spin' : ''}`} />
                    Regenerate
                  </button>
                </div>

                <div className="space-y-4">
                  {generatedSlogans.map((slogan, index) => (
                    <div 
                      key={index} 
                      className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors duration-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-medium text-gray-900 flex-1">
                          "{slogan.text}"
                        </h3>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => copySlogan(slogan.text)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                            title="Copy to clipboard"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          {user && (
                            <button
                              onClick={() => saveSlogan(slogan)}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                              title="Save to favorites"
                            >
                              <Heart className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {slogan.explanation && (
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                          <strong>Why this works:</strong> {slogan.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {!user && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-brand-50 to-primary-50 rounded-lg border border-brand-200">
                    <div className="flex items-center mb-2">
                      <Heart className="h-5 w-5 text-brand-600 mr-2" />
                      <h3 className="font-medium text-brand-900">
                        Love these slogans?
                      </h3>
                    </div>
                    <p className="text-brand-700 text-sm mb-3">
                      Create a free account to save your favorites, get more generations, and export your slogans.
                    </p>
                    <div className="flex space-x-3">
                      <Link to="/signup" className="btn btn-brand btn-sm">
                        Sign Up Free
                      </Link>
                      <Link to="/login" className="btn btn-outline btn-sm">
                        Sign In
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="card text-center">
                <Wand2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Ready to Generate Slogans?
                </h2>
                <p className="text-gray-600">
                  Fill in your business details on the left and click "Generate Slogans" 
                  to see your personalized marketing messages appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default GeneratorPage