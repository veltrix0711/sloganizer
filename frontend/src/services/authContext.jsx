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
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sessionLoading, setSessionLoading] = useState(false)

  useEffect(() => {
    // Optional connection test (non-blocking)
    const testConnection = () => {
      console.log('AuthContext: Testing Supabase connection...')
      supabase
        .from('profiles')
        .select('id')
        .limit(1)
        .then(({ error }) => {
          if (error) console.error('AuthContext: Supabase connection test failed:', error)
          else console.log('AuthContext: Supabase connection successful')
        })
        .catch((error) => console.error('AuthContext: Supabase connection error:', error))
    }

    // Get initial session
    const getSession = async () => {
      try {
        // fire-and-forget connection test
        testConnection()
        
        console.log('AuthContext: Getting initial session...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
        } else if (session) {
          console.log('AuthContext: Session found, fetching profile...')
          setUser(session.user)
          setSession(session)
          // fetch profile without blocking initial load
          fetchUserProfile(session.user.id).catch((e) => {
            console.warn('AuthContext: fetchUserProfile (initial) error:', e)
          })
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

    // Initialize session; rely on onAuthStateChange as source of truth
    getSession().catch((error) => {
      console.error('AuthContext: Error in getSession:', error)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, nextSession) => {
        setSessionLoading(true)
        setSession(nextSession)
        const nextUserId = nextSession?.user?.id
        if (nextUserId) {
          setUser(nextSession.user)
          await fetchUserProfile(nextUserId)
          setLoading(false)
        } else {
          setUser(null)
          setProfile(null)
          setLoading(false)
        }
        setSessionLoading(false)
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
        // Wait for ongoing fetch instead of returning null
        await new Promise(resolve => setTimeout(resolve, 1000))
        if (profileCache.current[userId]) {
          setProfile(profileCache.current[userId])
          return profileCache.current[userId]
        }
        return null
      }

      fetchingProfiles.current.add(userId)
      console.log('AuthContext: Fetching user profile for:', userId)
      
      // Create AbortController for better timeout handling
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 12000) // 12 second timeout
      
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
      
      // Check if profile already exists but was just not accessible
      const { data: existingProfile } = await supabase
        .from(TABLES.USER_PROFILES)
        .select('subscription_plan, subscription_status, slogans_remaining')
        .eq('id', userId)
        .single()

      const profileData = {
        id: userId,
        email: userData.user?.email || '',
        first_name: userData.user?.user_metadata?.first_name || '',
        last_name: userData.user?.user_metadata?.last_name || ''
      }

      // Only add subscription fields if no existing profile found
      if (!existingProfile) {
        profileData.subscription_plan = 'free'
        profileData.subscription_status = 'active'
        profileData.slogans_remaining = 3
      }

      console.log('AuthContext: Profile data to insert/update:', profileData)
      
      // Use upsert to avoid duplicate key errors and preserve existing data
      const { data, error } = await supabase
        .from(TABLES.USER_PROFILES)
        .upsert(profileData, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        })
        .select()
        .single()

      if (error) {
        console.error('Error upserting profile:', error)
        // If upsert fails, try to fetch existing profile
        const { data: existingData } = await supabase
          .from(TABLES.USER_PROFILES)
          .select('*')
          .eq('id', userId)
          .single()
        
        if (existingData) {
          console.log('AuthContext: Using existing profile after upsert error:', existingData)
          setProfile(existingData)
        }
        return
      }

      console.log('AuthContext: Profile upserted successfully:', data)
      setProfile(data)
    } catch (error) {
      console.error('Error creating/updating user profile:', error)
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
      console.log('AuthContext: Starting sign out process...')
      
      // Clear cache and local state first
      profileCache.current = {}
      setUser(null)
      setSession(null)
      setProfile(null)
      
      // Sign out from Supabase with global scope to clear all sessions
      const { error } = await supabase.auth.signOut({ scope: 'global' })
      if (error) {
        console.error('Supabase sign out error:', error)
        // Don't throw here - still want to clear local state
      }

      // Force clear any remaining session data
      localStorage.removeItem('supabase.auth.token')
      sessionStorage.clear()
      
      console.log('AuthContext: Sign out completed')
      toast.success('Signed out successfully!')
      
      // Force a small delay to ensure state is cleared
      await new Promise(resolve => setTimeout(resolve, 100))
      
      return { success: true }
      
    } catch (error) {
      console.error('Sign out error:', error)
      
      // Ensure local state is cleared regardless of errors
      setUser(null)
      setSession(null)
      setProfile(null)
      profileCache.current = {}
      localStorage.removeItem('supabase.auth.token')
      sessionStorage.clear()
      
      toast.success('Signed out successfully!')
      return { success: true }
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

  const fixSubscription = async (plan = 'agency') => {
    try {
      if (!user) throw new Error('No user logged in')

      console.log('Fixing subscription to:', plan)
      const { data, error } = await supabase
        .from(TABLES.USER_PROFILES)
        .update({ 
          subscription_plan: plan,
          subscription_status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error

      setProfile(data)
      toast.success(`Subscription fixed to ${plan}!`)
      return { success: true, data }
      
    } catch (error) {
      console.error('Subscription fix error:', error)
      toast.error(error.message || 'Failed to fix subscription')
      return { success: false, error: error.message }
    }
  }

  const value = {
    user,
    session,
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
    getUsageStats,
    fixSubscription
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}