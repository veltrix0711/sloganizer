import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY // For client connections
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // For server operations

if (!supabaseUrl) {
  throw new Error('Missing SUPABASE_URL environment variable')
}

if (!supabaseKey) {
  throw new Error('Missing SUPABASE_ANON_KEY environment variable')
}

// Client for general operations (respects RLS)
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false, // Server doesn't need to persist sessions
  }
})

// Admin client for server operations (bypasses RLS when needed)
export const supabaseAdmin = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  }
}) : null

// Utility function to get user from JWT token
export const getUserFromToken = async (token) => {
  if (!token) return null

  try {
    // Remove 'Bearer ' prefix if present
    const cleanToken = token.replace(/^Bearer\s+/, '')
    
    const { data: { user }, error } = await supabase.auth.getUser(cleanToken)
    
    if (error) {
      console.error('Error getting user from token:', error)
      return null
    }

    return user
  } catch (error) {
    console.error('Error parsing token:', error)
    return null
  }
}

// Utility function to verify user has access to resource
export const verifyUserAccess = async (userId, resourceUserId) => {
  return userId === resourceUserId
}

export default supabase