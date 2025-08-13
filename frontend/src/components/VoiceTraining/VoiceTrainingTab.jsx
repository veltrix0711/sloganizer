import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { 
  Upload, 
  FileText, 
  Globe, 
  Brain, 
  TrendingUp, 
  Trash2, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Upload as UploadIcon
} from 'lucide-react';
import VoiceContentUpload from './VoiceContentUpload';
import VoiceProfileSummary from './VoiceProfileSummary';
import VoiceTrainingProgress from './VoiceTrainingProgress';
import VoiceSamplesList from './VoiceSamplesList';

const VoiceTrainingTab = ({ brandProfile, onUpdate }) => {
  const [voiceStatus, setVoiceStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upload');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (brandProfile?.id) {
      fetchVoiceStatus();
    }
  }, [brandProfile?.id]);

  const fetchVoiceStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/voice-training/profiles/${brandProfile.id}/status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setVoiceStatus(data);
      } else {
        console.error('Failed to fetch voice status');
      }
    } catch (error) {
      console.error('Error fetching voice status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchVoiceStatus();
    setRefreshing(false);
  };

  const handleRetrain = async () => {
    try {
      setRefreshing(true);
      const response = await fetch(`/api/voice-training/profiles/${brandProfile.id}/retrain`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await fetchVoiceStatus();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to retrain voice profile');
      }
    } catch (error) {
      console.error('Error retraining voice profile:', error);
      alert('Failed to retrain voice profile');
    } finally {
      setRefreshing(false);
    }
  };

  const getTrainingStatusColor = (status) => {
    switch (status) {
      case 'trained': return 'bg-green-100 text-green-800';
      case 'training': return 'bg-blue-100 text-blue-800';
      case 'collecting_samples': return 'bg-yellow-100 text-yellow-800';
      case 'not_started': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrainingStatusIcon = (status) => {
    switch (status) {
      case 'trained': return <CheckCircle className="w-4 h-4" />;
      case 'training': return <Brain className="w-4 h-4" />;
      case 'collecting_samples': return <Upload className="w-4 h-4" />;
      case 'not_started': return <AlertCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Brand Voice Training</h2>
          <p className="text-gray-600 mt-1">
            Train your AI to understand and replicate your brand's unique voice and tone
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {voiceStatus?.progress?.analyzed_samples >= 3 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetrain}
              disabled={refreshing}
            >
              <Brain className="w-4 h-4 mr-2" />
              Retrain
            </Button>
          )}
        </div>
      </div>

      {/* Status Overview */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Training Status */}
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Badge className={`${getTrainingStatusColor(voiceStatus?.brandProfile?.voice_training_status)} flex items-center gap-1`}>
                  {getTrainingStatusIcon(voiceStatus?.brandProfile?.voice_training_status)}
                  {voiceStatus?.brandProfile?.voice_training_status?.replace('_', ' ') || 'Not Started'}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">Training Status</p>
            </div>

            {/* Confidence Score */}
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {Math.round((voiceStatus?.progress?.confidence_score || 0) * 100)}%
              </div>
              <p className="text-sm text-gray-600">Voice Confidence</p>
            </div>

            {/* Sample Count */}
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {voiceStatus?.progress?.analyzed_samples || 0}
              </div>
              <p className="text-sm text-gray-600">Training Samples</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Training Progress */}
      <VoiceTrainingProgress 
        progress={voiceStatus?.progress}
        brandProfile={voiceStatus?.brandProfile}
      />

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('upload')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'upload'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <UploadIcon className="w-4 h-4 inline mr-2" />
            Upload Content
          </button>
          <button
            onClick={() => setActiveTab('samples')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'samples'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Samples ({voiceStatus?.samples?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'profile'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <TrendingUp className="w-4 h-4 inline mr-2" />
            Voice Profile
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'upload' && (
          <VoiceContentUpload
            brandProfileId={brandProfile.id}
            onUploadComplete={fetchVoiceStatus}
          />
        )}

        {activeTab === 'samples' && (
          <VoiceSamplesList
            samples={voiceStatus?.samples || []}
            onSampleDeleted={fetchVoiceStatus}
          />
        )}

        {activeTab === 'profile' && (
          <VoiceProfileSummary
            voiceProfile={voiceStatus?.voiceProfile}
            brandProfile={voiceStatus?.brandProfile}
            progress={voiceStatus?.progress}
          />
        )}
      </div>
    </div>
  );
};

export default VoiceTrainingTab;