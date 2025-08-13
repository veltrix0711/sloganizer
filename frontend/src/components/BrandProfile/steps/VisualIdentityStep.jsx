import React, { useState } from 'react';
import { Palette, Type, Camera, Layers, Plus, X } from 'lucide-react';

const LOGO_STYLES = [
  { value: 'modern', label: 'Modern' },
  { value: 'classic', label: 'Classic' },
  { value: 'minimalist', label: 'Minimalist' },
  { value: 'bold', label: 'Bold' },
  { value: 'elegant', label: 'Elegant' },
  { value: 'playful', label: 'Playful' }
];

const PHOTOGRAPHY_STYLES = [
  { value: 'professional', label: 'Professional' },
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'candid', label: 'Candid' },
  { value: 'minimalist', label: 'Minimalist' },
  { value: 'vibrant', label: 'Vibrant' },
  { value: 'moody', label: 'Moody' }
];

const ICONOGRAPHY_STYLES = [
  { value: 'minimalist', label: 'Minimalist' },
  { value: 'detailed', label: 'Detailed' },
  { value: 'abstract', label: 'Abstract' },
  { value: 'geometric', label: 'Geometric' },
  { value: 'organic', label: 'Organic' },
  { value: 'tech', label: 'Tech-focused' }
];

const FONT_OPTIONS = [
  'Inter', 'Helvetica', 'Georgia', 'Times New Roman', 'Arial',
  'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins',
  'Playfair Display', 'Merriweather', 'Source Sans Pro', 'Ubuntu',
  'Nunito', 'Raleway', 'Oswald', 'PT Sans', 'Libre Franklin'
];

const COLOR_PRESETS = [
  { name: 'Ocean Blue', primary: '#0EA5E9', secondary: '#0F172A', accent: '#F59E0B' },
  { name: 'Forest Green', primary: '#10B981', secondary: '#1F2937', accent: '#F97316' },
  { name: 'Sunset Orange', primary: '#F97316', secondary: '#374151', accent: '#8B5CF6' },
  { name: 'Royal Purple', primary: '#8B5CF6', secondary: '#111827', accent: '#06B6D4' },
  { name: 'Cherry Red', primary: '#EF4444', secondary: '#1F2937', accent: '#FBBF24' },
  { name: 'Soft Pink', primary: '#EC4899', secondary: '#374151', accent: '#34D399' }
];

const VisualIdentityStep = ({ formData, updateFormData, errors }) => {
  const [newSecondaryColor, setNewSecondaryColor] = useState('#6B7280');

  const addSecondaryColor = () => {
    const currentColors = formData.color_palette_secondary || [];
    if (currentColors.length < 3 && !currentColors.includes(newSecondaryColor)) {
      updateFormData('color_palette_secondary', [...currentColors, newSecondaryColor]);
    }
  };

  const removeSecondaryColor = (colorToRemove) => {
    const currentColors = formData.color_palette_secondary || [];
    updateFormData('color_palette_secondary', currentColors.filter(c => c !== colorToRemove));
  };

  const applyColorPreset = (preset) => {
    updateFormData('primary_color', preset.primary);
    updateFormData('secondary_color', preset.secondary);
    updateFormData('accent_color', preset.accent);
  };

  return (
    <div className="space-y-8">
      {/* Color Palette */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Palette className="w-5 h-5 mr-2 text-blue-600" />
          Color Palette
        </h4>

        {/* Color Presets */}
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">Quick Color Presets:</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {COLOR_PRESETS.map((preset, index) => (
              <button
                key={index}
                type="button"
                onClick={() => applyColorPreset(preset)}
                className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.primary }} />
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.secondary }} />
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.accent }} />
                </div>
                <p className="text-sm font-medium text-gray-700">{preset.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Primary Colors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.primary_color}
                onChange={(e) => updateFormData('primary_color', e.target.value)}
                className="w-16 h-12 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={formData.primary_color}
                onChange={(e) => updateFormData('primary_color', e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="#3B82F6"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Secondary Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.secondary_color}
                onChange={(e) => updateFormData('secondary_color', e.target.value)}
                className="w-16 h-12 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={formData.secondary_color}
                onChange={(e) => updateFormData('secondary_color', e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="#6B7280"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Accent Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.accent_color}
                onChange={(e) => updateFormData('accent_color', e.target.value)}
                className="w-16 h-12 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={formData.accent_color}
                onChange={(e) => updateFormData('accent_color', e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="#F59E0B"
              />
            </div>
          </div>
        </div>

        {/* Extended Color Palette */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Extended Color Palette (up to 3 additional colors)
          </label>
          <div className="flex flex-wrap gap-3 mb-4">
            {(formData.color_palette_secondary || []).map((color, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-12 h-12 rounded border border-gray-300" style={{ backgroundColor: color }} />
                <span className="text-sm text-gray-600">{color}</span>
                <button
                  type="button"
                  onClick={() => removeSecondaryColor(color)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          
          {(formData.color_palette_secondary || []).length < 3 && (
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={newSecondaryColor}
                onChange={(e) => setNewSecondaryColor(e.target.value)}
                className="w-12 h-12 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={newSecondaryColor}
                onChange={(e) => setNewSecondaryColor(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="#6B7280"
              />
              <button
                type="button"
                onClick={addSecondaryColor}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Typography */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Type className="w-5 h-5 mr-2 text-blue-600" />
          Typography
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Font (Headings)
            </label>
            <select
              value={formData.primary_font}
              onChange={(e) => updateFormData('primary_font', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ fontFamily: formData.primary_font }}
            >
              {FONT_OPTIONS.map(font => (
                <option key={font} value={font} style={{ fontFamily: font }}>
                  {font}
                </option>
              ))}
            </select>
            <p className="mt-2 text-lg font-semibold" style={{ fontFamily: formData.primary_font }}>
              The quick brown fox jumps over the lazy dog
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Secondary Font (Body Text)
            </label>
            <select
              value={formData.secondary_font}
              onChange={(e) => updateFormData('secondary_font', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ fontFamily: formData.secondary_font }}
            >
              {FONT_OPTIONS.map(font => (
                <option key={font} value={font} style={{ fontFamily: font }}>
                  {font}
                </option>
              ))}
            </select>
            <p className="mt-2 text-base" style={{ fontFamily: formData.secondary_font }}>
              The quick brown fox jumps over the lazy dog
            </p>
          </div>
        </div>
      </div>

      {/* Logo Style */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Layers className="w-5 h-5 mr-2 text-blue-600" />
          Logo Style Preference
        </h4>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {LOGO_STYLES.map(style => (
            <button
              key={style.value}
              type="button"
              onClick={() => updateFormData('logo_style', style.value)}
              className={`p-4 text-center border-2 rounded-lg transition-colors ${
                formData.logo_style === style.value
                  ? 'bg-blue-50 border-blue-200 text-blue-800'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <p className="font-medium">{style.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Photography Style */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Camera className="w-5 h-5 mr-2 text-blue-600" />
          Photography & Visual Style
        </h4>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Photography Style
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {PHOTOGRAPHY_STYLES.map(style => (
                <button
                  key={style.value}
                  type="button"
                  onClick={() => updateFormData('photography_style', style.value)}
                  className={`p-3 text-center border-2 rounded-lg transition-colors ${
                    formData.photography_style === style.value
                      ? 'bg-blue-50 border-blue-200 text-blue-800'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Iconography Style
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {ICONOGRAPHY_STYLES.map(style => (
                <button
                  key={style.value}
                  type="button"
                  onClick={() => updateFormData('iconography_style', style.value)}
                  className={`p-3 text-center border-2 rounded-lg transition-colors ${
                    formData.iconography_style === style.value
                      ? 'bg-blue-50 border-blue-200 text-blue-800'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Color Preview */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">
          Color Palette Preview
        </h4>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4 mb-4">
            <div className="text-center">
              <div 
                className="w-full h-16 rounded-lg border border-gray-200 mb-2"
                style={{ backgroundColor: formData.primary_color }}
              />
              <p className="text-xs text-gray-600">Primary</p>
            </div>
            <div className="text-center">
              <div 
                className="w-full h-16 rounded-lg border border-gray-200 mb-2"
                style={{ backgroundColor: formData.secondary_color }}
              />
              <p className="text-xs text-gray-600">Secondary</p>
            </div>
            <div className="text-center">
              <div 
                className="w-full h-16 rounded-lg border border-gray-200 mb-2"
                style={{ backgroundColor: formData.accent_color }}
              />
              <p className="text-xs text-gray-600">Accent</p>
            </div>
            {(formData.color_palette_secondary || []).map((color, index) => (
              <div key={index} className="text-center">
                <div 
                  className="w-full h-16 rounded-lg border border-gray-200 mb-2"
                  style={{ backgroundColor: color }}
                />
                <p className="text-xs text-gray-600">Extra {index + 1}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualIdentityStep;