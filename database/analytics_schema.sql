-- Analytics Database Schema for Sloganizer
-- This file contains the database structure for analytics functionality

-- Content posts table - stores all content created by users
CREATE TABLE IF NOT EXISTS content_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL, -- 'instagram', 'tiktok', 'twitter', 'facebook', 'linkedin'
    content_type VARCHAR(50) NOT NULL, -- 'post', 'story', 'reel', 'video', 'image'
    content TEXT NOT NULL, -- The actual content/caption
    media_urls TEXT[], -- Array of media URLs
    hashtags TEXT[], -- Array of hashtags used
    scheduled_for TIMESTAMP WITH TIME ZONE,
    posted_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'scheduled', 'posted', 'failed'
    post_id_on_platform VARCHAR(255), -- Platform's post ID after posting
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Post metrics table - stores performance data for each post
CREATE TABLE IF NOT EXISTS post_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES content_posts(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    saves INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    reach INTEGER DEFAULT 0, -- Unique users who saw the post
    impressions INTEGER DEFAULT 0, -- Total times the post was shown
    engagement_rate DECIMAL(5,2) DEFAULT 0.00, -- Calculated engagement percentage
    collected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics events table - tracks user actions and content interactions
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL, -- 'content_created', 'content_scheduled', 'content_posted', 'dashboard_viewed', etc.
    platform VARCHAR(50), -- Platform if applicable
    content_id UUID REFERENCES content_posts(id) ON DELETE SET NULL,
    event_data JSONB DEFAULT '{}', -- Additional event-specific data
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social media accounts table - stores connected social accounts
CREATE TABLE IF NOT EXISTS social_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    platform_user_id VARCHAR(255) NOT NULL,
    username VARCHAR(255),
    display_name VARCHAR(255),
    profile_picture_url TEXT,
    access_token TEXT, -- Encrypted access token
    refresh_token TEXT, -- Encrypted refresh token
    token_expires_at TIMESTAMP WITH TIME ZONE,
    account_data JSONB DEFAULT '{}', -- Platform-specific account data
    is_active BOOLEAN DEFAULT true,
    connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_sync_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, platform, platform_user_id)
);

-- Campaign tracking table - for organizing content into campaigns
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    budget DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'paused', 'completed'
    campaign_data JSONB DEFAULT '{}', -- Additional campaign settings
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Link campaign posts to campaigns
CREATE TABLE IF NOT EXISTS campaign_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    post_id UUID REFERENCES content_posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(campaign_id, post_id)
);

-- Content templates table - for template marketplace feature (future)
CREATE TABLE IF NOT EXISTS content_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100), -- 'business', 'lifestyle', 'tech', etc.
    platform VARCHAR(50) NOT NULL,
    content_type VARCHAR(50) NOT NULL,
    template_data JSONB NOT NULL, -- Template structure and placeholders
    preview_urls TEXT[], -- Preview images
    is_public BOOLEAN DEFAULT false,
    is_premium BOOLEAN DEFAULT false,
    price DECIMAL(10,2) DEFAULT 0.00,
    usage_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics aggregation tables for faster queries
CREATE TABLE IF NOT EXISTS daily_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    platform VARCHAR(50),
    total_posts INTEGER DEFAULT 0,
    total_views INTEGER DEFAULT 0,
    total_likes INTEGER DEFAULT 0,
    total_shares INTEGER DEFAULT 0,
    total_comments INTEGER DEFAULT 0,
    total_reach INTEGER DEFAULT 0,
    total_impressions INTEGER DEFAULT 0,
    avg_engagement_rate DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, date, platform)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_content_posts_user_id ON content_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_content_posts_platform ON content_posts(platform);
CREATE INDEX IF NOT EXISTS idx_content_posts_status ON content_posts(status);
CREATE INDEX IF NOT EXISTS idx_content_posts_created_at ON content_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_content_posts_scheduled_for ON content_posts(scheduled_for);

CREATE INDEX IF NOT EXISTS idx_post_metrics_post_id ON post_metrics(post_id);
CREATE INDEX IF NOT EXISTS idx_post_metrics_platform ON post_metrics(platform);
CREATE INDEX IF NOT EXISTS idx_post_metrics_collected_at ON post_metrics(collected_at);

CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);

CREATE INDEX IF NOT EXISTS idx_social_accounts_user_id ON social_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_accounts_platform ON social_accounts(platform);
CREATE INDEX IF NOT EXISTS idx_social_accounts_is_active ON social_accounts(is_active);

CREATE INDEX IF NOT EXISTS idx_daily_analytics_user_date ON daily_analytics(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_analytics_platform ON daily_analytics(platform);

-- Row Level Security (RLS) policies
ALTER TABLE content_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_analytics ENABLE ROW LEVEL SECURITY;

-- RLS policies for content_posts
CREATE POLICY "Users can view own posts" ON content_posts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own posts" ON content_posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts" ON content_posts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts" ON content_posts
    FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for post_metrics (linked to posts)
CREATE POLICY "Users can view metrics for own posts" ON post_metrics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM content_posts 
            WHERE content_posts.id = post_metrics.post_id 
            AND content_posts.user_id = auth.uid()
        )
    );

CREATE POLICY "System can insert metrics" ON post_metrics
    FOR INSERT WITH CHECK (true); -- Allow system to insert metrics

-- RLS policies for analytics_events
CREATE POLICY "Users can view own events" ON analytics_events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own events" ON analytics_events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS policies for social_accounts
CREATE POLICY "Users can manage own social accounts" ON social_accounts
    FOR ALL USING (auth.uid() = user_id);

-- RLS policies for campaigns
CREATE POLICY "Users can manage own campaigns" ON campaigns
    FOR ALL USING (auth.uid() = user_id);

-- RLS policies for daily_analytics
CREATE POLICY "Users can view own analytics" ON daily_analytics
    FOR SELECT USING (auth.uid() = user_id);

-- Functions for analytics aggregation
CREATE OR REPLACE FUNCTION calculate_engagement_rate(
    likes INTEGER,
    shares INTEGER,
    comments INTEGER,
    views INTEGER
) RETURNS DECIMAL(5,2) AS $$
BEGIN
    IF views = 0 OR views IS NULL THEN
        RETURN 0.00;
    END IF;
    
    RETURN ROUND(
        ((COALESCE(likes, 0) + COALESCE(shares, 0) + COALESCE(comments, 0))::DECIMAL / views * 100),
        2
    );
END;
$$ LANGUAGE plpgsql;

-- Function to update daily analytics (to be called by cron job)
CREATE OR REPLACE FUNCTION update_daily_analytics(target_date DATE DEFAULT CURRENT_DATE - INTERVAL '1 day')
RETURNS void AS $$
BEGIN
    INSERT INTO daily_analytics (
        user_id, 
        date, 
        platform, 
        total_posts, 
        total_views, 
        total_likes, 
        total_shares, 
        total_comments,
        total_reach,
        total_impressions,
        avg_engagement_rate
    )
    SELECT 
        cp.user_id,
        target_date,
        cp.platform,
        COUNT(cp.id) as total_posts,
        COALESCE(SUM(pm.views), 0) as total_views,
        COALESCE(SUM(pm.likes), 0) as total_likes,
        COALESCE(SUM(pm.shares), 0) as total_shares,
        COALESCE(SUM(pm.comments), 0) as total_comments,
        COALESCE(SUM(pm.reach), 0) as total_reach,
        COALESCE(SUM(pm.impressions), 0) as total_impressions,
        COALESCE(AVG(pm.engagement_rate), 0) as avg_engagement_rate
    FROM content_posts cp
    LEFT JOIN post_metrics pm ON cp.id = pm.post_id
    WHERE DATE(cp.created_at) = target_date
    GROUP BY cp.user_id, cp.platform
    ON CONFLICT (user_id, date, platform) 
    DO UPDATE SET
        total_posts = EXCLUDED.total_posts,
        total_views = EXCLUDED.total_views,
        total_likes = EXCLUDED.total_likes,
        total_shares = EXCLUDED.total_shares,
        total_comments = EXCLUDED.total_comments,
        total_reach = EXCLUDED.total_reach,
        total_impressions = EXCLUDED.total_impressions,
        avg_engagement_rate = EXCLUDED.avg_engagement_rate;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update engagement_rate when metrics are inserted/updated
CREATE OR REPLACE FUNCTION update_engagement_rate()
RETURNS TRIGGER AS $$
BEGIN
    NEW.engagement_rate := calculate_engagement_rate(
        NEW.likes, 
        NEW.shares, 
        NEW.comments, 
        NEW.views
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_engagement_rate
    BEFORE INSERT OR UPDATE ON post_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_engagement_rate();

-- Sample data insertion (for testing)
-- This would be removed in production
INSERT INTO content_posts (user_id, platform, content_type, content, status, created_at) 
SELECT 
    id as user_id,
    'instagram' as platform,
    'post' as content_type,
    'Sample analytics post content for testing' as content,
    'posted' as status,
    NOW() - (random() * INTERVAL '30 days') as created_at
FROM profiles 
WHERE email = 'corey.osmond99@gmail.com'
LIMIT 5;

-- Insert sample metrics for the posts
INSERT INTO post_metrics (post_id, platform, views, likes, shares, comments, collected_at)
SELECT 
    cp.id as post_id,
    cp.platform,
    (random() * 1000)::INTEGER as views,
    (random() * 100)::INTEGER as likes,
    (random() * 20)::INTEGER as shares,
    (random() * 30)::INTEGER as comments,
    cp.created_at + INTERVAL '1 hour' as collected_at
FROM content_posts cp
WHERE cp.user_id = (SELECT id FROM profiles WHERE email = 'corey.osmond99@gmail.com' LIMIT 1);

-- Comments for documentation
COMMENT ON TABLE content_posts IS 'Stores all content created by users across platforms';
COMMENT ON TABLE post_metrics IS 'Performance metrics for each post from social platforms';
COMMENT ON TABLE analytics_events IS 'Tracks user actions and system events for analytics';
COMMENT ON TABLE social_accounts IS 'Connected social media accounts for each user';
COMMENT ON TABLE campaigns IS 'Marketing campaigns that group related content';
COMMENT ON TABLE daily_analytics IS 'Pre-aggregated daily analytics for faster reporting';