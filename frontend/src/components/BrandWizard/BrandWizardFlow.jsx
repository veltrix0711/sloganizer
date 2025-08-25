import React, { useState, useEffect } from 'react';
import { useAuth } from '../../services/authContext';
import { 
  Check, 
  ChevronRight, 
  ChevronLeft,
  Rocket,
  Building,
  Sparkles,
  Palette,
  Share2,
  Download,
  Star
} from 'lucide-react';

const WIZARD_STEPS = [
  {
    id: 'profile',
    title: 'Brand Profile',
    description: 'Define your brand identity and personality',
    icon: Building,
    component: 'BrandProfileStep'
  },
  {
    id: 'naming',
    title: 'Business Names',
    description: 'Generate and select your business name',
    icon: Sparkles,
    component: 'NamingStep'
  },
  {
    id: 'logo',
    title: 'Logo Creation',
    description: 'Design your brand logo',
    icon: Palette,
    component: 'LogoStep'
  },
  {
    id: 'content',
    title: 'Content Creation',
    description: 'Generate social media content',
    icon: Share2,
    component: 'ContentStep'
  },
  {
    id: 'launch',
    title: 'Launch Kit',
    description: 'Export your complete brand package',
    icon: Download,
    component: 'LaunchStep'
  }
];

const BrandWizardFlow = ({ onComplete, initialStep = 0 }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [wizardData, setWizardData] = useState({
    profile: null,
    selectedName: null,
    selectedLogo: null,
    socialContent: [],
    exportOptions: {}
  });

  // Load existing progress from localStorage
  useEffect(() => {
    try {
      const savedProgress = localStorage.getItem('lz_wizard_progress');
      if (savedProgress) {
        const { step, data, completed } = JSON.parse(savedProgress);
        setCurrentStep(step || 0);
        setWizardData(data || wizardData);
        setCompletedSteps(new Set(completed || []));
      }
    } catch (error) {
      console.error('Error loading wizard progress:', error);
    }
  }, []);

  // Save progress to localStorage
  const saveProgress = () => {
    const progressData = {
      step: currentStep,
      data: wizardData,
      completed: Array.from(completedSteps)
    };
    localStorage.setItem('lz_wizard_progress', JSON.stringify(progressData));
  };

  const updateWizardData = (stepId, data) => {
    setWizardData(prev => ({
      ...prev,
      [stepId]: data
    }));
    saveProgress();
  };

  const markStepCompleted = (stepId) => {
    setCompletedSteps(prev => new Set([...prev, stepId]));
    saveProgress();
  };

  const handleNext = () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      saveProgress();
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      saveProgress();
    }
  };

  const handleStepClick = (stepIndex) => {
    // Allow clicking on completed steps or the current step
    if (stepIndex <= currentStep || completedSteps.has(WIZARD_STEPS[stepIndex].id)) {
      setCurrentStep(stepIndex);
      saveProgress();
    }
  };

  const handleComplete = () => {
    // Clear wizard progress
    localStorage.removeItem('lz_wizard_progress');
    
    // Call completion handler
    if (onComplete) {
      onComplete(wizardData);
    }
  };

  const getCurrentStepData = () => {
    const step = WIZARD_STEPS[currentStep];
    return {
      ...step,
      isCompleted: completedSteps.has(step.id),
      data: wizardData[step.id]
    };
  };

  const getProgressPercentage = () => {
    return Math.round((completedSteps.size / WIZARD_STEPS.length) * 100);
  };

  const currentStepData = getCurrentStepData();
  const isLastStep = currentStep === WIZARD_STEPS.length - 1;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
            <Rocket className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Brand Launch Wizard</h1>
            <p className="text-gray-600">
              Build your complete brand identity step by step
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm font-medium text-gray-600 mb-2">
            <span>Progress</span>
            <span>{getProgressPercentage()}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        </div>

        {/* Step Navigation */}
        <div className="flex items-center justify-between">
          {WIZARD_STEPS.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = completedSteps.has(step.id);
            const isCurrent = index === currentStep;
            const isAccessible = index <= currentStep || isCompleted;

            return (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => handleStepClick(index)}
                  disabled={!isAccessible}
                  className={`group flex flex-col items-center p-3 rounded-lg transition-all duration-200 ${
                    isCurrent
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                      : isCompleted
                      ? 'bg-green-50 text-green-700 hover:bg-green-100'
                      : isAccessible
                      ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <div className="relative">
                    <Icon className="w-6 h-6" />
                    {isCompleted && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-medium mt-2 text-center">
                    {step.title}
                  </span>
                </button>

                {index < WIZARD_STEPS.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-xl shadow-sm border p-8 min-h-[500px]">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {currentStepData.title}
          </h2>
          <p className="text-gray-600">
            {currentStepData.description}
          </p>
        </div>

        {/* Step Content Area - This would be replaced with actual step components */}
        <div className="mb-8">
          <WizardStepContent
            step={currentStepData}
            data={wizardData}
            onUpdateData={updateWizardData}
            onMarkCompleted={markStepCompleted}
          />
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-100">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              Step {currentStep + 1} of {WIZARD_STEPS.length}
            </span>
            
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              {isLastStep ? (
                <>
                  <Star className="w-4 h-4" />
                  Complete & Launch
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-orange-600">{completedSteps.size}</div>
          <div className="text-sm text-gray-500">Steps Completed</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">
            {wizardData.profile ? '1' : '0'}
          </div>
          <div className="text-sm text-gray-500">Brand Profile</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-purple-600">
            {wizardData.selectedName ? '1' : '0'}
          </div>
          <div className="text-sm text-gray-500">Selected Name</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">
            {wizardData.selectedLogo ? '1' : '0'}
          </div>
          <div className="text-sm text-gray-500">Logo Created</div>
        </div>
      </div>
    </div>
  );
};

// Placeholder component for step content
const WizardStepContent = ({ step, data, onUpdateData, onMarkCompleted }) => {
  switch (step.component) {
    case 'BrandProfileStep':
      return (
        <div className="text-center py-12">
          <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Brand Profile Setup</h3>
          <p className="text-gray-600 mb-6">
            This step would integrate with the existing BrandProfileManager component
          </p>
          <button
            onClick={() => onMarkCompleted(step.id)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Mark as Complete (Demo)
          </button>
        </div>
      );
    
    case 'NamingStep':
      return (
        <div className="text-center py-12">
          <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Business Name Selection</h3>
          <p className="text-gray-600 mb-6">
            This step would integrate with the existing NameGenerator component
          </p>
          <button
            onClick={() => onMarkCompleted(step.id)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Mark as Complete (Demo)
          </button>
        </div>
      );
    
    default:
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
            {React.createElement(step.icon, { className: "w-8 h-8 text-gray-500" })}
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
          <p className="text-gray-600 mb-6">
            This step component is coming soon...
          </p>
          <button
            onClick={() => onMarkCompleted(step.id)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Mark as Complete (Demo)
          </button>
        </div>
      );
  }
};

export default BrandWizardFlow;