import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target, 
  CheckCircle, 
  Clock,
  ArrowRight,
  Star,
  Zap,
  Brain
} from 'lucide-react';

const AnalysisResults = ({ analysis, healthScore, recommendations, actionItems }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-50 border-red-200 text-red-800';
      case 'medium': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'low': return 'bg-green-50 border-green-200 text-green-800';
      case 'urgent': return 'bg-purple-50 border-purple-200 text-purple-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'visual': return '🎨';
      case 'messaging': return '💬';
      case 'marketing': return '📈';
      case 'positioning': return '🎯';
      default: return '💡';
    }
  };

  const getEffortColor = (effort) => {
    switch (effort) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Brain },
    { id: 'recommendations', name: 'Recommendations', icon: Star },
    { id: 'actions', name: 'Action Items', icon: CheckCircle },
    { id: 'insights', name: 'Market Insights', icon: Target }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">AI Brand Analysis Results</h2>
            <p className="text-gray-600 mt-1">Comprehensive insights and recommendations for your brand</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{healthScore}%</div>
            <div className="text-sm text-gray-600">Brand Health Score</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Analysis Summary</h3>
              <p className="text-blue-800">{analysis?.brand_health_summary}</p>
            </div>

            {/* SWOT Analysis Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strengths */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
                  <h3 className="font-medium text-green-900">Strengths</h3>
                </div>
                <ul className="space-y-2">
                  {analysis?.strengths?.map((strength, index) => (
                    <li key={index} className="text-green-800 text-sm flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Opportunities */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <Target className="w-5 h-5 text-blue-600 mr-2" />
                  <h3 className="font-medium text-blue-900">Opportunities</h3>
                </div>
                <ul className="space-y-2">
                  {analysis?.opportunities?.map((opportunity, index) => (
                    <li key={index} className="text-blue-800 text-sm flex items-start">
                      <ArrowRight className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      {opportunity}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                  <h3 className="font-medium text-yellow-900">Areas for Improvement</h3>
                </div>
                <ul className="space-y-2">
                  {analysis?.weaknesses?.map((weakness, index) => (
                    <li key={index} className="text-yellow-800 text-sm flex items-start">
                      <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                      {weakness}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Threats */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <TrendingDown className="w-5 h-5 text-red-600 mr-2" />
                  <h3 className="font-medium text-red-900">Potential Challenges</h3>
                </div>
                <ul className="space-y-2">
                  {analysis?.threats?.map((threat, index) => (
                    <li key={index} className="text-red-800 text-sm flex items-start">
                      <TrendingDown className="w-4 h-4 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                      {threat}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Strategic Recommendations</h3>
              <span className="text-sm text-gray-600">{recommendations?.length || 0} recommendations</span>
            </div>
            
            <div className="space-y-4">
              {recommendations?.map((rec, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{getCategoryIcon(rec.category)}</span>
                      <div>
                        <h4 className="font-medium text-gray-900">{rec.action}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(rec.priority)}`}>
                            {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)} Priority
                          </span>
                          <span className="text-xs text-gray-500 capitalize">{rec.category}</span>
                        </div>
                      </div>
                    </div>
                    {rec.timeline && (
                      <div className="text-right">
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="w-3 h-3 mr-1" />
                          {rec.timeline}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-gray-700 text-sm mb-3">{rec.reasoning}</p>
                  
                  {rec.expected_impact && (
                    <div className="bg-gray-50 rounded p-3">
                      <p className="text-sm text-gray-600">
                        <strong>Expected Impact:</strong> {rec.expected_impact}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'actions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Action Items</h3>
              <span className="text-sm text-gray-600">{actionItems?.length || 0} tasks</span>
            </div>
            
            <div className="space-y-3">
              {actionItems?.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(item.priority)}`}>
                          {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
                        </span>
                        <span className={`text-xs font-medium ${getEffortColor(item.effort)}`}>
                          {item.effort?.charAt(0).toUpperCase() + item.effort?.slice(1)} Effort
                        </span>
                        <span className={`text-xs font-medium ${getImpactColor(item.impact)}`}>
                          {item.impact?.charAt(0).toUpperCase() + item.impact?.slice(1)} Impact
                        </span>
                      </div>
                      <p className="text-gray-900 font-medium">{item.task}</p>
                    </div>
                    <button className="ml-4 text-gray-400 hover:text-gray-600">
                      <CheckCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Market Insights</h3>
            
            {analysis?.market_insights && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Positioning Effectiveness</h4>
                  <p className="text-blue-800 text-sm">{analysis.market_insights.positioning_effectiveness}</p>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-medium text-purple-900 mb-2">Differentiation Strength</h4>
                  <p className="text-purple-800 text-sm">{analysis.market_insights.differentiation_strength}</p>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">Growth Potential</h4>
                  <p className="text-green-800 text-sm">{analysis.market_insights.growth_potential}</p>
                </div>
              </div>
            )}

            {/* Analysis Timestamp */}
            <div className="border-t border-gray-200 pt-4">
              <p className="text-xs text-gray-500">
                Analysis generated on {new Date().toLocaleDateString()} using AI Brand Intelligence Engine v2.0
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisResults;