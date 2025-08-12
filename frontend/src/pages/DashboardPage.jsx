import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BarChart3, Heart, Download, CreditCard, User, TrendingUp } from 'lucide-react'
import { useAuth } from '../services/authContext'
import api from '../services/api'

const DashboardPage = () => {
  const { user, profile } = useAuth()
  const [stats, setStats] = useState(null)
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [statsResponse, subResponse] = await Promise.all([
          api.getFavoriteStats(),
          api.getSubscriptionStatus()
        ])
        
        if (statsResponse.success) {
          setStats(statsResponse.data)
        }
        
        if (subResponse.success) {
          setSubscription(subResponse.data)
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'there'}!
          </h1>
          <p className="text-gray-600">Here's what's happening with your slogans.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 rounded-lg">
                <Heart className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Saved Slogans</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.total || 0}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.thisMonth || 0}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Usage</p>
                <p className="text-2xl font-bold text-gray-900">
                  {subscription?.usage || 0}/{subscription?.limit || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link to="/generate" className="btn btn-brand w-full">
                Generate New Slogans
              </Link>
              <Link to="/favorites" className="btn btn-outline w-full">
                <Heart className="h-4 w-4 mr-2" />
                View Favorites
              </Link>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Account</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Plan</span>
                <span className="text-sm font-medium capitalize">
                  {subscription?.tier || 'free'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <span className="text-sm font-medium capitalize">
                  {subscription?.status || 'active'}
                </span>
              </div>
              <Link to="/pricing" className="btn btn-outline w-full">
                <CreditCard className="h-4 w-4 mr-2" />
                Manage Subscription
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage