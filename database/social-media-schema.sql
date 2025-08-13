-- Social Media Integration Schema
-- Tables for connecting social accounts and managing autopost functionality

-- Social Media Accounts Table
CREATE TABLE IF NOT EXISTS social_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL, -- 'instagram', 'facebook', 'linkedin', 'twitter', 'tiktok'
    account_name VARCHAR(255) NOT NULL,
    account_id VARCHAR(255) NOT NULL, -- Platform-specific account ID
    access_token TEXT, -- Encrypted access token
    refresh_token TEXT, -- Encrypted refresh token
    token_expires_at TIMESTAMP WITH TIME ZONE,
    account_avatar_url TEXT,
    follower_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    connection_status VARCHAR(20) DEFAULT 'connected', -- 'connected', 'expired', 'error', 'disconnected'
    last_sync_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, platform, account_id)
);

-- Scheduled Posts Table
CREATE TABLE IF NOT EXISTS scheduled_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    social_account_id UUID REFERENCES social_accounts(id) ON DELETE CASCADE,
    content_text TEXT NOT NULL,
    media_urls TEXT[], -- Array of media URLs
    hashtags TEXT[], -- Array of hashtags
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    post_status VARCHAR(20) DEFAULT 'scheduled', -- 'scheduled', 'posted', 'failed', 'cancelled'
    platform_post_id VARCHAR(255), -- ID returned by platform after posting
    error_message TEXT,
    post_analytics JSONB, -- Store engagement metrics when available
    created_from VARCHAR(50), -- 'manual', 'template', 'ai_generated'
    brand_profile_id UUID REFERENCES brand_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    posted_at TIMESTAMP WITH TIME ZONE
);

-- Autopost Templates Table
CREATE TABLE IF NOT EXISTS autopost_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    template_name VARCHAR(255) NOT NULL,
    template_content TEXT NOT NULL,
    platform VARCHAR(50) NOT NULL,
    template_variables JSONB, -- Variables to replace in template
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Autopost Schedules Table (for recurring posts)
CREATE TABLE IF NOT EXISTS autopost_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    template_id UUID REFERENCES autopost_templates(id) ON DELETE CASCADE,
    social_account_ids UUID[], -- Array of social account IDs to post to
    schedule_type VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly', 'custom'
    schedule_config JSONB NOT NULL, -- Configuration for schedule (days, times, etc.)
    is_active BOOLEAN DEFAULT true,
    next_post_at TIMESTAMP WITH TIME ZONE,
    last_post_at TIMESTAMP WITH TIME ZONE,
    total_posts INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social Media Analytics Table
CREATE TABLE IF NOT EXISTS social_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    social_account_id UUID REFERENCES social_accounts(id) ON DELETE CASCADE,
    scheduled_post_id UUID REFERENCES scheduled_posts(id) ON DELETE CASCADE,
    metrics_date DATE NOT NULL,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    reach_count INTEGER DEFAULT 0,
    impressions_count INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,2) DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    save_count INTEGER DEFAULT 0,
    raw_analytics JSONB, -- Store full platform response
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(social_account_id, scheduled_post_id, metrics_date)
);

-- Social Media Rate Limits Table (to prevent API abuse)
CREATE TABLE IF NOT EXISTS social_rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    action_type VARCHAR(50) NOT NULL, -- 'post', 'fetch_analytics', 'upload_media'
    requests_count INTEGER DEFAULT 0,
    window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    window_duration_minutes INTEGER DEFAULT 60,
    max_requests INTEGER DEFAULT 100,
    
    UNIQUE(user_id, platform, action_type, window_start)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_social_accounts_user_platform ON social_accounts(user_id, platform);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_user_status ON scheduled_posts(user_id, post_status);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_scheduled_for ON scheduled_posts(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_autopost_schedules_next_post ON autopost_schedules(next_post_at) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_social_analytics_account_date ON social_analytics(social_account_id, metrics_date);

-- Row Level Security (RLS)
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE autopost_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE autopost_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_rate_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own social accounts" ON social_accounts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own social accounts" ON social_accounts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own social accounts" ON social_accounts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own social accounts" ON social_accounts
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own scheduled posts" ON scheduled_posts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scheduled posts" ON scheduled_posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scheduled posts" ON scheduled_posts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scheduled posts" ON scheduled_posts
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own autopost templates" ON autopost_templates
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own autopost templates" ON autopost_templates
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own autopost templates" ON autopost_templates
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own autopost templates" ON autopost_templates
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own autopost schedules" ON autopost_schedules
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own autopost schedules" ON autopost_schedules
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own autopost schedules" ON autopost_schedules
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own autopost schedules" ON autopost_schedules
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own social analytics" ON social_analytics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own rate limits" ON social_rate_limits
    FOR SELECT USING (auth.uid() = user_id);

-- Functions for automation
CREATE OR REPLACE FUNCTION update_social_account_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_scheduled_post_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_social_accounts_updated_at
    BEFORE UPDATE ON social_accounts
    FOR EACH ROW EXECUTE FUNCTION update_social_account_updated_at();

CREATE TRIGGER update_scheduled_posts_updated_at
    BEFORE UPDATE ON scheduled_posts
    FOR EACH ROW EXECUTE FUNCTION update_scheduled_post_updated_at();

-- Function to clean up old rate limit records
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void AS $$
BEGIN
    DELETE FROM social_rate_limits 
    WHERE window_start < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Function to get next scheduled posts (for processing)
CREATE OR REPLACE FUNCTION get_next_scheduled_posts(limit_count INTEGER DEFAULT 50)
RETURNS TABLE(
    post_id UUID,
    user_id UUID,
    social_account_id UUID,
    content_text TEXT,
    scheduled_for TIMESTAMP WITH TIME ZONE,
    platform VARCHAR(50)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sp.id,
        sp.user_id,
        sp.social_account_id,
        sp.content_text,
        sp.scheduled_for,
        sa.platform
    FROM scheduled_posts sp
    JOIN social_accounts sa ON sp.social_account_id = sa.id
    WHERE sp.post_status = 'scheduled'
        AND sp.scheduled_for <= NOW()
        AND sa.is_active = true
        AND sa.connection_status = 'connected'
    ORDER BY sp.scheduled_for ASC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;