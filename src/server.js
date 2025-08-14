import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import socialMediaRoutes from './routes/socialMedia.js';
import paymentsRoutes from './routes/payments.js';
import billingRoutes from './routes/billing.js';
import analyticsRoutes from './routes/analytics.js';
import brandRoutes from './routes/brand.js';
import voiceTrainingRoutes from './routes/voiceTraining.js';
import brandAnalysisRoutes from './routes/brandAnalysis.js';
import favoritesRoutes from './routes/favorites.js';
import slogansRoutes from './routes/slogans.js';
import exportRoutes from './routes/export.js';
import { supabase } from './services/supabase.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy for Railway deployment
app.set('trust proxy', true);

// Performance middleware
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

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
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ 
  limit: '10mb',
  type: ['application/json', 'text/plain']
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb',
  parameterLimit: 20
}));

// Add cache control headers for static assets
app.use((req, res, next) => {
  if (req.method === 'GET' && req.path.includes('/api/')) {
    // Set cache headers for API responses
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  }
  next();
});

// Rate limiting with different tiers
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Increased for better UX
  message: { success: false, error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health' || req.path === '/api/health';
  }
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 50, // 50 requests per minute for API calls
  message: { success: false, error: 'API rate limit exceeded, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/', generalLimiter);
app.use('/api/', apiLimiter);

// Request logging middleware (optimized for production)
app.use('/api/', (req, res, next) => {
  const timestamp = new Date().toISOString();
  const isDev = process.env.NODE_ENV !== 'production';
  
  if (isDev) {
    console.log(`📥 [${timestamp}] ${req.method} ${req.path}`);
    console.log(`    Query: ${JSON.stringify(req.query)}`);
    console.log(`    Auth: ${req.headers.authorization ? 'Present' : 'Missing'}`);
  } else {
    // Production: only log important requests
    if (req.method !== 'GET' || res.statusCode >= 400) {
      console.log(`[${timestamp}] ${req.method} ${req.path} - ${res.statusCode}`);
    }
  }
  
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

// Social Media routes (auth is handled inside the routes)
app.use('/api/social-media', socialMediaRoutes);

// Payments routes
app.use('/api/payments', paymentsRoutes);

// Billing routes
app.use('/api/billing', billingRoutes);

// Analytics routes
app.use('/api/analytics', analyticsRoutes);

// Brand routes
app.use('/api/brand', brandRoutes);

// Voice training routes
app.use('/api/voice-training', voiceTrainingRoutes);

// Brand analysis routes
app.use('/api/brand-analysis', brandAnalysisRoutes);

// Favorites routes
app.use('/api/favorites', favoritesRoutes);

// Slogans routes
app.use('/api/slogans', slogansRoutes);

// Export routes
app.use('/api/export', exportRoutes);

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is running!' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    ok: true, 
    timestamp: new Date().toISOString(),
    routes: ['billing', 'payments', 'social-media', 'analytics', 'favorites/stats'],
    supabase_available: !!supabase,
    env_check: {
      supabase_url: !!process.env.SUPABASE_URL,
      supabase_service_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    }
  });
});

// Debug route to check table structure
app.get('/api/debug/table-structure/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    // First, let's see what columns exist by selecting a user
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .limit(1);

    if (error) {
      return res.json({
        success: false,
        error: error.message,
        details: error
      });
    }

    // Return the structure
    res.json({
      success: true,
      user_data: data[0] || 'No user found',
      available_columns: data[0] ? Object.keys(data[0]) : 'No data to analyze'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Debug route to test allowed subscription values
app.get('/api/debug/test-subscription-values/:email', async (req, res) => {
  const { email } = req.params;
  const testValues = ['free', 'pro', 'premium', 'agency', 'starter', 'professional', 'enterprise', 'pro_500', 'pro-500'];
  
  const results = {};
  
  for (const value of testValues) {
    try {
      // Test each value to see which ones are allowed
      const { data, error } = await supabase
        .from('profiles')
        .update({ subscription_plan: value })
        .eq('email', email)
        .select();
      
      if (error) {
        results[value] = { allowed: false, error: error.message };
      } else {
        results[value] = { allowed: true, data: data };
        
        // Reset back to original value if test worked
        await supabase
          .from('profiles')
          .update({ subscription_plan: 'agency' })
          .eq('email', email);
      }
    } catch (error) {
      results[value] = { allowed: false, error: error.message };
    }
  }
  
  res.json({
    success: true,
    test_results: results,
    message: 'Tested various subscription_plan values'
  });
});

// Admin route to check user subscription (temporary)
app.get('/api/admin/check-user/:email', async (req, res) => {
  try {
    const { email } = req.params;
    console.log('Checking user:', email);
    
    if (!supabase) {
      console.error('Supabase client not initialized');
      return res.status(500).json({
        success: false,
        error: 'Database connection not available'
      });
    }
    
    // Get user data from profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    console.log('Supabase response:', { data, error });

    if (error) {
      console.error('Error checking user:', error);
      return res.status(404).json({
        success: false,
        error: error.message || 'User not found',
        details: error
      });
    }

    res.json({
      success: true,
      user: data
    });

  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

// Admin route to check/update user subscription (temporary)
app.post('/api/admin/update-subscription', async (req, res) => {
  try {
    console.log('Update request received:', req.body);
    const { email, subscription_tier } = req.body;
    
    if (!email || !subscription_tier) {
      return res.status(400).json({
        success: false,
        error: 'Email and subscription_tier required'
      });
    }

    if (!supabase) {
      console.error('Supabase client not initialized');
      return res.status(500).json({
        success: false,
        error: 'Database connection not available'
      });
    }

    console.log('Updating subscription for:', email, 'to:', subscription_tier);

    // Update user subscription in profiles table
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        subscription_plan: subscription_tier, // Use subscription_plan column
        subscription_status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('email', email)
      .select();

    console.log('Supabase update response:', { data, error });

    if (error) {
      console.error('Error updating subscription:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
        details: error
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found or no rows updated'
      });
    }

    console.log('Successfully updated subscription for:', email, 'to:', subscription_tier);
    
    res.json({
      success: true,
      updated: data,
      message: `Updated ${email} to ${subscription_tier}`
    });

  } catch (error) {
    console.error('Admin update error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

// Favorites stats route (placeholder)
app.get('/api/favorites/stats/summary', async (req, res) => {
  try {
    // Return placeholder stats
    res.json({
      success: true,
      stats: {
        total_favorites: 0,
        categories: {
          slogans: 0,
          logos: 0,
          social_posts: 0
        },
        recent_activity: []
      }
    });
  } catch (error) {
    console.error('Error getting favorites stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});