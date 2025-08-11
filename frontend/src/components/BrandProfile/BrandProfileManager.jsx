import React, { useState, useEffect } from 'react';
import { useAuth } from '../../services/authContext';
import { supabase } from '../../services/supabase';
import toast from 'react-hot-toast';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Star, 
  StarOff, 
  Palette, 
  Type, 
  Users, 
  Building,
  ExternalLink 
} from 'lucide-react';
import BrandProfileForm from './BrandProfileForm';
import BrandProfileCard from './BrandProfileCard';

const BrandProfileManager = () => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);

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

      if (!response.ok) throw new Error('Failed to load profiles');

      const data = await response.json();
      setProfiles(data.profiles || []);
      
      // Set selected profile to default or first profile
      const defaultProfile = data.profiles?.find(p => p.is_default) || data.profiles?.[0];
      setSelectedProfile(defaultProfile);

    } catch (error) {
      console.error('Load profiles error:', error);
      toast.error('Failed to load brand profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProfile = () => {
    setEditingProfile(null);
    setShowForm(true);
  };

  const handleEditProfile = (profile) => {
    setEditingProfile(profile);
    setShowForm(true);
  };

  const handleDeleteProfile = async (profileId) => {
    if (!confirm('Are you sure you want to delete this brand profile? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/brand/profiles/${profileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${await supabase.auth.getSession().then(s => s.data.session?.access_token)}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete profile');

      toast.success('Brand profile deleted successfully');
      loadProfiles();
      
      // Clear selected profile if it was deleted
      if (selectedProfile?.id === profileId) {
        setSelectedProfile(null);
      }

    } catch (error) {
      console.error('Delete profile error:', error);
      toast.error('Failed to delete profile');
    }
  };

  const handleSetDefault = async (profileId) => {
    try {
      const response = await fetch(`/api/brand/profiles/${profileId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await supabase.auth.getSession().then(s => s.data.session?.access_token)}`,
        },
        body: JSON.stringify({ is_default: true }),
      });

      if (!response.ok) throw new Error('Failed to set default profile');

      toast.success('Default profile updated');
      loadProfiles();

    } catch (error) {
      console.error('Set default profile error:', error);
      toast.error('Failed to set default profile');
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      const url = editingProfile 
        ? `/api/brand/profiles/${editingProfile.id}`
        : '/api/brand/profiles';
      
      const method = editingProfile ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await supabase.auth.getSession().then(s => s.data.session?.access_token)}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save profile');

      const result = await response.json();
      
      toast.success(editingProfile ? 'Profile updated successfully' : 'Profile created successfully');
      setShowForm(false);
      setEditingProfile(null);
      loadProfiles();
      
      // Set as selected if it's the first profile or newly set as default
      if (!selectedProfile || result.profile?.is_default) {
        setSelectedProfile(result.profile);
      }

    } catch (error) {
      console.error('Save profile error:', error);
      toast.error('Failed to save profile');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Profile List Sidebar */}
        <div className="lg:w-80">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Brand Profiles</h2>
              <button
                onClick={handleCreateProfile}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="w-4 h-4 mr-1" />
                New Profile
              </button>
            </div>

            {profiles.length === 0 ? (
              <div className="text-center py-8">
                <Building className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No brand profiles</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating your first brand profile.</p>
                <button
                  onClick={handleCreateProfile}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Brand Profile
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {profiles.map((profile) => (
                  <div
                    key={profile.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedProfile?.id === profile.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedProfile(profile)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {profile.name}
                          </h3>
                          {profile.is_default && (
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          )}
                        </div>
                        {profile.tagline && (
                          <p className="text-xs text-gray-500 mt-1 truncate">{profile.tagline}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          {profile.primary_color && (
                            <div
                              className="w-4 h-4 rounded-full border border-gray-200"
                              style={{ backgroundColor: profile.primary_color }}
                            />
                          )}
                          {profile.industry && (
                            <span className="text-xs text-gray-400">{profile.industry}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditProfile(profile);
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="Edit profile"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {!profile.is_default && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSetDefault(profile.id);
                            }}
                            className="p-1 text-gray-400 hover:text-yellow-500"
                            title="Set as default"
                          >
                            <StarOff className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProfile(profile.id);
                          }}
                          className="p-1 text-gray-400 hover:text-red-500"
                          title="Delete profile"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          {selectedProfile ? (
            <BrandProfileCard
              profile={selectedProfile}
              onEdit={() => handleEditProfile(selectedProfile)}
            />
          ) : profiles.length > 0 ? (
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
              <Building className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">Select a brand profile</h3>
              <p className="mt-1 text-sm text-gray-500">
                Choose a profile from the sidebar to view its details and manage brand assets.
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Profile Form Modal */}
      {showForm && (
        <BrandProfileForm
          profile={editingProfile}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingProfile(null);
          }}
        />
      )}
    </div>
  );
};

export default BrandProfileManager;