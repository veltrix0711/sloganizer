import { useState, useEffect } from 'react'
import { Heart, Download, Trash2, Search, Sparkles, Star } from 'lucide-react'
import { useAuth } from '../services/authContext'
import api from '../services/api'

const FavoritesPage = () => {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const response = await api.getFavorites()
        if (response.success) {
          setFavorites(response.data)
        }
      } catch (error) {
        console.error('Error loading favorites:', error)
      } finally {
        setLoading(false)
      }
    }

    loadFavorites()
  }, [])

  const filteredFavorites = favorites.filter(fav => 
    fav.slogan_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fav.business_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading your favorites...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 py-8">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-purple-600 rounded-xl flex items-center justify-center shadow-2xl shadow-pink-500/25">
              <Heart className="h-8 w-8 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-pink-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
              My Favorites
            </span>
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Your collection of perfect slogans - save, organize, and export the marketing 
            messages that perfectly capture your brand.
          </p>
        </div>

        {/* Search and Actions */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 shadow-2xl mb-8">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search slogans..."
                className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-600/50 hover:border-pink-500/50 hover:text-pink-400 transition-all duration-200 flex items-center">
                <Download className="h-4 w-4 mr-2" />
                Export All
              </button>
            </div>
          </div>
        </div>

        {/* Favorites List */}
        {filteredFavorites.length > 0 ? (
          <div className="space-y-4">
            {filteredFavorites.map((favorite) => (
              <div key={favorite.id} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-2xl hover:border-pink-500/50 transition-all duration-300 group">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-4 group-hover:text-pink-300 transition-colors">
                      "{favorite.slogan_text}"
                    </h3>
                    <div className="text-sm text-slate-300 space-y-2">
                      <p><strong className="text-cyan-400">Business:</strong> {favorite.business_name}</p>
                      <p><strong className="text-cyan-400">Industry:</strong> {favorite.industry}</p>
                      <p><strong className="text-cyan-400">Personality:</strong> {favorite.personality}</p>
                      {favorite.explanation && (
                        <p className="bg-slate-600/30 p-3 rounded-lg mt-3">
                          <strong className="text-purple-400">Why this works:</strong> {favorite.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-16 text-center shadow-2xl">
            <div className="w-20 h-20 bg-gradient-to-r from-pink-400 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-pink-500/25">
              <Heart className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
              {searchTerm ? 'No matching slogans found' : 'No saved slogans yet'}
            </h2>
            <p className="text-slate-300 text-lg mb-8 leading-relaxed">
              {searchTerm 
                ? 'Try adjusting your search terms to find your perfect slogan'
                : 'Start generating slogans and save your favorites here to build your collection'
              }
            </p>
            {!searchTerm && (
              <a href="/generate" className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg font-bold text-white shadow-xl shadow-pink-500/25 hover:shadow-pink-500/40 transition-all duration-300 hover:scale-105 group">
                <Sparkles className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                Generate Slogans
                <Star className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default FavoritesPage