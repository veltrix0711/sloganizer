-- LaunchZone Pricing System Migration
-- Run this in your Supabase SQL editor after the main schema

-- Plans table
CREATE TABLE IF NOT EXISTS plans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL, -- STARTER, PRO_50, PRO_200, PRO_500, AGENCY
    name VARCHAR(50) NOT NULL,
    price_monthly INTEGER NOT NULL, -- in cents
    trial_days INTEGER DEFAULT 0,
    features JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_plan_code CHECK (code IN ('STARTER', 'PRO_50', 'PRO_200', 'PRO_500', 'AGENCY'))
);

-- Subscriptions table (replacing/extending existing subscription logic)
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    plan_code VARCHAR(20) REFERENCES plans(code) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'trialing', -- trialing, active, past_due, canceled
    stripe_subscription_id VARCHAR(100) UNIQUE,
    stripe_customer_id VARCHAR(100),
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT false,
    trial_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_subscription_status CHECK (status IN ('trialing', 'active', 'past_due', 'canceled', 'incomplete', 'incomplete_expired', 'unpaid'))
);

-- Usage tracking buckets for each billing period
CREATE TABLE IF NOT EXISTS usage_buckets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Usage counters
    posts_used INTEGER DEFAULT 0,
    credits_used INTEGER DEFAULT 0,
    video_minutes_used INTEGER DEFAULT 0,
    brands_count INTEGER DEFAULT 0,
    seats_count INTEGER DEFAULT 1,
    
    -- Limits (from plan + addons)
    posts_limit INTEGER DEFAULT 0,
    credits_limit INTEGER DEFAULT 0,
    video_minutes_limit INTEGER DEFAULT 0,
    brands_limit INTEGER DEFAULT 1,
    seats_limit INTEGER DEFAULT 1,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, period_start)
);

-- Brands table (for multi-brand support)
CREATE TABLE IF NOT EXISTS brands (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    industry VARCHAR(50),
    
    -- Brand kit data
    brand_colors JSONB DEFAULT '[]',
    brand_fonts JSONB DEFAULT '[]',
    brand_personality VARCHAR(50),
    target_audience TEXT,
    
    -- Logo data
    logo_url TEXT,
    logo_variations JSONB DEFAULT '[]',
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seats table (for team collaboration)
CREATE TABLE IF NOT EXISTS seats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    member_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    member_email VARCHAR(255), -- For invitations before user signup
    role VARCHAR(20) NOT NULL DEFAULT 'editor',
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, active, inactive
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_seat_role CHECK (role IN ('admin', 'editor', 'viewer')),
    CONSTRAINT valid_seat_status CHECK (status IN ('pending', 'active', 'inactive'))
);

-- Add-on purchases table
CREATE TABLE IF NOT EXISTS addon_purchases (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type VARCHAR(20) NOT NULL, -- CREDITS_500, VIDEO_60, POSTS_1000, BRAND, SEAT
    amount INTEGER NOT NULL, -- units granted
    price_paid INTEGER NOT NULL, -- in cents
    stripe_payment_id VARCHAR(100),
    expires_at TIMESTAMP WITH TIME ZONE, -- for time-limited addons
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_addon_type CHECK (type IN ('CREDITS_500', 'VIDEO_60', 'POSTS_1000', 'BRAND', 'SEAT'))
);

-- Social connections table (for tracking connected platforms)
CREATE TABLE IF NOT EXISTS social_connections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
    platform VARCHAR(20) NOT NULL, -- X, INSTAGRAM, TIKTOK, FACEBOOK, PINTEREST, THREADS
    account_id VARCHAR(100) NOT NULL,
    account_name VARCHAR(100),
    access_token TEXT, -- encrypted
    refresh_token TEXT, -- encrypted
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_platform CHECK (platform IN ('X', 'INSTAGRAM', 'TIKTOK', 'FACEBOOK', 'PINTEREST', 'THREADS')),
    UNIQUE(user_id, platform, account_id)
);

-- Scheduled posts table
CREATE TABLE IF NOT EXISTS scheduled_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
    social_connection_id UUID REFERENCES social_connections(id) ON DELETE CASCADE,
    
    content TEXT NOT NULL,
    media_urls TEXT[], -- array of media URLs
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    posted_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, posted, failed, canceled
    
    -- AI generation metadata
    ai_credits_used INTEGER DEFAULT 1,
    generation_prompt TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_post_status CHECK (status IN ('scheduled', 'posted', 'failed', 'canceled'))
);

-- Analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    event_name VARCHAR(50) NOT NULL,
    event_properties JSONB DEFAULT '{}',
    session_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Index for analytics queries
    CONSTRAINT valid_event_name CHECK (event_name ~ '^[a-z_]+$')
);

-- Insert default plans
INSERT INTO plans (code, name, price_monthly, trial_days, features) VALUES
('STARTER', 'Starter Pack', 999, 7, '{
    "brands": 1,
    "social_connections": 5,
    "posts_per_month": 200,
    "ai_credits_per_month": 200,
    "video_minutes_per_month": 0,
    "brand_kit": true,
    "smart_scheduler": true,
    "basic_analytics": true,
    "watermark": true,
    "template_marketplace": true,
    "coming_soon": ["Template Marketplace"]
}'),
('PRO_50', 'Pro-50', 2999, 0, '{
    "brands": 2,
    "social_connections": 8,
    "posts_per_month": 1000,
    "ai_credits_per_month": 1000,
    "video_minutes_per_month": 60,
    "brand_kit": true,
    "smart_scheduler": true,
    "quick_ads": true,
    "marketing_plan": true,
    "api_webhooks": true,
    "seats": 2,
    "website_builder": true,
    "websites": 1,
    "coming_soon": ["Website Builder + Hosting"]
}'),
('PRO_200', 'Pro-200', 4999, 0, '{
    "brands": 3,
    "social_connections": 12,
    "posts_per_month": 2500,
    "ai_credits_per_month": 2500,
    "video_minutes_per_month": 150,
    "brand_kit": true,
    "smart_scheduler": true,
    "quick_ads": true,
    "marketing_plan": true,
    "api_webhooks": true,
    "ab_tests": true,
    "advanced_analytics": true,
    "approvals": true,
    "seats": 4,
    "website_builder": true,
    "websites": 3,
    "coming_soon": ["Website Builder + Hosting"]
}'),
('PRO_500', 'Pro-500', 7999, 0, '{
    "brands": 5,
    "social_connections": 15,
    "posts_per_month": 5000,
    "ai_credits_per_month": 5000,
    "video_minutes_per_month": 300,
    "brand_kit": true,
    "smart_scheduler": true,
    "quick_ads": true,
    "marketing_plan": true,
    "api_webhooks": true,
    "ab_tests": true,
    "advanced_analytics": true,
    "approvals": true,
    "priority_queue": true,
    "seats": 6,
    "website_builder": true,
    "websites": 5,
    "coming_soon": ["Website Builder + Hosting"]
}'),
('AGENCY', 'Agency Command', 15000, 0, '{
    "brands": -1,
    "social_connections": -1,
    "posts_per_month": -1,
    "ai_credits_per_month": -1,
    "video_minutes_per_month": -1,
    "brand_kit": true,
    "smart_scheduler": true,
    "quick_ads": true,
    "marketing_plan": true,
    "api_webhooks": true,
    "ab_tests": true,
    "advanced_analytics": true,
    "approvals": true,
    "priority_queue": true,
    "white_label": true,
    "audit_logs": true,
    "sso_saml": true,
    "priority_sla": true,
    "pooled_credits": true,
    "higher_api_limits": true,
    "seats": -1,
    "coming_soon": ["Personal On-Call Assistant"]
}')
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    price_monthly = EXCLUDED.price_monthly,
    trial_days = EXCLUDED.trial_days,
    features = EXCLUDED.features,
    updated_at = NOW();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_usage_buckets_user_period ON usage_buckets(user_id, period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_brands_user_id ON brands(user_id);
CREATE INDEX IF NOT EXISTS idx_seats_owner_id ON seats(owner_id);
CREATE INDEX IF NOT EXISTS idx_seats_member_id ON seats(member_id);
CREATE INDEX IF NOT EXISTS idx_social_connections_user_brand ON social_connections(user_id, brand_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_user_brand ON scheduled_posts(user_id, brand_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_scheduled_for ON scheduled_posts(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_event ON analytics_events(user_id, event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);

-- Row Level Security (RLS) policies
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE addon_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Plans are readable by all authenticated users
CREATE POLICY "Plans are readable by authenticated users" ON plans
    FOR SELECT USING (auth.role() = 'authenticated');

-- Subscriptions policies
CREATE POLICY "Users can view their own subscriptions" ON subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" ON subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

-- Usage buckets policies
CREATE POLICY "Users can view their own usage buckets" ON usage_buckets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage buckets" ON usage_buckets
    FOR UPDATE USING (auth.uid() = user_id);

-- Brands policies
CREATE POLICY "Users can manage their own brands" ON brands
    FOR ALL USING (auth.uid() = user_id);

-- Seats policies
CREATE POLICY "Owners can manage their seats" ON seats
    FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Members can view seats they're part of" ON seats
    FOR SELECT USING (auth.uid() = member_id);

-- Add-on purchases policies
CREATE POLICY "Users can view their own addon purchases" ON addon_purchases
    FOR SELECT USING (auth.uid() = user_id);

-- Social connections policies
CREATE POLICY "Users can manage their own social connections" ON social_connections
    FOR ALL USING (auth.uid() = user_id);

-- Scheduled posts policies
CREATE POLICY "Users can manage their own scheduled posts" ON scheduled_posts
    FOR ALL USING (auth.uid() = user_id);

-- Analytics events policies
CREATE POLICY "Users can view their own analytics events" ON analytics_events
    FOR SELECT USING (auth.uid() = user_id);

-- Functions for usage tracking
CREATE OR REPLACE FUNCTION get_current_usage_bucket(user_uuid UUID)
RETURNS usage_buckets AS $$
DECLARE
    current_bucket usage_buckets;
    subscription_record subscriptions;
    plan_record plans;
BEGIN
    -- Get current subscription
    SELECT * INTO subscription_record 
    FROM subscriptions 
    WHERE user_id = user_uuid AND status IN ('trialing', 'active')
    ORDER BY created_at DESC 
    LIMIT 1;
    
    -- If no active subscription, return null
    IF NOT FOUND THEN
        RETURN NULL;
    END IF;
    
    -- Get plan details
    SELECT * INTO plan_record 
    FROM plans 
    WHERE code = subscription_record.plan_code;
    
    -- Try to get existing bucket for current period
    SELECT * INTO current_bucket
    FROM usage_buckets
    WHERE user_id = user_uuid
    AND period_start = subscription_record.current_period_start
    AND period_end = subscription_record.current_period_end;
    
    -- If no bucket exists, create one
    IF NOT FOUND THEN
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
            user_uuid,
            subscription_record.current_period_start,
            subscription_record.current_period_end,
            COALESCE((plan_record.features->>'posts_per_month')::integer, 0),
            COALESCE((plan_record.features->>'ai_credits_per_month')::integer, 0),
            COALESCE((plan_record.features->>'video_minutes_per_month')::integer, 0),
            COALESCE((plan_record.features->>'brands')::integer, 1),
            COALESCE((plan_record.features->>'seats')::integer, 1)
        ) RETURNING * INTO current_bucket;
    END IF;
    
    RETURN current_bucket;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is on trial with watermark
CREATE OR REPLACE FUNCTION has_watermark(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    subscription_record subscriptions;
BEGIN
    SELECT * INTO subscription_record 
    FROM subscriptions 
    WHERE user_id = user_uuid AND status IN ('trialing', 'active')
    ORDER BY created_at DESC 
    LIMIT 1;
    
    -- If no subscription or trial status, has watermark
    IF NOT FOUND OR subscription_record.status = 'trialing' THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment usage
CREATE OR REPLACE FUNCTION increment_usage(
    user_uuid UUID,
    usage_type TEXT,
    amount INTEGER DEFAULT 1
)
RETURNS BOOLEAN AS $$
DECLARE
    current_bucket usage_buckets;
    updated_rows INTEGER;
BEGIN
    -- Get current usage bucket
    SELECT * INTO current_bucket FROM get_current_usage_bucket(user_uuid);
    
    IF current_bucket IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Update the appropriate usage counter
    CASE usage_type
        WHEN 'posts' THEN
            UPDATE usage_buckets 
            SET posts_used = posts_used + amount, updated_at = NOW()
            WHERE id = current_bucket.id;
        WHEN 'credits' THEN
            UPDATE usage_buckets 
            SET credits_used = credits_used + amount, updated_at = NOW()
            WHERE id = current_bucket.id;
        WHEN 'video_minutes' THEN
            UPDATE usage_buckets 
            SET video_minutes_used = video_minutes_used + amount, updated_at = NOW()
            WHERE id = current_bucket.id;
        ELSE
            RETURN FALSE;
    END CASE;
    
    GET DIAGNOSTICS updated_rows = ROW_COUNT;
    RETURN updated_rows > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;