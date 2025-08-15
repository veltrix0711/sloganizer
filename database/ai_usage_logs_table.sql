-- AI Usage Logs Table
-- Tracks AI service usage for rate limiting and analytics

CREATE TABLE IF NOT EXISTS ai_usage_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Service details
    service_type VARCHAR(50) NOT NULL, -- 'slogan_generation', 'brand_analysis', 'social_posts', etc.
    tokens_used INTEGER DEFAULT 0,
    request_duration_ms INTEGER,
    
    -- Request metadata
    request_data JSONB DEFAULT '{}',
    response_success BOOLEAN DEFAULT true,
    error_message TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user_id ON ai_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_service_type ON ai_usage_logs(service_type);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_created_at ON ai_usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user_service_date ON ai_usage_logs(user_id, service_type, created_at);

-- Enable Row Level Security
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own AI usage logs" ON ai_usage_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service can insert AI usage logs" ON ai_usage_logs
    FOR INSERT WITH CHECK (true);

-- Function to clean up old usage logs (keep last 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_ai_usage_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM ai_usage_logs 
    WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to run cleanup (if pg_cron is available)
-- SELECT cron.schedule('cleanup-ai-logs', '0 2 * * *', 'SELECT cleanup_old_ai_usage_logs();');

-- Success message
SELECT 'AI usage logs table created successfully' as status;