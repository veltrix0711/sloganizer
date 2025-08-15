import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
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
  ArrowRight,
  Lock,
  X
} from 'lucide-react'
import { useAuth } from '../services/authContext'
import api from '../services/api'
import toast from 'react-hot-toast'

const TemplateMarketplacePage = () => {
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [templates, setTemplates] = useState([])
  const [total, setTotal] = useState(0)
  const [categories, setCategories] = useState([])
  const [searchTerm, setSearchTerm] = useState(new URLSearchParams(window.location.search).get('q') || '')
  const [selectedCategory, setSelectedCategory] = useState(new URLSearchParams(window.location.search).get('category') || 'all')
  const [sortBy, setSortBy] = useState(new URLSearchParams(window.location.search).get('sort') || 'popular')
  const [tier, setTier] = useState(new URLSearchParams(window.location.search).get('tier') || 'all')
  const [page, setPage] = useState(parseInt(new URLSearchParams(window.location.search).get('page') || '1', 10))
  const pageSize = 24
  const [favorites, setFavorites] = useState(new Set())
  const [showPreview, setShowPreview] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const loadMoreRef = useRef(null)

  // Sync URL from state
  useEffect(() => {
    const p = new URLSearchParams()
    if (searchTerm) p.set('q', searchTerm)
    if (selectedCategory && selectedCategory !== 'all') p.set('category', selectedCategory)
    if (tier && tier !== 'all') p.set('tier', tier)
    if (sortBy && sortBy !== 'popular') p.set('sort', sortBy)
    if (page > 1) p.set('page', String(page))
    const qs = p.toString()
    const url = window.location.pathname + (qs ? `?${qs}` : '')
    window.history.replaceState({}, '', url)
  }, [searchTerm, selectedCategory, tier, sortBy, page])

  useEffect(() => {
    loadTemplates()
    loadCategories()
    loadFavorites()
  }, [])

  // Refetch when filters change
  useEffect(() => {
    const handler = setTimeout(() => {
      loadTemplates()
    }, 300)
    return () => clearTimeout(handler)
  }, [searchTerm, selectedCategory, tier, sortBy, page])

  const loadTemplates = async () => {
    try {
      if (page === 1) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }
      const params = new URLSearchParams()
      if (searchTerm) params.set('q', searchTerm)
      if (selectedCategory && selectedCategory !== 'all') params.set('category', selectedCategory)
      if (tier && tier !== 'all') params.set('tier', tier)
      if (sortBy) params.set('sort', sortBy)
      params.set('page', String(page))
      params.set('pageSize', String(pageSize))
      const response = await api.get(`/api/templates?${params.toString()}`)
      if (response.success) {
        const newItems = response.templates || []
        const nextTotal = response.total || 0
        if (page === 1) {
          setTemplates(newItems)
        } else {
          setTemplates(prev => [...prev, ...newItems])
        }
        setTotal(nextTotal)
        const computedHasMore = (page * pageSize) < nextTotal && newItems.length > 0
        setHasMore(computedHasMore)
      }
    } catch (error) {
      console.error('Failed to load templates:', error)
      toast.error('Failed to load templates')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  // Infinite scroll observer
  useEffect(() => {
    if (!loadMoreRef.current) return
    const el = loadMoreRef.current
    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries
      if (entry.isIntersecting && !loading && !loadingMore && hasMore) {
        setPage(prev => prev + 1)
      }
    }, { root: null, rootMargin: '200px', threshold: 0 })
    observer.observe(el)
    return () => observer.unobserve(el)
  }, [hasMore, loading, loadingMore])

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
      const response = await api.get(`/api/templates/favorites${user?.email ? `?email=${encodeURIComponent(user.email)}` : ''}`)
      if (response.success) {
        setFavorites(new Set(response.favoriteIds))
      }
    } catch (error) {
      console.error('Failed to load favorites:', error)
    }
  }

  const filteredTemplates = useMemo(() => templates, [templates])

  const handleUseTemplate = async (template) => {
    try {
      const response = await api.post('/api/templates/use', {
        templateId: template.id,
        email: user?.email
      })
      
      if (response.success) {
        toast.success('Template applied successfully!')
        // Navigate to generator with template data
        window.location.href = `/generate?template=${template.id}`
      }
    } catch (error) {
      console.error('Failed to use template:', error)
      toast.error('Failed to use template')
    }
  }

  const openPreview = (template) => {
    setPreviewTemplate(template)
    setShowPreview(true)
  }

  const closePreview = () => {
    setShowPreview(false)
    setPreviewTemplate(null)
  }

  const handleToggleFavorite = async (templateId) => {
    if (!user) {
      toast.error('Please sign in to save favorites')
      return
    }

    try {
      const isFavorite = favorites.has(templateId)
      
      if (isFavorite) {
        await api.delete(`/api/templates/favorites/${templateId}${user?.email ? `?email=${encodeURIComponent(user.email)}` : ''}`)
        setFavorites(prev => {
          const newSet = new Set(prev)
          newSet.delete(templateId)
          return newSet
        })
        toast.success('Removed from favorites')
      } else {
        await api.post('/api/templates/favorites', { templateId, email: user?.email })
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
                onChange={(e) => { setPage(1); setSearchTerm(e.target.value) }}
                className="w-full pl-10 pr-4 py-2 bg-space border border-electric/20 rounded-lg text-heading placeholder-muted focus:outline-none focus:ring-2 focus:ring-electric"
              />
            </div>

            {/* Category Filter (chips) */}
            <div className="flex-1 overflow-x-auto">
              <div className="flex items-center gap-2 min-w-max">
                {[{ id: 'all', name: 'All', count: total }, ...categories].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { setPage(1); setSelectedCategory(cat.id) }}
                    className={`px-3 py-1 rounded-full border transition-colors whitespace-nowrap ${
                      (selectedCategory === cat.id)
                        ? 'border-electric/40 bg-electric/10 text-electric'
                        : 'border-electric/20 text-muted hover:text-heading hover:bg-space'
                    }`}
                  >
                    {cat.name}{typeof cat.count === 'number' ? ` (${cat.count})` : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* Tier Filter (chips) */}
            <div className="flex items-center gap-2">
              {[
                { id: 'all', name: 'All tiers' },
                { id: 'free', name: 'Free' },
                { id: 'pro', name: 'Pro' },
                { id: 'enterprise', name: 'Enterprise' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => { setPage(1); setTier(t.id) }}
                  className={`px-3 py-1 rounded-full border transition-colors whitespace-nowrap ${
                    (tier === t.id)
                      ? 'border-electric/40 bg-electric/10 text-electric'
                      : 'border-electric/20 text-muted hover:text-heading hover:bg-space'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => { setPage(1); setSortBy(e.target.value) }}
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
              Showing {filteredTemplates.length} of {total} templates
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
              {(searchTerm || selectedCategory !== 'all' || tier !== 'all' || sortBy !== 'popular' || page > 1) && (
                <button
                  onClick={() => { setSearchTerm(''); setSelectedCategory('all'); setTier('all'); setSortBy('popular'); setPage(1) }}
                  className="px-3 py-1 rounded-full border border-electric/20 text-muted hover:text-heading hover:bg-space"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        {filteredTemplates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTemplates.map((template) => (
              <div key={template.id} className="card-primary group hover:shadow-lg transition-all duration-200 relative overflow-hidden">
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
                      <Lock className="h-4 w-4 mr-1" />
                      Upgrade to Use
                    </button>
                  )}

                  <button className="btn-secondary px-3 py-2 text-sm" onClick={() => openPreview(template)}>
                    <Eye className="h-4 w-4" />
                  </button>
                </div>

                {/* Lock overlay for non-eligible users */}
                {isPremiumTemplate(template) && !canUseTemplate(template) && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="text-center">
                      <Lock className="h-6 w-6 text-white mx-auto mb-2" />
                      <button
                        className="btn-primary text-xs"
                        onClick={() => window.location.href = '/pricing'}
                      >
                        Upgrade to unlock
                      </button>
                    </div>
                  </div>
                )}
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

        {/* Infinite scroll sentinel and loader */}
        <div className="flex justify-center items-center mt-10">
          {loadingMore && (
            <div className="text-muted text-sm">Loading more…</div>
          )}
        </div>
        <div ref={loadMoreRef} className="h-10" />

        {/* Preview Modal */}
        {showPreview && previewTemplate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60" onClick={closePreview} />
            <div className="relative z-10 w-full max-w-2xl mx-4 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl">
              <div className="flex items-center justify-between p-4 border-b border-slate-700">
                <div className="flex items-center gap-2">
                  {isPremiumTemplate(previewTemplate) && (
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full">
                      {previewTemplate.tier === 'enterprise' ? 'Enterprise' : 'Pro'}
                    </div>
                  )}
                  <h3 className="text-white font-semibold">{previewTemplate.title}</h3>
                </div>
                <button onClick={closePreview} className="p-2 text-slate-400 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <p className="text-body">{previewTemplate.description}</p>
                <div className="bg-space/50 rounded-lg p-4">
                  <p className="text-heading font-medium text-center italic">
                    "{previewTemplate.preview || 'Sample slogan preview...'}"
                  </p>
                </div>
                {previewTemplate.tags?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {previewTemplate.tags.map((tag, i) => (
                      <span key={i} className="px-2 py-1 bg-electric/10 text-electric text-xs rounded-full">{tag}</span>
                    ))}
                  </div>
                ) : null}
                <div className="flex items-center justify-between text-xs text-muted">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1"><Download className="h-3 w-3" />{previewTemplate.downloads || 0}</span>
                    <span className="flex items-center gap-1"><Star className="h-3 w-3" />{previewTemplate.rating || 0}</span>
                  </div>
                  <div className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(previewTemplate.created_at).toLocaleDateString()}</div>
                </div>
              </div>
              <div className="p-4 border-t border-slate-700 flex items-center gap-3">
                {canUseTemplate(previewTemplate) ? (
                  <button className="btn-primary flex items-center" onClick={() => handleUseTemplate(previewTemplate)}>
                    <Zap className="h-4 w-4 mr-2" /> Use Template
                  </button>
                ) : (
                  <button className="btn-secondary flex items-center" onClick={() => window.location.href = '/pricing'}>
                    <Lock className="h-4 w-4 mr-2" /> Upgrade to Use
                  </button>
                )}
                <button className="btn-secondary ml-auto" onClick={closePreview}>Close</button>
              </div>
            </div>
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