-- Migration script to convert existing Pro subscription to new Pro-50 plan
-- Run this in Supabase SQL Editor

-- First, let's check what exists
SELECT 'Current subscription status:' as info;
SELECT * FROM subscriptions WHERE user_id = '65459250-0738-48df-8ba4-a74e92868fb6';

SELECT 'Old subscription records:' as info;
SELECT * FROM subscription_plans WHERE user_id = '65459250-0738-48df-8ba4-a74e92868fb6';

-- Check if user has any Stripe customer data
SELECT 'User profiles:' as info;
SELECT * FROM profiles WHERE id = '65459250-0738-48df-8ba4-a74e92868fb6';

-- Migration: Create Pro-50 subscription for user
INSERT INTO subscriptions (
    user_id,
    plan_code,
    status,
    current_period_start,
    current_period_end,
    stripe_customer_id,
    stripe_subscription_id
) VALUES (
    '65459250-0738-48df-8ba4-a74e92868fb6'::uuid,
    'PRO_50',
    'active',
    NOW(),
    NOW() + INTERVAL '1 month',
    -- If you have a stripe customer ID, we'll update this manually after seeing the old data
    'cus_temp_' || substr(md5(random()::text), 1, 8),
    'sub_temp_' || substr(md5(random()::text), 1, 8)
) ON CONFLICT (user_id, plan_code) DO UPDATE SET
    status = 'active',
    current_period_start = NOW(),
    current_period_end = NOW() + INTERVAL '1 month';

-- Create usage bucket for current period
INSERT INTO usage_buckets (
    user_id,
    period_start,
    period_end,
    posts_limit,
    credits_limit,
    video_minutes_limit,
    brands_limit,
    seats_limit
) VALUES (
    '65459250-0738-48df-8ba4-a74e92868fb6'::uuid,
    NOW(),
    NOW() + INTERVAL '1 month',
    1000,  -- Pro-50 posts limit
    1000,  -- Pro-50 credits limit
    60,    -- Pro-50 video minutes
    2,     -- Pro-50 brands limit
    2      -- Pro-50 seats limit
) ON CONFLICT (user_id, period_start) DO UPDATE SET
    posts_limit = 1000,
    credits_limit = 1000,
    video_minutes_limit = 60,
    brands_limit = 2,
    seats_limit = 2;

-- Update user profile subscription tier
UPDATE profiles 
SET subscription_tier = 'pro' 
WHERE id = '65459250-0738-48df-8ba4-a74e92868fb6';

-- Verify the migration worked
SELECT 'After migration - new subscription:' as info;
SELECT * FROM subscriptions WHERE user_id = '65459250-0738-48df-8ba4-a74e92868fb6';

SELECT 'After migration - usage bucket:' as info;
SELECT * FROM usage_buckets WHERE user_id = '65459250-0738-48df-8ba4-a74e92868fb6';

SELECT 'After migration - profile:' as info;
SELECT * FROM profiles WHERE id = '65459250-0738-48df-8ba4-a74e92868fb6';