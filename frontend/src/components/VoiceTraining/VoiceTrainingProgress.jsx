import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { 
  TrendingUp, 
  Target, 
  CheckCircle, 
  Clock, 
  BarChart3,
  AlertTriangle
} from 'lucide-react';

const VoiceTrainingProgress = ({ progress, brandProfile }) => {
  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  const getStatusMessage = () => {
    if (!progress) return 'No training data available';
    
    const { total_samples, analyzed_samples, confidence_score, ready_for_generation } = progress;
    
    if (ready_for_generation) {
      return 'Voice profile is ready for content generation! 🎉';
    }
    
    if (analyzed_samples === 0) {
      return 'Upload your first content sample to begin voice training';
    }
    
    if (analyzed_samples < 5) {
      return `Upload ${5 - analyzed_samples} more samples to build a basic voice profile`;
    }
    
    if (confidence_score < 0.7) {
      return 'Upload more diverse content samples to improve voice accuracy';
    }
    
    return 'Keep adding samples to enhance your voice profile';
  };

  const getRecommendations = () => {
    if (!progress) return [];
    
    const recommendations = [];
    const { total_samples, analyzed_samples, confidence_score, recommended_min_samples } = progress;
    
    if (analyzed_samples < recommended_min_samples) {
      recommendations.push({
        type: 'samples',
        message: `Upload ${recommended_min_samples - analyzed_samples} more content samples`,
        priority: 'high'
      });
    }
    
    if (confidence_score < 0.6) {
      recommendations.push({
        type: 'diversity',
        message: 'Add more diverse content types (emails, social posts, blogs)',
        priority: 'medium'
      });
    }
    
    if (analyzed_samples >= 10 && confidence_score < 0.8) {
      recommendations.push({
        type: 'quality',
        message: 'Focus on high-quality, authentic brand content',
        priority: 'medium'
      });
    }
    
    return recommendations;
  };

  const analysisProgress = progress?.analysis_progress || 0;
  const confidencePercentage = Math.round((progress?.confidence_score || 0) * 100);
  const recommendations = getRecommendations();

  return (
    <div className="space-y-6">
      {/* Main Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Training Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Message */}
          <div className="text-center">
            <p className="text-lg font-medium text-gray-900 mb-2">
              {getStatusMessage()}
            </p>
            {progress?.ready_for_generation && (
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="w-4 h-4 mr-1" />
                Ready for Generation
              </Badge>
            )}
          </div>

          {/* Progress Bars */}
          <div className="space-y-4">
            {/* Sample Collection Progress */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Content Samples</span>
                <span className="text-sm text-gray-600">
                  {progress?.analyzed_samples || 0} / {progress?.recommended_min_samples || 10}
                </span>
              </div>
              <Progress 
                value={Math.min(100, ((progress?.analyzed_samples || 0) / (progress?.recommended_min_samples || 10)) * 100)}
                className="h-2"
              />
            </div>

            {/* Analysis Progress */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Analysis Complete</span>
                <span className="text-sm text-gray-600">{Math.round(analysisProgress)}%</span>
              </div>
              <Progress 
                value={analysisProgress}
                className="h-2"
              />
            </div>

            {/* Voice Confidence */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Voice Confidence</span>
                <span className="text-sm text-gray-600">{confidencePercentage}%</span>
              </div>
              <Progress 
                value={confidencePercentage}
                className="h-2"
              />
            </div>
          </div>

          {/* Progress Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {progress?.total_samples || 0}
              </div>
              <p className="text-xs text-gray-600">Total Samples</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {progress?.analyzed_samples || 0}
              </div>
              <p className="text-xs text-gray-600">Analyzed</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {confidencePercentage}%
              </div>
              <p className="text-xs text-gray-600">Confidence</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {progress?.training_status === 'trained' ? '✓' : '○'}
              </div>
              <p className="text-xs text-gray-600">Status</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="flex-shrink-0 mt-0.5">
                    {rec.priority === 'high' ? (
                      <AlertTriangle className="w-5 h-5 text-orange-500" />
                    ) : (
                      <TrendingUp className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{rec.message}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Priority: {rec.priority}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Training Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Training Milestones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Milestone Items */}
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                (progress?.analyzed_samples || 0) >= 1 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {(progress?.analyzed_samples || 0) >= 1 ? <CheckCircle className="w-4 h-4" /> : '1'}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">First Sample Analyzed</p>
                <p className="text-xs text-gray-600">Start building your voice profile</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                (progress?.analyzed_samples || 0) >= 5 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {(progress?.analyzed_samples || 0) >= 5 ? <CheckCircle className="w-4 h-4" /> : '5'}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Basic Voice Profile</p>
                <p className="text-xs text-gray-600">Minimum samples for voice analysis</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                (progress?.analyzed_samples || 0) >= 10 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {(progress?.analyzed_samples || 0) >= 10 ? <CheckCircle className="w-4 h-4" /> : '10'}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Recommended Threshold</p>
                <p className="text-xs text-gray-600">Good voice profile accuracy</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                progress?.ready_for_generation ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {progress?.ready_for_generation ? <CheckCircle className="w-4 h-4" /> : '✓'}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Ready for Generation</p>
                <p className="text-xs text-gray-600">High-quality voice matching</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceTrainingProgress;