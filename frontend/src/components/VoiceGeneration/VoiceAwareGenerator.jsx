import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { 
  Brain, 
  Sparkles, 
  MessageSquare, 
  Copy, 
  RefreshCw, 
  CheckCircle,
  AlertCircle,
  Loader2,
  Zap,
  Target,
  TrendingUp
} from 'lucide-react';

const VoiceAwareGenerator = ({ brandProfile, contentType = 'general' }) => {
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [voiceMatchScore, setVoiceMatchScore] = useState(0);
  const [usedVoiceProfile, setUsedVoiceProfile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState(null);

  useEffect(() => {
    if (brandProfile?.id) {
      checkVoiceStatus();
    }
  }, [brandProfile?.id]);

  const checkVoiceStatus = async () => {
    try {
      const response = await fetch(`/api/voice-training/profiles/${brandProfile.id}/status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setVoiceStatus(data);
      }
    } catch (error) {
      console.error('Error checking voice status:', error);
    }
  };

  const generateContent = async () => {
    if (!prompt.trim()) {
      alert('Please enter a content prompt');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/voice-training/generate-content', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          brandProfileId: brandProfile.id,
          prompt,
          contentType
        })
      });

      if (response.ok) {
        const result = await response.json();
        setGeneratedContent(result.content);
        setVoiceMatchScore(result.voiceMatchScore || 0);
        setUsedVoiceProfile(result.usedVoiceProfile || false);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to generate content');
      }
    } catch (error) {
      console.error('Error generating content:', error);
      alert('Failed to generate content');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const getVoiceStatusBadge = () => {
    if (!voiceStatus) return null;

    const { progress } = voiceStatus;
    if (progress?.ready_for_generation) {
      return (
        <Badge className="bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Voice Ready
        </Badge>
      );
    }

    if (progress?.analyzed_samples >= 3) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800">
          <Brain className="w-3 h-3 mr-1" />
          Training
        </Badge>
      );
    }

    return (
      <Badge className="bg-gray-100 text-gray-800">
        <AlertCircle className="w-3 h-3 mr-1" />
        No Voice Profile
      </Badge>
    );
  };

  const getVoiceMatchBadge = () => {
    if (!usedVoiceProfile) {
      return (
        <Badge variant="secondary">
          <MessageSquare className="w-3 h-3 mr-1" />
          Standard Generation
        </Badge>
      );
    }

    const score = Math.round(voiceMatchScore * 100);
    let variant = 'secondary';
    let label = 'Voice Match';

    if (score >= 80) {
      variant = 'success';
      label = 'Excellent Voice Match';
    } else if (score >= 60) {
      variant = 'default';
      label = 'Good Voice Match';
    } else if (score >= 40) {
      variant = 'warning';
      label = 'Fair Voice Match';
    }

    return (
      <Badge variant={variant}>
        <Sparkles className="w-3 h-3 mr-1" />
        {label} ({score}%)
      </Badge>
    );
  };

  const contentPrompts = {
    general: [
      "Write a welcome message for new customers",
      "Create a product announcement",
      "Draft a company update",
      "Write an about us section"
    ],
    marketing: [
      "Create a compelling product description",
      "Write ad copy for a new campaign",
      "Draft email marketing content",
      "Create social media captions"
    ],
    blog: [
      "Write an introduction for a blog post about industry trends",
      "Create a how-to article outline",
      "Draft a company news article",
      "Write a thought leadership piece"
    ],
    social: [
      "Create an engaging Instagram post",
      "Write a LinkedIn company update",
      "Draft Twitter announcement",
      "Create Facebook community post"
    ]
  };

  return (
    <div className="space-y-6">
      {/* Voice Status Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Voice-Aware Content Generation
            </CardTitle>
            {getVoiceStatusBadge()}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Generate content that matches your brand's unique voice and tone
          </p>
        </CardHeader>
      </Card>

      {/* Voice Status Warning */}
      {voiceStatus && !voiceStatus.progress?.ready_for_generation && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-yellow-800 font-medium">Voice Profile Not Ready</h4>
                <p className="text-yellow-700 text-sm mt-1">
                  {voiceStatus.progress?.analyzed_samples < 5 
                    ? `Upload ${5 - (voiceStatus.progress?.analyzed_samples || 0)} more content samples to enable voice-aware generation.`
                    : 'Your voice profile needs more training data for optimal results.'
                  }
                </p>
                <p className="text-yellow-600 text-xs mt-2">
                  Content will be generated using standard AI without voice matching.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content Generation Form */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Content Type Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content Type
            </label>
            <div className="flex flex-wrap gap-2">
              {['general', 'marketing', 'blog', 'social'].map((type) => (
                <Button
                  key={type}
                  variant={contentType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    // This would be handled by parent component
                  }}
                  className="capitalize"
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>

          {/* Prompt Suggestions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Prompts
            </label>
            <div className="flex flex-wrap gap-2">
              {(contentPrompts[contentType] || contentPrompts.general).map((suggestion, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={() => setPrompt(suggestion)}
                  className="text-xs h-auto py-1 px-2 whitespace-normal text-left"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>

          {/* Prompt Input */}
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
              Content Prompt *
            </label>
            <Textarea
              id="prompt"
              placeholder="Describe what content you want to generate..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
            />
          </div>

          {/* Generate Button */}
          <Button 
            onClick={generateContent}
            disabled={loading || !prompt.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Content...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Content
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Content */}
      {generatedContent && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Generated Content
              </CardTitle>
              <div className="flex items-center gap-2">
                {getVoiceMatchBadge()}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  className="ml-2"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-4 text-gray-900 whitespace-pre-wrap font-mono text-sm">
              {generatedContent}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Voice Profile Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Improve Voice Matching
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-gray-900">Upload More Samples</h4>
                <p className="text-sm text-gray-600">
                  Add diverse content samples (emails, blogs, social posts) to improve voice accuracy
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-gray-900">Quality Over Quantity</h4>
                <p className="text-sm text-gray-600">
                  Focus on authentic, high-quality brand content that represents your true voice
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <RefreshCw className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-gray-900">Regular Updates</h4>
                <p className="text-sm text-gray-600">
                  Retrain your voice profile periodically as your brand voice evolves
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceAwareGenerator;