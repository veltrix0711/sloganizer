@echo off
echo Setting up Railway Backend Environment Variables...

railway variables set NODE_ENV=production
railway variables set PORT=3001

echo.
echo Now set your API keys (replace with your actual values):
echo.

echo railway variables set SUPABASE_URL=https://your-project-id.supabase.co
echo railway variables set SUPABASE_ANON_KEY=your_anon_key_here
echo railway variables set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
echo railway variables set ANTHROPIC_API_KEY=your_claude_api_key
echo railway variables set STRIPE_SECRET_KEY=your_stripe_secret_key
echo railway variables set STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
echo railway variables set STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
echo railway variables set JWT_SECRET=2cd94d5661c41839187d0cc56e8a9898d99e70067d49bd5bf34a9ad594e9c9eb672c45f8f6132976da463ae3aaae46842fd771187e501ac229a3d0f916fa3611
echo railway variables set RATE_LIMIT_WINDOW_MS=900000
echo railway variables set RATE_LIMIT_MAX_REQUESTS=100

echo.
echo Copy and run the commands above with your actual API keys!
pause