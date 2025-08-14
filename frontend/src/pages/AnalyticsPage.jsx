import { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  Eye, 
  Heart, 
  Share2, 
  MessageCircle,
  BarChart3,
  Download,
  Calendar,
  Users,
  Target,
  Zap,
  Instagram,
  Twitter,
  Facebook,
  Plus,
  RefreshCw,
  Settings
} from 'lucide-react'
import { useAuth } from '../services/authContext'
import api from '../services/api'
import toast from 'react-hot-toast'
import SocialConnectModal from '../components/SocialConnectModal'

const AnalyticsPage = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [overview, setOverview] = useState(null)
  const [metrics, setMetrics] = useState(null)
  const [topPosts, setTopPosts] = useState([])
  const [selectedPeriod, setSelectedPeriod] = useState('30')
  const [selectedPlatform, setSelectedPlatform] = useState('all')
  const [connectedAccounts, setConnectedAccounts] = useState([])
  const [syncStatus, setSyncStatus] = useState(null)
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    if (user) {
      loadAnalyticsData()
      loadConnectedAccounts()
      loadSyncStatus()
    }
  }, [user, selectedPeriod, selectedPlatform])

  const loadAnalyticsData = async () => {
    if (!user?.email) return
    
    setLoading(true)
    try {
      // Load overview data
      const overviewRes = await api.get(`/api/analytics/overview?email=${user.email}`)
      if (overviewRes.success) {
        setOverview(overviewRes.overview)
      }

      // Load detailed metrics
      const metricsRes = await api.get(`/api/analytics/metrics?email=${user.email}&days=${selectedPeriod}${selectedPlatform !== 'all' ? `&platform=${selectedPlatform}` : ''}`)
      if (metricsRes.success) {
        setMetrics(metricsRes.metrics)
      }

      // Load top performing posts
      const topPostsRes = await api.get(`/api/analytics/top-posts?email=${user.email}&limit=5${selectedPlatform !== 'all' ? `&platform=${selectedPlatform}` : ''}`)
      if (topPostsRes.success) {
        setTopPosts(topPostsRes.topPosts)
      }

    } catch (error) {
      console.error('Analytics loading error:', error)
      toast.error('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (format) => {
    try {
      const baseUrl = `/api/analytics/export?email=${user.email}&days=${selectedPeriod}${selectedPlatform !== 'all' ? `&platform=${selectedPlatform}` : ''}`
      
      if (format === 'pdf') {
        // Handle PDF download
        const response = await fetch(`${api.defaults.baseURL}${baseUrl}&format=pdf`, {
          method: 'GET',
          headers: {
            'Authorization': api.defaults.headers.Authorization || ''
          }
        })
        
        if (response.ok) {
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.pdf`
          a.click()
          window.URL.revokeObjectURL(url)
          toast.success('PDF report downloaded!')
        } else {
          throw new Error('PDF generation failed')
        }
      } else if (format === 'csv-enhanced') {
        // Handle enhanced CSV download
        const response = await fetch(`${api.defaults.baseURL}${baseUrl}&format=csv-enhanced`, {
          method: 'GET',
          headers: {
            'Authorization': api.defaults.headers.Authorization || ''
          }
        })
        
        if (response.ok) {
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.csv`
          a.click()
          window.URL.revokeObjectURL(url)
          toast.success('Enhanced CSV report downloaded!')
        } else {
          throw new Error('CSV generation failed')
        }
      } else {
        // Handle basic CSV and JSON exports
        const response = await api.get(`${baseUrl}&format=${format}`)
        
        if (format === 'csv') {
          const blob = new Blob([response.data], { type: 'text/csv' })
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`
          a.click()
          window.URL.revokeObjectURL(url)
        } else {
          const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' })
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `analytics-${new Date().toISOString().split('T')[0]}.json`
          a.click()
          window.URL.revokeObjectURL(url)
        }
        
        toast.success(`Analytics exported as ${format.toUpperCase()}`)
      }
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export analytics')
    }
  }

  const loadConnectedAccounts = async () => {
    if (!user?.email) return
    
    try {
      const response = await api.get(`/api/analytics/accounts?email=${user.email}`)
      if (response.success) {
        setConnectedAccounts(response.accounts)
      }
    } catch (error) {
      console.error('Failed to load connected accounts:', error)
    }
  }

  const loadSyncStatus = async () => {
    if (!user?.email) return
    
    try {
      const response = await api.get(`/api/analytics/sync/status?email=${user.email}`)
      if (response.success) {
        setSyncStatus(response)
      }
    } catch (error) {
      console.error('Failed to load sync status:', error)
    }
  }

  const handleSyncData = async (platform = null) => {
    if (!user?.email) return
    
    setSyncing(true)
    try {
      const payload = { email: user.email }
      if (platform) payload.platform = platform

      const response = await api.post('/api/analytics/sync', payload)
      if (response.success) {
        toast.success(response.message)
        // Reload data after sync
        setTimeout(() => {
          loadAnalyticsData()
          loadSyncStatus()
        }, 2000)
      }
    } catch (error) {
      console.error('Sync failed:', error)
      toast.error('Failed to sync data')
    } finally {
      setSyncing(false)
    }
  }

  const handleAccountConnected = (platform) => {
    loadConnectedAccounts()
    loadSyncStatus()
    toast.success(`${platform} account connected successfully!`)
  }

  const getPlatformIcon = (platform) => {
    switch (platform?.toLowerCase()) {
      case 'instagram': return <Instagram className="h-4 w-4 text-pink-500" />
      case 'twitter': return <Twitter className="h-4 w-4 text-blue-400" />
      case 'facebook': return <Facebook className="h-4 w-4 text-blue-600" />
      default: return <Target className="h-4 w-4 text-gray-400" />
    }
  }

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num?.toString() || '0'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-night py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-space rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-space rounded-lg"></div>
              ))}
            </div>
            <div className="h-96 bg-space rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-night py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-heading mb-2">Analytics Dashboard</h1>
            <p className="text-body">Track your content performance across all platforms</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-6 md:mt-0">
            {/* Period Selector */}
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-space border border-electric/20 text-heading px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>

            {/* Platform Filter */}
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="bg-space border border-electric/20 text-heading px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric"
            >
              <option value="all">All Platforms</option>
              <option value="instagram">Instagram</option>
              <option value="twitter">Twitter</option>
              <option value="facebook">Facebook</option>
              <option value="tiktok">TikTok</option>
            </select>

            {/* Sync Button */}
            <button
              onClick={() => handleSyncData()}
              disabled={syncing}
              className="btn-secondary flex items-center"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync Data'}
            </button>

            {/* Export Button */}
            <div className="relative group">
              <button className="btn-secondary flex items-center">
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
              
              {/* Export Dropdown */}
              <div className="absolute right-0 mt-2 w-48 bg-space border border-electric/20 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                <button
                  onClick={() => handleExport('pdf')}
                  className="w-full text-left px-4 py-2 text-body hover:bg-electric/10 hover:text-heading transition-colors rounded-t-lg flex items-center"
                >
                  📄 PDF Report
                </button>
                <button
                  onClick={() => handleExport('csv-enhanced')}
                  className="w-full text-left px-4 py-2 text-body hover:bg-electric/10 hover:text-heading transition-colors flex items-center"
                >
                  📊 Enhanced CSV
                </button>
                <button
                  onClick={() => handleExport('csv')}
                  className="w-full text-left px-4 py-2 text-body hover:bg-electric/10 hover:text-heading transition-colors flex items-center"
                >
                  📄 Basic CSV
                </button>
                <button
                  onClick={() => handleExport('json')}
                  className="w-full text-left px-4 py-2 text-body hover:bg-electric/10 hover:text-heading transition-colors rounded-b-lg flex items-center"
                >
                  📋 JSON Data
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card-primary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted text-sm mb-1">Total Posts</p>
                <p className="text-2xl font-bold text-heading">{overview?.totalPosts || 0}</p>
              </div>
              <div className="w-12 h-12 bg-grad-surge rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="card-primary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted text-sm mb-1">Total Views</p>
                <p className="text-2xl font-bold text-heading">{formatNumber(overview?.totalViews || 0)}</p>
              </div>
              <div className="w-12 h-12 bg-grad-quantum rounded-lg flex items-center justify-center">
                <Eye className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="card-primary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted text-sm mb-1">Engagement</p>
                <p className="text-2xl font-bold text-heading">{formatNumber((overview?.totalLikes || 0) + (overview?.totalShares || 0) + (overview?.totalComments || 0))}</p>
              </div>
              <div className="w-12 h-12 bg-grad-heat rounded-lg flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="card-primary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted text-sm mb-1">Engagement Rate</p>
                <p className="text-2xl font-bold text-heading">{overview?.engagementRate || 0}%</p>
              </div>
              <div className="w-12 h-12 bg-electric rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Connected Accounts Section */}
        {connectedAccounts.length === 0 && (
          <div className="card-primary mb-8">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-grad-quantum rounded-xl flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-heading mb-2">Connect Your Social Media</h3>
              <p className="text-body mb-6">
                Connect your social media accounts to start tracking your content performance and get detailed analytics.
              </p>
              <button
                onClick={() => setShowConnectModal(true)}
                className="btn-primary flex items-center mx-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Connect Account
              </button>
            </div>
          </div>
        )}

        {/* Connected Accounts Display */}
        {connectedAccounts.length > 0 && (
          <div className="card-primary mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-heading">Connected Accounts</h3>
              <button
                onClick={() => setShowConnectModal(true)}
                className="btn-secondary btn-small flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Account
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {connectedAccounts.map((account, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-space/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getPlatformIcon(account.platform)}
                    <div>
                      <p className="font-medium text-heading capitalize">{account.platform}</p>
                      <p className="text-sm text-muted">@{account.username}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleSyncData(account.platform)}
                      disabled={syncing}
                      className="p-2 hover:bg-space rounded-lg transition-colors"
                      title="Sync this account"
                    >
                      <RefreshCw className={`h-4 w-4 text-muted ${syncing ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                      className="p-2 hover:bg-space rounded-lg transition-colors"
                      title="Account settings"
                    >
                      <Settings className="h-4 w-4 text-muted" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Sync Status */}
            {syncStatus && (
              <div className="mt-4 p-4 bg-space/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-heading">Sync Status</p>
                    <p className="text-xs text-muted">
                      {syncStatus.needsSyncCount > 0 
                        ? `${syncStatus.needsSyncCount} account(s) need syncing`
                        : 'All accounts up to date'
                      }
                    </p>
                  </div>
                  {syncStatus.needsSyncCount > 0 && (
                    <button
                      onClick={() => handleSyncData()}
                      disabled={syncing}
                      className="btn-secondary btn-small"
                    >
                      Sync All
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Performance Chart */}
          <div className="lg:col-span-2">
            <div className="card-primary">
              <h3 className="text-xl font-bold text-heading mb-6">Performance Trends</h3>
              
              {metrics?.dailyMetrics && metrics.dailyMetrics.length > 0 ? (
                <div className="space-y-6">
                  {/* Simple chart representation */}
                  <div className="h-64 bg-space/50 rounded-lg flex items-end justify-around p-4 space-x-1">
                    {metrics.dailyMetrics.slice(-7).map((day, index) => {
                      const maxValue = Math.max(...metrics.dailyMetrics.map(d => d.views))
                      const height = maxValue > 0 ? (day.views / maxValue) * 200 : 10
                      
                      return (
                        <div key={index} className="flex flex-col items-center">
                          <div 
                            className="w-8 bg-electric rounded-t transition-all duration-500 hover:bg-teal"
                            style={{ height: `${height}px` }}
                            title={`${day.date}: ${day.views} views`}
                          ></div>
                          <span className="text-xs text-muted mt-2 transform -rotate-45">
                            {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                  
                  {/* Chart Legend */}
                  <div className="flex items-center justify-center space-x-6 text-sm">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-electric rounded mr-2"></div>
                      <span className="text-muted">Views</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No data available for the selected period</p>
                    <p className="text-sm mt-2">Start creating content to see analytics here</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Platform Breakdown */}
          <div>
            <div className="card-primary">
              <h3 className="text-xl font-bold text-heading mb-6">Platform Performance</h3>
              
              {metrics?.platformMetrics && metrics.platformMetrics.length > 0 ? (
                <div className="space-y-4">
                  {metrics.platformMetrics.map((platform, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-space/30 rounded-lg">
                      <div className="flex items-center">
                        {getPlatformIcon(platform.platform)}
                        <div className="ml-3">
                          <p className="font-medium text-heading capitalize">{platform.platform}</p>
                          <p className="text-sm text-muted">{platform.posts} posts</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-heading">{platform.avgEngagement}%</p>
                        <p className="text-sm text-muted">engagement</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted" />
                  <p className="text-muted">No platform data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top Performing Posts */}
        <div className="mt-8">
          <div className="card-primary">
            <h3 className="text-xl font-bold text-heading mb-6">Top Performing Posts</h3>
            
            {topPosts && topPosts.length > 0 ? (
              <div className="space-y-4">
                {topPosts.map((post, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-space/30 rounded-lg hover:bg-space/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-electric rounded-full flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          {getPlatformIcon(post.platform)}
                          <span className="text-sm text-muted capitalize">{post.platform}</span>
                          <span className="text-sm text-muted">•</span>
                          <span className="text-sm text-muted">{new Date(post.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-heading line-clamp-2">{post.content.substring(0, 100)}...</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="flex items-center text-muted">
                        <Eye className="h-4 w-4 mr-1" />
                        {formatNumber(post.metrics?.views || 0)}
                      </div>
                      <div className="flex items-center text-muted">
                        <Heart className="h-4 w-4 mr-1" />
                        {formatNumber(post.metrics?.likes || 0)}
                      </div>
                      <div className="flex items-center text-muted">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        {formatNumber(post.metrics?.comments || 0)}
                      </div>
                      <div className="text-electric font-medium">
                        {post.engagementRate}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Zap className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted" />
                <p className="text-muted mb-2">No posts to analyze yet</p>
                <p className="text-sm text-muted">Create and publish content to see your top performers here</p>
              </div>
            )}
          </div>
        </div>

        {/* Pro Feature Callout for Free Users */}
        {user && (
          <div className="mt-8">
            <div className="card-accent bg-grad-quantum text-center">
              <div className="flex items-center justify-center mb-4">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Unlock Advanced Analytics</h3>
              <p className="text-white/90 mb-6">Get detailed insights, competitor analysis, and automated reporting with Pro</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="btn-primary">
                  Upgrade to Pro
                </button>
                <button className="btn-secondary">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Social Connect Modal */}
        <SocialConnectModal
          isOpen={showConnectModal}
          onClose={() => setShowConnectModal(false)}
          onAccountConnected={handleAccountConnected}
        />
      </div>
    </div>
  )
}

export default AnalyticsPage