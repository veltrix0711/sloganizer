import React, { useState } from 'react';
import { Building, Calendar, BookOpen, Target, Heart } from 'lucide-react';

const GROWTH_STAGES = [
  { value: 'idea', label: 'Idea Stage' },
  { value: 'launch', label: 'Launch' },
  { value: 'growth', label: 'Growth' },
  { value: 'mature', label: 'Mature' }
];

const CORE_VALUES_OPTIONS = [
  'Innovation', 'Quality', 'Integrity', 'Sustainability', 'Excellence',
  'Trust', 'Collaboration', 'Diversity', 'Growth', 'Transparency',
  'Customer Focus', 'Social Impact', 'Authenticity', 'Reliability',
  'Creativity', 'Efficiency', 'Community', 'Passion'
];

const BasicInformationStep = ({ formData, updateFormData, errors }) => {
  const [newValue, setNewValue] = useState('');

  const handleCoreValueToggle = (value) => {
    const currentValues = formData.core_values || [];
    if (currentValues.includes(value)) {
      updateFormData('core_values', currentValues.filter(v => v !== value));
    } else {
      updateFormData('core_values', [...currentValues, value]);
    }
  };

  const addCustomValue = () => {
    const value = newValue.trim();
    if (value && !formData.core_values.includes(value)) {
      updateFormData('core_values', [...formData.core_values, value]);
      setNewValue('');
    }
  };

  const removeValue = (valueToRemove) => {
    updateFormData('core_values', formData.core_values.filter(v => v !== valueToRemove));
  };

  return (
    <div className="space-y-8">
      {/* Brand Identity Core */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Building className="w-5 h-5 mr-2 text-blue-600" />
          Brand Identity Core
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brand Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => updateFormData('name', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter your brand name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tagline/Slogan
            </label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => updateFormData('tagline', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your memorable tagline"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Industry *
            </label>
            <input
              type="text"
              value={formData.industry}
              onChange={(e) => updateFormData('industry', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.industry ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., Technology, Healthcare, Retail"
            />
            {errors.industry && (
              <p className="mt-1 text-sm text-red-600">{errors.industry}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              Founding Year
            </label>
            <input
              type="number"
              min="1800"
              max={new Date().getFullYear()}
              value={formData.founding_year}
              onChange={(e) => updateFormData('founding_year', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="2024"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Growth Stage
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {GROWTH_STAGES.map(stage => (
              <button
                key={stage.value}
                type="button"
                onClick={() => updateFormData('growth_stage', stage.value)}
                className={`p-3 text-sm font-medium rounded-lg border-2 transition-colors ${
                  formData.growth_stage === stage.value
                    ? 'bg-blue-50 border-blue-200 text-blue-800'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {stage.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2 text-blue-600" />
          Mission & Vision
        </h4>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mission Statement
            </label>
            <textarea
              value={formData.mission}
              onChange={(e) => updateFormData('mission', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="What is your brand's purpose and what value do you provide to customers?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vision Statement
            </label>
            <textarea
              value={formData.vision}
              onChange={(e) => updateFormData('vision', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Where do you see your brand in the future? What impact do you want to make?"
            />
          </div>
        </div>
      </div>

      {/* Core Values */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Heart className="w-5 h-5 mr-2 text-blue-600" />
          Core Values
        </h4>
        
        <p className="text-gray-600 mb-4">
          Select the values that best represent your brand (choose 3-5):
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          {CORE_VALUES_OPTIONS.map(value => (
            <button
              key={value}
              type="button"
              onClick={() => handleCoreValueToggle(value)}
              className={`p-3 text-sm font-medium rounded-lg border-2 transition-colors ${
                formData.core_values?.includes(value)
                  ? 'bg-blue-50 border-blue-200 text-blue-800'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {value}
            </button>
          ))}
        </div>

        {/* Custom Core Value */}
        <div className="flex gap-3">
          <input
            type="text"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addCustomValue();
              }
            }}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add custom core value"
          />
          <button
            type="button"
            onClick={addCustomValue}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Add
          </button>
        </div>

        {/* Selected Values */}
        {formData.core_values?.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Selected Values:</p>
            <div className="flex flex-wrap gap-2">
              {formData.core_values.map(value => (
                <span
                  key={value}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {value}
                  <button
                    type="button"
                    onClick={() => removeValue(value)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Brand Story */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
          Brand Story
        </h4>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tell Your Story
          </label>
          <textarea
            value={formData.brand_story}
            onChange={(e) => updateFormData('brand_story', e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="How did your brand start? What challenges were you solving? What makes your journey unique?"
          />
          <p className="mt-2 text-sm text-gray-500">
            Share the human story behind your brand - the 'why' that drives everything you do.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BasicInformationStep;