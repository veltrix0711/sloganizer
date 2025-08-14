import { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  Star, 
  Download, 
  Eye, 
  Heart, 
  Tag,
  Zap,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  Plus,
  ArrowRight
} from 'lucide-react'
import { useAuth } from '../services/authContext'
import api from '../services/api'
import toast from 'react-hot-toast'

const TemplateMarketplacePage = () => {
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [templates, setTemplates] = useState([])
  const [filteredTemplates, setFilteredTemplates] = useState([])
  const [categories, setCategories] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('popular')
  const [favorites, setFavorites] = useState(new Set())

  useEffect(() => {
    loadTemplates()
    loadCategories()
    loadFavorites()
  }, [])

  useEffect(() => {
    filterTemplates()
  }, [templates, searchTerm, selectedCategory, sortBy])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/templates')
      if (response.success) {
        setTemplates(response.templates)
      }
    } catch (error) {
      console.error('Failed to load templates:', error)
      toast.error('Failed to load templates')
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await api.get('/api/templates/categories')
      if (response.success) {
        setCategories(response.categories)
      }
    } catch (error) {
      console.error('Failed to load categories:', error)
    }
  }

  const loadFavorites = async () => {
    if (!user) return
    try {
      const response = await api.get('/api/templates/favorites')
      if (response.success) {
        setFavorites(new Set(response.favoriteIds))
      }
    } catch (error) {
      console.error('Failed to load favorites:', error)
    }
  }

  const filterTemplates = () => {
    let filtered = [...templates]

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(template => 
        template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory)
    }

    // Sort templates
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => (b.downloads || 0) - (a.downloads || 0))
        break
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        break
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case 'alphabetical':
        filtered.sort((a, b) => a.title.localeCompare(b.title))
        break
    }

    setFilteredTemplates(filtered)
  }

  const handleUseTemplate = async (template) => {
    try {
      const response = await api.post('/api/templates/use', {
        templateId: template.id,
        email: user?.email
      })
      
      if (response.success) {
        toast.success('Template applied successfully!')
        // Navigate to generator with template data
        window.location.href = `/generator?template=${template.id}`
      }
    } catch (error) {
      console.error('Failed to use template:', error)
      toast.error('Failed to use template')
    }
  }

  const handleToggleFavorite = async (templateId) => {
    if (!user) {
      toast.error('Please sign in to save favorites')
      return
    }

    try {
      const isFavorite = favorites.has(templateId)
      
      if (isFavorite) {
        await api.delete(`/api/templates/favorites/${templateId}`)
        setFavorites(prev => {
          const newSet = new Set(prev)
          newSet.delete(templateId)
          return newSet
        })
        toast.success('Removed from favorites')
      } else {
        await api.post('/api/templates/favorites', { templateId })
        setFavorites(prev => new Set([...prev, templateId]))
        toast.success('Added to favorites')
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
      toast.error('Failed to update favorites')
    }
  }

  const isPremiumTemplate = (template) => {
    return template.tier === 'pro' || template.tier === 'enterprise'
  }

  const canUseTemplate = (template) => {
    if (!isPremiumTemplate(template)) return true
    if (!profile) return false
    
    const userTier = profile.subscription_plan
    if (userTier === 'agency' || userTier === 'premium') return true
    if (userTier === 'pro' && template.tier === 'pro') return true
    
    return false
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-night py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-space rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="h-64 bg-space rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-night py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-heading mb-2">Template Marketplace</h1>
          <p className="text-body">Discover professional slogan templates to boost your creativity</p>
        </div>

        {/* Search and Filters */}
        <div className="card-primary mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-space border border-electric/20 rounded-lg text-heading placeholder-muted focus:outline-none focus:ring-2 focus:ring-electric"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-space border border-electric/20 text-heading px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-space border border-electric/20 text-heading px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric"
            >
              <option value="popular">Most Popular</option>
              <option value="newest">Newest</option>
              <option value="rating">Highest Rated</option>
              <option value="alphabetical">A-Z</option>
            </select>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-electric/10">
            <p className="text-muted text-sm">
              Showing {filteredTemplates.length} of {templates.length} templates
            </p>
            <div className="flex items-center space-x-4 text-sm text-muted">
              <div className="flex items-center">
                <Star className="h-4 w-4 mr-1 text-yellow-400" />
                Premium templates available
              </div>
              <div className="flex items-center">
                <Heart className="h-4 w-4 mr-1 text-red-400" />
                {favorites.size} favorites
              </div>
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        {filteredTemplates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTemplates.map((template) => (
              <div key={template.id} className="card-primary group hover:shadow-lg transition-all duration-200">
                {/* Template Header */}
                <div className="relative mb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-heading mb-1 group-hover:text-electric transition-colors">
                        {template.title}
                      </h3>
                      <p className="text-sm text-muted line-clamp-2">
                        {template.description}
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggleFavorite(template.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        favorites.has(template.id)
                          ? 'text-red-400 hover:bg-red-400/10'
                          : 'text-muted hover:bg-space hover:text-red-400'
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${favorites.has(template.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Premium Badge */}
                  {isPremiumTemplate(template) && (
                    <div className="absolute -top-2 -right-2">
                      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                        <Star className="h-3 w-3 mr-1" />
                        {template.tier === 'enterprise' ? 'Enterprise' : 'Pro'}
                      </div>
                    </div>
                  )}
                </div>

                {/* Template Preview */}
                <div className="bg-space/50 rounded-lg p-4 mb-4">
                  <p className="text-heading font-medium text-center italic">
                    "{template.preview || 'Sample slogan preview...'}"
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {template.tags?.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-electric/10 text-electric text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  {template.tags?.length > 3 && (
                    <span className="px-2 py-1 bg-space text-muted text-xs rounded-full">
                      +{template.tags.length - 3}
                    </span>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-muted mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center">
                      <Download className="h-3 w-3 mr-1" />
                      {template.downloads || 0}
                    </div>
                    <div className="flex items-center">
                      <Star className="h-3 w-3 mr-1" />
                      {template.rating || 0}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {new Date(template.created_at).toLocaleDateString()}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  {canUseTemplate(template) ? (
                    <button
                      onClick={() => handleUseTemplate(template)}
                      className="flex-1 btn-primary text-sm py-2 flex items-center justify-center"
                    >
                      <Zap className="h-4 w-4 mr-1" />
                      Use Template
                    </button>
                  ) : (
                    <button
                      onClick={() => window.location.href = '/pricing'}
                      className="flex-1 btn-secondary text-sm py-2 flex items-center justify-center"
                    >
                      <Star className="h-4 w-4 mr-1" />
                      Upgrade to Use
                    </button>
                  )}
                  
                  <button className="btn-secondary px-3 py-2 text-sm">
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted" />
            <h3 className="text-xl font-semibold text-heading mb-2">No templates found</h3>
            <p className="text-muted mb-6">
              Try adjusting your search or filter criteria
            </p>
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('all')
              }}
              className="btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Pro Callout */}
        {profile?.subscription_plan === 'free' && (
          <div className="mt-12">
            <div className="card-accent bg-grad-quantum text-center">
              <div className="flex items-center justify-center mb-4">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Unlock Premium Templates</h3>
              <p className="text-white/90 mb-6">
                Get access to our entire library of professional templates and exclusive designs
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => window.location.href = '/pricing'}
                  className="btn-primary"
                >
                  View Pricing
                </button>
                <button className="btn-secondary">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TemplateMarketplacePage