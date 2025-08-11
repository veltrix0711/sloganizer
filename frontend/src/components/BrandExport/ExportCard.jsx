import React from 'react';
import { 
  Download, 
  Trash2, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  ExternalLink,
  Calendar,
  FileText,
  Package
} from 'lucide-react';

const ExportCard = ({ exportItem, exportType, onDownload, onDelete }) => {
  const {
    id,
    exportType: type,
    status,
    fileSize,
    createdAt,
    processedAt,
    expiresAt,
    downloadUrl,
    errorMessage
  } = exportItem;

  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 border-yellow-200';
      case 'processing':
        return 'bg-blue-50 border-blue-200';
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'failed':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'pending':
        return 'Queued for processing';
      case 'processing':
        return 'Generating export...';
      case 'completed':
        return 'Ready for download';
      case 'failed':
        return 'Generation failed';
      default:
        return 'Unknown status';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
  };

  const isExpired = expiresAt && new Date(expiresAt) < new Date();
  const TypeIcon = exportType?.icon || FileText;

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${getStatusColor()}`}>
              <TypeIcon className={`w-5 h-5 ${exportType?.color || 'text-gray-600'}`} />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{exportType?.name || `${type.toUpperCase()} Export`}</h3>
              <p className="text-sm text-gray-500">{exportType?.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {status === 'completed' && downloadUrl && !isExpired && (
              <button
                onClick={() => onDownload(exportItem)}
                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                title="Download export"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
            
            <button
              onClick={() => onDelete(id)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
              title="Delete export"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status */}
        <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border mb-4 ${getStatusColor()}`}>
          {getStatusIcon()}
          <span className="text-sm font-medium">{getStatusText()}</span>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800">Export Failed</p>
                <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Expiration Warning */}
        {isExpired && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Export Expired</p>
                <p className="text-sm text-yellow-700 mt-1">
                  This export has expired and is no longer available for download.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center justify-between">
            <span>Created:</span>
            <span>{formatDate(createdAt)}</span>
          </div>
          
          {processedAt && (
            <div className="flex items-center justify-between">
              <span>Completed:</span>
              <span>{formatDate(processedAt)}</span>
            </div>
          )}
          
          {fileSize && (
            <div className="flex items-center justify-between">
              <span>File size:</span>
              <span>{formatFileSize(fileSize)}</span>
            </div>
          )}
          
          {expiresAt && !isExpired && (
            <div className="flex items-center justify-between">
              <span>Expires:</span>
              <span className="text-orange-600">{formatDate(expiresAt)}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        {status === 'completed' && !isExpired && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            {downloadUrl ? (
              <button
                onClick={() => onDownload(exportItem)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download Export
              </button>
            ) : (
              <div className="text-sm text-gray-500 italic">
                Download link is being prepared...
              </div>
            )}
          </div>
        )}

        {/* Processing Info */}
        {['pending', 'processing'].includes(status) && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>
                {status === 'pending' 
                  ? 'Your export is queued and will begin processing shortly...'
                  : 'Your brand kit is being generated. This typically takes 30 seconds to 2 minutes...'
                }
              </span>
            </div>
          </div>
        )}

        {/* Failed Actions */}
        {status === 'failed' && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600 mb-3">
              The export failed to generate. You can try creating a new export.
            </p>
            <button
              onClick={() => onDelete(id)}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Remove Failed Export
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExportCard;