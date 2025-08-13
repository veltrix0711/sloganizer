import React, { useState } from 'react';
import { MessageCircle, Volume2, Check, X, Plus } from 'lucide-react';

const PERSONALITY_TRAITS = [
  'Trustworthy', 'Innovative', 'Professional', 'Creative', 'Reliable',
  'Modern', 'Friendly', 'Bold', 'Sophisticated', 'Authentic',
  'Energetic', 'Minimalist', 'Luxurious', 'Approachable', 'Expert',
  'Playful', 'Serious', 'Caring', 'Dynamic', 'Transparent'
];

const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional', description: 'Formal, competent, and business-focused' },
  { value: 'friendly', label: 'Friendly', description: 'Warm, approachable, and conversational' },
  { value: 'witty', label: 'Witty', description: 'Clever, humorous, and engaging' },
  { value: 'authoritative', label: 'Authoritative', description: 'Expert, confident, and leadership-focused' },
  { value: 'inspiring', label: 'Inspiring', description: 'Motivational, uplifting, and empowering' },
  { value: 'caring', label: 'Caring', description: 'Empathetic, supportive, and nurturing' }
];

const COMMUNICATION_STYLES = [
  { value: 'formal', label: 'Formal', description: 'Traditional, structured communication' },
  { value: 'casual', label: 'Casual', description: 'Relaxed, informal conversation' },
  { value: 'technical', label: 'Technical', description: 'Detailed, precise, expert-level' },
  { value: 'simple', label: 'Simple', description: 'Clear, straightforward, easy to understand' },
  { value: 'storytelling', label: 'Storytelling', description: 'Narrative-driven, engaging stories' },
  { value: 'educational', label: 'Educational', description: 'Informative, teaching-focused' }
];

const CONTENT_THEMES = [
  'Education', 'Entertainment', 'Inspiration', 'Behind-the-scenes',
  'Industry insights', 'Customer stories', 'Product updates', 'Tips & tricks',
  'Company culture', 'Social impact', 'Innovation', 'Trends'
];

const VoiceMessagingStep = ({ formData, updateFormData, errors }) => {
  const [newMessage, setNewMessage] = useState('');
  const [newDo, setNewDo] = useState('');
  const [newDont, setNewDont] = useState('');

  const togglePersonalityTrait = (trait) => {
    const currentTraits = formData.brand_personality || [];
    if (currentTraits.includes(trait)) {
      updateFormData('brand_personality', currentTraits.filter(t => t !== trait));
    } else {
      updateFormData('brand_personality', [...currentTraits, trait]);
    }
  };

  const toggleContentTheme = (theme) => {
    const currentThemes = formData.content_themes || [];
    if (currentThemes.includes(theme)) {
      updateFormData('content_themes', currentThemes.filter(t => t !== theme));
    } else {
      updateFormData('content_themes', [...currentThemes, theme]);
    }
  };

  const addKeyMessage = () => {
    const message = newMessage.trim();
    if (message) {
      const currentMessages = formData.key_messages || [];
      updateFormData('key_messages', [...currentMessages, message]);
      setNewMessage('');
    }
  };

  const removeKeyMessage = (index) => {
    const currentMessages = formData.key_messages || [];
    updateFormData('key_messages', currentMessages.filter((_, i) => i !== index));
  };

  const addBrandGuideline = (type, value) => {
    if (value.trim()) {
      const currentGuidelines = formData.brand_guidelines || { dos: [], donts: [] };
      updateFormData('brand_guidelines', {
        ...currentGuidelines,
        [type]: [...currentGuidelines[type], value.trim()]
      });
      
      if (type === 'dos') {
        setNewDo('');
      } else {
        setNewDont('');
      }
    }
  };

  const removeBrandGuideline = (type, index) => {
    const currentGuidelines = formData.brand_guidelines || { dos: [], donts: [] };
    updateFormData('brand_guidelines', {
      ...currentGuidelines,
      [type]: currentGuidelines[type].filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-8">
      {/* Brand Personality */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Volume2 className="w-5 h-5 mr-2 text-blue-600" />
          Brand Personality
        </h4>
        
        <div className="mb-4">
          <p className="text-gray-600 mb-4">
            Select 3-6 personality traits that best describe your brand:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {PERSONALITY_TRAITS.map(trait => (
              <button
                key={trait}
                type="button"
                onClick={() => togglePersonalityTrait(trait)}
                className={`p-3 text-sm font-medium rounded-lg border-2 transition-colors ${
                  formData.brand_personality?.includes(trait)
                    ? 'bg-blue-50 border-blue-200 text-blue-800'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {trait}
              </button>
            ))}
          </div>
          {errors.brand_personality && (
            <p className="mt-2 text-sm text-red-600">{errors.brand_personality}</p>
          )}
        </div>

        {formData.brand_personality && formData.brand_personality.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h5 className="font-medium text-blue-900 mb-2">Selected Personality Traits:</h5>
            <div className="flex flex-wrap gap-2">
              {formData.brand_personality.map(trait => (
                <span
                  key={trait}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {trait}
                  <button
                    type="button"
                    onClick={() => togglePersonalityTrait(trait)}
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

      {/* Tone of Voice */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <MessageCircle className="w-5 h-5 mr-2 text-blue-600" />
          Tone of Voice
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TONE_OPTIONS.map(tone => (
            <button
              key={tone.value}
              type="button"
              onClick={() => updateFormData('tone_of_voice', tone.value)}
              className={`p-4 text-left border-2 rounded-lg transition-colors ${
                formData.tone_of_voice === tone.value
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h5 className={`font-medium ${
                  formData.tone_of_voice === tone.value ? 'text-blue-800' : 'text-gray-900'
                }`}>
                  {tone.label}
                </h5>
                {formData.tone_of_voice === tone.value && (
                  <Check className="w-4 h-4 text-blue-600" />
                )}
              </div>
              <p className={`text-sm ${
                formData.tone_of_voice === tone.value ? 'text-blue-600' : 'text-gray-600'
              }`}>
                {tone.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Communication Style */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">
          Communication Style
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {COMMUNICATION_STYLES.map(style => (
            <button
              key={style.value}
              type="button"
              onClick={() => updateFormData('communication_style', style.value)}
              className={`p-4 text-left border-2 rounded-lg transition-colors ${
                formData.communication_style === style.value
                  ? 'bg-green-50 border-green-200'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h5 className={`font-medium ${
                  formData.communication_style === style.value ? 'text-green-800' : 'text-gray-900'
                }`}>
                  {style.label}
                </h5>
                {formData.communication_style === style.value && (
                  <Check className="w-4 h-4 text-green-600" />
                )}
              </div>
              <p className={`text-sm ${
                formData.communication_style === style.value ? 'text-green-600' : 'text-gray-600'
              }`}>
                {style.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Key Messages */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">
          Key Messages (3-5 core messages)
        </h4>
        
        <div className="space-y-4">
          {formData.key_messages && formData.key_messages.map((message, index) => (
            <div key={index} className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <p className="text-gray-900">{message}</p>
              </div>
              <button
                type="button"
                onClick={() => removeKeyMessage(index)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addKeyMessage();
                  }
                }}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter a key message your brand should consistently communicate"
              />
              <button
                type="button"
                onClick={addKeyMessage}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Guidelines */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">
          Brand Communication Guidelines
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Do's */}
          <div>
            <h5 className="font-medium text-green-800 mb-3 flex items-center">
              <Check className="w-4 h-4 mr-2" />
              Do's
            </h5>
            
            <div className="space-y-2 mb-4">
              {formData.brand_guidelines?.dos?.map((item, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <span className="flex-1 text-green-800">{item}</span>
                  <button
                    type="button"
                    onClick={() => removeBrandGuideline('dos', index)}
                    className="text-green-600 hover:text-green-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newDo}
                onChange={(e) => setNewDo(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addBrandGuideline('dos', newDo);
                  }
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Add a 'do' guideline"
              />
              <button
                type="button"
                onClick={() => addBrandGuideline('dos', newDo)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Don'ts */}
          <div>
            <h5 className="font-medium text-red-800 mb-3 flex items-center">
              <X className="w-4 h-4 mr-2" />
              Don'ts
            </h5>
            
            <div className="space-y-2 mb-4">
              {formData.brand_guidelines?.donts?.map((item, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <span className="flex-1 text-red-800">{item}</span>
                  <button
                    type="button"
                    onClick={() => removeBrandGuideline('donts', index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newDont}
                onChange={(e) => setNewDont(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addBrandGuideline('donts', newDont);
                  }
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Add a 'don't' guideline"
              />
              <button
                type="button"
                onClick={() => addBrandGuideline('donts', newDont)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Themes */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">
          Content Themes
        </h4>
        
        <p className="text-gray-600 mb-4">
          Select the types of content that align with your brand:
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {CONTENT_THEMES.map(theme => (
            <button
              key={theme}
              type="button"
              onClick={() => toggleContentTheme(theme)}
              className={`p-3 text-sm font-medium rounded-lg border-2 transition-colors ${
                formData.content_themes?.includes(theme)
                  ? 'bg-purple-50 border-purple-200 text-purple-800'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {theme}
            </button>
          ))}
        </div>

        {formData.content_themes && formData.content_themes.length > 0 && (
          <div className="mt-4 p-4 bg-purple-50 rounded-lg">
            <h5 className="font-medium text-purple-900 mb-2">Selected Content Themes:</h5>
            <div className="flex flex-wrap gap-2">
              {formData.content_themes.map(theme => (
                <span
                  key={theme}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
                >
                  {theme}
                  <button
                    type="button"
                    onClick={() => toggleContentTheme(theme)}
                    className="ml-2 text-purple-600 hover:text-purple-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Brand Voice Summary */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">
          Brand Voice Summary
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="font-medium text-gray-700 mb-1">Personality:</p>
            <p className="text-gray-600">
              {formData.brand_personality?.length > 0 
                ? formData.brand_personality.join(', ')
                : 'Not selected'
              }
            </p>
          </div>
          
          <div>
            <p className="font-medium text-gray-700 mb-1">Tone:</p>
            <p className="text-gray-600">
              {formData.tone_of_voice 
                ? formData.tone_of_voice.charAt(0).toUpperCase() + formData.tone_of_voice.slice(1)
                : 'Not selected'
              }
            </p>
          </div>
          
          <div>
            <p className="font-medium text-gray-700 mb-1">Style:</p>
            <p className="text-gray-600">
              {formData.communication_style 
                ? formData.communication_style.charAt(0).toUpperCase() + formData.communication_style.slice(1)
                : 'Not selected'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceMessagingStep;