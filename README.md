# Marketing Sloganizer

A SaaS application that generates creative marketing slogans using Claude AI, with user authentication, favorites management, and export capabilities.

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database & Auth**: Supabase
- **AI**: Claude API (Anthropic)
- **Payments**: Stripe
- **Hosting**: Railway

## Project Structure

```
sloganizer/
├── backend/                 # Node.js Express API server
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Authentication & validation
│   │   ├── services/       # Claude API, Stripe, exports
│   │   ├── utils/          # Helper functions
│   │   └── server.js       # Express server setup
│   ├── package.json
│   └── .env.example
├── frontend/               # React Vite application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API calls
│   │   ├── utils/          # Helper functions
│   │   └── App.jsx         # Main app component
│   ├── package.json
│   └── vite.config.js
├── database/               # Supabase schema & migrations
└── railway.json            # Railway deployment config
```

## Features

- ✅ AI-powered slogan generation
- ✅ Brand personality selector (Friendly, Professional, Witty, Premium, Innovative)
- ✅ Industry-specific options
- ✅ 1 free slogan before signup
- ✅ User authentication (Supabase)
- ✅ Save & manage favorites
- ✅ Export in PDF, CSV, TXT
- ✅ Stripe subscription plans (Free, Pro, Agency)
- ✅ Responsive UI

## Getting Started

1. Clone the repository
2. Set up environment variables
3. Install dependencies for both frontend and backend
4. Configure Supabase project
5. Start development servers

## Development

- Backend: `cd backend && npm run dev`
- Frontend: `cd frontend && npm run dev`

## Deployment

Railway deployment configuration included for seamless hosting.