import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database table names
export const TABLES = {
  USER_PROFILES: 'profiles',
  SAVED_SLOGANS: 'favorites', 
  GENERATION_HISTORY: 'slogans',
  SUBSCRIPTION_PLANS: 'subscription_plans'
}

// Subscription tiers
export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  PRO: 'pro', 
  AGENCY: 'agency'
}

// Brand personalities
export const BRAND_PERSONALITIES = {
  FRIENDLY: 'friendly',
  PROFESSIONAL: 'professional',
  WITTY: 'witty',
  PREMIUM: 'premium',
  INNOVATIVE: 'innovative'
}

// Industries
export const INDUSTRIES = [
  'technology',
  'healthcare', 
  'finance',
  'retail',
  'food',
  'automotive',
  'real-estate',
  'education',
  'entertainment',
  'fitness',
  'beauty',
  'consulting',
  'manufacturing',
  'agriculture',
  'travel',
  'legal',
  'construction',
  'marketing',
  'fashion',
  'other'
]

// Helper functions
export const getSubscriptionLimits = (tier) => {
  const limits = {
    [SUBSCRIPTION_TIERS.FREE]: {
      monthlySlogans: 5,
      exportFormats: ['txt'],
      support: 'community',
      features: ['Basic slogan generation']
    },
    [SUBSCRIPTION_TIERS.PRO]: {
      monthlySlogans: 100,
      exportFormats: ['txt', 'csv', 'pdf'],
      support: 'email',
      features: ['Advanced slogan generation', 'Export to multiple formats', 'Favorites history', 'Email support']
    },
    [SUBSCRIPTION_TIERS.AGENCY]: {
      monthlySlogans: 1000,
      exportFormats: ['txt', 'csv', 'pdf'],
      support: 'priority',
      features: ['Premium slogan generation', 'All export formats', 'Full history access', 'Priority support', 'API access']
    }
  }
  
  return limits[tier] || limits[SUBSCRIPTION_TIERS.FREE]
}

export const formatPersonality = (personality) => {
  const formatted = {
    [BRAND_PERSONALITIES.FRIENDLY]: 'Friendly & Approachable',
    [BRAND_PERSONALITIES.PROFESSIONAL]: 'Professional & Trustworthy', 
    [BRAND_PERSONALITIES.WITTY]: 'Witty & Clever',
    [BRAND_PERSONALITIES.PREMIUM]: 'Premium & Luxurious',
    [BRAND_PERSONALITIES.INNOVATIVE]: 'Innovative & Forward-thinking'
  }
  
  return formatted[personality] || personality
}

export const formatIndustry = (industry) => {
  const formatted = {
    'technology': 'Technology',
    'healthcare': 'Healthcare',
    'finance': 'Finance', 
    'retail': 'Retail',
    'food': 'Food & Beverage',
    'automotive': 'Automotive',
    'real-estate': 'Real Estate',
    'education': 'Education',
    'entertainment': 'Entertainment',
    'fitness': 'Fitness & Health',
    'beauty': 'Beauty & Cosmetics',
    'consulting': 'Consulting',
    'manufacturing': 'Manufacturing',
    'agriculture': 'Agriculture',
    'travel': 'Travel & Tourism',
    'legal': 'Legal Services',
    'construction': 'Construction',
    'marketing': 'Marketing & Advertising',
    'fashion': 'Fashion & Apparel',
    'other': 'Other'
  }
  
  return formatted[industry] || industry
}