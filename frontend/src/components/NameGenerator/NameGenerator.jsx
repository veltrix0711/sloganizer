import React, { useState, useEffect } from 'react';
import { useAuth } from '../../services/authContext';
import { apiRequest } from '../../utils/api';
import toast from 'react-hot-toast';
import { 
  Sparkles, 
  Search, 
  Heart, 
  HeartOff, 
  Globe, 
  Check, 
  X, 
  Loader2,
  RefreshCw,
  Building,
  Filter,
  Download
} from 'lucide-react';
import NameGeneratorForm from './NameGeneratorForm';
import NameCard from './NameCard';
import BrandProfileSelector from '../BrandProfile/BrandProfileSelector';

const NameGenerator = () => {
  const { user } = useAuth();
  const [names, setNames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [filter, setFilter] = useState('all'); // all, favorites, available
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      loadGeneratedNames();
    }
  }, [user, selectedProfile, filter]);

  const loadGeneratedNames = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: '50',
        offset: '0'
      });

      if (selectedProfile) {
        params.append('brandProfileId', selectedProfile.id);
      }

      if (filter === 'favorites') {
        params.append('favoritesOnly', 'true');
      }

      const data = await apiRequest(`/api/names/names?${params}`);
      setNames(data.names || []);

    } catch (error) {
      console.error('Load names error:', error);
      toast.error('Failed to load generated names');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (formData) => {
    try {
      setGenerating(true);
      
      const payload = {
        ...formData,
        brandProfileId: selectedProfile?.id,
        checkDomains: true
      };

      const data = await apiRequest('/api/names/generate', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      
      if (data.success) {
        toast.success(`Generated ${data.names.length} business names!`);
        // Add new names to the beginning of the list
        setNames(prev => [...data.names, ...prev]);
      } else {
        throw new Error(data.error || 'Generation failed');
      }

    } catch (error) {
      console.error('Name generation error:', error);
      toast.error(error.message || 'Failed to generate names');
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleFavorite = async (nameId, isFavorite) => {
    try {
      const data = await apiRequest(`/api/names/names/${nameId}/favorite`, {
        method: 'PATCH',
        body: JSON.stringify({ isFavorite }),
      });
      
      // Update the name in the list
      setNames(prev => 
        prev.map(name => 
          name.id === nameId 
            ? { ...name, is_favorite: isFavorite }
            : name
        )
      );

      toast.success(isFavorite ? 'Added to favorites' : 'Removed from favorites');

    } catch (error) {
      console.error('Toggle favorite error:', error);
      toast.error('Failed to update favorite');
    }
  };

  const handleClaimName = async (nameId) => {
    try {
      const data = await apiRequest(`/api/names/names/${nameId}/claim`, {
        method: 'PATCH',
      });

      // Update the name in the list
      setNames(prev => 
        prev.map(name => 
          name.id === nameId 
            ? { ...name, is_claimed: true }
            : name
        )
      );

      toast.success('Name marked as claimed!');

    } catch (error) {
      console.error('Claim name error:', error);
      toast.error('Failed to claim name');
    }
  };

  const handleDeleteName = async (nameId) => {
    if (!confirm('Are you sure you want to delete this name?')) {
      return;
    }

    try {
      const data = await apiRequest(`/api/names/names/${nameId}`, {
        method: 'DELETE',
      });

      setNames(prev => prev.filter(name => name.id !== nameId));
      toast.success('Name deleted successfully');

    } catch (error) {
      console.error('Delete name error:', error);
      toast.error('Failed to delete name');
    }
  };

  const handleCheckDomains = async (nameIds) => {
    try {
      setLoading(true);
      
      const data = await apiRequest('/api/names/check-domains', {
        method: 'POST',
        body: JSON.stringify({ nameIds }),
      });
      
      // Update names with domain info
      setNames(prev => 
        prev.map(name => {
          const result = data.results.find(r => r.id === name.id);
          return result ? {
            ...name,
            domain_available: result.domainAvailable,
            available_extensions: result.availableExtensions,
            domain_checked_at: new Date().toISOString()
          } : name;
        })
      );

      toast.success('Domain availability updated!');

    } catch (error) {
      console.error('Domain check error:', error);
      toast.error('Failed to check domains');
    } finally {
      setLoading(false);
    }
  };

  const filteredNames = names.filter(name => {
    // Apply search filter
    if (searchTerm && !name.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Apply availability filter
    if (filter === 'available' && !name.domain_available) {
      return false;
    }

    if (filter === 'favorites' && !name.is_favorite) {
      return false;
    }

    return true;
  });

  const availableCount = names.filter(n => n.domain_available).length;
  const favoriteCount = names.filter(n => n.is_favorite).length;

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-blue-600" />
              Business Name Generator
            </h1>
            <p className="text-gray-600 mt-2">
              Generate AI-powered business names with domain availability checking
            </p>
          </div>
          <div className="flex items-center gap-4">
            <BrandProfileSelector
              selectedProfile={selectedProfile}
              onProfileChange={setSelectedProfile}
              allowNone={true}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-gray-900">{names.length}</div>
            <div className="text-sm text-gray-500">Total Names</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-green-600">{availableCount}</div>
            <div className="text-sm text-gray-500">Available Domains</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-red-600">{favoriteCount}</div>
            <div className="text-sm text-gray-500">Favorites</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-blue-600">
              {names.filter(n => n.is_claimed).length}
            </div>
            <div className="text-sm text-gray-500">Claimed</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Generation Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Generate Names</h2>
            <NameGeneratorForm
              onGenerate={handleGenerate}
              generating={generating}
              selectedProfile={selectedProfile}
            />
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-2">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search names..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Names</option>
                  <option value="favorites">Favorites Only</option>
                  <option value="available">Available Domains</option>
                </select>
              </div>

              {names.length > 0 && (
                <button
                  onClick={() => handleCheckDomains(names.slice(0, 10).map(n => n.id))}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  Check Domains
                </button>
              )}
            </div>
          </div>

          {/* Names List */}
          {loading && names.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : filteredNames.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              {names.length === 0 ? (
                <div>
                  <Sparkles className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No names generated yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Use the form on the left to generate your first business names.
                  </p>
                </div>
              ) : (
                <div>
                  <Search className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No names match your filters</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Try adjusting your search term or filter options.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNames.map((name) => (
                <NameCard
                  key={name.id}
                  name={name}
                  onToggleFavorite={handleToggleFavorite}
                  onClaim={handleClaimName}
                  onDelete={handleDeleteName}
                />
              ))}
              
              {filteredNames.length < names.length && (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">
                    Showing {filteredNames.length} of {names.length} names
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NameGenerator;