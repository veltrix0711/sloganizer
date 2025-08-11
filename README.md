# Sloganizer Backend

Express.js API server for the Marketing Sloganizer SaaS application.

## Features

- **Authentication**: Supabase-based user auth
- **AI Integration**: Claude API for slogan generation
- **Payments**: Stripe integration for subscriptions
- **Export**: PDF, CSV, and TXT export capabilities
- **Security**: Helmet, CORS, rate limiting
- **Validation**: Request validation with Joi

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Reset password

### Slogans
- `POST /api/slogans/generate` - Generate new slogans
- `GET /api/slogans/history` - Get user's slogan history
- `GET /api/slogans/favorites` - Get user's favorite slogans
- `POST /api/slogans/favorites/:id` - Add slogan to favorites
- `DELETE /api/slogans/favorites/:id` - Remove from favorites
- `POST /api/slogans/export` - Export slogans

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/usage` - Get usage statistics

### Payments
- `POST /api/payments/create-checkout-session` - Create Stripe checkout
- `POST /api/payments/create-portal-session` - Create billing portal
- `GET /api/payments/subscription` - Get subscription status
- `POST /api/payments/webhook` - Stripe webhook handler

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Anthropic
ANTHROPIC_API_KEY=your_claude_api_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# JWT
JWT_SECRET=your_jwt_secret
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start
```

## Deployment

Ready for deployment on Railway, Heroku, or any Node.js hosting platform.

### Railway Deployment
- Configured in `railway.toml`
- Automatic builds with Nixpacks
- Health check endpoint: `/health`