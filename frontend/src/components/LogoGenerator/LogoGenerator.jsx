import React, { useState, useEffect } from 'react';
import { useAuth } from '../../services/authContext';
import { apiRequest } from '../../utils/api';
import toast from 'react-hot-toast';
import { 
  Palette, 
  Loader2, 
  Star, 
  StarOff, 
  Download, 
  Trash2, 
  Eye,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon
} from 'lucide-react';
import LogoGeneratorForm from './LogoGeneratorForm';
import LogoCard from './LogoCard';
import JobStatusCard from './JobStatusCard';
import BrandProfileSelector from '../BrandProfile/BrandProfileSelector';
import CrossGeneratorSuggestions from '../Widgets/CrossGeneratorSuggestions';

const LogoGenerator = () => {
  const { user } = useAuth();
  const [logos, setLogos] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [filter, setFilter] = useState('all'); // all, primary, recent

  useEffect(() => {
    if (user) {
      loadLogos();
      loadJobs();
      
      // Set up polling for active jobs
      const interval = setInterval(() => {
        loadJobs();
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [user, selectedProfile]);

  const loadLogos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        assetType: 'logo',
        limit: '20',
        offset: '0'
      });

      if (selectedProfile) {
        params.append('brandProfileId', selectedProfile.id);
      }

      const data = await apiRequest(`/api/logos/assets?${params}`);
      setLogos(data.assets || []);

    } catch (error) {
      console.error('Load logos error:', error);
      toast.error('Failed to load logos');
    } finally {
      setLoading(false);
    }
  };

  const loadJobs = async () => {
    try {
      const data = await apiRequest('/api/logos/jobs');
      setJobs(data.jobs || []);
      
      // Check if any jobs completed and reload logos
      const completedJobs = data.jobs?.filter(j => j.status === 'completed' && j.completedAt);
      if (completedJobs?.length > 0) {
        loadLogos();
      }
    } catch (error) {
      console.error('Load jobs error:', error);
    }
  };

  const handleGenerate = async (formData) => {
    console.log('🎨 Logo generation started with data:', formData);
    try {
      setGenerating(true);
      
      const payload = {
        ...formData,
        brandProfileId: selectedProfile?.id
      };
      
      console.log('🚀 Making API request to /api/logos/generate with payload:', payload);

      const data = await apiRequest('/api/logos/generate', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      
      console.log('📥 Logo generation response:', data);
      
      if (data.success) {
        toast.success('Logo generation started! This may take 1-2 minutes.');
        // Add new job to the list
        loadJobs();
      } else {
        console.error('❌ Logo generation failed:', data);
        throw new Error(data.error || 'Generation failed');
      }

    } catch (error) {
      console.error('❌ Logo generation error:', error);
      console.error('Error details:', error.message, error.stack);
      toast.error(error.message || 'Failed to generate logos');
    } finally {
      setGenerating(false);
    }
  };

  const handleSetPrimary = async (assetId) => {
    try {
      const data = await apiRequest(`/api/logos/assets/${assetId}/primary`, {
        method: 'PATCH',
      });

      // Update the logos in state
      setLogos(prev => 
        prev.map(logo => ({
          ...logo,
          is_primary: logo.id === assetId
        }))
      );

      toast.success('Primary logo updated!');

    } catch (error) {
      console.error('Set primary logo error:', error);
      toast.error('Failed to set primary logo');
    }
  };

  const handleDeleteLogo = async (assetId) => {
    if (!confirm('Are you sure you want to delete this logo? This action cannot be undone.')) {
      return;
    }

    try {
      const data = await apiRequest(`/api/logos/assets/${assetId}`, {
        method: 'DELETE',
      });

      setLogos(prev => prev.filter(logo => logo.id !== assetId));
      toast.success('Logo deleted successfully');

    } catch (error) {
      console.error('Delete logo error:', error);
      toast.error('Failed to delete logo');
    }
  };

  const handleDownloadLogo = (logoUrl, logoName) => {
    const link = document.createElement('a');
    link.href = logoUrl;
    link.download = logoName || 'logo.png';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLogos = logos.filter(logo => {
    if (filter === 'primary' && !logo.is_primary) return false;
    if (filter === 'recent') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(logo.created_at) > weekAgo;
    }
    return true;
  });

  const activeJobs = jobs.filter(j => ['pending', 'processing'].includes(j.status));
  const recentJobs = jobs.filter(j => ['completed', 'failed'].includes(j.status)).slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Palette className="w-8 h-8 text-blue-600" />
              AI Logo Generator
            </h1>
            <p className="text-gray-600 mt-2">
              Generate professional logos with AI-powered design
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
            <div className="text-2xl font-bold text-gray-900">{logos.length}</div>
            <div className="text-sm text-gray-500">Total Logos</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-blue-600">
              {logos.filter(l => l.is_primary).length}
            </div>
            <div className="text-sm text-gray-500">Primary Logos</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-orange-600">{activeJobs.length}</div>
            <div className="text-sm text-gray-500">In Progress</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-green-600">
              {jobs.filter(j => j.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-500">Completed Jobs</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Generation Form */}
        <div className="lg:col-span-1">
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Generate Logos</h2>
              <LogoGeneratorForm
                onGenerate={handleGenerate}
                generating={generating}
                selectedProfile={selectedProfile}
              />
            </div>

            {/* Active Jobs */}
            {activeJobs.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Generation Status</h3>
                <div className="space-y-3">
                  {activeJobs.map((job) => (
                    <JobStatusCard key={job.id} job={job} />
                  ))}
                </div>
              </div>
            )}

            {/* Recent Jobs */}
            {recentJobs.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Jobs</h3>
                <div className="space-y-3">
                  {recentJobs.map((job) => (
                    <JobStatusCard key={job.id} job={job} compact />
                  ))}
                </div>
              </div>
            )}

            {/* Cross-Generator Suggestions */}
            <CrossGeneratorSuggestions
              currentGenerator="logos"
              selectedProfile={selectedProfile}
              latestAssets={{
                hasLogo: logos.length > 0,
                hasSocialContent: false // TODO: Check if user has social posts
              }}
            />
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-2">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Show:</span>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Logos</option>
                  <option value="primary">Primary Logos</option>
                  <option value="recent">Recent (7 days)</option>
                </select>
              </div>
              
              <button
                onClick={loadLogos}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Logos Grid */}
          {loading && logos.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : filteredLogos.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              {logos.length === 0 ? (
                <div>
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No logos generated yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Use the form on the left to generate your first AI logo.
                  </p>
                </div>
              ) : (
                <div>
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No logos match your filter</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Try adjusting your filter options.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredLogos.map((logo) => (
                <LogoCard
                  key={logo.id}
                  logo={logo}
                  onSetPrimary={handleSetPrimary}
                  onDelete={handleDeleteLogo}
                  onDownload={handleDownloadLogo}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogoGenerator;