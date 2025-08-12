-- Agency Leads table for contact sales functionality
-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS agency_leads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    company VARCHAR(200) NOT NULL,
    company_domain VARCHAR(100),
    
    -- Scale information
    brands_count VARCHAR(20), -- 5-10, 10-25, 25-50, 50-100, 100+
    seats VARCHAR(20),         -- 5-10, 10-25, 25-50, 50-100, 100+
    monthly_posts VARCHAR(20), -- 1k-5k, 5k-10k, 10k-25k, 25k-50k, 50k+
    video_minutes VARCHAR(20), -- 100-500, 500-1000, 1000-2500, 2500+
    
    -- Requirements
    must_haves TEXT[], -- Array of must-have features
    integrations TEXT[], -- Array of required integrations
    goals TEXT, -- Free-text goals and requirements
    
    -- Lead management
    status VARCHAR(20) DEFAULT 'new', -- new, contacted, qualified, proposal, closed, lost
    priority VARCHAR(10) DEFAULT 'medium', -- low, medium, high
    estimated_value INTEGER, -- Estimated monthly value in dollars
    source VARCHAR(50) DEFAULT 'contact_form',
    
    -- Notes and follow-up
    notes TEXT,
    assigned_to VARCHAR(100), -- Sales rep email or ID
    next_follow_up TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    contacted_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT valid_status CHECK (status IN ('new', 'contacted', 'qualified', 'proposal', 'closed', 'lost')),
    CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high')),
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_agency_leads_status ON agency_leads(status);
CREATE INDEX IF NOT EXISTS idx_agency_leads_priority ON agency_leads(priority);
CREATE INDEX IF NOT EXISTS idx_agency_leads_created_at ON agency_leads(created_at);
CREATE INDEX IF NOT EXISTS idx_agency_leads_email ON agency_leads(email);
CREATE INDEX IF NOT EXISTS idx_agency_leads_company ON agency_leads(company);
CREATE INDEX IF NOT EXISTS idx_agency_leads_assigned_to ON agency_leads(assigned_to);

-- Row Level Security
ALTER TABLE agency_leads ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view agency leads (you'll need to create admin roles)
-- For now, allowing all authenticated users (modify based on your admin system)
CREATE POLICY "Admins can manage agency leads" ON agency_leads
    FOR ALL USING (auth.role() = 'authenticated');

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_agency_lead_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER trigger_agency_leads_updated_at
    BEFORE UPDATE ON agency_leads
    FOR EACH ROW
    EXECUTE FUNCTION update_agency_lead_updated_at();

-- Function to calculate estimated value (can be called from SQL)
CREATE OR REPLACE FUNCTION calculate_lead_estimated_value(
    brands_count_param VARCHAR,
    seats_param VARCHAR,
    monthly_posts_param VARCHAR,
    must_haves_param TEXT[]
)
RETURNS INTEGER AS $$
DECLARE
    base_value INTEGER := 150;
    brand_multiplier DECIMAL := 1.0;
    seat_multiplier DECIMAL := 1.0;
    posts_multiplier DECIMAL := 1.0;
    complexity_multiplier DECIMAL := 1.0;
BEGIN
    -- Brand count multipliers
    CASE brands_count_param
        WHEN '5-10' THEN brand_multiplier := 1.2;
        WHEN '10-25' THEN brand_multiplier := 1.5;
        WHEN '25-50' THEN brand_multiplier := 2.0;
        WHEN '50-100' THEN brand_multiplier := 3.0;
        WHEN '100+' THEN brand_multiplier := 5.0;
        ELSE brand_multiplier := 1.0;
    END CASE;
    
    -- Seat count multipliers
    CASE seats_param
        WHEN '5-10' THEN seat_multiplier := 1.1;
        WHEN '10-25' THEN seat_multiplier := 1.3;
        WHEN '25-50' THEN seat_multiplier := 1.8;
        WHEN '50-100' THEN seat_multiplier := 2.5;
        WHEN '100+' THEN seat_multiplier := 4.0;
        ELSE seat_multiplier := 1.0;
    END CASE;
    
    -- Posts volume multipliers
    CASE monthly_posts_param
        WHEN '1k-5k' THEN posts_multiplier := 1.0;
        WHEN '5k-10k' THEN posts_multiplier := 1.5;
        WHEN '10k-25k' THEN posts_multiplier := 2.5;
        WHEN '25k-50k' THEN posts_multiplier := 4.0;
        WHEN '50k+' THEN posts_multiplier := 6.0;
        ELSE posts_multiplier := 1.0;
    END CASE;
    
    -- Complexity multiplier for enterprise features
    IF array_length(must_haves_param, 1) > 3 THEN
        complexity_multiplier := 1.3;
    END IF;
    
    RETURN ROUND(base_value * brand_multiplier * seat_multiplier * posts_multiplier * complexity_multiplier);
END;
$$ LANGUAGE plpgsql;

-- Function to calculate lead priority
CREATE OR REPLACE FUNCTION calculate_lead_priority(
    brands_count_param VARCHAR,
    seats_param VARCHAR,
    monthly_posts_param VARCHAR,
    must_haves_param TEXT[],
    goals_param TEXT
)
RETURNS VARCHAR AS $$
DECLARE
    score INTEGER := 0;
    enterprise_features TEXT[] := ARRAY['SSO/SAML Authentication', 'White-label branding', 'Audit logs'];
BEGIN
    -- Brand count score
    CASE brands_count_param
        WHEN '5-10' THEN score := score + 1;
        WHEN '10-25' THEN score := score + 2;
        WHEN '25-50' THEN score := score + 3;
        WHEN '50-100' THEN score := score + 4;
        WHEN '100+' THEN score := score + 5;
    END CASE;
    
    -- Seat count score
    CASE seats_param
        WHEN '5-10' THEN score := score + 1;
        WHEN '10-25' THEN score := score + 2;
        WHEN '25-50' THEN score := score + 3;
        WHEN '50-100' THEN score := score + 4;
        WHEN '100+' THEN score := score + 5;
    END CASE;
    
    -- High volume posting
    IF monthly_posts_param IN ('25k-50k', '50k+') THEN
        score := score + 2;
    END IF;
    
    -- Enterprise features requested
    IF must_haves_param && enterprise_features THEN
        score := score + 3;
    END IF;
    
    -- Detailed goals indicate serious interest
    IF char_length(COALESCE(goals_param, '')) > 100 THEN
        score := score + 1;
    END IF;
    
    -- Convert to priority level
    IF score >= 8 THEN
        RETURN 'high';
    ELSIF score >= 5 THEN
        RETURN 'medium';
    ELSE
        RETURN 'low';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate estimated value and priority on insert/update
CREATE OR REPLACE FUNCTION auto_calculate_lead_metrics()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate estimated value
    NEW.estimated_value := calculate_lead_estimated_value(
        NEW.brands_count,
        NEW.seats,
        NEW.monthly_posts,
        NEW.must_haves
    );
    
    -- Calculate priority
    NEW.priority := calculate_lead_priority(
        NEW.brands_count,
        NEW.seats,
        NEW.monthly_posts,
        NEW.must_haves,
        NEW.goals
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_calculate_lead_metrics
    BEFORE INSERT OR UPDATE ON agency_leads
    FOR EACH ROW
    EXECUTE FUNCTION auto_calculate_lead_metrics();