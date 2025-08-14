import toast from 'react-hot-toast'
import { supabase } from './supabase'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL
  }

  async getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession()
    
    return {
      'Content-Type': 'application/json',
      ...(session?.access_token && {
        'Authorization': `Bearer ${session.access_token}`
      })
    }
  }

  async request(endpoint, options = {}) {
      const url = `${this.baseURL}${endpoint}`
      try {
        const headers = await this.getAuthHeaders()
        const response = await fetch(url, {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            ...headers
          },
          ...options
        })
        
        // Read response as text first to handle non-JSON responses
        const text = await response.text()
        const contentType = response.headers.get('content-type') || ''
        
        let data
        if (contentType.includes('application/json')) {
          try {
            data = JSON.parse(text)
          } catch (parseError) {
            throw new Error(`Invalid JSON from ${endpoint}: ${text.slice(0, 200)}`)
          }
        } else if (!response.ok) {
          // HTML or other non-JSON error response
          throw new Error(`Non-JSON ${response.status} from ${endpoint}. Response: ${text.slice(0, 120)}`)
        } else {
          // Allow empty OK responses
          data = text || {}
        }
        
        if (!response.ok) {
          const errorMessage = data?.error || data?.message || response.statusText || `HTTP ${response.status}`
          throw new Error(errorMessage)
        }
        
        return data
      } catch (error) {
        console.error(`API request failed: ${endpoint}`, error)
        throw error
      }
  }

  // Slogan generation
  async generateSlogan(params) {
    try {
      const response = await this.request('/api/slogans/generate', {
        method: 'POST',
        body: JSON.stringify(params)
      })
      
      if (response.success) {
        toast.success('Slogans generated successfully!')
      }
      
      return response
    } catch (error) {
      toast.error(error.message || 'Failed to generate slogans')
      throw error
    }
  }

  // Favorites management
  async getFavorites(params = {}) {
    const queryParams = new URLSearchParams(params).toString()
    const endpoint = `/api/favorites${queryParams ? `?${queryParams}` : ''}`
    
    return this.request(endpoint)
  }

  async saveFavorite(sloganData) {
    try {
      const response = await this.request('/api/favorites', {
        method: 'POST',
        body: JSON.stringify(sloganData)
      })
      
      if (response.success) {
        toast.success('Slogan saved to favorites!')
      }
      
      return response
    } catch (error) {
      if (error.message.includes('already saved')) {
        toast.error('This slogan is already in your favorites')
      } else {
        toast.error(error.message || 'Failed to save slogan')
      }
      throw error
    }
  }

  async deleteFavorite(id) {
    try {
      const response = await this.request(`/api/favorites/${id}`, {
        method: 'DELETE'
      })
      
      if (response.success) {
        toast.success('Slogan removed from favorites')
      }
      
      return response
    } catch (error) {
      toast.error(error.message || 'Failed to delete slogan')
      throw error
    }
  }

  async updateFavorite(id, updates) {
    try {
      const response = await this.request(`/api/favorites/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      })
      
      if (response.success) {
        toast.success('Slogan updated successfully!')
      }
      
      return response
    } catch (error) {
      toast.error(error.message || 'Failed to update slogan')
      throw error
    }
  }

  async bulkDeleteFavorites(ids) {
    try {
      const response = await this.request('/api/favorites/bulk/delete', {
        method: 'POST',
        body: JSON.stringify({ ids })
      })
      
      if (response.success) {
        toast.success(`${ids.length} slogan(s) deleted successfully!`)
      }
      
      return response
    } catch (error) {
      toast.error(error.message || 'Failed to delete slogans')
      throw error
    }
  }

  async getFavoriteStats() {
    return this.request('/api/favorites/stats/summary')
  }

  // Export functionality
  async exportSlogans(format, params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString()
      const endpoint = `/api/export/${format}${queryParams ? `?${queryParams}` : ''}`
      
      const headers = await this.getAuthHeaders()
      delete headers['Content-Type'] // Let browser set content type for blob
      
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        headers
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Export failed: ${response.status}`)
      }

      const blob = await response.blob()
      const filename = response.headers.get('Content-Disposition')
        ?.split('filename=')[1]
        ?.replace(/"/g, '') || `slogans.${format}`

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success(`${format.toUpperCase()} export completed!`)
      
      return { success: true, filename }
    } catch (error) {
      toast.error(error.message || 'Export failed')
      throw error
    }
  }

  async getExportPreview(format, params = {}) {
    const queryParams = new URLSearchParams(params).toString()
    const endpoint = `/api/export/preview/${format}${queryParams ? `?${queryParams}` : ''}`
    
    return this.request(endpoint)
  }

  async getAvailableExportFormats() {
    return this.request('/api/export/formats/available')
  }

  // Payments and subscription
  async getSubscriptionPlans() {
    return this.request('/api/payments/plans')
  }

  async createCheckoutSession(priceId, planName) {
    try {
      const response = await this.request('/api/payments/create-checkout-session', {
        method: 'POST',
        body: JSON.stringify({ priceId, planName })
      })
      
      return response
    } catch (error) {
      toast.error(error.message || 'Failed to create checkout session')
      throw error
    }
  }

  async createBillingPortalSession() {
    try {
      const response = await this.request('/api/payments/create-portal-session', {
        method: 'POST'
      })
      
      return response
    } catch (error) {
      toast.error(error.message || 'Failed to access billing portal')
      throw error
    }
  }

  async getSubscriptionStatus() {
    return this.request('/api/billing/subscription')
  }

  // Billing API methods
  async getBillingUsage() {
    return this.request('/api/billing/usage')
  }

  async createBillingCheckout(data) {
    try {
      const response = await this.request('/api/billing/checkout', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      
      return response
    } catch (error) {
      toast.error(error.message || 'Failed to create checkout session')
      throw error
    }
  }

  async getBillingPortal() {
    try {
      const response = await this.request('/api/billing/portal', {
        method: 'GET'
      })
      
      return response
    } catch (error) {
      toast.error(error.message || 'Failed to access billing portal')
      throw error
    }
  }

  async getUpgradeSuggestions(limitType = null) {
    const endpoint = `/api/billing/upgrade-suggestions${limitType ? `?limitType=${limitType}` : ''}`
    return this.request(endpoint)
  }

  // HTTP method helpers
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' })
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' })
  }

  // Health check
  async healthCheck() {
    return this.request('/health')
  }
}

export const api = new ApiService()
export default api