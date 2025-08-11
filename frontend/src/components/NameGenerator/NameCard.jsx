import React, { useState } from 'react';
import { 
  Heart, 
  HeartOff, 
  Globe, 
  Check, 
  X, 
  ExternalLink,
  Clock,
  Trash2,
  Copy,
  CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const NameCard = ({ name, onToggleFavorite, onClaim, onDelete }) => {
  const [copied, setCopied] = useState(false);

  const {
    id,
    name: businessName,
    niche,
    style,
    domain_available,
    domain_checked_at,
    available_extensions,
    is_favorite,
    is_claimed,
    created_at
  } = name;

  const handleCopyName = async () => {
    try {
      await navigator.clipboard.writeText(businessName);
      setCopied(true);
      toast.success('Name copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy name');
    }
  };

  const getDomainStatusColor = () => {
    if (domain_available === null) return 'bg-gray-100 text-gray-600';
    return domain_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getDomainStatusIcon = () => {
    if (domain_available === null) return <Clock className="w-3 h-3" />;
    return domain_available ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />;
  };

  const getDomainStatusText = () => {
    if (domain_available === null) return 'Checking...';
    return domain_available ? 'Available' : 'Unavailable';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStyleColor = (style) => {
    const colors = {
      modern: 'bg-blue-100 text-blue-800',
      creative: 'bg-purple-100 text-purple-800',
      professional: 'bg-gray-100 text-gray-800',
      playful: 'bg-orange-100 text-orange-800',
      premium: 'bg-yellow-100 text-yellow-800',
      tech: 'bg-green-100 text-green-800',
      minimalist: 'bg-indigo-100 text-indigo-800',
      compound: 'bg-pink-100 text-pink-800'
    };
    return colors[style] || 'bg-gray-100 text-gray-800';
  };

  const openDomainSearch = (domain) => {
    const searchUrls = {
      '.com': `https://www.namecheap.com/domains/registration/results/?domain=${businessName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      '.net': `https://www.namecheap.com/domains/registration/results/?domain=${businessName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      '.org': `https://www.namecheap.com/domains/registration/results/?domain=${businessName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      '.io': `https://www.namecheap.com/domains/registration/results/?domain=${businessName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      '.co': `https://www.namecheap.com/domains/registration/results/?domain=${businessName.toLowerCase().replace(/[^a-z0-9]/g, '')}`
    };
    
    const url = searchUrls[domain] || `https://www.namecheap.com/domains/registration/results/?domain=${businessName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-bold text-gray-900 truncate">
                {businessName}
              </h3>
              
              {is_claimed && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Claimed
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStyleColor(style)}`}>
                {style.charAt(0).toUpperCase() + style.slice(1)}
              </span>
              
              {niche && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                  {niche}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={handleCopyName}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              title="Copy name"
            >
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            </button>
            
            <button
              onClick={() => onToggleFavorite(id, !is_favorite)}
              className={`p-2 rounded-md transition-colors ${
                is_favorite 
                  ? 'text-red-500 hover:text-red-600 hover:bg-red-50' 
                  : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
              }`}
              title={is_favorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              {is_favorite ? <Heart className="w-4 h-4 fill-current" /> : <HeartOff className="w-4 h-4" />}
            </button>

            <button
              onClick={() => onDelete(id)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
              title="Delete name"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Domain Status */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Domain Availability</span>
            {domain_checked_at && (
              <span className="text-xs text-gray-500">
                Checked {formatDate(domain_checked_at)}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDomainStatusColor()}`}>
              {getDomainStatusIcon()}
              <span className="ml-1">{getDomainStatusText()}</span>
            </span>

            {available_extensions && available_extensions.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500">Available:</span>
                {available_extensions.map((ext) => (
                  <button
                    key={ext}
                    onClick={() => openDomainSearch(ext)}
                    className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                  >
                    {businessName.toLowerCase().replace(/[^a-z0-9]/g, '')}{ext}
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            Generated {formatDate(created_at)}
          </div>
          
          <div className="flex items-center gap-2">
            {domain_available && !is_claimed && (
              <button
                onClick={() => onClaim(id)}
                className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
              >
                Mark as Claimed
              </button>
            )}
            
            {available_extensions && available_extensions.length > 0 && (
              <button
                onClick={() => openDomainSearch('.com')}
                className="inline-flex items-center px-3 py-1 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
              >
                <Globe className="w-3 h-3 mr-1" />
                Register Domain
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NameCard;