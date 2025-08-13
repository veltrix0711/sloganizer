-- Enhanced Brand Profile System Database Schema
-- Comprehensive Phase 1 enhancements for AI-powered brand intelligence

-- First, add new columns to existing brand_profiles table (one by one to avoid syntax issues)
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS vision TEXT;
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS founding_year INTEGER;
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS brand_story TEXT;
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS core_values TEXT[];

-- Visual Identity enhancements  
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS color_palette_secondary TEXT[];
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS logo_style TEXT;
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS photography_style TEXT;
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS iconography_style TEXT;

-- Target Audience & Market (detailed demographics)
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS primary_demographics JSONB;
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS secondary_demographics JSONB;
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS psychographics JSONB;
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS pain_points TEXT[];
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS customer_journey JSONB;
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS competitors JSONB;
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS market_positioning VARCHAR(50);
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS geographic_presence TEXT[];

-- Business Information
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS business_model VARCHAR(50);
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS company_size VARCHAR(20);
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS revenue_range VARCHAR(30);
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS growth_stage VARCHAR(20);
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS products_services JSONB;
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS usp TEXT;
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS pricing_strategy VARCHAR(30);
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS competitive_advantages TEXT;
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS current_market_position TEXT;
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS growth_goals TEXT;
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS success_metrics TEXT;

-- Communication & Voice (enhanced)
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS communication_style VARCHAR(50);
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS key_messages TEXT[];
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS brand_guidelines JSONB;

-- Marketing Strategy
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS marketing_channels TEXT[];
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS content_types TEXT[];
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS posting_frequency JSONB;
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS marketing_budget_range VARCHAR(30);
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS campaign_goals TEXT[];
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS seasonal_considerations TEXT[];
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS partnership_opportunities TEXT[];

-- AI Analysis Results (for future Phase 2)
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS brand_health_score INTEGER;
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS last_analysis_date TIMESTAMPTZ;
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS ai_recommendations JSONB;
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS strengths TEXT[];
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS opportunities TEXT[];
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS weaknesses TEXT[];
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS threats TEXT[];

-- Create new tables for enhanced functionality

-- AI Content Suggestions (Phase 2 preparation)
CREATE TABLE IF NOT EXISTS ai_content_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_profile_id UUID REFERENCES brand_profiles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  suggestion_type VARCHAR(50) NOT NULL, -- social_post, blog_topic, campaign_idea, marketing_strategy
  content_category VARCHAR(50), -- educational, promotional, seasonal, behind_scenes
  title TEXT NOT NULL,
  description TEXT,
  content_preview TEXT,
  target_platform VARCHAR(30), -- instagram, linkedin, twitter, etc.
  
  -- AI metadata
  ai_model_version VARCHAR(50),
  confidence_score DECIMAL(3,2), -- 0.00 to 1.00
  generation_prompt TEXT,
  
  -- Usage tracking
  estimated_engagement_score INTEGER,
  is_used BOOLEAN DEFAULT false,
  is_favorite BOOLEAN DEFAULT false,
  user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

-- Brand Analysis History (Phase 2 preparation)
CREATE TABLE IF NOT EXISTS brand_analysis_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_profile_id UUID REFERENCES brand_profiles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  analysis_type VARCHAR(50) NOT NULL, -- health_check, competitor_analysis, content_audit, market_positioning
  analysis_version VARCHAR(20) DEFAULT '1.0',
  
  -- Analysis results
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
  analysis_results JSONB NOT NULL, -- detailed analysis data
  recommendations JSONB, -- structured recommendations
  action_items JSONB, -- prioritized action items
  
  -- Comparison data (for tracking improvements)
  previous_score INTEGER,
  score_change INTEGER,
  
  -- AI metadata
  ai_model_used VARCHAR(50),
  processing_time_ms INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enhanced Brand Assets with AI generation metadata
CREATE TABLE IF NOT EXISTS brand_assets_extended (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_profile_id UUID REFERENCES brand_profiles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  asset_category VARCHAR(50) NOT NULL, -- logo, social_template, marketing_material, brand_guideline
  asset_subcategory VARCHAR(50), -- primary_logo, instagram_post, business_card, etc.
  asset_name VARCHAR(255) NOT NULL,
  
  -- File information
  file_variations JSONB, -- {svg: url, png: url, pdf: url, high_res: url}
  file_metadata JSONB, -- {dimensions, color_mode, file_sizes}
  
  -- Usage guidelines
  usage_guidelines TEXT,
  brand_compliance_notes TEXT,
  
  -- AI generation metadata (if AI generated)
  ai_generated BOOLEAN DEFAULT false,
  ai_model_version VARCHAR(50),
  generation_prompt TEXT,
  generation_params JSONB, -- style, colors, themes used
  user_modifications JSONB, -- track user edits to AI content
  
  -- Usage tracking
  download_count INTEGER DEFAULT 0,
  last_downloaded_at TIMESTAMPTZ,
  is_featured BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content Performance Tracking (Phase 2 preparation)
CREATE TABLE IF NOT EXISTS content_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_profile_id UUID REFERENCES brand_profiles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content_suggestion_id UUID REFERENCES ai_content_suggestions(id) ON DELETE SET NULL,
  
  platform VARCHAR(30) NOT NULL,
  content_type VARCHAR(50) NOT NULL,
  content_text TEXT,
  
  -- Performance metrics
  engagement_metrics JSONB, -- {likes, comments, shares, views, clicks}
  reach_metrics JSONB, -- {impressions, reach, unique_viewers}
  conversion_metrics JSONB, -- {clicks, conversions, cost_per_conversion}
  
  -- Analysis
  performance_score DECIMAL(3,2), -- calculated performance score
  best_performing_elements JSONB, -- hashtags, posting_time, content_themes
  improvement_suggestions JSONB,
  
  posted_at TIMESTAMPTZ,
  tracked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Marketing Campaign Tracking (Phase 2 preparation)
CREATE TABLE IF NOT EXISTS marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_profile_id UUID REFERENCES brand_profiles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  campaign_name VARCHAR(255) NOT NULL,
  campaign_type VARCHAR(50), -- product_launch, brand_awareness, seasonal, etc.
  campaign_status VARCHAR(20) DEFAULT 'planning' CHECK (campaign_status IN ('planning', 'active', 'completed', 'paused')),
  
  -- Campaign details
  description TEXT,
  objectives TEXT[],
  target_audience_override JSONB, -- override brand's default audience for this campaign
  
  -- Timeline
  start_date DATE,
  end_date DATE,
  
  -- Budget & Resources
  budget_allocated DECIMAL(10,2),
  budget_spent DECIMAL(10,2) DEFAULT 0,
  team_members TEXT[],
  
  -- AI assistance
  ai_suggested BOOLEAN DEFAULT false,
  ai_optimization_applied BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Brand Monitoring (Phase 2 preparation)
CREATE TABLE IF NOT EXISTS brand_monitoring (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_profile_id UUID REFERENCES brand_profiles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  monitoring_type VARCHAR(50) NOT NULL, -- social_mention, review, competitor_activity, trend_analysis
  source_platform VARCHAR(50), -- twitter, instagram, google_reviews, etc.
  
  -- Content data
  content TEXT,
  sentiment_score DECIMAL(3,2), -- -1.00 to 1.00 (negative to positive)
  relevance_score DECIMAL(3,2), -- 0.00 to 1.00
  
  -- Context
  author_info JSONB, -- {username, follower_count, verification_status}
  engagement_metrics JSONB, -- {likes, shares, comments}
  
  -- Classification
  requires_response BOOLEAN DEFAULT false,
  priority_level VARCHAR(10) DEFAULT 'low' CHECK (priority_level IN ('low', 'medium', 'high', 'urgent')),
  category_tags TEXT[],
  
  -- Processing
  processed_by_ai BOOLEAN DEFAULT false,
  suggested_response TEXT,
  
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update indexes for performance
CREATE INDEX IF NOT EXISTS brand_profiles_enhanced_idx ON brand_profiles(user_id, is_default, growth_stage);
CREATE INDEX IF NOT EXISTS brand_profiles_industry_idx ON brand_profiles(industry, market_positioning);
CREATE INDEX IF NOT EXISTS ai_content_suggestions_user_idx ON ai_content_suggestions(user_id, suggestion_type, is_used);
CREATE INDEX IF NOT EXISTS ai_content_suggestions_profile_idx ON ai_content_suggestions(brand_profile_id, created_at);
CREATE INDEX IF NOT EXISTS brand_analysis_history_profile_idx ON brand_analysis_history(brand_profile_id, analysis_type, created_at);
CREATE INDEX IF NOT EXISTS brand_assets_extended_profile_idx ON brand_assets_extended(brand_profile_id, asset_category);
CREATE INDEX IF NOT EXISTS content_performance_profile_idx ON content_performance(brand_profile_id, platform, posted_at);
CREATE INDEX IF NOT EXISTS marketing_campaigns_profile_idx ON marketing_campaigns(brand_profile_id, campaign_status);
CREATE INDEX IF NOT EXISTS brand_monitoring_profile_idx ON brand_monitoring(brand_profile_id, monitoring_type, priority_level);

-- Add updated_at triggers for new tables
CREATE TRIGGER brand_assets_extended_updated_at
  BEFORE UPDATE ON brand_assets_extended
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER marketing_campaigns_updated_at
  BEFORE UPDATE ON marketing_campaigns
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Add RLS policies for new tables
ALTER TABLE ai_content_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_analysis_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_assets_extended ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_monitoring ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can access their own AI content suggestions" ON ai_content_suggestions
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can access their own brand analysis history" ON brand_analysis_history
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can access their own brand assets" ON brand_assets_extended
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can access their own content performance" ON content_performance
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can access their own marketing campaigns" ON marketing_campaigns
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can access their own brand monitoring" ON brand_monitoring
  FOR ALL USING (user_id = auth.uid());