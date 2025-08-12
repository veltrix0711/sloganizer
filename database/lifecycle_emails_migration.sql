-- Add email tracking fields to subscriptions table
-- Run this in your Supabase SQL editor

ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS welcome_email_sent TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS trial_reminder_sent TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS final_reminder_sent TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS conversion_email_sent TIMESTAMP WITH TIME ZONE;

-- Create email_events table for detailed tracking
CREATE TABLE IF NOT EXISTS email_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
    email_type VARCHAR(50) NOT NULL, -- welcome, trial_reminder, final_reminder, conversion
    email_address VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'sent', -- sent, delivered, opened, clicked, bounced, failed
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivered_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    
    -- Email content metadata
    subject_line TEXT,
    template_version VARCHAR(20),
    
    -- Tracking metadata
    external_message_id VARCHAR(255), -- From email service provider
    user_agent TEXT,
    ip_address INET,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_email_type CHECK (email_type IN ('welcome', 'trial_reminder', 'final_reminder', 'conversion', 'upgrade_nudge', 'payment_failed')),
    CONSTRAINT valid_status CHECK (status IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed', 'unsubscribed'))
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_events_user_id ON email_events(user_id);
CREATE INDEX IF NOT EXISTS idx_email_events_subscription_id ON email_events(subscription_id);
CREATE INDEX IF NOT EXISTS idx_email_events_type ON email_events(email_type);
CREATE INDEX IF NOT EXISTS idx_email_events_status ON email_events(status);
CREATE INDEX IF NOT EXISTS idx_email_events_sent_at ON email_events(sent_at);
CREATE INDEX IF NOT EXISTS idx_email_events_email_address ON email_events(email_address);

-- Row Level Security
ALTER TABLE email_events ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own email events
CREATE POLICY "Users can view own email events" ON email_events
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Only service role can insert/update email events
CREATE POLICY "Service role can manage email events" ON email_events
    FOR ALL USING (auth.role() = 'service_role');

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_email_event_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER trigger_email_events_updated_at
    BEFORE UPDATE ON email_events
    FOR EACH ROW
    EXECUTE FUNCTION update_email_event_updated_at();

-- Function to log email events (called from backend)
CREATE OR REPLACE FUNCTION log_email_event(
    user_id_param UUID,
    subscription_id_param UUID,
    email_type_param VARCHAR,
    email_address_param VARCHAR,
    status_param VARCHAR DEFAULT 'sent',
    subject_line_param TEXT DEFAULT NULL,
    external_message_id_param VARCHAR DEFAULT NULL,
    error_message_param TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    event_id UUID;
BEGIN
    INSERT INTO email_events (
        user_id,
        subscription_id,
        email_type,
        email_address,
        status,
        subject_line,
        external_message_id,
        error_message
    ) VALUES (
        user_id_param,
        subscription_id_param,
        email_type_param,
        email_address_param,
        status_param,
        subject_line_param,
        external_message_id_param,
        error_message_param
    )
    RETURNING id INTO event_id;
    
    RETURN event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get email stats for a user
CREATE OR REPLACE FUNCTION get_user_email_stats(user_id_param UUID)
RETURNS TABLE (
    email_type VARCHAR,
    total_sent BIGINT,
    total_delivered BIGINT,
    total_opened BIGINT,
    total_clicked BIGINT,
    last_sent TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.email_type,
        COUNT(*) as total_sent,
        COUNT(*) FILTER (WHERE e.status = 'delivered') as total_delivered,
        COUNT(*) FILTER (WHERE e.status = 'opened') as total_opened,
        COUNT(*) FILTER (WHERE e.status = 'clicked') as total_clicked,
        MAX(e.sent_at) as last_sent
    FROM email_events e
    WHERE e.user_id = user_id_param
    GROUP BY e.email_type
    ORDER BY last_sent DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user should receive specific email type
CREATE OR REPLACE FUNCTION should_send_email(
    user_id_param UUID,
    email_type_param VARCHAR,
    cooldown_hours INTEGER DEFAULT 24
)
RETURNS BOOLEAN AS $$
DECLARE
    last_sent TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get the last time this email type was sent to this user
    SELECT MAX(sent_at) INTO last_sent
    FROM email_events
    WHERE user_id = user_id_param 
    AND email_type = email_type_param
    AND status != 'failed';
    
    -- If never sent, or sent more than cooldown_hours ago, allow sending
    IF last_sent IS NULL OR last_sent < NOW() - (cooldown_hours || ' hours')::INTERVAL THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create email templates table for dynamic templates
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL, -- welcome, trial_reminder, final_reminder, etc.
    subject_template TEXT NOT NULL,
    html_template TEXT NOT NULL,
    text_template TEXT,
    
    -- Template variables (JSON array of variable names)
    variables JSONB DEFAULT '[]',
    
    -- A/B testing support
    variant VARCHAR(10) DEFAULT 'A',
    is_active BOOLEAN DEFAULT true,
    
    -- Metadata
    description TEXT,
    created_by UUID REFERENCES auth.users(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_template_type CHECK (type IN ('welcome', 'trial_reminder', 'final_reminder', 'conversion', 'upgrade_nudge', 'payment_failed', 'onboarding', 'feature_announcement'))
);

-- Create indexes for email templates
CREATE INDEX IF NOT EXISTS idx_email_templates_type ON email_templates(type);
CREATE INDEX IF NOT EXISTS idx_email_templates_active ON email_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_email_templates_name ON email_templates(name);

-- Row Level Security for email templates
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can manage templates
CREATE POLICY "Service role can manage email templates" ON email_templates
    FOR ALL USING (auth.role() = 'service_role');

-- Policy: Authenticated users can view active templates
CREATE POLICY "Users can view active email templates" ON email_templates
    FOR SELECT USING (is_active = true AND auth.role() = 'authenticated');

-- Trigger for email templates updated_at
CREATE TRIGGER trigger_email_templates_updated_at
    BEFORE UPDATE ON email_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_email_event_updated_at();

-- Insert default email templates
INSERT INTO email_templates (name, type, subject_template, html_template, description, variables) VALUES
(
    'trial_welcome_v1',
    'welcome',
    '🚀 Welcome to LaunchZone - Your 7-day trial has started!',
    '<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; background: #0B1220; color: #B9C7D9;"><div style="max-width: 600px; margin: 0 auto; background: #0F1B2E; border-radius: 12px;"><div style="background: linear-gradient(135deg, #00E5A8 0%, #1FB5FF 100%); padding: 40px 30px; text-align: center;"><h1 style="color: white; margin: 0; font-size: 28px;">🚀 Welcome to LaunchZone!</h1></div><div style="padding: 40px 30px;"><p>Hi {{user_name}},</p><p>Welcome to LaunchZone! Your free trial has started and you now have access to our complete brand-building toolkit.</p><p><strong>Trial ends:</strong> {{trial_end_date}}</p><div style="text-align: center; margin: 30px 0;"><a href="{{dashboard_url}}" style="background: linear-gradient(135deg, #FF7A00 0%, #1FB5FF 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold;">Start Building Your Brand →</a></div></div></div></body></html>',
    'Welcome email for new trial users',
    '["user_name", "trial_end_date", "dashboard_url"]'
) ON CONFLICT (name) DO NOTHING;

INSERT INTO email_templates (name, type, subject_template, html_template, description, variables) VALUES
(
    'trial_reminder_v1',
    'trial_reminder',
    '⏰ Your LaunchZone trial ends in {{days_left}} days',
    '<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; background: #0B1220; color: #B9C7D9;"><div style="max-width: 600px; margin: 0 auto; background: #0F1B2E; border-radius: 12px;"><div style="background: linear-gradient(135deg, #FF7A00 0%, #00E5A8 100%); padding: 40px 30px; text-align: center;"><h1 style="color: white; margin: 0; font-size: 28px;">⏰ Trial Ending Soon</h1></div><div style="padding: 40px 30px;"><p>Hi {{user_name}},</p><p>Your LaunchZone trial ends in <strong>{{days_left}} days</strong>. Don''t lose your progress!</p><div style="text-align: center; margin: 30px 0;"><a href="{{pricing_url}}" style="background: linear-gradient(135deg, #FF7A00 0%, #1FB5FF 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold;">Continue for $9.99/month →</a></div></div></div></body></html>',
    'Reminder email 3 days before trial expires',
    '["user_name", "days_left", "pricing_url"]'
) ON CONFLICT (name) DO NOTHING;