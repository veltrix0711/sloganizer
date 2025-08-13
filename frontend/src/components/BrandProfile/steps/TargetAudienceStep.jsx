import React, { useState } from 'react';
import { Users, MapPin, Heart, AlertCircle, TrendingUp, Plus, X } from 'lucide-react';

const AGE_RANGES = [
  '18-24', '25-34', '35-44', '45-54', '55-64', '65+'
];

const INCOME_RANGES = [
  'Under $25k', '$25k-$50k', '$50k-$75k', '$75k-$100k', '$100k-$150k', '$150k+'
];

const INTERESTS_OPTIONS = [
  'Technology', 'Health & Fitness', 'Fashion', 'Travel', 'Food & Dining',
  'Entertainment', 'Sports', 'Education', 'Finance', 'Home & Garden',
  'Arts & Culture', 'Gaming', 'Music', 'Books', 'Photography',
  'Sustainability', 'Parenting', 'Career Development', 'Social Causes'
];

const PAIN_POINTS_COMMON = [
  'Lack of time', 'Budget constraints', 'Information overload', 'Quality concerns',
  'Trust issues', 'Complexity', 'Poor customer service', 'Limited options',
  'Inconvenience', 'Lack of expertise', 'Security concerns', 'Sustainability concerns'
];

const GEOGRAPHIC_OPTIONS = [
  'Local', 'Regional', 'National', 'International', 'Global'
];

const TargetAudienceStep = ({ formData, updateFormData, errors }) => {
  const [newInterest, setNewInterest] = useState('');
  const [newPainPoint, setNewPainPoint] = useState('');
  const [newCompetitor, setNewCompetitor] = useState({ name: '', strengths: '', weaknesses: '' });

  const updateDemographics = (type, field, value) => {
    const currentData = formData[type] || {};
    updateFormData(type, {
      ...currentData,
      [field]: value
    });
  };

  const toggleMultiSelect = (field, value) => {
    const currentArray = formData[field] || [];
    if (currentArray.includes(value)) {
      updateFormData(field, currentArray.filter(item => item !== value));
    } else {
      updateFormData(field, [...currentArray, value]);
    }
  };

  const addCustomInterest = () => {
    const interest = newInterest.trim();
    if (interest) {
      const currentInterests = formData.psychographics?.interests || [];
      updateDemographics('psychographics', 'interests', [...currentInterests, interest]);
      setNewInterest('');
    }
  };

  const removeInterest = (interestToRemove) => {
    const currentInterests = formData.psychographics?.interests || [];
    updateDemographics('psychographics', 'interests', 
      currentInterests.filter(interest => interest !== interestToRemove)
    );
  };

  const addPainPoint = () => {
    const painPoint = newPainPoint.trim();
    if (painPoint && !formData.pain_points?.includes(painPoint)) {
      updateFormData('pain_points', [...(formData.pain_points || []), painPoint]);
      setNewPainPoint('');
    }
  };

  const removePainPoint = (painPointToRemove) => {
    updateFormData('pain_points', 
      (formData.pain_points || []).filter(point => point !== painPointToRemove)
    );
  };

  const addCompetitor = () => {
    if (newCompetitor.name.trim()) {
      const currentCompetitors = formData.competitors || [];
      if (currentCompetitors.length < 5) {
        updateFormData('competitors', [...currentCompetitors, { ...newCompetitor }]);
        setNewCompetitor({ name: '', strengths: '', weaknesses: '' });
      }
    }
  };

  const removeCompetitor = (index) => {
    const currentCompetitors = formData.competitors || [];
    updateFormData('competitors', currentCompetitors.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-8">
      {/* Primary Demographics */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-blue-600" />
          Primary Demographics
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Age Range *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {AGE_RANGES.map(range => (
                <button
                  key={range}
                  type="button"
                  onClick={() => updateDemographics('primary_demographics', 'age_range', range)}
                  className={`p-3 text-sm border-2 rounded-lg transition-colors ${
                    formData.primary_demographics?.age_range === range
                      ? 'bg-blue-50 border-blue-200 text-blue-800'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
            {errors.primary_demographics && (
              <p className="mt-1 text-sm text-red-600">{errors.primary_demographics}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Income Range
            </label>
            <div className="grid grid-cols-1 gap-2">
              {INCOME_RANGES.map(range => (
                <button
                  key={range}
                  type="button"
                  onClick={() => updateDemographics('primary_demographics', 'income_range', range)}
                  className={`p-3 text-sm border-2 rounded-lg transition-colors ${
                    formData.primary_demographics?.income_range === range
                      ? 'bg-blue-50 border-blue-200 text-blue-800'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender
            </label>
            <input
              type="text"
              value={formData.primary_demographics?.gender || ''}
              onChange={(e) => updateDemographics('primary_demographics', 'gender', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., All genders, Women, Men, Non-binary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              value={formData.primary_demographics?.location || ''}
              onChange={(e) => updateDemographics('primary_demographics', 'location', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., United States, Urban areas, California"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Education Level
          </label>
          <input
            type="text"
            value={formData.primary_demographics?.education || ''}
            onChange={(e) => updateDemographics('primary_demographics', 'education', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., College-educated, High school, Graduate degree"
          />
        </div>
      </div>

      {/* Psychographics */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Heart className="w-5 h-5 mr-2 text-blue-600" />
          Psychographics
        </h4>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Interests & Hobbies
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              {INTERESTS_OPTIONS.map(interest => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => {
                    const currentInterests = formData.psychographics?.interests || [];
                    const newInterests = currentInterests.includes(interest)
                      ? currentInterests.filter(i => i !== interest)
                      : [...currentInterests, interest];
                    updateDemographics('psychographics', 'interests', newInterests);
                  }}
                  className={`p-3 text-sm border-2 rounded-lg transition-colors ${
                    formData.psychographics?.interests?.includes(interest)
                      ? 'bg-blue-50 border-blue-200 text-blue-800'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <input
                type="text"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomInterest();
                  }
                }}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add custom interest"
              />
              <button
                type="button"
                onClick={addCustomInterest}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add
              </button>
            </div>

            {formData.psychographics?.interests && formData.psychographics.interests.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Selected Interests:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.psychographics.interests.map(interest => (
                    <span
                      key={interest}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {interest}
                      <button
                        type="button"
                        onClick={() => removeInterest(interest)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lifestyle
            </label>
            <textarea
              value={formData.psychographics?.lifestyle || ''}
              onChange={(e) => updateDemographics('psychographics', 'lifestyle', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe their typical lifestyle, daily routines, and priorities"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Values & Motivations
            </label>
            <textarea
              value={formData.psychographics?.values || ''}
              onChange={(e) => updateDemographics('psychographics', 'values', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="What drives them? What do they care about most?"
            />
          </div>
        </div>
      </div>

      {/* Pain Points */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
          Pain Points & Challenges
        </h4>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-3">
              What problems or frustrations does your target audience face?
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              {PAIN_POINTS_COMMON.map(painPoint => (
                <button
                  key={painPoint}
                  type="button"
                  onClick={() => toggleMultiSelect('pain_points', painPoint)}
                  className={`p-3 text-sm border-2 rounded-lg transition-colors ${
                    formData.pain_points?.includes(painPoint)
                      ? 'bg-red-50 border-red-200 text-red-800'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {painPoint}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <input
                type="text"
                value={newPainPoint}
                onChange={(e) => setNewPainPoint(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addPainPoint();
                  }
                }}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add custom pain point"
              />
              <button
                type="button"
                onClick={addPainPoint}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Add
              </button>
            </div>

            {formData.pain_points && formData.pain_points.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Selected Pain Points:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.pain_points.map(painPoint => (
                    <span
                      key={painPoint}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800"
                    >
                      {painPoint}
                      <button
                        type="button"
                        onClick={() => removePainPoint(painPoint)}
                        className="ml-2 text-red-600 hover:text-red-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Market Positioning */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
          Market Position & Geography
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Market Positioning
            </label>
            <div className="space-y-2">
              {['premium', 'mid-market', 'budget', 'luxury', 'niche'].map(position => (
                <button
                  key={position}
                  type="button"
                  onClick={() => updateFormData('market_positioning', position)}
                  className={`w-full p-3 text-left border-2 rounded-lg transition-colors ${
                    formData.market_positioning === position
                      ? 'bg-blue-50 border-blue-200 text-blue-800'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {position.charAt(0).toUpperCase() + position.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Geographic Presence
            </label>
            <div className="space-y-2">
              {GEOGRAPHIC_OPTIONS.map(geo => (
                <button
                  key={geo}
                  type="button"
                  onClick={() => toggleMultiSelect('geographic_presence', geo)}
                  className={`w-full p-3 text-left border-2 rounded-lg transition-colors ${
                    formData.geographic_presence?.includes(geo)
                      ? 'bg-green-50 border-green-200 text-green-800'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {geo}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Competitor Analysis */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <MapPin className="w-5 h-5 mr-2 text-blue-600" />
          Competitor Analysis (up to 5)
        </h4>
        
        <div className="space-y-4">
          {formData.competitors && formData.competitors.map((competitor, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-medium text-gray-900">{competitor.name}</h5>
                <button
                  type="button"
                  onClick={() => removeCompetitor(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Strengths:</p>
                  <p className="text-sm text-gray-600">{competitor.strengths}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Weaknesses:</p>
                  <p className="text-sm text-gray-600">{competitor.weaknesses}</p>
                </div>
              </div>
            </div>
          ))}

          {(!formData.competitors || formData.competitors.length < 5) && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Competitor Name
                  </label>
                  <input
                    type="text"
                    value={newCompetitor.name}
                    onChange={(e) => setNewCompetitor(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter competitor name"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Strengths
                    </label>
                    <textarea
                      value={newCompetitor.strengths}
                      onChange={(e) => setNewCompetitor(prev => ({ ...prev, strengths: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="What do they do well?"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weaknesses
                    </label>
                    <textarea
                      value={newCompetitor.weaknesses}
                      onChange={(e) => setNewCompetitor(prev => ({ ...prev, weaknesses: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Where do they fall short?"
                    />
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={addCompetitor}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Competitor
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TargetAudienceStep;