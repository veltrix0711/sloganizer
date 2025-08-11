import React, { useState } from 'react';
import { useAuth } from '../services/authContext';
import { 
  Building, 
  Type, 
  Palette, 
  Share2, 
  Download,
  Sparkles,
  Users,
  Globe
} from 'lucide-react';
import BrandProfileManager from '../components/BrandProfile/BrandProfileManager';
import NameGenerator from '../components/NameGenerator/NameGenerator';
import LogoGenerator from '../components/LogoGenerator/LogoGenerator';
import SocialPostsGenerator from '../components/SocialPosts/SocialPostsGenerator';
import BrandExportGenerator from '../components/BrandExport/BrandExportGenerator';

const BrandSuitePage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profiles');

  const tabs = [
    {
      id: 'profiles',
      name: 'Brand Profiles',
      icon: Building,
      description: 'Manage your brand identities and guidelines'
    },
    {
      id: 'names',
      name: 'Name Generator', 
      icon: Sparkles,
      description: 'Generate business names with domain checking'
    },
    {
      id: 'logos',
      name: 'Logo Generator',
      icon: Palette,
      description: 'Create AI-powered logos and brand assets'
    },
    {
      id: 'social',
      name: 'Social Posts',
      icon: Share2,
      description: 'Generate platform-specific social media content'
    },
    {
      id: 'exports',
      name: 'Brand Kits',
      icon: Download,
      description: 'Export comprehensive brand kits and guidelines'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profiles':
        return <BrandProfileManager />;
      case 'names':
        return <NameGenerator />;
      case 'logos':
        return <LogoGenerator />;
      case 'social':
        return <SocialPostsGenerator />;
      case 'exports':
        return <BrandExportGenerator />;
      default:
        return <BrandProfileManager />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Brand Suite</h1>
                <p className="mt-2 text-gray-600">
                  Complete brand creation and management platform
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Welcome back</p>
                  <p className="font-medium text-gray-900">{user?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </div>
    </div>
  );
};

// Temporary component for features not yet implemented
const ComingSoonPanel = ({ feature }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
      <div className="max-w-md mx-auto">
        <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-6">
          <Sparkles className="w-10 h-10 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">
          {feature} Coming Soon
        </h3>
        <p className="text-gray-600 mb-6">
          We're working hard to bring you this powerful feature. It will be available in the next update.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">What to expect:</h4>
          <ul className="text-sm text-blue-800 text-left space-y-1">
            {feature.includes('Name') && (
              <>
                <li>• AI-powered business name generation</li>
                <li>• Real-time domain availability checking</li>
                <li>• Industry-specific name suggestions</li>
                <li>• Trademark conflict checking</li>
              </>
            )}
            {feature.includes('Logo') && (
              <>
                <li>• AI-generated logo designs</li>
                <li>• Multiple style variations</li>
                <li>• High-resolution downloads</li>
                <li>• Brand guideline integration</li>
              </>
            )}
            {feature.includes('Social') && (
              <>
                <li>• Platform-specific content generation</li>
                <li>• Hashtag optimization</li>
                <li>• Scheduling and calendar integration</li>
                <li>• Performance analytics</li>
              </>
            )}
            {feature.includes('Export') && (
              <>
                <li>• Professional PDF brand guides</li>
                <li>• Notion workspace templates</li>
                <li>• Asset package downloads</li>
                <li>• Shareable brand links</li>
              </>
            )}
          </ul>
        </div>
        <p className="text-sm text-gray-500 mt-6">
          For now, you can create and manage your brand profiles to get started.
        </p>
      </div>
    </div>
  );
};

export default BrandSuitePage;