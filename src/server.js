import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import socialMediaRoutes from './routes/socialMedia.js';
import paymentsRoutes from './routes/payments.js';
import billingRoutes from './routes/billing.js';
import { supabase } from './services/supabase.js';

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
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Request logging middleware
app.use('/api/', (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`📥 [${timestamp}] ${req.method} ${req.path}`);
  console.log(`    Body: ${JSON.stringify(req.body).substring(0, 200)}`);
  console.log(`    Query: ${JSON.stringify(req.query)}`);
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

// Social Media routes (auth is handled inside the routes)
app.use('/api/social-media', socialMediaRoutes);

// Payments routes
app.use('/api/payments', paymentsRoutes);

// Billing routes
app.use('/api/billing', billingRoutes);

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is running!' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    ok: true, 
    timestamp: new Date().toISOString(),
    routes: ['billing', 'payments', 'social-media', 'favorites/stats'],
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