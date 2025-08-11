import React from 'react';
import { 
  Clock, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Zap
} from 'lucide-react';

const JobStatusCard = ({ job, compact = false }) => {
  const {
    id,
    status,
    createdAt,
    completedAt,
    errorMessage,
    progress = 0
  } = job;

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
        return `Generating logos... ${progress}%`;
      case 'completed':
        return 'Generation completed';
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
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeElapsed = () => {
    const start = new Date(createdAt);
    const end = completedAt ? new Date(completedAt) : new Date();
    const diffInSeconds = Math.floor((end - start) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds}s`;
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    return `${diffInMinutes}m ${diffInSeconds % 60}s`;
  };

  if (compact) {
    return (
      <div className={`p-3 rounded-lg border ${getStatusColor()}`}>
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900">
              {getStatusText()}
            </div>
            <div className="text-xs text-gray-500">
              {formatDate(createdAt)}
              {completedAt && ` • Completed in ${getTimeElapsed()}`}
            </div>
          </div>
        </div>
        
        {errorMessage && (
          <div className="mt-2 text-xs text-red-600">
            {errorMessage}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-lg border ${getStatusColor()}`}>
      <div className="flex items-start gap-3">
        {getStatusIcon()}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-medium text-gray-900">
              Logo Generation Job
            </h4>
            <span className="text-xs text-gray-500">
              {formatDate(createdAt)}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 mb-2">
            {getStatusText()}
          </p>

          {/* Progress Bar */}
          {status === 'processing' && (
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded text-xs text-red-700">
              <strong>Error:</strong> {errorMessage}
            </div>
          )}

          {/* Completion Info */}
          {completedAt && (
            <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
              <span>Completed: {formatDate(completedAt)}</span>
              <span>Duration: {getTimeElapsed()}</span>
            </div>
          )}

          {/* Active Status Indicator */}
          {['pending', 'processing'].includes(status) && (
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
              <Zap className="w-3 h-3" />
              <span>
                {status === 'pending' 
                  ? 'Waiting in queue...' 
                  : 'AI is generating your logos...'
                }
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobStatusCard;