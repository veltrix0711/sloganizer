-- Final migration script - just create the subscription without touching profiles
-- Run this in Supabase SQL Editor

-- Check current status
SELECT 'Current subscription status:' as info;
SELECT * FROM subscriptions WHERE user_id = '65459250-0738-48df-8ba4-a74e92868fb6';

-- Check what columns exist in profiles table
SELECT 'Profiles table columns:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles';

-- Create Pro-50 subscription for user (this is the most important part)
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
    'cus_migrated_' || substr(md5('65459250-0738-48df-8ba4-a74e92868fb6'::text), 1, 8),
    'sub_migrated_' || substr(md5('65459250-0738-48df-8ba4-a74e92868fb6'::text), 1, 8)
) ON CONFLICT DO NOTHING;

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
    DATE_TRUNC('month', NOW()),
    DATE_TRUNC('month', NOW()) + INTERVAL '1 month',
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

-- Verify the migration worked
SELECT 'After migration - subscription:' as info;
SELECT 
    user_id,
    plan_code,
    status,
    current_period_start,
    current_period_end,
    created_at
FROM subscriptions WHERE user_id = '65459250-0738-48df-8ba4-a74e92868fb6';

SELECT 'After migration - usage bucket:' as info;
SELECT 
    user_id,
    period_start,
    period_end,
    posts_limit,
    credits_limit,
    video_minutes_limit,
    brands_limit,
    seats_limit
FROM usage_buckets WHERE user_id = '65459250-0738-48df-8ba4-a74e92868fb6';