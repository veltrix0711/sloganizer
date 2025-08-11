import React, { useState, useEffect } from 'react';
import { useAuth } from '../../services/authContext';
import { supabase } from '../../services/supabase';
import toast from 'react-hot-toast';
import { 
  Download, 
  Loader2, 
  FileText, 
  ExternalLink, 
  Trash2, 
  Clock,
  CheckCircle,
  AlertCircle,
  Package,
  FileImage,
  Calendar
} from 'lucide-react';
import BrandExportForm from './BrandExportForm';
import ExportCard from './ExportCard';
import BrandProfileSelector from '../BrandProfile/BrandProfileSelector';

const EXPORT_TYPES = {
  pdf: { name: 'PDF Brand Guide', icon: FileText, color: 'text-red-600', description: 'Professional PDF document' },
  notion: { name: 'Notion Template', icon: Package, color: 'text-gray-800', description: 'Notion workspace template' },
  markdown: { name: 'Markdown Guide', icon: FileText, color: 'text-blue-600', description: 'Markdown document' }
};

const BrandExportGenerator = () => {
  const { user } = useAuth();
  const [exports, setExports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [filter, setFilter] = useState('all'); // all, completed, processing, failed

  useEffect(() => {
    if (user) {
      loadExports();
      
      // Set up polling for active exports
      const interval = setInterval(() => {
        loadExports();
      }, 10000); // Poll every 10 seconds
      
      return () => clearInterval(interval);
    }
  }, [user, selectedProfile, filter]);

  const loadExports = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: '20',
        offset: '0'
      });

      if (selectedProfile) {
        params.append('brandProfileId', selectedProfile.id);
      }

      if (filter !== 'all') {
        params.append('status', filter);
      }

      const response = await fetch(`/api/exports/exports?${params}`, {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to load exports');

      const data = await response.json();
      setExports(data.exports || []);

    } catch (error) {
      console.error('Load exports error:', error);
      toast.error('Failed to load exports');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (formData) => {
    if (!selectedProfile) {
      toast.error('Please select a brand profile first');
      return;
    }

    try {
      setGenerating(true);
      
      const payload = {
        brandProfileId: selectedProfile.id,
        exportType: formData.exportType,
        exportOptions: formData.exportOptions
      };

      const response = await fetch('/api/exports/brand-kit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to start export generation');

      const data = await response.json();
      
      if (data.success) {
        toast.success(`Brand kit export started! ${data.message}`);
        loadExports();
      } else {
        throw new Error(data.error || 'Export failed');
      }

    } catch (error) {
      console.error('Export generation error:', error);
      toast.error(error.message || 'Failed to generate export');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = (exportItem) => {
    if (exportItem.downloadUrl) {
      window.open(exportItem.downloadUrl, '_blank');
      toast.success('Download started!');
    } else {
      toast.error('Download not available');
    }
  };

  const handleDelete = async (exportId) => {
    if (!confirm('Are you sure you want to delete this export? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/exports/exports/${exportId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete export');

      setExports(prev => prev.filter(exp => exp.id !== exportId));
      toast.success('Export deleted successfully');

    } catch (error) {
      console.error('Delete export error:', error);
      toast.error('Failed to delete export');
    }
  };

  const getExportStats = () => {
    const stats = {
      total: exports.length,
      completed: exports.filter(e => e.status === 'completed').length,
      processing: exports.filter(e => ['pending', 'processing'].includes(e.status)).length,
      failed: exports.filter(e => e.status === 'failed').length
    };
    
    // Type breakdown
    Object.keys(EXPORT_TYPES).forEach(type => {
      stats[type] = exports.filter(e => e.exportType === type).length;
    });

    return stats;
  };

  const stats = getExportStats();
  const activeExports = exports.filter(e => ['pending', 'processing'].includes(e.status));

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Download className="w-8 h-8 text-blue-600" />
              Brand Kit Export
            </h1>
            <p className="text-gray-600 mt-2">
              Export comprehensive brand guidelines and assets
            </p>
          </div>
          <div className="flex items-center gap-4">
            <BrandProfileSelector
              selectedProfile={selectedProfile}
              onProfileChange={setSelectedProfile}
              allowNone={false}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-500">Total Exports</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-gray-500">Completed</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-orange-600">{stats.processing}</div>
            <div className="text-sm text-gray-500">Processing</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <div className="text-sm text-gray-500">Failed</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-red-600">{stats.pdf}</div>
            <div className="text-sm text-gray-500">PDF Guides</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-gray-800">{stats.notion}</div>
            <div className="text-sm text-gray-500">Notion Templates</div>
          </div>
        </div>

        {/* Active Processing */}
        {activeExports.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-blue-800 mb-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="font-medium">
                {activeExports.length} export{activeExports.length > 1 ? 's' : ''} currently processing...
              </span>
            </div>
            <p className="text-sm text-blue-600">
              Brand kit exports typically take 30 seconds to 2 minutes depending on the content size.
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Export Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create Brand Kit</h2>
            {selectedProfile ? (
              <BrandExportForm
                onGenerate={handleGenerate}
                generating={generating}
                selectedProfile={selectedProfile}
              />
            ) : (
              <div className="text-center py-8">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Select a brand profile</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Choose a brand profile to export its guidelines and assets.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Exports List */}
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
                  <option value="all">All Exports</option>
                  <option value="completed">Completed</option>
                  <option value="processing">Processing</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              
              <button
                onClick={loadExports}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50"
              >
                <Download className={`w-4 h-4 ${loading ? 'animate-pulse' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Exports */}
          {loading && exports.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : exports.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              {selectedProfile ? (
                <div>
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No exports created yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Create your first brand kit export using the form on the left.
                  </p>
                </div>
              ) : (
                <div>
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">Select a brand profile</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Choose a brand profile to view and create exports.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {exports.map((exportItem) => (
                <ExportCard
                  key={exportItem.id}
                  exportItem={exportItem}
                  exportType={EXPORT_TYPES[exportItem.exportType]}
                  onDownload={handleDownload}
                  onDelete={handleDelete}
                />
              ))}
              
              {exports.length >= 20 && (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">
                    Showing recent exports • Older exports are automatically cleaned up
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

export default BrandExportGenerator;