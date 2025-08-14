import { createContext, useContext, useEffect, useState, useRef } from 'react'
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
    // Test Supabase connection first
    const testConnection = async () => {
      try {
        console.log('AuthContext: Testing Supabase connection...')
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .limit(1)
        
        if (error) {
          console.error('AuthContext: Supabase connection test failed:', error)
        } else {
          console.log('AuthContext: Supabase connection successful')
        }
      } catch (error) {
        console.error('AuthContext: Supabase connection error:', error)
      }
    }

    // Get initial session
    const getSession = async () => {
      try {
        await testConnection()
        
        console.log('AuthContext: Getting initial session...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
        } else if (session) {
          console.log('AuthContext: Session found, fetching profile...')
          setUser(session.user)
          await fetchUserProfile(session.user.id)
        } else {
          console.log('AuthContext: No session found')
        }
      } catch (error) {
        console.error('Session error:', error)
      } finally {
        console.log('AuthContext: Setting loading to false')
        setLoading(false)
      }
    }

    // Add timeout to prevent hanging
    const sessionTimeout = setTimeout(() => {
      console.warn('AuthContext: Session loading timed out, setting loading to false')
      setLoading(false)
    }, 3000) // 3 second timeout - faster loading

    getSession().then(() => {
      clearTimeout(sessionTimeout)
    }).catch((error) => {
      console.error('AuthContext: Error in getSession:', error)
      clearTimeout(sessionTimeout)
      setLoading(false)
    })

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

  // Cache and debounce profile fetches
  const profileCache = useRef({})
  const fetchingProfiles = useRef(new Set())

  const fetchUserProfile = async (userId) => {
    try {
      // Skip fetch if no userId
      if (!userId) {
        console.log('AuthContext: No userId provided, skipping profile fetch')
        return null
      }

      // Return cached profile if available
      if (profileCache.current[userId]) {
        console.log('AuthContext: Using cached profile for:', userId)
        setProfile(profileCache.current[userId])
        return profileCache.current[userId]
      }

      // Prevent concurrent fetches for the same user
      if (fetchingProfiles.current.has(userId)) {
        console.log('AuthContext: Profile fetch already in progress for:', userId)
        return null
      }

      fetchingProfiles.current.add(userId)
      console.log('AuthContext: Fetching user profile for:', userId)
      
      // Create AbortController for better timeout handling
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 4000) // 4 second timeout
      
      try {
        const { data, error } = await supabase
          .from(TABLES.USER_PROFILES)
          .select('*')
          .eq('id', userId)
          .single()
          .abortSignal(controller.signal)

        clearTimeout(timeoutId)

        if (error) {
          console.error('Error fetching profile:', error)
          if (error.code === 'PGRST116') {
            console.log('AuthContext: No profile found (PGRST116), creating one...')
            await createUserProfile(userId)
            return
          }
          
          // For other errors, continue without profile to prevent infinite loading
          console.warn('AuthContext: Continuing without profile due to error:', error)
          setProfile(null)
          return null
        }

        if (data) {
          console.log('AuthContext: Profile found:', data)
          profileCache.current[userId] = data
          setProfile(data)
          return data
        } else {
          console.log('AuthContext: No profile data, creating one...')
          await createUserProfile(userId)
          return null
        }
      } catch (abortError) {
        clearTimeout(timeoutId)
        if (abortError.name === 'AbortError') {
          console.warn('AuthContext: Profile query was aborted (timeout)')
          setProfile(null)
        } else {
          throw abortError
        }
      }
      
    } catch (error) {
      console.error('Error fetching user profile:', error)
      setProfile(null)
      // Don't crash the app, just continue without profile
    } finally {
      fetchingProfiles.current.delete(userId)
    }
  }

  const createUserProfile = async (userId) => {
    try {
      console.log('AuthContext: Creating user profile for:', userId)
      const { data: userData } = await supabase.auth.getUser()
      
      const profileData = {
        id: userId,
        email: userData.user?.email || '',
        first_name: userData.user?.user_metadata?.first_name || '',
        last_name: userData.user?.user_metadata?.last_name || '',
        subscription_plan: 'free',
        subscription_status: 'active',
        slogans_remaining: 3
      }

      console.log('AuthContext: Inserting profile data:', profileData)
      
      // Add timeout to profile creation
      const insertPromise = supabase
        .from(TABLES.USER_PROFILES)
        .insert(profileData)
        .select()
        .single()

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile creation timeout')), 8000)
      )

      const { data, error } = await Promise.race([insertPromise, timeoutPromise])

      if (error) {
        console.error('Error creating profile:', error)
        return
      }

      console.log('AuthContext: Profile created:', data)
      setProfile(data)
    } catch (error) {
      console.error('Error creating user profile:', error)
      if (error.message === 'Profile creation timeout') {
        console.warn('AuthContext: Profile creation timed out')
      }
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
        .eq('id', user.id)
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