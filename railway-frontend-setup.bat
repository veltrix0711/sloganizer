@echo off
echo Setting up Railway Frontend Environment Variables...

echo.
echo First, navigate to frontend folder and create project:
echo cd frontend
echo railway project create
echo railway up
echo.
echo Then set these variables (replace with your actual values):
echo.

echo railway variables set VITE_SUPABASE_URL=https://your-project-id.supabase.co
echo railway variables set VITE_SUPABASE_ANON_KEY=your_anon_key_here
echo railway variables set VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
echo railway variables set VITE_APP_NAME=Marketing Sloganizer
echo railway variables set VITE_APP_DESCRIPTION=AI-Powered Slogan Generator for Your Business
echo railway variables set VITE_FEATURE_EXPORT_ENABLED=true
echo railway variables set VITE_FEATURE_STRIPE_ENABLED=true
echo railway variables set VITE_FEATURE_ANALYTICS_ENABLED=false
echo railway variables set VITE_NODE_ENV=production
echo railway variables set VITE_DEV_MODE=false

echo.
echo After both services are deployed, update these cross-service URLs:
echo.
echo Backend: railway variables set FRONTEND_URL=https://your-frontend-url.railway.app
echo Frontend: railway variables set VITE_API_URL=https://your-backend-url.railway.app/api
echo Frontend: railway variables set VITE_APP_URL=https://your-frontend-url.railway.app

echo.
echo Copy and run the commands above with your actual values!
pause