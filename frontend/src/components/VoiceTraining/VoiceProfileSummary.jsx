import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { 
  TrendingUp, 
  MessageSquare, 
  Brain, 
  Target, 
  Users, 
  Lightbulb,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const VoiceProfileSummary = ({ voiceProfile, brandProfile, progress }) => {
  const getScoreColor = (score) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-blue-600';
    if (score >= 0.4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score) => {
    if (score >= 0.8) return 'Excellent';
    if (score >= 0.6) return 'Good';
    if (score >= 0.4) return 'Fair';
    return 'Needs Improvement';
  };

  const formatToneDescription = (formalScore, friendlyScore, confidentScore) => {
    let description = '';
    
    // Formality
    if (formalScore > 0.7) description += 'Formal';
    else if (formalScore < 0.3) description += 'Casual';
    else description += 'Balanced';
    
    description += ', ';
    
    // Friendliness
    if (friendlyScore > 0.7) description += 'warm and friendly';
    else if (friendlyScore < 0.3) description += 'professional and direct';
    else description += 'approachable';
    
    description += ', ';
    
    // Confidence
    if (confidentScore > 0.7) description += 'confident and assertive';
    else if (confidentScore < 0.3) description += 'humble and careful';
    else description += 'balanced confidence';
    
    return description;
  };

  if (!voiceProfile) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Voice Profile Yet</h3>
          <p className="text-gray-600 mb-4">
            Upload at least 5 content samples to generate your first voice profile.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-blue-500 mt-0.5" />
              <div className="text-left">
                <h4 className="text-blue-900 font-medium text-sm">Getting Started</h4>
                <p className="text-blue-700 text-sm mt-1">
                  Upload diverse content like emails, blog posts, and social media to build a comprehensive voice profile.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const confidenceScore = voiceProfile.confidence_score || 0;
  const toneDescription = formatToneDescription(
    voiceProfile.tone_formal_score,
    voiceProfile.tone_friendly_score,
    voiceProfile.tone_confident_score
  );

  return (
    <div className="space-y-6">
      {/* Voice Profile Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Voice Profile Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Confidence Score */}
          <div className="text-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {Math.round(confidenceScore * 100)}%
            </div>
            <p className="text-lg font-medium text-gray-900 mb-1">Voice Confidence</p>
            <Badge className={`${confidenceScore >= 0.7 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              {getScoreLabel(confidenceScore)}
            </Badge>
            <p className="text-sm text-gray-600 mt-2">
              Based on {voiceProfile.training_sample_count} training samples
            </p>
          </div>

          {/* Voice Description */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Brand Voice Description</h4>
            <p className="text-gray-700 bg-gray-50 rounded-lg p-4 text-lg">
              Your brand voice is <strong>{toneDescription}</strong>.
            </p>
          </div>

          {/* Training Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-xl font-bold text-blue-600 mb-1">
                {voiceProfile.training_sample_count}
              </div>
              <p className="text-xs text-gray-600">Training Samples</p>
            </div>
            
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-xl font-bold text-green-600 mb-1">
                {voiceProfile.total_word_count?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-gray-600">Total Words</p>
            </div>
            
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-xl font-bold text-purple-600 mb-1">
                v{voiceProfile.training_version}
              </div>
              <p className="text-xs text-gray-600">Profile Version</p>
            </div>
            
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-xl font-bold text-orange-600 mb-1">
                {voiceProfile.avg_sentence_length?.toFixed(1) || 0}
              </div>
              <p className="text-xs text-gray-600">Avg Sentence Length</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Voice Characteristics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Voice Characteristics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tone Scores */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Tone Analysis</h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-700">Formality</span>
                  <span className="text-sm font-medium">
                    {Math.round((voiceProfile.tone_formal_score || 0) * 100)}%
                  </span>
                </div>
                <Progress value={(voiceProfile.tone_formal_score || 0) * 100} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">
                  {voiceProfile.tone_formal_score > 0.6 ? 'Formal tone' : 
                   voiceProfile.tone_formal_score < 0.4 ? 'Casual tone' : 'Balanced formality'}
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-700">Friendliness</span>
                  <span className="text-sm font-medium">
                    {Math.round((voiceProfile.tone_friendly_score || 0) * 100)}%
                  </span>
                </div>
                <Progress value={(voiceProfile.tone_friendly_score || 0) * 100} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">
                  {voiceProfile.tone_friendly_score > 0.6 ? 'Warm and approachable' : 
                   voiceProfile.tone_friendly_score < 0.4 ? 'Professional and direct' : 'Balanced friendliness'}
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-700">Confidence</span>
                  <span className="text-sm font-medium">
                    {Math.round((voiceProfile.tone_confident_score || 0) * 100)}%
                  </span>
                </div>
                <Progress value={(voiceProfile.tone_confident_score || 0) * 100} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">
                  {voiceProfile.tone_confident_score > 0.6 ? 'Confident and assertive' : 
                   voiceProfile.tone_confident_score < 0.4 ? 'Humble and careful' : 'Balanced confidence'}
                </p>
              </div>
            </div>
          </div>

          {/* Complexity and Emotion */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Writing Style</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-700">Complexity</span>
                    <span className="text-sm font-medium">
                      {Math.round((voiceProfile.complexity_score || 0) * 100)}%
                    </span>
                  </div>
                  <Progress value={(voiceProfile.complexity_score || 0) * 100} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-700">Emotional Expression</span>
                    <span className="text-sm font-medium">
                      {Math.round((voiceProfile.emotional_score || 0) * 100)}%
                    </span>
                  </div>
                  <Progress value={(voiceProfile.emotional_score || 0) * 100} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-700">Readability</span>
                    <span className="text-sm font-medium">
                      {Math.round((voiceProfile.readability_score || 0) * 100)}%
                    </span>
                  </div>
                  <Progress value={(voiceProfile.readability_score || 0) * 100} className="h-2" />
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Style Markers</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Uses contractions</span>
                  <Badge variant={voiceProfile.uses_contractions ? 'default' : 'secondary'}>
                    {voiceProfile.uses_contractions ? 'Yes' : 'No'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Uses exclamations</span>
                  <Badge variant={voiceProfile.uses_exclamations ? 'default' : 'secondary'}>
                    {voiceProfile.uses_exclamations ? 'Yes' : 'No'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Asks questions</span>
                  <Badge variant={voiceProfile.uses_questions ? 'default' : 'secondary'}>
                    {voiceProfile.uses_questions ? 'Yes' : 'No'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Uses humor</span>
                  <Badge variant={voiceProfile.uses_humor ? 'default' : 'secondary'}>
                    {voiceProfile.uses_humor ? 'Yes' : 'No'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Storytelling</span>
                  <Badge variant={voiceProfile.uses_storytelling ? 'default' : 'secondary'}>
                    {voiceProfile.uses_storytelling ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Brand Keywords and Phrases */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Common Phrases */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Common Phrases
            </CardTitle>
          </CardHeader>
          <CardContent>
            {voiceProfile.common_phrases && voiceProfile.common_phrases.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {voiceProfile.common_phrases.slice(0, 10).map((phrase, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    "{phrase}"
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No common phrases identified yet</p>
            )}
          </CardContent>
        </Card>

        {/* Brand Keywords */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Brand Keywords
            </CardTitle>
          </CardHeader>
          <CardContent>
            {voiceProfile.brand_keywords && voiceProfile.brand_keywords.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {voiceProfile.brand_keywords.slice(0, 15).map((keyword, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No brand keywords identified yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Last Training Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>
                Last trained: {voiceProfile.last_trained_at ? 
                  new Date(voiceProfile.last_trained_at).toLocaleDateString() : 
                  'Never'
                }
              </span>
            </div>
            <div className="flex items-center gap-2">
              {confidenceScore >= 0.7 ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-green-600">Ready for generation</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                  <span className="text-yellow-600">Needs more training data</span>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceProfileSummary;