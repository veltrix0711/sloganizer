import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

// Step Components
import BasicInformationStep from './steps/BasicInformationStep';
import VisualIdentityStep from './steps/VisualIdentityStep';
import TargetAudienceStep from './steps/TargetAudienceStep';
import BusinessDetailsStep from './steps/BusinessDetailsStep';
import VoiceMessagingStep from './steps/VoiceMessagingStep';
import MarketingStrategyStep from './steps/MarketingStrategyStep';
import ReviewLaunchStep from './steps/ReviewLaunchStep';

const WIZARD_STEPS = [
  {
    id: 'basics',
    title: 'Brand Basics',
    description: 'Name, industry, and foundation',
    component: BasicInformationStep
  },
  {
    id: 'visual',
    title: 'Visual Identity',
    description: 'Colors, fonts, and style',
    component: VisualIdentityStep
  },
  {
    id: 'audience',
    title: 'Target Audience',
    description: 'Demographics and psychographics',
    component: TargetAudienceStep
  },
  {
    id: 'business',
    title: 'Business Details',
    description: 'Model, products, and positioning',
    component: BusinessDetailsStep
  },
  {
    id: 'voice',
    title: 'Voice & Messaging',
    description: 'Personality, tone, and messages',
    component: VoiceMessagingStep
  },
  {
    id: 'marketing',
    title: 'Marketing Strategy',
    description: 'Channels, content, and goals',
    component: MarketingStrategyStep
  },
  {
    id: 'review',
    title: 'Review & Launch',
    description: 'AI analysis preview',
    component: ReviewLaunchStep
  }
];

const BrandWizard = ({ profile, onSubmit, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    // Basic Information
    name: profile?.name || '',
    tagline: profile?.tagline || '',
    mission: profile?.mission || '',
    vision: profile?.vision || '',
    founding_year: profile?.founding_year || '',
    brand_story: profile?.brand_story || '',
    core_values: profile?.core_values || [],

    // Visual Identity
    primary_color: profile?.primary_color || '#3B82F6',
    secondary_color: profile?.secondary_color || '#6B7280',
    accent_color: profile?.accent_color || '#F59E0B',
    color_palette_secondary: profile?.color_palette_secondary || [],
    primary_font: profile?.primary_font || 'Inter',
    secondary_font: profile?.secondary_font || 'Inter',
    logo_style: profile?.logo_style || 'modern',
    photography_style: profile?.photography_style || 'professional',
    iconography_style: profile?.iconography_style || 'minimalist',

    // Target Audience & Market
    primary_demographics: profile?.primary_demographics || {},
    secondary_demographics: profile?.secondary_demographics || {},
    psychographics: profile?.psychographics || {},
    pain_points: profile?.pain_points || [],
    customer_journey: profile?.customer_journey || {},
    competitors: profile?.competitors || [],
    market_positioning: profile?.market_positioning || 'premium',
    geographic_presence: profile?.geographic_presence || [],

    // Business Information
    industry: profile?.industry || '',
    business_model: profile?.business_model || 'B2C',
    company_size: profile?.company_size || 'startup',
    revenue_range: profile?.revenue_range || '',
    growth_stage: profile?.growth_stage || 'launch',
    products_services: profile?.products_services || [],
    usp: profile?.usp || '',
    pricing_strategy: profile?.pricing_strategy || 'competitive',

    // Voice & Messaging
    brand_personality: profile?.brand_personality || [],
    tone_of_voice: profile?.tone_of_voice || 'professional',
    communication_style: profile?.communication_style || 'professional',
    key_messages: profile?.key_messages || [],
    brand_guidelines: profile?.brand_guidelines || { dos: [], donts: [] },
    content_themes: profile?.content_themes || [],

    // Marketing Strategy
    marketing_channels: profile?.marketing_channels || [],
    content_types: profile?.content_types || [],
    posting_frequency: profile?.posting_frequency || {},
    marketing_budget_range: profile?.marketing_budget_range || '',
    campaign_goals: profile?.campaign_goals || [],
    seasonal_considerations: profile?.seasonal_considerations || [],
    partnership_opportunities: profile?.partnership_opportunities || [],

    // Links & Social
    website_url: profile?.website_url || '',
    social_links: profile?.social_links || {
      instagram: '',
      linkedin: '',
      twitter: '',
      facebook: '',
      tiktok: '',
      youtube: '',
      pinterest: ''
    },
    niche_tags: profile?.niche_tags || [],
    is_default: profile?.is_default || false
  });

  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [errors, setErrors] = useState({});

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user makes changes
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateCurrentStep = () => {
    const stepId = WIZARD_STEPS[currentStep].id;
    const newErrors = {};

    switch (stepId) {
      case 'basics':
        if (!formData.name.trim()) {
          newErrors.name = 'Brand name is required';
        }
        if (!formData.industry.trim()) {
          newErrors.industry = 'Industry is required';
        }
        break;
      case 'visual':
        // Visual identity is optional but we can provide warnings
        break;
      case 'audience':
        if (!formData.primary_demographics.age_range) {
          newErrors.primary_demographics = 'Primary demographics are required';
        }
        break;
      case 'business':
        if (!formData.business_model) {
          newErrors.business_model = 'Business model is required';
        }
        break;
      case 'voice':
        if (formData.brand_personality.length === 0) {
          newErrors.brand_personality = 'Select at least one personality trait';
        }
        break;
      case 'marketing':
        if (formData.marketing_channels.length === 0) {
          newErrors.marketing_channels = 'Select at least one marketing channel';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      if (currentStep < WIZARD_STEPS.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepIndex) => {
    if (stepIndex <= currentStep || completedSteps.has(stepIndex - 1)) {
      setCurrentStep(stepIndex);
    }
  };

  const handleSubmit = () => {
    if (validateCurrentStep()) {
      onSubmit(formData);
    }
  };

  const CurrentStepComponent = WIZARD_STEPS[currentStep].component;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex">
        {/* Sidebar - Progress */}
        <div className="w-80 bg-gray-50 border-r border-gray-200 p-6">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {profile ? 'Edit Brand Profile' : 'Create Brand Profile'}
            </h2>
            <p className="text-sm text-gray-600">
              Step {currentStep + 1} of {WIZARD_STEPS.length}
            </p>
          </div>

          <nav className="space-y-3">
            {WIZARD_STEPS.map((step, index) => {
              const isCompleted = completedSteps.has(index);
              const isCurrent = index === currentStep;
              const isAccessible = index <= currentStep || completedSteps.has(index - 1);
              
              return (
                <button
                  key={step.id}
                  onClick={() => goToStep(index)}
                  disabled={!isAccessible}
                  className={`w-full text-left p-4 rounded-lg transition-all ${
                    isCurrent
                      ? 'bg-blue-600 text-white shadow-md'
                      : isCompleted
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : isAccessible
                      ? 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{step.title}</span>
                    {isCompleted && (
                      <Check className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                  <p className={`text-sm ${
                    isCurrent ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {step.description}
                  </p>
                </button>
              );
            })}
          </nav>

          {/* Progress Bar */}
          <div className="mt-8">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{Math.round(((completedSteps.size) / WIZARD_STEPS.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((completedSteps.size) / WIZARD_STEPS.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="border-b border-gray-200 px-8 py-6">
            <h3 className="text-2xl font-semibold text-gray-900">
              {WIZARD_STEPS[currentStep].title}
            </h3>
            <p className="text-gray-600 mt-1">
              {WIZARD_STEPS[currentStep].description}
            </p>
          </div>

          {/* Step Content */}
          <div className="flex-1 overflow-y-auto p-8">
            <CurrentStepComponent
              formData={formData}
              updateFormData={updateFormData}
              errors={errors}
            />
          </div>

          {/* Footer Navigation */}
          <div className="border-t border-gray-200 px-8 py-6 flex items-center justify-between bg-gray-50">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>

            <div className="flex items-center gap-4">
              {currentStep > 0 && (
                <button
                  onClick={prevStep}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
              )}

              {currentStep < WIZARD_STEPS.length - 1 ? (
                <button
                  onClick={nextStep}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  {profile ? 'Update Profile' : 'Create Profile'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandWizard;