import React, { useState } from 'react';
import { 
  Edit3, 
  Trash2, 
  Copy, 
  Check, 
  Calendar, 
  Send, 
  Clock, 
  Hash,
  MessageSquare,
  ExternalLink,
  Save,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

const PostCard = ({ post, platform, onUpdate, onSchedule, onPublish, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const [editedHashtags, setEditedHashtags] = useState(post.hashtags?.join(' ') || '');
  const [copied, setCopied] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');

  const {
    id,
    content,
    hashtags = [],
    character_count,
    is_draft,
    scheduled_for,
    posted_at,
    created_at,
    updated_at
  } = post;

  const handleCopyContent = async () => {
    try {
      const fullContent = hashtags.length > 0 
        ? `${content}\n\n${hashtags.map(h => `#${h}`).join(' ')}`
        : content;
      
      await navigator.clipboard.writeText(fullContent);
      setCopied(true);
      toast.success('Post content copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy content');
    }
  };

  const handleSaveEdit = async () => {
    try {
      const hashtagsArray = editedHashtags
        .split(/\s+/)
        .map(tag => tag.replace('#', '').trim())
        .filter(tag => tag.length > 0);

      await onUpdate(id, {
        content: editedContent,
        hashtags: hashtagsArray
      });
      
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update post');
    }
  };

  const handleCancelEdit = () => {
    setEditedContent(content);
    setEditedHashtags(hashtags.join(' '));
    setIsEditing(false);
  };

  const handleSchedule = async () => {
    if (!scheduleDate) {
      toast.error('Please select a date and time');
      return;
    }

    try {
      await onSchedule(id, scheduleDate);
      setShowSchedule(false);
      setScheduleDate('');
    } catch (error) {
      toast.error('Failed to schedule post');
    }
  };

  const getStatusBadge = () => {
    if (posted_at) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <Check className="w-3 h-3 mr-1" />
          Published
        </span>
      );
    }
    
    if (scheduled_for) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <Clock className="w-3 h-3 mr-1" />
          Scheduled
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <Edit3 className="w-3 h-3 mr-1" />
        Draft
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCharacterCount = () => {
    const currentCount = isEditing ? editedContent.length : character_count;
    const maxChars = getPlatformMaxChars();
    const isOverLimit = currentCount > maxChars;
    
    return (
      <span className={`text-xs ${isOverLimit ? 'text-red-600' : 'text-gray-500'}`}>
        {currentCount.toLocaleString()} / {maxChars.toLocaleString()} characters
        {isOverLimit && ' (over limit)'}
      </span>
    );
  };

  const getPlatformMaxChars = () => {
    const limits = {
      instagram: 2200,
      linkedin: 3000,
      twitter: 280,
      facebook: 63206,
      tiktok: 300
    };
    return limits[post.platform] || 2200;
  };

  const getPlatformColor = () => {
    const colors = {
      instagram: 'border-pink-200 bg-pink-50',
      linkedin: 'border-blue-200 bg-blue-50',
      twitter: 'border-blue-200 bg-blue-50',
      facebook: 'border-blue-200 bg-blue-50',
      tiktok: 'border-gray-200 bg-gray-50'
    };
    return colors[post.platform] || 'border-gray-200 bg-gray-50';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-lg border ${getPlatformColor()}`}>
              <span className="text-sm font-medium">
                {platform?.icon} {platform?.name}
              </span>
            </div>
            {getStatusBadge()}
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={handleCopyContent}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              title="Copy content"
            >
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            </button>
            
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                title="Edit post"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
            
            <button
              onClick={() => onDelete(id)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
              title="Delete post"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {isEditing ? (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hashtags</label>
                <input
                  type="text"
                  value={editedHashtags}
                  onChange={(e) => setEditedHashtags(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="hashtag1 hashtag2 hashtag3"
                />
                <p className="text-xs text-gray-500 mt-1">Space-separated hashtags</p>
              </div>
              
              <div className="flex items-center justify-between">
                {getCharacterCount()}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCancelEdit}
                    className="px-3 py-1 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="px-3 py-1 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-gray-900 whitespace-pre-wrap mb-3">{content}</p>
              
              {hashtags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {hashtags.map((hashtag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800"
                    >
                      <Hash className="w-3 h-3 mr-1" />
                      {hashtag}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                {getCharacterCount()}
                <div className="flex items-center gap-4">
                  <span>Created {formatDate(created_at)}</span>
                  {updated_at && updated_at !== created_at && (
                    <span>Edited {formatDate(updated_at)}</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Scheduling Info */}
        {scheduled_for && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <Calendar className="w-4 h-4" />
              <span>Scheduled for {formatDate(scheduled_for)}</span>
            </div>
          </div>
        )}

        {posted_at && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 text-sm text-green-800">
              <Check className="w-4 h-4" />
              <span>Published on {formatDate(posted_at)}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        {!isEditing && (
          <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              {is_draft && !scheduled_for && (
                <button
                  onClick={() => setShowSchedule(!showSchedule)}
                  className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                >
                  <Calendar className="w-4 h-4 mr-1" />
                  Schedule
                </button>
              )}
              
              {is_draft && (
                <button
                  onClick={() => onPublish(id)}
                  className="inline-flex items-center px-3 py-1 text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-md transition-colors"
                >
                  <Send className="w-4 h-4 mr-1" />
                  Mark as Published
                </button>
              )}
            </div>
          </div>
        )}

        {/* Schedule Form */}
        {showSchedule && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center gap-3">
              <input
                type="datetime-local"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min={new Date().toISOString().slice(0, 16)}
              />
              <button
                onClick={handleSchedule}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                Schedule
              </button>
              <button
                onClick={() => setShowSchedule(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;