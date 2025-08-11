import React, { useState } from 'react';
import { Download, Loader2, FileText, Package, Lightbulb, Palette, Type, Image } from 'lucide-react';

const EXPORT_TYPES = [
  { 
    value: 'pdf', 
    label: 'PDF Brand Guide', 
    icon: FileText,
    description: 'Professional PDF document with all brand guidelines',
    features: ['Color palettes', 'Typography guide', 'Logo usage', 'Brand voice guidelines'],
    estimatedTime: '1-2 minutes'
  },
  { 
    value: 'notion', 
    label: 'Notion Template', 
    icon: Package,
    description: 'Notion workspace template for team collaboration',
    features: ['Interactive pages', 'Editable content', 'Team sharing', 'Asset library'],
    estimatedTime: '30 seconds'
  },
  { 
    value: 'markdown', 
    label: 'Markdown Guide', 
    icon: FileText,
    description: 'Markdown document for developers and documentation',
    features: ['Text-based format', 'Version control friendly', 'Easy to edit', 'Lightweight'],
    estimatedTime: '30 seconds'
  }
];

const BrandExportForm = ({ onGenerate, generating, selectedProfile }) => {
  const [formData, setFormData] = useState({
    exportType: 'pdf',
    exportOptions: {
      includeLogo: true,
      includeColors: true,
      includeFonts: true,
      includeGuidelines: true,
      includeAssets: false,
      template: 'standard'
    }
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOptionChange = (option, value) => {
    setFormData(prev => ({
      ...prev,
      exportOptions: {
        ...prev.exportOptions,
        [option]: value
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onGenerate(formData);
  };

  const selectedType = EXPORT_TYPES.find(t => t.value === formData.exportType);
  const IconComponent = selectedType?.icon || FileText;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Brand Profile Info */}
      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2 text-sm">
          <div 
            className="w-4 h-4 rounded"
            style={{ backgroundColor: selectedProfile.primary_color || '#3B82F6' }}
          />
          <span className="font-medium text-blue-900">
            {selectedProfile.name}
          </span>
        </div>
        <p className="text-xs text-blue-700 mt-1">
          Brand kit will include this profile's colors, fonts, and guidelines
        </p>
      </div>

      {/* Export Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Export Format *
        </label>
        <div className="space-y-3">
          {EXPORT_TYPES.map((type) => {
            const TypeIcon = type.icon;
            return (
              <label
                key={type.value}
                className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.exportType === type.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="exportType"
                  value={type.value}
                  checked={formData.exportType === type.value}
                  onChange={(e) => handleInputChange('exportType', e.target.value)}
                  className="sr-only"
                  disabled={generating}
                />
                <div className="flex items-start gap-3">
                  <TypeIcon className={`w-5 h-5 mt-0.5 ${
                    formData.exportType === type.value ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-gray-900">{type.label}</h4>
                      <span className="text-xs text-gray-500">{type.estimatedTime}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{type.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {type.features.map((feature, index) => (
                        <span
                          key={index}
                          className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Export Options */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Include in Export
        </label>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.exportOptions.includeLogo}
              onChange={(e) => handleOptionChange('includeLogo', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              disabled={generating}
            />
            <div className="ml-3 flex items-center gap-2">
              <Image className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-700">Logo and brand assets</span>
            </div>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.exportOptions.includeColors}
              onChange={(e) => handleOptionChange('includeColors', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              disabled={generating}
            />
            <div className="ml-3 flex items-center gap-2">
              <Palette className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-700">Color palette and usage</span>
            </div>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.exportOptions.includeFonts}
              onChange={(e) => handleOptionChange('includeFonts', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              disabled={generating}
            />
            <div className="ml-3 flex items-center gap-2">
              <Type className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-700">Typography guidelines</span>
            </div>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.exportOptions.includeGuidelines}
              onChange={(e) => handleOptionChange('includeGuidelines', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              disabled={generating}
            />
            <div className="ml-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-700">Brand voice and messaging</span>
            </div>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.exportOptions.includeAssets}
              onChange={(e) => handleOptionChange('includeAssets', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              disabled={generating}
            />
            <div className="ml-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-700">Additional brand assets</span>
            </div>
          </label>
        </div>
      </div>

      {/* Template Selection for PDF */}
      {formData.exportType === 'pdf' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Template Style
          </label>
          <select
            value={formData.exportOptions.template}
            onChange={(e) => handleOptionChange('template', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={generating}
          >
            <option value="standard">Standard Template</option>
            <option value="minimal">Minimal Template</option>
            <option value="detailed">Detailed Template</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Choose the level of detail and visual style for your brand guide
          </p>
        </div>
      )}

      {/* Export Preview */}
      {selectedType && (
        <div className="p-3 bg-gray-50 rounded-lg border">
          <div className="flex items-center gap-2 mb-2">
            <IconComponent className="w-4 h-4 text-gray-600" />
            <span className="font-medium text-gray-900">Export Preview</span>
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <div>Format: {selectedType.label}</div>
            <div>Estimated time: {selectedType.estimatedTime}</div>
            <div>
              Includes: {Object.entries(formData.exportOptions)
                .filter(([key, value]) => value === true && key.startsWith('include'))
                .map(([key]) => key.replace('include', '').toLowerCase())
                .join(', ') || 'basic information'}
            </div>
          </div>
        </div>
      )}

      {/* Generation Tips */}
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-amber-800">
            <p className="font-medium mb-1">Export tips:</p>
            <ul className="space-y-1 text-xs">
              <li>• PDF exports are perfect for sharing with clients and team members</li>
              <li>• Notion templates allow for collaborative brand guideline editing</li>
              <li>• Markdown exports work great for developer documentation</li>
              <li>• Exports are automatically cleaned up after 7 days</li>
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
            Creating Export...
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            Create Brand Kit
          </>
        )}
      </button>

      {generating && (
        <p className="text-xs text-center text-gray-500">
          Your brand kit is being generated in the background. You'll be notified when it's ready for download.
        </p>
      )}
    </form>
  );
};

export default BrandExportForm;