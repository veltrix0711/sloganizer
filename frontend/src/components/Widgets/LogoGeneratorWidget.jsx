import React, { useState } from 'react';
import { Palette, Download, Crown, Zap, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const LogoGeneratorWidget = ({ user, businessName }) => {
  const [style, setStyle] = useState('modern');
  const [color, setColor] = useState('#3B82F6');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLogos, setGeneratedLogos] = useState([]);
  const [freeGenerationsUsed, setFreeGenerationsUsed] = useState(0);

  const maxFreeGenerations = 2;

  const logoStyles = {
    modern: {
      name: 'Modern',
      description: 'Clean, minimalist design'
    },
    classic: {
      name: 'Classic',
      description: 'Timeless, traditional style'
    },
    playful: {
      name: 'Playful',
      description: 'Fun, creative design'
    },
    professional: {
      name: 'Professional',
      description: 'Corporate, business-focused'
    }
  };

  const generateLogos = async () => {
    if (!businessName?.trim()) {
      toast.error('Please enter a business name first');
      return;
    }

    if (!user && freeGenerationsUsed >= maxFreeGenerations) {
      toast.error('Free limit reached! Sign up for more logos.');
      return;
    }

    setIsGenerating(true);
    try {
      // Generate simple SVG logos (placeholder implementation)
      const logos = [];
      for (let i = 0; i < 3; i++) {
        const logoId = Date.now() + i;
        const logo = {
          id: logoId,
          style: style,
          svg: generateSimpleSVG(businessName, color, style, i),
          downloadUrl: `data:image/svg+xml;base64,${btoa(generateSimpleSVG(businessName, color, style, i))}`
        };
        logos.push(logo);
      }

      setGeneratedLogos(logos);
      if (!user) {
        setFreeGenerationsUsed(prev => prev + 1);
      }
      
      // Mark checklist action as completed
      if (window.markChecklistAction) {
        window.markChecklistAction('hasGeneratedLogo');
      }
    } catch (error) {
      toast.error('Failed to generate logos');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateSimpleSVG = (name, color, style, variant) => {
    const initial = name.charAt(0).toUpperCase();
    const fontSize = variant === 0 ? 24 : variant === 1 ? 20 : 18;
    const shapes = {
      modern: `<rect x="10" y="10" width="80" height="80" rx="20" fill="${color}" opacity="0.1"/>`,
      classic: `<circle cx="50" cy="50" r="40" fill="${color}" opacity="0.1"/>`,
      playful: `<polygon points="50,10 90,90 10,90" fill="${color}" opacity="0.1"/>`,
      professional: `<rect x="15" y="15" width="70" height="70" fill="${color}" opacity="0.1"/>`
    };

    const watermark = !user ? `<text x="50" y="95" text-anchor="middle" font-family="Arial" font-size="6" fill="#666" opacity="0.5">LaunchZone</text>` : '';

    return `
      <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <style>
            .logo-text { font-family: Arial, sans-serif; font-weight: bold; }
          </style>
        </defs>
        ${shapes[style] || shapes.modern}
        <text x="50" y="55" text-anchor="middle" class="logo-text" font-size="${fontSize}" fill="${color}">${initial}</text>
        ${watermark}
      </svg>
    `;
  };

  const downloadLogo = (logo) => {
    if (!user) {
      toast.error('Sign up to download logos without watermark!');
      return;
    }

    const link = document.createElement('a');
    link.href = logo.downloadUrl;
    link.download = `${businessName || 'logo'}-${logo.style}-${logo.id}.svg`;
    link.click();
    toast.success('Logo downloaded!');
  };

  const previewLogo = (logo) => {
    // Create a modal or new window to preview the logo
    const previewWindow = window.open('', '_blank', 'width=400,height=400');
    previewWindow.document.write(`
      <html>
        <head><title>Logo Preview</title></head>
        <body style="display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f0f0f0;">
          <div style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            ${logo.svg}
          </div>
        </body>
      </html>
    `);
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center">
          <Palette className="w-5 h-5 mr-2 text-cyan-400" />
          Logo Generator
        </h3>
        {!user && (
          <span className="text-xs text-slate-400">
            {freeGenerationsUsed}/{maxFreeGenerations} free
          </span>
        )}
      </div>

      <div className="space-y-4">
        {/* Style Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Style</label>
          <select
            className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-200 text-sm"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
          >
            {Object.entries(logoStyles).map(([key, styleInfo]) => (
              <option key={key} value={key}>
                {styleInfo.name} - {styleInfo.description}
              </option>
            ))}
          </select>
        </div>

        {/* Color Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Primary Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-10 h-8 rounded border border-slate-600 bg-slate-700"
            />
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-200 text-sm"
              placeholder="#3B82F6"
            />
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={generateLogos}
          disabled={isGenerating || !businessName?.trim() || (!user && freeGenerationsUsed >= maxFreeGenerations)}
          className="w-full py-2 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-medium text-white shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm"
        >
          {isGenerating ? (
            <>
              <Palette className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Palette className="w-4 h-4 mr-2" />
              Generate Logos
            </>
          )}
        </button>

        {/* Results */}
        {generatedLogos.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-slate-300">Generated Logos:</h4>
            <div className="grid grid-cols-3 gap-2">
              {generatedLogos.map((logo) => (
                <div
                  key={logo.id}
                  className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/50 hover:border-cyan-500/50 transition-colors group"
                >
                  <div 
                    className="w-full aspect-square bg-white rounded-lg flex items-center justify-center mb-2 cursor-pointer"
                    onClick={() => previewLogo(logo)}
                    dangerouslySetInnerHTML={{ __html: logo.svg }}
                  />
                  <div className="flex gap-1">
                    <button
                      onClick={() => previewLogo(logo)}
                      className="flex-1 p-1 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
                      title="Preview"
                    >
                      <Eye className="w-3 h-3 mx-auto" />
                    </button>
                    <button
                      onClick={() => downloadLogo(logo)}
                      className="flex-1 p-1 text-xs text-slate-400 hover:text-green-400 transition-colors"
                      title={user ? "Download" : "Sign up to download"}
                    >
                      <Download className="w-3 h-3 mx-auto" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upgrade Prompt */}
        {!user && freeGenerationsUsed >= maxFreeGenerations && (
          <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg border border-cyan-500/30 p-3 text-center">
            <Crown className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
            <p className="text-cyan-300 text-xs mb-2">Free limit reached!</p>
            <Link 
              to="/signup" 
              className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-md text-white text-xs font-medium hover:shadow-lg transition-all duration-200"
            >
              <Zap className="w-3 h-3 mr-1" />
              Get Unlimited
            </Link>
          </div>
        )}

        {/* Watermark Notice */}
        {!user && (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-2 text-center">
            <p className="text-orange-300 text-xs">
              Free logos include watermark. Sign up to remove!
            </p>
          </div>
        )}

        {/* Full Feature Link */}
        <div className="text-center pt-2 border-t border-slate-600">
          <Link 
            to="/brand-suite" 
            className="text-cyan-400 hover:text-cyan-300 text-xs transition-colors"
          >
            → Professional logo creation in Brand Suite
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LogoGeneratorWidget;