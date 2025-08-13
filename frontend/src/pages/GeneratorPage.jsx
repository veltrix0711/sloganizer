import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Wand2, Copy, Heart, Download, RefreshCw, AlertCircle, CheckCircle, Loader2, Sparkles, Rocket, Zap, Brain, MessageSquare } from 'lucide-react'
import { useAuth } from '../services/authContext'
import { INDUSTRIES, BRAND_PERSONALITIES, formatPersonality, formatIndustry } from '../services/supabase'
import api from '../services/api'
import toast from 'react-hot-toast'
import NameGeneratorWidget from '../components/Widgets/NameGeneratorWidget'
import LogoGeneratorWidget from '../components/Widgets/LogoGeneratorWidget'
import ActivationChecklist from '../components/Widgets/ActivationChecklist'
import SocialPostTemplates from '../components/Widgets/SocialPostTemplates'
import CompleteBrandGenerator from '../components/BusinessSuite/CompleteBrandGenerator'

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
  
  // Brand profile and voice training state
  const [brandProfiles, setBrandProfiles] = useState([])
  const [selectedBrandProfile, setSelectedBrandProfile] = useState(null)
  const [useVoiceTraining, setUseVoiceTraining] = useState(false)
  const [voiceStatus, setVoiceStatus] = useState(null)
  
  // Activation checklist state
  const [showChecklist, setShowChecklist] = useState(true)

  // Load brand profiles when user is available
  useEffect(() => {
    if (user) {
      loadBrandProfiles()
    }
  }, [user])

  // Check voice status when brand profile is selected
  useEffect(() => {
    if (selectedBrandProfile && useVoiceTraining) {
      checkVoiceStatus()
    }
  }, [selectedBrandProfile, useVoiceTraining])

  const loadBrandProfiles = async () => {
    try {
      const response = await fetch('/api/brand/profiles', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setBrandProfiles(data.profiles || [])
        
        // Auto-select default profile if available
        const defaultProfile = data.profiles?.find(p => p.is_default)
        if (defaultProfile) {
          setSelectedBrandProfile(defaultProfile)
        }
      }
    } catch (error) {
      console.error('Error loading brand profiles:', error)
    }
  }

  const checkVoiceStatus = async () => {
    if (!selectedBrandProfile?.id) return

    try {
      const response = await fetch(`/api/voice-training/profiles/${selectedBrandProfile.id}/status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setVoiceStatus(data)
      }
    } catch (error) {
      console.error('Error checking voice status:', error)
    }
  }

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
      let response;
      
      // Use voice-aware generation if enabled and voice profile is ready
      if (useVoiceTraining && selectedBrandProfile && voiceStatus?.progress?.ready_for_generation) {
        const voicePrompt = `Generate creative slogans for ${formData.businessName.trim()}, a ${formatIndustry(formData.industry)} business with a ${formatPersonality(formData.personality)} personality. ${formData.keywords.length > 0 ? `Include these keywords: ${formData.keywords.join(', ')}.` : ''} ${formData.targetAudience ? `Target audience: ${formData.targetAudience}.` : ''}`
        
        const voiceResponse = await fetch('/api/voice-training/generate-content', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            brandProfileId: selectedBrandProfile.id,
            prompt: voicePrompt,
            contentType: 'marketing'
          })
        })
        
        if (voiceResponse.ok) {
          const voiceResult = await voiceResponse.json()
          // Parse slogans from the generated content
          const slogans = voiceResult.content
            .split('\n')
            .filter(line => line.trim())
            .map(line => line.replace(/^[\d\-\.\*\s]+/, '').trim())
            .filter(slogan => slogan.length > 0 && slogan.length < 100)
            .slice(0, 10)
          
          response = {
            success: true,
            slogans: slogans.map(slogan => ({ text: slogan, voiceMatch: true })),
            voiceMatchScore: voiceResult.voiceMatchScore,
            usedVoiceProfile: voiceResult.usedVoiceProfile
          }
        } else {
          // Fallback to regular generation
          response = await api.generateSlogan({
            companyName: formData.businessName.trim(),
            industry: formData.industry,
            brandPersonality: formData.personality,
            keywords: formData.keywords,
            tone: 'casual'
          })
        }
      } else {
        // Regular slogan generation
        response = await api.generateSlogan({
          companyName: formData.businessName.trim(),
          industry: formData.industry,
          brandPersonality: formData.personality,
          keywords: formData.keywords,
          tone: 'casual'
        })
      }

      if (response.success) {
        console.log('Frontend received response:', response)
        console.log('Slogans from response:', response.slogans)
        setGeneratedSlogans(response.slogans || [])
        setRemainingFreeGenerations(response.remaining)
        
        // Mark checklist action as completed
        if (window.markChecklistAction) {
          window.markChecklistAction('hasGeneratedSlogan')
        }
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
        sloganText: slogan,
        businessName: formData.businessName,
        industry: formData.industry,
        personality: formData.personality,
        targetAudience: formData.targetAudience || null,
        keywords: formData.keywords,
        explanation: null
      })
    } catch (error) {
      // Error handling is done in the api service
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 py-8">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-xl flex items-center justify-center shadow-2xl shadow-cyan-500/25">
              <Wand2 className="h-8 w-8 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              Brand Toolkit Studio
            </span>
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Create your complete brand identity with AI-powered slogans, business names, logos, 
            and professional content - everything you need to launch your brand successfully.
          </p>
          
          {/* Free generations remaining indicator */}
          {!user && remainingFreeGenerations !== null && (
            <div className="mt-8 flex justify-center">
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/50 rounded-full text-cyan-300 backdrop-blur-sm shadow-lg">
                <Zap className="h-5 w-5 mr-2 text-cyan-400" />
                <span className="font-medium">
                  {remainingFreeGenerations} free generation{remainingFreeGenerations !== 1 ? 's' : ''} remaining
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-8">
          {/* Input Form */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <Wand2 className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">AI Slogan Generator</h2>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); generateSlogans(); }}>
              {/* Business Name */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-white mb-3">
                  Business Name *
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-200"
                  placeholder="Enter your business name..."
                  value={formData.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                  maxLength={100}
                />
              </div>

              {/* Industry */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-white mb-3">
                  Industry *
                </label>
                <select
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-200"
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
                <label className="block text-sm font-bold text-white mb-3">
                  Brand Personality
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  {Object.values(BRAND_PERSONALITIES).map(personality => (
                    <label 
                      key={personality}
                      className={`relative flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                        formData.personality === personality
                          ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300'
                          : 'border-slate-600 hover:border-slate-500 text-slate-300'
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
                        <CheckCircle className="h-4 w-4 text-cyan-400" />
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Target Audience */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-white mb-3">
                  Target Audience (Optional)
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-200"
                  placeholder="e.g., Young professionals, Families, Tech enthusiasts..."
                  value={formData.targetAudience}
                  onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                  maxLength={200}
                />
                <p className="text-sm text-slate-400 mt-2">
                  Help us tailor slogans to your specific audience
                </p>
              </div>

              {/* Brand Profile Selection (for authenticated users) */}
              {user && brandProfiles.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-bold text-white mb-3">
                    <Brain className="inline w-4 h-4 mr-2" />
                    Brand Profile (Optional)
                  </label>
                  <select
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-200"
                    value={selectedBrandProfile?.id || ''}
                    onChange={(e) => {
                      const profile = brandProfiles.find(p => p.id === e.target.value)
                      setSelectedBrandProfile(profile || null)
                    }}
                  >
                    <option value="">Select a brand profile...</option>
                    {brandProfiles.map(profile => (
                      <option key={profile.id} value={profile.id}>
                        {profile.name} {profile.is_default ? '(Default)' : ''}
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-slate-400 mt-2">
                    Use your brand profile to generate more targeted slogans
                  </p>
                </div>
              )}

              {/* Voice Training Toggle */}
              {user && selectedBrandProfile && (
                <div className="mb-6">
                  <div className="flex items-center justify-between p-4 bg-slate-700/30 border border-slate-600 rounded-lg">
                    <div className="flex items-center">
                      <MessageSquare className="w-5 h-5 text-cyan-400 mr-3" />
                      <div>
                        <span className="text-sm font-medium text-white">Voice-Aware Generation</span>
                        <p className="text-xs text-slate-400 mt-1">
                          Generate slogans that match your brand's unique voice and tone
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {voiceStatus?.progress?.ready_for_generation ? (
                        <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full border border-green-500/30">
                          Ready
                        </span>
                      ) : voiceStatus?.progress?.analyzed_samples >= 3 ? (
                        <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full border border-yellow-500/30">
                          Training
                        </span>
                      ) : (
                        <span className="text-xs bg-gray-500/20 text-gray-300 px-2 py-1 rounded-full border border-gray-500/30">
                          No Profile
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => setUseVoiceTraining(!useVoiceTraining)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-800 ${
                          useVoiceTraining ? 'bg-cyan-600' : 'bg-slate-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            useVoiceTraining ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                  {useVoiceTraining && !voiceStatus?.progress?.ready_for_generation && (
                    <div className="mt-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <p className="text-xs text-yellow-300">
                        {voiceStatus?.progress?.analyzed_samples < 5 
                          ? `Upload ${5 - (voiceStatus?.progress?.analyzed_samples || 0)} more content samples in Brand Suite to enable voice-aware generation.`
                          : 'Voice profile is still training. Slogans will use standard generation with brand context.'
                        }
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Keywords */}
              <div className="mb-8">
                <label className="block text-sm font-bold text-white mb-3">
                  Keywords (Optional, max 5)
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.keywords.map((keyword, index) => (
                    <span 
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-cyan-500/20 text-cyan-300 text-sm rounded-full border border-cyan-500/30"
                    >
                      {keyword}
                      <button
                        type="button"
                        onClick={() => removeKeyword(keyword)}
                        className="ml-2 text-cyan-400 hover:text-cyan-200 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex">
                  <input
                    type="text"
                    className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-l-lg text-white placeholder-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-200"
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
                    className="px-4 py-3 bg-slate-600 text-white border border-l-0 border-slate-600 rounded-r-lg hover:bg-slate-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!keywordInput.trim() || formData.keywords.length >= 5}
                  >
                    Add
                  </button>
                </div>
                <p className="text-sm text-slate-400 mt-2">
                  Words or phrases that should influence the slogan style
                </p>
              </div>

              {/* Error Display */}
              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm backdrop-blur-sm">
                  <AlertCircle className="h-4 w-4 inline mr-2" />
                  {error}
                </div>
              )}

              {/* Generate Button */}
              <button
                type="submit"
                disabled={isGenerating || !formData.businessName.trim() || !formData.industry}
                className="w-full py-4 px-6 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg font-bold text-white shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group"
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
                <p className="text-sm text-slate-400 text-center mt-4">
                  <Link to="/signup" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                    Create a free account
                  </Link> to save favorites and get more generations
                </p>
              )}
            </form>
          </div>

          {/* Generated Slogans */}
          <div>
            {generatedSlogans.length > 0 ? (
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center mb-2">
                      <Sparkles className="h-6 w-6 text-cyan-400 mr-2" />
                      Your Brand Slogans
                    </h2>
                    <p className="text-slate-400 text-sm">AI-generated slogans tailored to your brand</p>
                  </div>
                  <button
                    onClick={generateSlogans}
                    disabled={isGenerating}
                    className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-600/50 hover:border-cyan-500/50 hover:text-cyan-400 transition-all duration-200 group"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 group-hover:rotate-180 transition-transform ${isGenerating ? 'animate-spin' : ''}`} />
                    Regenerate
                  </button>
                </div>

                <div className="space-y-4">
                  {generatedSlogans.map((slogan, index) => {
                    const sloganText = typeof slogan === 'string' ? slogan : slogan.text;
                    const isVoiceMatch = typeof slogan === 'object' && slogan.voiceMatch;
                    
                    return (
                      <div 
                        key={index} 
                        className="p-6 border border-slate-600 rounded-xl hover:border-cyan-500/50 bg-slate-700/30 hover:bg-slate-700/50 transition-all duration-200 group"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-medium text-white">
                                "{sloganText}"
                              </h3>
                              {isVoiceMatch && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                  <MessageSquare className="w-3 h-3 mr-1" />
                                  Voice Match
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <button
                              onClick={() => copySlogan(sloganText)}
                              className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-600/50 rounded-lg transition-all duration-200"
                              title="Copy to clipboard"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                            {user && (
                              <button
                                onClick={() => saveSlogan(sloganText)}
                                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                                title="Save to favorites"
                              >
                                <Heart className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                        
                        {(typeof slogan === 'object' && slogan.explanation) && (
                          <p className="text-sm text-slate-300 bg-slate-600/30 p-3 rounded-lg">
                            <strong className="text-cyan-400">Why this works:</strong> {slogan.explanation}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {!user && (
                  <div className="mt-8 p-6 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl border border-orange-500/30 backdrop-blur-sm">
                    <div className="flex items-center mb-3">
                      <Heart className="h-5 w-5 text-orange-400 mr-2" />
                      <h3 className="font-bold text-orange-300">
                        Love these slogans?
                      </h3>
                    </div>
                    <p className="text-orange-200 text-sm mb-4">
                      Create a free account to save your favorites, get more generations, and export your slogans.
                    </p>
                    <div className="flex space-x-3">
                      <Link to="/signup" className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                        Sign Up Free
                      </Link>
                      <Link to="/login" className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg font-semibold text-slate-300 hover:bg-slate-600/50 hover:border-orange-500/50 hover:text-orange-400 transition-all duration-200">
                        Sign In
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-12 text-center shadow-2xl">
                <div className="w-20 h-20 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-cyan-500/25">
                  <Wand2 className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Ready to <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">Create</span> Your Brand?
                </h2>
                <p className="text-slate-300 text-lg leading-relaxed">
                  Fill in your business details and let our AI create compelling slogans 
                  that perfectly capture your brand's essence. Start with slogans, then explore 
                  our complete brand toolkit below.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Section Separator */}
        <div className="flex items-center my-16">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>
          <div className="px-6">
            <div className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full"></div>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>
        </div>

        {/* Brand Toolkit Widgets */}
        <div>
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-2xl shadow-purple-500/25">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Complete <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">Brand Toolkit</span>
            </h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Build your entire brand identity with our comprehensive suite of AI-powered tools
            </p>
          </div>

          {/* Quick Tools Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto mb-12">
            <NameGeneratorWidget user={user} />
            <LogoGeneratorWidget user={user} businessName={formData.businessName} />
          </div>

          {/* Content Creation Tools */}
          <div className="max-w-5xl mx-auto mb-12">
            <SocialPostTemplates 
              user={user} 
              businessName={formData.businessName}
              industry={formData.industry}
              brandProfile={selectedBrandProfile}
            />
          </div>

          {/* Premium Business Suite */}
          {user?.subscription?.plan_code === 'AGENCY' || user?.subscription_tier === 'pro-500' ? (
            <div className="max-w-4xl mx-auto">
              <CompleteBrandGenerator user={user} brandProfile={selectedBrandProfile} />
            </div>
          ) : null}
        </div>
      </div>

      {/* Activation Checklist */}
      {user && showChecklist && (
        <ActivationChecklist 
          user={user} 
          onDismiss={() => setShowChecklist(false)}
        />
      )}
    </div>
  )
}

export default GeneratorPage