import { useState, useEffect } from 'react'
import { Heart, Download, Trash2, Search } from 'lucide-react'
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your favorites...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">My Favorite Slogans</h1>
          <p className="text-gray-600">Manage and export your saved slogans</p>
        </div>

        {/* Search and Actions */}
        <div className="card mb-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search slogans..."
                className="form-input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button className="btn btn-outline btn-sm">
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
              <div key={favorite.id} className="card">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      "{favorite.slogan_text}"
                    </h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Business:</strong> {favorite.business_name}</p>
                      <p><strong>Industry:</strong> {favorite.industry}</p>
                      <p><strong>Personality:</strong> {favorite.personality}</p>
                      {favorite.explanation && (
                        <p className="bg-gray-50 p-2 rounded mt-2">
                          <strong>Why this works:</strong> {favorite.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button className="p-2 text-gray-400 hover:text-red-500 rounded-lg transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No matching slogans found' : 'No saved slogans yet'}
            </h2>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Start generating slogans and save your favorites here'
              }
            </p>
            {!searchTerm && (
              <a href="/generate" className="btn btn-brand">
                Generate Slogans
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default FavoritesPage