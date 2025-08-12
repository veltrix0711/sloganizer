import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import sloganRoutes from './routes/slogans.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import paymentRoutes from './routes/payments.js';
import favoriteRoutes from './routes/favorites.js';
import exportRoutes from './routes/export.js';
import brandProfileRoutes from './routes/brandProfile.js';
import nameGeneratorRoutes from './routes/nameGenerator.js';
import logoGeneratorRoutes from './routes/logoGenerator.js';
import socialPostsRoutes from './routes/socialPosts.js';
import brandExportRoutes from './routes/brandExport.js';
// LaunchZone routes - now re-enabled with Stripe price IDs
import billingRoutes from './routes/billing.js';
import salesRoutes from './routes/sales.js';
import emailRoutes from './routes/emails.js';
import webhookRoutes from './routes/webhooks.js';

import { errorHandler } from './middleware/errorHandler.js';
import { authMiddleware } from './middleware/auth.js';

// Jobs and Services - now re-enabled
import lifecycleEmailJob from './jobs/lifecycleEmails.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy for Railway deployment
app.set('trust proxy', true);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [
    'https://sloganizer-frontend-production.up.railway.app',
    'https://www.launchzone.space',
    'https://launchzone.space',
    'http://localhost:5173',
    process.env.FRONTEND_URL,
    'null' // Allow file:// origins for local debugging
  ].filter(Boolean),
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
  // More restrictive trust proxy for Railway
  trustProxy: ['127.0.0.1', '::1']
});
app.use('/api/', limiter);

// Webhooks route (must be before JSON parsing for Stripe raw body)
app.use('/api/webhooks', webhookRoutes);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Enhanced debug logging middleware
app.use('/api/', (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`🔍 [${timestamp}] ${req.method} ${req.originalUrl}`);
  console.log(`    Headers: ${JSON.stringify(req.headers, null, 2)}`);
  console.log(`    Body: ${JSON.stringify(req.body)}`);
  console.log(`    Auth: ${req.headers.authorization ? 'Present' : 'Missing'}`);
  
  // Log response
  const originalSend = res.send;
  res.send = function(data) {
    console.log(`📤 [${timestamp}] Response ${res.statusCode}: ${typeof data === 'string' ? data.substring(0, 200) : JSON.stringify(data).substring(0, 200)}`);
    originalSend.call(this, data);
  };
  
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Debug endpoint (no auth required)
app.get('/api/debug', (req, res) => {
  try {
    const debugInfo = {
      stripeConfigured: !!process.env.STRIPE_SECRET_KEY,
      stripeKeyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 10) + '...',
      stripeKeyType: process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_') ? 'live' : 'test',
      frontendUrl: process.env.FRONTEND_URL,
      priceIds: {
        pro: process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
        agency: process.env.STRIPE_AGENCY_MONTHLY_PRICE_ID
      },
      supabaseConfigured: !!process.env.SUPABASE_URL,
      nodeEnv: process.env.NODE_ENV,
      railwayRegion: process.env.RAILWAY_REGION || 'unknown'
    };
    
    res.json(debugInfo);
  } catch (error) {
    res.json({ error: error.message, debugInfo: 'failed to load' });
  }
});

// Network connectivity test
app.get('/api/debug/network', async (req, res) => {
  const results = {};
  
  // Test basic HTTP connectivity
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch('https://httpbin.org/ip', { timeout: 5000 });
    const data = await response.json();
    results.httpConnectivity = {
      success: true,
      ip: data.origin,
      status: response.status
    };
  } catch (error) {
    results.httpConnectivity = {
      success: false,
      error: error.message
    };
  }
  
  // Test Stripe API connectivity (without authentication)
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch('https://api.stripe.com', { 
      timeout: 8000,
      headers: { 'User-Agent': 'Launchzone/1.0' }
    });
    results.stripeConnectivity = {
      success: response.status < 500,
      status: response.status,
      statusText: response.statusText
    };
  } catch (error) {
    results.stripeConnectivity = {
      success: false,
      error: error.message,
      code: error.code
    };
  }
  
  res.json(results);
});

// Stripe test endpoint (no auth required) - standalone implementation
app.get('/api/debug/stripe-test', async (req, res) => {
  try {
    console.log('Testing Stripe prices...');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Railway environment detected:', !!process.env.RAILWAY_PROJECT_ID);
    
    // Import Stripe dynamically to avoid module issues
    const { default: Stripe } = await import('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      maxNetworkRetries: 3,
      timeout: 15000, // 15 seconds for debug
      telemetry: false
    });
    
    const starterPriceId = 'price_1Rv6l6GdU41U3RDABW3PJgU3';
    const pro50PriceId = 'price_1Rv6sTGdU41U3RDAMU7CB5Vf';
    const pro200PriceId = 'price_1Rv6u0GdU41U3RDAqLI5XEde';
    const pro500PriceId = 'price_1Rv6uvGdU41U3RDAjMpsNLkm';
    
    const results = {
      config: {
        starterPriceId,
        pro50PriceId,
        pro200PriceId,
        pro500PriceId,
        hasStripeKey: !!process.env.STRIPE_SECRET_KEY
      }
    };
    
    // Test Starter price
    try {
      const starterPrice = await stripe.prices.retrieve(starterPriceId);
      results.starter = {
        valid: true,
        priceId: starterPrice.id,
        amount: starterPrice.unit_amount,
        currency: starterPrice.currency,
        interval: starterPrice.recurring?.interval
      };
    } catch (error) {
      results.starter = {
        valid: false,
        priceId: starterPriceId,
        error: error.message,
        type: error.type
      };
    }
    
    // Test Pro-50 price
    try {
      const pro50Price = await stripe.prices.retrieve(pro50PriceId);
      results.pro50 = {
        valid: true,
        priceId: pro50Price.id,
        amount: pro50Price.unit_amount,
        currency: pro50Price.currency,
        interval: pro50Price.recurring?.interval
      };
    } catch (error) {
      results.pro50 = {
        valid: false,
        priceId: pro50PriceId,
        error: error.message,
        type: error.type
      };
    }
    
    // Test Pro-200 price
    try {
      const pro200Price = await stripe.prices.retrieve(pro200PriceId);
      results.pro200 = {
        valid: true,
        priceId: pro200Price.id,
        amount: pro200Price.unit_amount,
        currency: pro200Price.currency,
        interval: pro200Price.recurring?.interval
      };
    } catch (error) {
      results.pro200 = {
        valid: false,
        priceId: pro200PriceId,
        error: error.message,
        type: error.type
      };
    }
    
    // Test Pro-500 price
    try {
      const pro500Price = await stripe.prices.retrieve(pro500PriceId);
      results.pro500 = {
        valid: true,
        priceId: pro500Price.id,
        amount: pro500Price.unit_amount,
        currency: pro500Price.currency,
        interval: pro500Price.recurring?.interval
      };
    } catch (error) {
      results.pro500 = {
        valid: false,
        priceId: pro500PriceId,
        error: error.message,
        type: error.type
      };
    }
    
    res.json(results);
  } catch (error) {
    res.json({ 
      error: error.message, 
      stack: error.stack,
      hasStripeKey: !!process.env.STRIPE_SECRET_KEY
    });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/slogans', sloganRoutes); // Allow free generation for unauthenticated users
app.use('/api/favorites', favoriteRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/users', authMiddleware, userRoutes);

// Brand profile system routes (all require authentication)
app.use('/api/brand', authMiddleware, brandProfileRoutes);
app.use('/api/names', authMiddleware, nameGeneratorRoutes);
app.use('/api/logos', authMiddleware, logoGeneratorRoutes);
app.use('/api/social', authMiddleware, socialPostsRoutes);
app.use('/api/exports', authMiddleware, brandExportRoutes);

// Mount payments routes - some endpoints need to be accessible without auth
app.use('/api/payments', (req, res, next) => {
  // Skip auth for debug endpoints and plans endpoint
  if (req.path.startsWith('/debug/') || req.path === '/plans') {
    return next();
  }
  // Apply auth middleware for all other payment routes
  return authMiddleware(req, res, next);
}, paymentRoutes);

// New LaunchZone billing and lifecycle routes - now enabled
app.use('/api/billing', billingRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/emails', emailRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🎯 Brand Suite Routes Loaded:`);
  console.log(`   ✓ /api/brand/* - Brand Profile Management`);
  console.log(`   ✓ /api/names/* - Name Generator`);
  console.log(`   ✓ /api/logos/* - Logo Generator`);
  console.log(`   ✓ /api/social/* - Social Posts`);
  console.log(`   ✓ /api/exports/* - Brand Exports`);
  console.log(`🔐 All Brand Suite routes require authentication`);
  console.log(`✅ LaunchZone billing system enabled with Stripe integration`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});