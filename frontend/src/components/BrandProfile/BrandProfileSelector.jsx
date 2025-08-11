import React, { useState, useEffect } from 'react';
import { useAuth } from '../../services/authContext';
import { supabase } from '../../services/supabase';
import { ChevronDown, Building, Star } from 'lucide-react';

const BrandProfileSelector = ({ selectedProfile, onProfileChange, allowNone = false }) => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfiles();
    }
  }, [user]);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/brand/profiles', {
        headers: {
          'Authorization': `Bearer ${await supabase.auth.getSession().then(s => s.data.session?.access_token)}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfiles(data.profiles || []);
        
        // Auto-select default profile if none selected
        if (!selectedProfile && data.profiles?.length > 0) {
          const defaultProfile = data.profiles.find(p => p.is_default) || data.profiles[0];
          onProfileChange(defaultProfile);
        }
      }
    } catch (error) {
      console.error('Load profiles error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (profile) => {
    onProfileChange(profile);
    setIsOpen(false);
  };

  if (loading) {
    return (
      <div className="w-64 h-10 bg-gray-100 rounded-md animate-pulse"></div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic">
        No brand profiles created yet
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-64 flex items-center justify-between px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <div className="flex items-center gap-2 min-w-0">
          {selectedProfile ? (
            <>
              <div 
                className="w-4 h-4 rounded-full border border-gray-200 flex-shrink-0"
                style={{ backgroundColor: selectedProfile.primary_color || '#3B82F6' }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {selectedProfile.name}
                  </span>
                  {selectedProfile.is_default && (
                    <Star className="w-3 h-3 text-yellow-500 fill-current flex-shrink-0" />
                  )}
                </div>
                {selectedProfile.industry && (
                  <span className="text-xs text-gray-500 truncate block">
                    {selectedProfile.industry}
                  </span>
                )}
              </div>
            </>
          ) : (
            <>
              <Building className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-500">
                {allowNone ? 'No profile selected' : 'Select brand profile'}
              </span>
            </>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
          {allowNone && (
            <button
              onClick={() => handleSelect(null)}
              className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
            >
              <Building className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">No profile</span>
            </button>
          )}
          
          {profiles.map((profile) => (
            <button
              key={profile.id}
              onClick={() => handleSelect(profile)}
              className={`w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 ${
                selectedProfile?.id === profile.id ? 'bg-blue-50' : ''
              }`}
            >
              <div 
                className="w-4 h-4 rounded-full border border-gray-200 flex-shrink-0"
                style={{ backgroundColor: profile.primary_color || '#3B82F6' }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {profile.name}
                  </span>
                  {profile.is_default && (
                    <Star className="w-3 h-3 text-yellow-500 fill-current flex-shrink-0" />
                  )}
                </div>
                {profile.industry && (
                  <span className="text-xs text-gray-500 truncate block">
                    {profile.industry}
                  </span>
                )}
              </div>
            </button>
          ))}
          
          {profiles.length === 0 && !allowNone && (
            <div className="px-3 py-2 text-sm text-gray-500">
              No brand profiles available
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BrandProfileSelector;