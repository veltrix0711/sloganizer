import { useState, useEffect } from 'react'
import { User, Mail, CreditCard, Shield } from 'lucide-react'
import { useAuth } from '../services/authContext'

const ProfilePage = () => {
  const { user, profile, updateProfile } = useAuth()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user && profile) {
      setFormData({
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        email: user.email || ''
      })
    }
  }, [user, profile])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await updateProfile({
        first_name: formData.firstName,
        last_name: formData.lastName
      })
    } catch (error) {
      console.error('Update error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Form */}
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Personal Information
              </h2>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="form-label">First Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="form-label">Last Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="mt-6">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input bg-gray-50"
                    value={formData.email}
                    disabled
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Email cannot be changed. Contact support if needed.
                  </p>
                </div>
                
                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn btn-brand"
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Account Info */}
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Subscription
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Plan</span>
                  <span className="font-medium capitalize">
                    {(profile?.subscription_plan === 'pro' || profile?.subscription_plan === 'pro_500' || profile?.subscription_plan === 'pro-500') ? 'Professional' : 
                     (profile?.subscription_plan === 'agency' || profile?.subscription_plan === 'premium') ? 'Enterprise' : 
                     'Starter'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className="font-medium capitalize">{profile?.subscription_status || 'active'}</span>
                </div>
                <div className="pt-3">
                  <a href="/pricing" className="btn btn-outline w-full text-sm">
                    Manage Subscription
                  </a>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Security
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Update your password and security settings
              </p>
              <button className="btn btn-outline w-full text-sm">
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage