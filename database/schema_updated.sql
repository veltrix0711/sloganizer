-- Marketing Sloganizer Database Schema (Updated)
-- Run this in your Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    company TEXT,
    avatar_url TEXT,
    
    -- Subscription information
    subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'pro', 'agency')),
    subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'past_due', 'canceled', 'paused')),
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    
    -- Usage tracking
    slogans_remaining INTEGER DEFAULT 1,
    total_slogans_generated INTEGER DEFAULT 0,
    last_generation_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Slogans table (all generated slogans)
CREATE TABLE IF NOT EXISTS slogans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Slogan content
    text TEXT NOT NULL,
    company_name TEXT NOT NULL,
    industry TEXT NOT NULL,
    brand_personality TEXT NOT NULL CHECK (brand_personality IN ('friendly', 'professional', 'witty', 'premium', 'innovative')),
    keywords TEXT,
    tone TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Favorites table (user's favorite slogans)
CREATE TABLE IF NOT EXISTS favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    slogan_id UUID REFERENCES slogans(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, slogan_id)
);

-- Subscription plans reference table
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    stripe_price_id TEXT,
    
    -- Plan limits and features
    slogans_per_month INTEGER NOT NULL,
    features JSONB DEFAULT '{}',
    
    -- Pricing
    price_cents INTEGER NOT NULL,
    currency TEXT DEFAULT 'USD',
    billing_interval TEXT DEFAULT 'month' CHECK (billing_interval IN ('month', 'year')),
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default plans
INSERT INTO subscription_plans (name, slogans_per_month, price_cents, features) VALUES
('free', 1, 0, '{"export_formats": ["txt"], "support": "community"}'),
('pro', 100, 1999, '{"export_formats": ["txt", "csv", "pdf"], "support": "email", "history": true}'),
('agency', -1, 4999, '{"export_formats": ["txt", "csv", "pdf"], "support": "priority", "history": true, "api_access": true, "unlimited": true}')
ON CONFLICT (name) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS profiles_stripe_customer_id_idx ON profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS slogans_user_id_idx ON slogans(user_id);
CREATE INDEX IF NOT EXISTS slogans_created_at_idx ON slogans(created_at DESC);
CREATE INDEX IF NOT EXISTS favorites_user_id_idx ON favorites(user_id);
CREATE INDEX IF NOT EXISTS favorites_slogan_id_idx ON favorites(slogan_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE slogans ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for slogans
CREATE POLICY "Users can view own slogans" ON slogans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own slogans" ON slogans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own slogans" ON slogans FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for favorites
CREATE POLICY "Users can view own favorites" ON favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own favorites" ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorites" ON favorites FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for subscription plans (public read)
CREATE POLICY "Anyone can view active plans" ON subscription_plans FOR SELECT USING (is_active = true);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();