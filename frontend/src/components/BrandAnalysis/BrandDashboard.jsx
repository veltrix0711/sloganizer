import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Lightbulb, 
  BarChart3, 
  Sparkles,
  Calendar,
  CheckCircle,
  AlertCircle,
  Zap,
  RefreshCw
} from 'lucide-react';
import { apiRequest } from '../../utils/api';
import toast from 'react-hot-toast';

const BrandDashboard = ({ brandProfile, onAnalyze, onGenerateContent }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (brandProfile?.id) {
      loadDashboardData();
    }
  }, [brandProfile]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await apiRequest(`/api/brand-analysis/dashboard/${brandProfile.id}`);
      setDashboardData(data.dashboard);
    } catch (error) {
      console.error('Load dashboard error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const runBrandAnalysis = async () => {
    try {
      setAnalyzing(true);
      const result = await apiRequest(`/api/brand-analysis/analyze/${brandProfile.id}`, {
        method: 'POST'
      });
      
      toast.success('Brand analysis completed!');
      loadDashboardData(); // Refresh dashboard
      if (onAnalyze) onAnalyze(result);
      
    } catch (error) {
      console.error('Brand analysis error:', error);
      toast.error('Failed to analyze brand');
    } finally {
      setAnalyzing(false);
    }
  };

  const getHealthScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getHealthScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Work';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
        <Brain className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">AI Brand Analysis</h3>
        <p className="text-gray-600 mb-6">
          Get AI-powered insights about your brand's strengths, opportunities, and recommendations.
        </p>
        <button
          onClick={runBrandAnalysis}
          disabled={analyzing}
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {analyzing ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Analyze Brand
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Main Metrics */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">{dashboardData.brandName}</h2>
            <p className="text-blue-100">AI Brand Intelligence Dashboard</p>
          </div>
          <button
            onClick={runBrandAnalysis}
            disabled={analyzing}
            className="bg-white/20 backdrop-blur text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50"
          >
            {analyzing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin inline" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2 inline" />
                Re-analyze
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Brand Health</p>
                <p className="text-2xl font-bold">{dashboardData.healthScore}%</p>
                <p className="text-blue-200 text-sm">{getHealthScoreLabel(dashboardData.healthScore)}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-200" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Profile Complete</p>
                <p className="text-2xl font-bold">{dashboardData.completionPercentage}%</p>
                <p className="text-blue-200 text-sm">
                  {dashboardData.completionPercentage >= 80 ? 'Comprehensive' : 'In Progress'}
                </p>
              </div>
              <Target className="w-8 h-8 text-blue-200" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">AI Insights</p>
                <p className="text-2xl font-bold">{dashboardData.recommendations}</p>
                <p className="text-blue-200 text-sm">Recommendations</p>
              </div>
              <Lightbulb className="w-8 h-8 text-blue-200" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Content Ideas</p>
                <p className="text-2xl font-bold">{dashboardData.unusedSuggestions}</p>
                <p className="text-blue-200 text-sm">Ready to use</p>
              </div>
              <Sparkles className="w-8 h-8 text-blue-200" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <Brain className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Brand Analysis</h3>
              <p className="text-sm text-gray-600">AI-powered insights</p>
            </div>
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Strengths:</span>
              <span className="font-medium">{dashboardData.strengths}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Opportunities:</span>
              <span className="font-medium">{dashboardData.opportunities}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Last Analysis:</span>
              <span className="font-medium">
                {dashboardData.lastAnalysis 
                  ? new Date(dashboardData.lastAnalysis).toLocaleDateString()
                  : 'Never'
                }
              </span>
            </div>
          </div>
          
          <button
            onClick={runBrandAnalysis}
            disabled={analyzing}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {analyzing ? 'Analyzing...' : 'Run Analysis'}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
              <Zap className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Content Generation</h3>
              <p className="text-sm text-gray-600">AI content ideas</p>
            </div>
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Unused Ideas:</span>
              <span className="font-medium">{dashboardData.unusedSuggestions}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Categories:</span>
              <span className="font-medium">Social, Blog, Email</span>
            </div>
          </div>
          
          <button
            onClick={() => onGenerateContent && onGenerateContent('social_post')}
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Generate Content
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Growth Tracking</h3>
              <p className="text-sm text-gray-600">Performance metrics</p>
            </div>
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Analyses:</span>
              <span className="font-medium">{dashboardData.analysisCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Health Trend:</span>
              <span className="font-medium text-green-600">↗ Improving</span>
            </div>
          </div>
          
          <button
            className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors"
            onClick={() => {/* TODO: Navigate to detailed analytics */}}
          >
            View Analytics
          </button>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Brand Status</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center">
              {dashboardData.completionPercentage >= 80 ? (
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-500 mr-3" />
              )}
              <span className="text-sm font-medium">Profile Completeness</span>
              <span className="ml-auto text-sm text-gray-600">{dashboardData.completionPercentage}%</span>
            </div>
            
            <div className="flex items-center">
              {dashboardData.healthScore >= 70 ? (
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-500 mr-3" />
              )}
              <span className="text-sm font-medium">Brand Health</span>
              <span className="ml-auto text-sm text-gray-600">{getHealthScoreLabel(dashboardData.healthScore)}</span>
            </div>
            
            <div className="flex items-center">
              {dashboardData.lastAnalysis ? (
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
              ) : (
                <AlertCircle className="w-5 h-5 text-gray-400 mr-3" />
              )}
              <span className="text-sm font-medium">AI Analysis</span>
              <span className="ml-auto text-sm text-gray-600">
                {dashboardData.lastAnalysis ? 'Up to date' : 'Pending'}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center">
              {dashboardData.unusedSuggestions > 0 ? (
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
              ) : (
                <AlertCircle className="w-5 h-5 text-gray-400 mr-3" />
              )}
              <span className="text-sm font-medium">Content Suggestions</span>
              <span className="ml-auto text-sm text-gray-600">
                {dashboardData.unusedSuggestions} available
              </span>
            </div>
            
            <div className="flex items-center">
              {dashboardData.recommendations > 0 ? (
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
              ) : (
                <AlertCircle className="w-5 h-5 text-gray-400 mr-3" />
              )}
              <span className="text-sm font-medium">AI Recommendations</span>
              <span className="ml-auto text-sm text-gray-600">
                {dashboardData.recommendations} insights
              </span>
            </div>
            
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-blue-500 mr-3" />
              <span className="text-sm font-medium">Last Updated</span>
              <span className="ml-auto text-sm text-gray-600">
                {dashboardData.lastAnalysis 
                  ? new Date(dashboardData.lastAnalysis).toLocaleDateString()
                  : 'Never'
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandDashboard;