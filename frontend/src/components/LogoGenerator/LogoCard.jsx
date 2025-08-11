import React, { useState } from 'react';
import { 
  Star, 
  StarOff, 
  Download, 
  Trash2, 
  Eye, 
  Copy,
  Check,
  Maximize2,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';

const LogoCard = ({ logo, onSetPrimary, onDelete, onDownload }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const {
    id,
    file_name,
    file_url,
    width,
    height,
    is_primary,
    ai_prompt,
    ai_model,
    generation_params,
    created_at
  } = logo;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(file_url);
      setCopied(true);
      toast.success('Logo URL copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy URL');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileSizeDisplay = () => {
    if (!logo.file_size) return 'Unknown size';
    const sizeInKB = Math.round(logo.file_size / 1024);
    return sizeInKB > 1024 ? `${(sizeInKB / 1024).toFixed(1)}MB` : `${sizeInKB}KB`;
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
        <div className="p-4">
          {/* Logo Image */}
          <div className="relative bg-gray-50 rounded-lg mb-4 aspect-square flex items-center justify-center overflow-hidden">
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
            <img
              src={file_url}
              alt={file_name}
              className="max-w-full max-h-full object-contain"
              onLoad={() => setImageLoading(false)}
              onError={() => setImageLoading(false)}
            />
            
            {/* Primary Badge */}
            {is_primary && (
              <div className="absolute top-2 right-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  <Star className="w-3 h-3 mr-1 fill-current" />
                  Primary
                </span>
              </div>
            )}
            
            {/* Preview Button */}
            <button
              onClick={() => setShowPreview(true)}
              className="absolute top-2 left-2 p-2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-lg text-gray-600 hover:text-gray-900 transition-colors"
              title="Preview full size"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Logo Info */}
          <div className="space-y-3">
            <div>
              <h3 className="font-medium text-gray-900 truncate">{file_name}</h3>
              <div className="flex items-center justify-between text-sm text-gray-500 mt-1">
                <span>{width} × {height}px</span>
                <span>{getFileSizeDisplay()}</span>
              </div>
            </div>

            {/* AI Generation Info */}
            {ai_prompt && (
              <div className="p-2 bg-blue-50 rounded text-xs">
                <div className="flex items-center gap-1 text-blue-700 font-medium mb-1">
                  <Info className="w-3 h-3" />
                  AI Generated
                </div>
                <p className="text-blue-600 line-clamp-2">{ai_prompt}</p>
                {generation_params?.seed && (
                  <p className="text-blue-500 mt-1">Seed: {generation_params.seed}</p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center gap-1">
                {!is_primary && (
                  <button
                    onClick={() => onSetPrimary(id)}
                    className="p-2 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 rounded-md transition-colors"
                    title="Set as primary logo"
                  >
                    <StarOff className="w-4 h-4" />
                  </button>
                )}
                
                <button
                  onClick={handleCopyUrl}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                  title="Copy URL"
                >
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </button>
                
                <button
                  onClick={() => onDownload(file_url, file_name)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  title="Download logo"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
              
              <button
                onClick={() => onDelete(id)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                title="Delete logo"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Metadata */}
            <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
              <div>Generated {formatDate(created_at)}</div>
              {ai_model && (
                <div className="mt-1">Model: {ai_model}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
          onClick={() => setShowPreview(false)}
        >
          <div className="max-w-4xl max-h-full">
            <img
              src={file_url}
              alt={file_name}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <button
            onClick={() => setShowPreview(false)}
            className="absolute top-4 right-4 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-white"
          >
            ×
          </button>
        </div>
      )}
    </>
  );
};

export default LogoCard;