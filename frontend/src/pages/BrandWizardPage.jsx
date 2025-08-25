import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/authContext';
import BrandWizardFlow from '../components/BrandWizard/BrandWizardFlow';
import toast from 'react-hot-toast';

const BrandWizardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleWizardComplete = (wizardData) => {
    toast.success('🎉 Brand creation completed! Welcome to your new brand.');
    
    // Navigate to dashboard or brand suite
    navigate('/brand-suite', { 
      state: { 
        message: 'Your brand has been successfully created!',
        wizardData 
      }
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Please log in to access the Brand Wizard
          </h2>
          <p className="text-gray-600">
            You need to be logged in to create your brand identity.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <BrandWizardFlow onComplete={handleWizardComplete} />
    </div>
  );
};

export default BrandWizardPage;