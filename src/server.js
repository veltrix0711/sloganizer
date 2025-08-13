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