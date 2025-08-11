# Stripe Subscription Setup Guide

## 🎯 Your Stripe Product IDs
You provided these Stripe product IDs:
- **Pro Plan**: `prod_SpTuDNVCfoRzWe`
- **Agency Plan**: `prod_SpTvgM7gldgBXN`

## 📋 Required Stripe Price IDs

You need to get the **Price IDs** (not Product IDs) from your Stripe dashboard to complete the setup.

### Steps to get Price IDs:

1. **Go to Stripe Dashboard** → Products
2. **Click on each product** (Pro Plan & Agency Plan)
3. **Copy the Price IDs** for each pricing tier

### ✅ Environment Variables Configured:

Your actual Stripe Price IDs are now configured in Railway:

```bash
# Pro Plan Price IDs
STRIPE_PRO_MONTHLY_PRICE_ID=price_1RtowyGdU41U3RDAlb3icSCI ✅

# Agency Plan Price IDs  
STRIPE_AGENCY_MONTHLY_PRICE_ID=price_1Rtoy5GdU41U3RDA7KHOSRrD ✅
```

### Railway Commands to Update:
```bash
cd backend
railway variables --set "STRIPE_PRO_MONTHLY_PRICE_ID=price_YOUR_ACTUAL_ID"
railway variables --set "STRIPE_PRO_YEARLY_PRICE_ID=price_YOUR_ACTUAL_ID"
railway variables --set "STRIPE_AGENCY_MONTHLY_PRICE_ID=price_YOUR_ACTUAL_ID"
railway variables --set "STRIPE_AGENCY_YEARLY_PRICE_ID=price_YOUR_ACTUAL_ID"
```

## 💰 Current Plan Configuration

### Pro Plan (`prod_SpTuDNVCfoRzWe`)
- **Name**: Pro Plan
- **Price**: $19.99/month
- **Features**:
  - 100 slogan generations per month
  - Save unlimited favorites
  - Export in all formats (CSV, TXT, JSON, PDF)
  - Priority AI processing
  - Email support

### Agency Plan (`prod_SpTvgM7gldgBXN`)
- **Name**: Agency Plan  
- **Price**: $49.99/month
- **Features**:
  - Unlimited slogan generations
  - Save unlimited favorites
  - Export in all formats
  - Bulk generation capabilities
  - Priority AI processing
  - Dedicated support
  - Team collaboration features
  - Custom branding options

## 🛠️ Backend Implementation Status

✅ **Completed:**
- Subscription plans endpoint: `/api/payments/plans`
- Product IDs integrated: `prod_SpTuDNVCfoRzWe` & `prod_SpTvgM7gldgBXN`
- Environment variable mapping
- Webhook handling for subscription events
- Plan limits and features configured

✅ **Recently Completed:**
- Actual Stripe Price IDs integrated and deployed
- Backend updated with your real price IDs
- Subscription plans endpoint active

⏳ **Next:**
- Test subscription flow end-to-end through frontend

## 🧪 Testing

Once you update the Price IDs, you can test:

1. **Plans Endpoint**: `GET /api/payments/plans` (requires auth)
2. **Checkout Creation**: `POST /api/payments/create-checkout-session`
3. **Subscription Status**: `GET /api/payments/subscription`

## 📝 Next Steps

1. Get your actual Stripe Price IDs from the Stripe dashboard
2. Update the Railway environment variables
3. Redeploy the backend
4. Test the subscription flow through the frontend