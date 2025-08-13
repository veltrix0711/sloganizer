import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  FileText, 
  Calendar, 
  BarChart3, 
  Trash2, 
  Eye, 
  Globe,
  Upload,
  AlertCircle,
  CheckCircle,
  Clock,
  X
} from 'lucide-react';

const VoiceSamplesList = ({ samples, onSampleDeleted }) => {
  const [selectedSample, setSelectedSample] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const getStatusColor = (status) => {
    switch (status) {
      case 'analyzed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'analyzed': return <CheckCircle className="w-4 h-4" />;
      case 'processing': return <Clock className="w-4 h-4 animate-spin" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'failed': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getSourceIcon = (source) => {
    switch (source) {
      case 'website': return <Globe className="w-4 h-4" />;
      case 'file': return <FileText className="w-4 h-4" />;
      case 'manual': return <Upload className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const handleDeleteSample = async (sampleId) => {
    if (!confirm('Are you sure you want to delete this training sample? This will affect your voice profile.')) {
      return;
    }

    try {
      setDeletingId(sampleId);
      const response = await fetch(`/api/voice-training/samples/${sampleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        onSampleDeleted?.();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete sample');
      }
    } catch (error) {
      console.error('Delete sample error:', error);
      alert('Failed to delete sample');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getQualityColor = (score) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-blue-600';
    if (score >= 0.4) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!samples || samples.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Training Samples</h3>
          <p className="text-gray-600 mb-4">
            Upload your first content sample to start building your brand voice profile.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {samples.length}
            </div>
            <p className="text-sm text-gray-600">Total Samples</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {samples.filter(s => s.processing_status === 'analyzed').length}
            </div>
            <p className="text-sm text-gray-600">Analyzed</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600 mb-1">
              {samples.filter(s => s.processing_status === 'processing' || s.processing_status === 'pending').length}
            </div>
            <p className="text-sm text-gray-600">Processing</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {samples.reduce((sum, s) => sum + (s.word_count || 0), 0)}
            </div>
            <p className="text-sm text-gray-600">Total Words</p>
          </CardContent>
        </Card>
      </div>

      {/* Samples List */}
      <div className="space-y-4">
        {samples.map((sample) => (
          <Card key={sample.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-3">
                    {getSourceIcon(sample.content_source)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getStatusColor(sample.processing_status)}>
                          {getStatusIcon(sample.processing_status)}
                          {sample.processing_status}
                        </Badge>
                        <span className="text-sm text-gray-600 capitalize">
                          {sample.content_source}
                        </span>
                        {sample.file_name && (
                          <span className="text-sm text-gray-500">
                            • {sample.file_name}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        Uploaded {formatDate(sample.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Content Preview */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-700 line-clamp-3">
                      {sample.content_text?.substring(0, 200)}
                      {sample.content_text?.length > 200 && '...'}
                    </p>
                  </div>

                  {/* Metrics */}
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-1">
                      <BarChart3 className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{sample.word_count || 0} words</span>
                    </div>
                    
                    {sample.quality_score && (
                      <div className="flex items-center gap-1">
                        <span className="text-gray-600">Quality:</span>
                        <span className={`font-medium ${getQualityColor(sample.quality_score)}`}>
                          {Math.round(sample.quality_score * 100)}%
                        </span>
                      </div>
                    )}
                    
                    {sample.uniqueness_score && (
                      <div className="flex items-center gap-1">
                        <span className="text-gray-600">Uniqueness:</span>
                        <span className={`font-medium ${getQualityColor(sample.uniqueness_score)}`}>
                          {Math.round(sample.uniqueness_score * 100)}%
                        </span>
                      </div>
                    )}

                    {sample.source_url && (
                      <a
                        href={sample.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-xs"
                      >
                        View Source
                      </a>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedSample(sample)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteSample(sample.id)}
                    disabled={deletingId === sample.id}
                    className="text-red-600 hover:text-red-700"
                  >
                    {deletingId === sample.id ? (
                      <Clock className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sample Detail Modal */}
      {selectedSample && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">Sample Details</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedSample(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Sample Info */}
              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Sample Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <Badge className={getStatusColor(selectedSample.processing_status)}>
                          {selectedSample.processing_status}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Source:</span>
                        <span className="capitalize">{selectedSample.content_source}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Word Count:</span>
                        <span>{selectedSample.word_count || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Upload Date:</span>
                        <span>{formatDate(selectedSample.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {selectedSample.processing_status === 'analyzed' && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Quality Scores</h4>
                      <div className="space-y-2 text-sm">
                        {selectedSample.quality_score && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Quality Score:</span>
                            <span className={getQualityColor(selectedSample.quality_score)}>
                              {Math.round(selectedSample.quality_score * 100)}%
                            </span>
                          </div>
                        )}
                        {selectedSample.uniqueness_score && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Uniqueness:</span>
                            <span className={getQualityColor(selectedSample.uniqueness_score)}>
                              {Math.round(selectedSample.uniqueness_score * 100)}%
                            </span>
                          </div>
                        )}
                        {selectedSample.analysis_completed_at && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Analyzed:</span>
                            <span>{formatDate(selectedSample.analysis_completed_at)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Content</h4>
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap max-h-96 overflow-y-auto">
                  {selectedSample.content_text}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceSamplesList;