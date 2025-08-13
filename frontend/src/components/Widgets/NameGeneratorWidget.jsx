import React, { useState } from 'react';
import { Sparkles, Copy, Crown, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const NameGeneratorWidget = ({ user }) => {
  const [businessType, setBusinessType] = useState('');
  const [style, setStyle] = useState('modern');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedNames, setGeneratedNames] = useState([]);
  const [freeGenerationsUsed, setFreeGenerationsUsed] = useState(0);

  const maxFreeGenerations = 3;

  const generateNames = async () => {
    if (!businessType.trim()) {
      toast.error('Please enter a business type');
      return;
    }

    if (!user && freeGenerationsUsed >= maxFreeGenerations) {
      toast.error('Free limit reached! Sign up for more generations.');
      return;
    }

    setIsGenerating(true);
    try {
      // Simple name generation logic (you can enhance this with API calls)
      const styles = {
        modern: ['Tech', 'Digital', 'Smart', 'Pro', 'Next', 'Flow', 'Edge', 'Core'],
        creative: ['Studio', 'Lab', 'Hub', 'Space', 'Craft', 'Works', 'Design', 'Creative'],
        professional: ['Solutions', 'Services', 'Group', 'Partners', 'Associates', 'Corp', 'Consulting', 'Enterprise'],
        playful: ['Box', 'Spot', 'Pop', 'Buzz', 'Spark', 'Dash', 'Flip', 'Zoom']
      };

      const prefixes = ['', 'The ', 'My ', 'Your '];
      const suffixes = styles[style] || styles.modern;
      
      const names = [];
      for (let i = 0; i < 6; i++) {
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        const baseName = businessType.charAt(0).toUpperCase() + businessType.slice(1);
        names.push(`${prefix}${baseName} ${suffix}`);
      }

      setGeneratedNames(names);
      if (!user) {
        setFreeGenerationsUsed(prev => prev + 1);
      }
      
      // Mark checklist action as completed
      if (window.markChecklistAction) {
        window.markChecklistAction('hasGeneratedName');
      }
    } catch (error) {
      toast.error('Failed to generate names');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyName = async (name) => {
    try {
      await navigator.clipboard.writeText(name);
      toast.success('Name copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy name');
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center">
          <Sparkles className="w-5 h-5 mr-2 text-purple-400" />
          Business Name Generator
        </h3>
        {!user && (
          <span className="text-xs text-slate-400">
            {freeGenerationsUsed}/{maxFreeGenerations} free
          </span>
        )}
      </div>

      <div className="space-y-4">
        {/* Input */}
        <div>
          <input
            type="text"
            className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-200 text-sm"
            placeholder="e.g., Tech Startup, Coffee Shop, Consulting..."
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
            maxLength={50}
          />
        </div>

        {/* Style */}
        <div>
          <select
            className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-200 text-sm"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
          >
            <option value="modern">Modern</option>
            <option value="creative">Creative</option>
            <option value="professional">Professional</option>
            <option value="playful">Playful</option>
          </select>
        </div>

        {/* Generate Button */}
        <button
          onClick={generateNames}
          disabled={isGenerating || !businessType.trim() || (!user && freeGenerationsUsed >= maxFreeGenerations)}
          className="w-full py-2 px-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg font-medium text-white shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm"
        >
          {isGenerating ? (
            <>
              <Sparkles className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Names
            </>
          )}
        </button>

        {/* Results */}
        {generatedNames.length > 0 && (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {generatedNames.map((name, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-slate-700/30 rounded-lg border border-slate-600/50 hover:border-purple-500/50 transition-colors"
              >
                <span className="text-white text-sm flex-1">{name}</span>
                <button
                  onClick={() => copyName(name)}
                  className="p-1 text-slate-400 hover:text-purple-400 transition-colors"
                  title="Copy name"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upgrade Prompt */}
        {!user && freeGenerationsUsed >= maxFreeGenerations && (
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/30 p-3 text-center">
            <Crown className="w-5 h-5 text-purple-400 mx-auto mb-1" />
            <p className="text-purple-300 text-xs mb-2">Free limit reached!</p>
            <Link 
              to="/signup" 
              className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-600 rounded-md text-white text-xs font-medium hover:shadow-lg transition-all duration-200"
            >
              <Zap className="w-3 h-3 mr-1" />
              Get Unlimited
            </Link>
          </div>
        )}

        {/* Full Feature Link */}
        <div className="text-center pt-2 border-t border-slate-600">
          <Link 
            to="/brand-suite" 
            className="text-purple-400 hover:text-purple-300 text-xs transition-colors"
          >
            → Advanced name generation in Brand Suite
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NameGeneratorWidget;