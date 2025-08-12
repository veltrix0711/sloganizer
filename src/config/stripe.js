import Stripe from 'stripe'
import dotenv from 'dotenv'

dotenv.config()

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
})

// Pricing configuration
export const STRIPE_CONFIG = {
  prices: {
    STARTER: 'price_1Rv6l6GdU41U3RDABW3PJgU3',
    PRO_50: 'price_1Rv6sTGdU41U3RDAMU7CB5Vf',
    PRO_200: 'price_1Rv6u0GdU41U3RDAqLI5XEde',
    PRO_500: 'price_1Rv6uvGdU41U3RDAjMpsNLkm',
  },
  addons: {
    CREDITS_500: 'price_1Rv6x6GdU41U3RDAuUTeAVvZ',
    VIDEO_60: 'price_1Rv70PGdU41U3RDAHsnClUmo',
    POSTS_1000: 'price_1Rv6ybGdU41U3RDAh3CxzEPf',
    BRAND: 'price_1Rv72JGdU41U3RDAPYwGN6S7',
    SEAT: 'price_1Rv73pGdU41U3RDAVuTAjcWO',
  },
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
}

// Plan configurations
export const PLAN_CONFIGS = {
  STARTER: {
    code: 'STARTER',
    name: 'Starter Pack',
    price: 999, // $9.99
    trialDays: 7,
    features: {
      brands: 1,
      socialConnections: 5,
      postsPerMonth: 200,
      aiCreditsPerMonth: 200,
      videoMinutesPerMonth: 0,
      brandKit: true,
      smartScheduler: true,
      basicAnalytics: true,
      watermark: true,
      templateMarketplace: true,
    }
  },
  PRO_50: {
    code: 'PRO_50',
    name: 'Pro-50',
    price: 2999, // $29.99
    trialDays: 0,
    features: {
      brands: 2,
      socialConnections: 8,
      postsPerMonth: 1000,
      aiCreditsPerMonth: 1000,
      videoMinutesPerMonth: 60,
      brandKit: true,
      smartScheduler: true,
      quickAds: true,
      marketingPlan: true,
      apiWebhooks: true,
      seats: 2,
      websiteBuilder: true,
      websites: 1,
    }
  },
  PRO_200: {
    code: 'PRO_200',
    name: 'Pro-200',
    price: 4999, // $49.99
    trialDays: 0,
    features: {
      brands: 3,
      socialConnections: 12,
      postsPerMonth: 2500,
      aiCreditsPerMonth: 2500,
      videoMinutesPerMonth: 150,
      brandKit: true,
      smartScheduler: true,
      quickAds: true,
      marketingPlan: true,
      apiWebhooks: true,
      abTests: true,
      advancedAnalytics: true,
      approvals: true,
      seats: 4,
      websiteBuilder: true,
      websites: 3,
    }
  },
  PRO_500: {
    code: 'PRO_500',
    name: 'Pro-500',
    price: 7999, // $79.99
    trialDays: 0,
    features: {
      brands: 5,
      socialConnections: 15,
      postsPerMonth: 5000,
      aiCreditsPerMonth: 5000,
      videoMinutesPerMonth: 300,
      brandKit: true,
      smartScheduler: true,
      quickAds: true,
      marketingPlan: true,
      apiWebhooks: true,
      abTests: true,
      advancedAnalytics: true,
      approvals: true,
      priorityQueue: true,
      seats: 6,
      websiteBuilder: true,
      websites: 5,
    }
  },
  AGENCY: {
    code: 'AGENCY',
    name: 'Agency Command',
    price: 15000, // $150+/month (contact sales)
    trialDays: 0,
    features: {
      brands: -1, // unlimited
      socialConnections: -1,
      postsPerMonth: -1,
      aiCreditsPerMonth: -1,
      videoMinutesPerMonth: -1,
      brandKit: true,
      smartScheduler: true,
      quickAds: true,
      marketingPlan: true,
      apiWebhooks: true,
      abTests: true,
      advancedAnalytics: true,
      approvals: true,
      priorityQueue: true,
      whiteLabel: true,
      auditLogs: true,
      ssoSaml: true,
      prioritySla: true,
      pooledCredits: true,
      higherApiLimits: true,
      seats: -1,
    }
  }
}

// Add-on configurations
export const ADDON_CONFIGS = {
  CREDITS_500: {
    type: 'CREDITS_500',
    name: '+500 AI Credits',
    price: 500, // $5.00
    amount: 500,
  },
  VIDEO_60: {
    type: 'VIDEO_60',
    name: '+60 Video Minutes',
    price: 800, // $8.00
    amount: 60,
  },
  POSTS_1000: {
    type: 'POSTS_1000',
    name: '+1,000 Scheduled Posts',
    price: 500, // $5.00
    amount: 1000,
  },
  BRAND: {
    type: 'BRAND',
    name: 'Extra Brand',
    price: 500, // $5.00/month
    amount: 1,
    recurring: true,
  },
  SEAT: {
    type: 'SEAT',
    name: 'Extra Seat',
    price: 300, // $3.00/month
    amount: 1,
    recurring: true,
  }
}

// Credit cost mapping
export const CREDIT_COSTS = {
  POST_COPY: 1,      // 1 post copy = 1 credit
  THUMBNAIL: 5,      // 1 thumbnail/image = 5 credits
  LOGO_CONCEPT: 10,  // 1 logo concept = 10 credits
  VIDEO_MINUTE: 20,  // 1 minute of AI video = 20 credits
}

export default stripe