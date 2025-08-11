import React, { useState } from 'react';
import { Sparkles, Loader2, Plus, X, Hash, Lightbulb } from 'lucide-react';

const STYLE_OPTIONS = [
  { value: 'modern', label: 'Modern', description: 'Clean, contemporary names' },
  { value: 'creative', label: 'Creative', description: 'Unique, inventive names' },
  { value: 'professional', label: 'Professional', description: 'Business-focused names' },
  { value: 'playful', label: 'Playful', description: 'Fun, energetic names' },
  { value: 'premium', label: 'Premium', description: 'Luxurious, high-end names' },
  { value: 'tech', label: 'Tech', description: 'Technology-oriented names' },
  { value: 'minimalist', label: 'Minimalist', description: 'Simple, clean names' },
  { value: 'compound', label: 'Compound', description: 'Two words combined' }
];

const EXAMPLE_NICHES = [
  'Tech Startup',
  'Coffee Shop',
  'Fitness Studio',
  'Design Agency',
  'Restaurant',
  'Consulting Firm',
  'E-commerce Store',
  'Photography Studio',
  'Marketing Agency',
  'Real Estate',
  'Healthcare',
  'Education'
];

const NameGeneratorForm = ({ onGenerate, generating, selectedProfile }) => {
  const [formData, setFormData] = useState({
    niche: '',
    style: 'modern',
    keywords: [],
    count: 10
  });
  const [newKeyword, setNewKeyword] = useState('');
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

  const addKeyword = () => {
    const keyword = newKeyword.trim();
    if (keyword && !formData.keywords.includes(keyword)) {
      if (formData.keywords.length >= 5) {
        setErrors(prev => ({
          ...prev,
          keywords: 'Maximum 5 keywords allowed'
        }));
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keyword]
      }));
      setNewKeyword('');
      
      // Clear keywords error
      if (errors.keywords) {
        setErrors(prev => ({
          ...prev,
          keywords: null
        }));
      }
    }
  };

  const removeKeyword = (keywordToRemove) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keywordToRemove)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.niche.trim()) {
      newErrors.niche = 'Business niche is required';
    } else if (formData.niche.trim().length < 2) {
      newErrors.niche = 'Niche must be at least 2 characters';
    }

    if (formData.count < 1 || formData.count > 20) {
      newErrors.count = 'Count must be between 1 and 20';
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
      niche: formData.niche.trim()
    });
  };

  const selectedStyle = STYLE_OPTIONS.find(s => s.value === formData.style);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Brand Profile Context */}
      {selectedProfile && (
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-4 h-4 rounded bg-blue-600"></div>
            <span className="font-medium text-blue-900">
              Using context from: {selectedProfile.name}
            </span>
          </div>
          {selectedProfile.industry && (
            <p className="text-xs text-blue-700 mt-1">
              Industry: {selectedProfile.industry}
            </p>
          )}
        </div>
      )}

      {/* Business Niche */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Business Niche / Industry *
        </label>
        <input
          type="text"
          value={formData.niche}
          onChange={(e) => handleInputChange('niche', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.niche ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="e.g. Tech Startup, Coffee Shop, Design Agency"
          disabled={generating}
        />
        {errors.niche && (
          <p className="mt-1 text-sm text-red-600">{errors.niche}</p>
        )}
        
        {/* Example niches */}
        <div className="mt-2">
          <p className="text-xs text-gray-500 mb-1">Quick examples:</p>
          <div className="flex flex-wrap gap-1">
            {EXAMPLE_NICHES.slice(0, 6).map(niche => (
              <button
                key={niche}
                type="button"
                onClick={() => handleInputChange('niche', niche)}
                className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                disabled={generating}
              >
                {niche}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Style Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Naming Style
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

      {/* Keywords */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Keywords (Optional)
        </label>
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addKeyword();
                }
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add a keyword and press Enter"
              disabled={generating}
            />
            <button
              type="button"
              onClick={addKeyword}
              disabled={generating || formData.keywords.length >= 5}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          {errors.keywords && (
            <p className="text-sm text-red-600">{errors.keywords}</p>
          )}

          {formData.keywords.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  <Hash className="w-3 h-3 mr-1" />
                  {keyword}
                  <button
                    type="button"
                    onClick={() => removeKeyword(keyword)}
                    disabled={generating}
                    className="ml-2 text-blue-600 hover:text-blue-800 disabled:opacity-50"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
          
          <p className="text-xs text-gray-500">
            {formData.keywords.length}/5 keywords • 
            These will be considered when generating names
          </p>
        </div>
      </div>

      {/* Generation Count */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Number of Names
        </label>
        <select
          value={formData.count}
          onChange={(e) => handleInputChange('count', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={generating}
        >
          <option value={5}>5 names</option>
          <option value={10}>10 names</option>
          <option value={15}>15 names</option>
          <option value={20}>20 names</option>
        </select>
      </div>

      {/* Generation Tips */}
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-amber-800">
            <p className="font-medium mb-1">Tips for better names:</p>
            <ul className="space-y-1 text-xs">
              <li>• Be specific about your niche (e.g., "AI-powered marketing tool" vs "software")</li>
              <li>• Choose a style that matches your brand personality</li>
              <li>• Add keywords related to your core value proposition</li>
              <li>• Domain availability is checked automatically</li>
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
            Generating Names...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Generate Names
          </>
        )}
      </button>

      {generating && (
        <p className="text-xs text-center text-gray-500">
          This may take 10-30 seconds while we generate names and check domain availability...
        </p>
      )}
    </form>
  );
};

export default NameGeneratorForm;