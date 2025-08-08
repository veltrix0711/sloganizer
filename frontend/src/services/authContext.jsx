import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, TABLES } from './supabase'
import toast from 'react-hot-toast'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sessionLoading, setSessionLoading] = useState(false)

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
        } else if (session) {
          setUser(session.user)
          await fetchUserProfile(session.user.id)
        }
      } catch (error) {
        console.error('Session error:', error)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSessionLoading(true)
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setUser(session?.user ?? null)
          if (session?.user) {
            await fetchUserProfile(session.user.id)
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setProfile(null)
        }
        
        setSessionLoading(false)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from(TABLES.USER_PROFILES)
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Error fetching profile:', error)
        return
      }

      if (data) {
        setProfile(data)
      } else {
        // Create profile if it doesn't exist
        await createUserProfile(userId)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  const createUserProfile = async (userId) => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      
      const profileData = {
        user_id: userId,
        email: userData.user?.email || '',
        first_name: userData.user?.user_metadata?.first_name || '',
        last_name: userData.user?.user_metadata?.last_name || '',
        subscription_tier: 'free',
        subscription_status: 'active',
        usage_count: 0
      }

      const { data, error } = await supabase
        .from(TABLES.USER_PROFILES)
        .insert(profileData)
        .select()
        .single()

      if (error) {
        console.error('Error creating profile:', error)
        return
      }

      setProfile(data)
    } catch (error) {
      console.error('Error creating user profile:', error)
    }
  }

  const signUp = async (email, password, { firstName, lastName } = {}) => {
    try {
      setSessionLoading(true)
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName || '',
            last_name: lastName || ''
          }
        }
      })

      if (error) throw error

      if (data.user && !data.session) {
        toast.success('Check your email to confirm your account!')
        return { success: true, needsConfirmation: true }
      }

      toast.success('Account created successfully!')
      return { success: true, needsConfirmation: false }
      
    } catch (error) {
      console.error('Sign up error:', error)
      toast.error(error.message || 'Failed to create account')
      return { success: false, error: error.message }
    } finally {
      setSessionLoading(false)
    }
  }

  const signIn = async (email, password) => {
    try {
      setSessionLoading(true)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      toast.success('Signed in successfully!')
      return { success: true }
      
    } catch (error) {
      console.error('Sign in error:', error)
      toast.error(error.message || 'Failed to sign in')
      return { success: false, error: error.message }
    } finally {
      setSessionLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setSessionLoading(true)
      
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      toast.success('Signed out successfully!')
      return { success: true }
      
    } catch (error) {
      console.error('Sign out error:', error)
      toast.error(error.message || 'Failed to sign out')
      return { success: false, error: error.message }
    } finally {
      setSessionLoading(false)
    }
  }

  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) throw error

      toast.success('Password reset email sent! Check your inbox.')
      return { success: true }
      
    } catch (error) {
      console.error('Password reset error:', error)
      toast.error(error.message || 'Failed to send reset email')
      return { success: false, error: error.message }
    }
  }

  const updatePassword = async (newPassword) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error

      toast.success('Password updated successfully!')
      return { success: true }
      
    } catch (error) {
      console.error('Password update error:', error)
      toast.error(error.message || 'Failed to update password')
      return { success: false, error: error.message }
    }
  }

  const updateProfile = async (updates) => {
    try {
      if (!user) throw new Error('No user logged in')

      const { data, error } = await supabase
        .from(TABLES.USER_PROFILES)
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      setProfile(data)
      toast.success('Profile updated successfully!')
      return { success: true, data }
      
    } catch (error) {
      console.error('Profile update error:', error)
      toast.error(error.message || 'Failed to update profile')
      return { success: false, error: error.message }
    }
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id)
    }
  }

  const getUsageStats = async () => {
    try {
      if (!user) return null

      const { data, error } = await supabase
        .rpc('get_user_usage_stats', { p_user_id: user.id })

      if (error) throw error

      return data?.[0] || null
    } catch (error) {
      console.error('Error fetching usage stats:', error)
      return null
    }
  }

  const value = {
    user,
    profile,
    loading,
    sessionLoading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshProfile,
    getUsageStats
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}