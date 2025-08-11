import React, { useState } from 'react';
import { Palette, Loader2, Lightbulb, Type, Sparkles } from 'lucide-react';

const STYLE_OPTIONS = [
  { value: 'modern', label: 'Modern', description: 'Clean, contemporary design' },
  { value: 'minimalist', label: 'Minimalist', description: 'Simple, clean aesthetic' },
  { value: 'vintage', label: 'Vintage', description: 'Classic, retro styling' },
  { value: 'bold', label: 'Bold', description: 'Strong, impactful design' },
  { value: 'elegant', label: 'Elegant', description: 'Sophisticated, refined' },
  { value: 'playful', label: 'Playful', description: 'Fun, creative approach' },
  { value: 'corporate', label: 'Corporate', description: 'Professional, business-focused' },
  { value: 'creative', label: 'Creative', description: 'Artistic, unique design' }
];

const CONCEPT_EXAMPLES = [
  'Tech startup with geometric shapes',
  'Coffee shop with warm colors',
  'Fitness brand with dynamic elements',
  'Luxury brand with gold accents',
  'Nature-inspired organic shapes',
  'Digital agency with modern typography'
];

const LogoGeneratorForm = ({ onGenerate, generating, selectedProfile }) => {
  const [formData, setFormData] = useState({
    concept: '',
    style: 'modern',
    colors: selectedProfile?.primary_color ? [selectedProfile.primary_color] : ['#3B82F6'],
    includeText: false,
    iterations: 4
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleColorChange = (index, color) => {
    const newColors = [...formData.colors];
    newColors[index] = color;
    setFormData(prev => ({
      ...prev,
      colors: newColors
    }));
  };

  const addColor = () => {
    if (formData.colors.length < 3) {
      setFormData(prev => ({
        ...prev,
        colors: [...prev.colors, '#6B7280']
      }));
    }
  };

  const removeColor = (index) => {
    if (formData.colors.length > 1) {
      setFormData(prev => ({
        ...prev,
        colors: prev.colors.filter((_, i) => i !== index)
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.concept.trim()) {
      newErrors.concept = 'Logo concept is required';
    } else if (formData.concept.trim().length < 3) {
      newErrors.concept = 'Concept must be at least 3 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onGenerate({
      ...formData,
      concept: formData.concept.trim()
    });
  };

  const selectedStyle = STYLE_OPTIONS.find(s => s.value === formData.style);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Brand Profile Context */}
      {selectedProfile && (
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 text-sm">
            <div 
              className="w-4 h-4 rounded"
              style={{ backgroundColor: selectedProfile.primary_color || '#3B82F6' }}
            />
            <span className="font-medium text-blue-900">
              Using context from: {selectedProfile.name}
            </span>
          </div>
          {selectedProfile.tone_of_voice && (
            <p className="text-xs text-blue-700 mt-1">
              Tone: {selectedProfile.tone_of_voice}
            </p>
          )}
        </div>
      )}

      {/* Logo Concept */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Logo Concept *
        </label>
        <textarea
          value={formData.concept}
          onChange={(e) => handleInputChange('concept', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.concept ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="Describe your logo concept (e.g., 'Modern tech logo with abstract geometric shapes')"
          rows={3}
          disabled={generating}
        />
        {errors.concept && (
          <p className="mt-1 text-sm text-red-600">{errors.concept}</p>
        )}
        
        {/* Example concepts */}
        <div className="mt-2">
          <p className="text-xs text-gray-500 mb-1">Example concepts:</p>
          <div className="space-y-1">
            {CONCEPT_EXAMPLES.slice(0, 3).map(concept => (
              <button
                key={concept}
                type="button"
                onClick={() => handleInputChange('concept', concept)}
                className="block text-xs text-left px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors w-full"
                disabled={generating}
              >
                {concept}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Style Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Design Style
        </label>
        <select
          value={formData.style}
          onChange={(e) => handleInputChange('style', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={generating}
        >
          {STYLE_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {selectedStyle && (
          <p className="mt-1 text-xs text-gray-500">
            {selectedStyle.description}
          </p>
        )}
      </div>

      {/* Color Palette */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Color Palette
        </label>
        <div className="space-y-3">
          {formData.colors.map((color, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => handleColorChange(index, e.target.value)}
                  className="w-10 h-8 border border-gray-300 rounded cursor-pointer"
                  disabled={generating}
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => handleColorChange(index, e.target.value)}
                  className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="#3B82F6"
                  disabled={generating}
                />
              </div>
              
              {formData.colors.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeColor(index)}
                  disabled={generating}
                  className="p-1 text-gray-400 hover:text-red-500 disabled:opacity-50"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          
          {formData.colors.length < 3 && (
            <button
              type="button"
              onClick={addColor}
              disabled={generating}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-md disabled:opacity-50"
            >
              <Palette className="w-4 h-4" />
              Add Color
            </button>
          )}
          
          <p className="text-xs text-gray-500">
            {formData.colors.length}/3 colors • Primary color will be most prominent
          </p>
        </div>
      </div>

      {/* Include Text */}
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.includeText}
            onChange={(e) => handleInputChange('includeText', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            disabled={generating}
          />
          <span className="ml-2 text-sm text-gray-700">Include brand name in logo</span>
        </label>
        <p className="text-xs text-gray-500 mt-1">
          {formData.includeText 
            ? 'Brand name will be integrated into the logo design' 
            : 'Generate icon/symbol only without text'
          }
        </p>
      </div>

      {/* Iterations */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Number of Variations
        </label>
        <select
          value={formData.iterations}
          onChange={(e) => handleInputChange('iterations', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={generating}
        >
          <option value={2}>2 variations</option>
          <option value={4}>4 variations</option>
          <option value={6}>6 variations</option>
          <option value={8}>8 variations</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">
          More variations take longer but provide more options
        </p>
      </div>

      {/* Generation Tips */}
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-amber-800">
            <p className="font-medium mb-1">Tips for better logos:</p>
            <ul className="space-y-1 text-xs">
              <li>• Be specific about the visual elements you want</li>
              <li>• Mention the mood or feeling (e.g., "friendly", "professional")</li>
              <li>• Specify any symbols or icons relevant to your business</li>
              <li>• Consider your target audience when describing the concept</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={generating}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {generating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Starting Generation...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Generate Logos
          </>
        )}
      </button>

      {generating && (
        <p className="text-xs text-center text-gray-500">
          Logo generation will be processed in the background. This typically takes 1-2 minutes...
        </p>
      )}
    </form>
  );
};

export default LogoGeneratorForm;