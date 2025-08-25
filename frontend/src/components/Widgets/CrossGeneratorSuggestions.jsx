import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Sparkles, 
  Palette, 
  Share2, 
  Type, 
  Download,
  Lightbulb,
  Zap
} from 'lucide-react';

const CrossGeneratorSuggestions = ({ currentGenerator, selectedProfile, latestAssets = {} }) => {
  // Define suggestions based on current generator and available assets
  const getSuggestions = () => {
    const suggestions = [];

    switch (currentGenerator) {
      case 'names':
        if (latestAssets.selectedName) {
          suggestions.push({
            id: 'name-to-logo',
            title: 'Create Logo for "' + latestAssets.selectedName + '"',
            description: 'Generate a professional logo that matches your chosen business name',
            icon: Palette,
            color: 'bg-purple-500',
            hoverColor: 'hover:bg-purple-600',
            link: '/brand-suite?tab=logos',
            action: () => {
              // Store name context for logo generator
              localStorage.setItem('lz_logo_prefill', JSON.stringify({
                brandName: latestAssets.selectedName,
                fromGenerator: 'names'
              }));
            }
          });
        }

        suggestions.push({
          id: 'name-to-social',
          title: 'Create Social Posts',
          description: 'Generate social media content for your brand identity',
          icon: Share2,
          color: 'bg-blue-500',
          hoverColor: 'hover:bg-blue-600',
          link: '/brand-suite?tab=social'
        });
        break;

      case 'logos':
        suggestions.push({
          id: 'logo-to-social',
          title: 'Create Social Posts',
          description: 'Generate social content that matches your logo style',
          icon: Share2,
          color: 'bg-blue-500',
          hoverColor: 'hover:bg-blue-600',
          link: '/brand-suite?tab=social'
        });

        suggestions.push({
          id: 'logo-to-export',
          title: 'Export Brand Kit',
          description: 'Create a complete brand kit with your logo and guidelines',
          icon: Download,
          color: 'bg-green-500',
          hoverColor: 'hover:bg-green-600',
          link: '/brand-suite?tab=exports'
        });
        break;

      case 'social':
        if (!latestAssets.hasLogo) {
          suggestions.push({
            id: 'social-to-logo',
            title: 'Create Matching Logo',
            description: 'Design a logo that complements your social content style',
            icon: Palette,
            color: 'bg-purple-500',
            hoverColor: 'hover:bg-purple-600',
            link: '/brand-suite?tab=logos'
          });
        }

        suggestions.push({
          id: 'social-to-export',
          title: 'Export Content Package',
          description: 'Download your social posts and brand assets',
          icon: Download,
          color: 'bg-green-500',
          hoverColor: 'hover:bg-green-600',
          link: '/brand-suite?tab=exports'
        });
        break;

      case 'exports':
        if (!latestAssets.hasLogo) {
          suggestions.push({
            id: 'export-to-logo',
            title: 'Add Missing Logo',
            description: 'Complete your brand kit with a professional logo',
            icon: Palette,
            color: 'bg-purple-500',
            hoverColor: 'hover:bg-purple-600',
            link: '/brand-suite?tab=logos'
          });
        }

        if (!latestAssets.hasSocialContent) {
          suggestions.push({
            id: 'export-to-social',
            title: 'Add Social Content',
            description: 'Generate social posts to complete your brand package',
            icon: Share2,
            color: 'bg-blue-500',
            hoverColor: 'hover:bg-blue-600',
            link: '/brand-suite?tab=social'
          });
        }
        break;

      default:
        // Generic suggestions for unknown generators
        suggestions.push({
          id: 'complete-brand',
          title: 'Complete Your Brand',
          description: 'Use all generators to build a comprehensive brand identity',
          icon: Zap,
          color: 'bg-gradient-to-r from-orange-500 to-red-500',
          hoverColor: 'hover:from-orange-600 hover:to-red-600',
          link: '/brand-suite?tab=profiles'
        });
        break;
    }

    // Always suggest profile creation if no profile selected
    if (!selectedProfile) {
      suggestions.unshift({
        id: 'create-profile',
        title: 'Create Brand Profile First',
        description: 'Set up your brand identity to get better, more cohesive results',
        icon: Type,
        color: 'bg-indigo-500',
        hoverColor: 'hover:bg-indigo-600',
        link: '/brand-suite?tab=profiles',
        priority: true
      });
    }

    return suggestions;
  };

  const suggestions = getSuggestions();

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
          <Lightbulb className="w-4 h-4 text-white" />
        </div>
        <h3 className="font-semibold text-gray-900">Smart Suggestions</h3>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        Based on your current work, here are some logical next steps:
      </p>

      <div className="space-y-3">
        {suggestions.map((suggestion) => {
          const Icon = suggestion.icon;
          const isGradient = suggestion.color.includes('gradient');
          
          return (
            <Link
              key={suggestion.id}
              to={suggestion.link}
              onClick={suggestion.action}
              className={`group flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 ${
                suggestion.priority ? 'bg-indigo-50 border-indigo-200' : 'bg-white hover:bg-gray-50'
              }`}
            >
              <div className={`p-2 rounded-lg ${isGradient ? suggestion.color : `${suggestion.color} text-white`} group-${suggestion.hoverColor} transition-colors flex-shrink-0`}>
                <Icon className="w-4 h-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 group-hover:text-gray-700">
                  {suggestion.title}
                </div>
                <div className="text-sm text-gray-500 group-hover:text-gray-600">
                  {suggestion.description}
                </div>
              </div>
              
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </Link>
          );
        })}
      </div>

      {selectedProfile && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: selectedProfile.primary_color || '#3B82F6' }}
            />
            <span>Using brand context: {selectedProfile.name}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrossGeneratorSuggestions;