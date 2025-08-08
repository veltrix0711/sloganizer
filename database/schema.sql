-- Marketing Sloganizer Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles table to extend Supabase auth.users
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    
    -- Subscription information
    subscription_tier VARCHAR(20) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'agency')),
    subscription_status VARCHAR(20) DEFAULT 'active' CHECK (subscription_status IN ('active', 'past_due', 'canceled', 'paused')),
    stripe_customer_id VARCHAR(100),
    stripe_subscription_id VARCHAR(100),
    
    -- Usage tracking
    usage_count INTEGER DEFAULT 0,
    usage_reset_date TIMESTAMP WITH TIME ZONE,
    last_used_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Saved slogans (favorites) table
CREATE TABLE IF NOT EXISTS saved_slogans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Slogan data
    slogan_text TEXT NOT NULL,
    business_name VARCHAR(100) NOT NULL,
    industry VARCHAR(50) NOT NULL,
    personality VARCHAR(20) NOT NULL CHECK (personality IN ('friendly', 'professional', 'witty', 'premium', 'innovative')),
    target_audience TEXT,
    keywords TEXT[], -- Array of keywords
    explanation TEXT,
    
    -- Metadata
    is_favorite BOOLEAN DEFAULT true,
    generated_at TIMESTAMP WITH TIME ZONE,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Search and filtering
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Slogan generation history table (for analytics)
CREATE TABLE IF NOT EXISTS generation_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Allow anonymous generations
    
    -- Request data
    business_name VARCHAR(100) NOT NULL,
    industry VARCHAR(50) NOT NULL,
    personality VARCHAR(20) NOT NULL,
    target_audience TEXT,
    keywords TEXT[],
    
    -- Response data
    slogans_generated INTEGER DEFAULT 0,
    processing_time_ms INTEGER,
    
    -- Usage tracking
    ip_address INET,
    user_agent TEXT,
    is_free_generation BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscription plans table (for reference)
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    stripe_price_id VARCHAR(100) NOT NULL UNIQUE,
    
    -- Plan limits
    monthly_slogan_limit INTEGER NOT NULL,
    features JSONB DEFAULT '{}',
    
    -- Pricing
    price_cents INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    billing_interval VARCHAR(20) DEFAULT 'month' CHECK (billing_interval IN ('month', 'year')),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, stripe_price_id, monthly_slogan_limit, price_cents, features, sort_order) VALUES
('Free', 'free', 5, 0, '{"export_formats": ["txt"], "support": "community"}', 1),
('Pro', 'price_pro_monthly', 100, 1999, '{"export_formats": ["txt", "csv", "pdf"], "support": "email", "history": true}', 2),
('Agency', 'price_agency_monthly', 1000, 4999, '{"export_formats": ["txt", "csv", "pdf"], "support": "priority", "history": true, "api_access": true}', 3)
ON CONFLICT (name) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription ON user_profiles(subscription_tier, subscription_status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_stripe_customer ON user_profiles(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_saved_slogans_user_id ON saved_slogans(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_slogans_created_at ON saved_slogans(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_slogans_industry ON saved_slogans(industry);
CREATE INDEX IF NOT EXISTS idx_saved_slogans_personality ON saved_slogans(personality);
CREATE INDEX IF NOT EXISTS idx_saved_slogans_favorite ON saved_slogans(user_id, is_favorite) WHERE is_favorite = true;

CREATE INDEX IF NOT EXISTS idx_generation_history_user_id ON generation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_generation_history_created_at ON generation_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generation_history_ip ON generation_history(ip_address);

-- Row Level Security (RLS) policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_slogans ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_history ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Saved slogans policies
CREATE POLICY "Users can view their own saved slogans" ON saved_slogans
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved slogans" ON saved_slogans
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved slogans" ON saved_slogans
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved slogans" ON saved_slogans
    FOR DELETE USING (auth.uid() = user_id);

-- Generation history policies (users can only see their own history)
CREATE POLICY "Users can view their own generation history" ON generation_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can insert generation history" ON generation_history
    FOR INSERT WITH CHECK (true);

-- Subscription plans are public (read-only)
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view subscription plans" ON subscription_plans
    FOR SELECT USING (is_active = true);

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_slogans_updated_at 
    BEFORE UPDATE ON saved_slogans 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_plans_updated_at 
    BEFORE UPDATE ON subscription_plans 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get user's current usage and limits
CREATE OR REPLACE FUNCTION get_user_usage_stats(p_user_id UUID)
RETURNS TABLE (
    current_usage INTEGER,
    monthly_limit INTEGER,
    subscription_tier TEXT,
    usage_reset_date TIMESTAMP WITH TIME ZONE,
    days_until_reset INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(up.usage_count, 0) as current_usage,
        COALESCE(sp.monthly_slogan_limit, 5) as monthly_limit,
        COALESCE(up.subscription_tier, 'free') as subscription_tier,
        up.usage_reset_date,
        CASE 
            WHEN up.usage_reset_date IS NULL THEN 30
            ELSE EXTRACT(DAYS FROM (up.usage_reset_date - NOW()))::INTEGER
        END as days_until_reset
    FROM user_profiles up
    LEFT JOIN subscription_plans sp ON sp.name = up.subscription_tier
    WHERE up.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;