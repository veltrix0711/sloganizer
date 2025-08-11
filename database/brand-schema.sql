-- Brand Profile System Database Schema
-- Created for Launchzone Brand Setup Suite

-- Brand Profiles Table
CREATE TABLE brand_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  tagline TEXT,
  mission TEXT,
  
  -- Brand Identity
  primary_color TEXT, -- hex color
  secondary_color TEXT, -- hex color
  accent_color TEXT, -- hex color
  primary_font TEXT DEFAULT 'Inter',
  secondary_font TEXT DEFAULT 'Inter',
  
  -- Brand Voice & Audience
  tone_of_voice TEXT CHECK (tone_of_voice IN ('professional', 'friendly', 'witty', 'premium', 'innovative', 'bold', 'minimalist', 'playful')),
  target_audience TEXT,
  brand_personality JSONB, -- array of personality traits
  
  -- Industry & Category
  industry TEXT,
  niche_tags TEXT[], -- array of niche keywords
  
  -- Links & Social
  website_url TEXT,
  social_links JSONB, -- {instagram: "", linkedin: "", twitter: ""}
  
  -- Metadata
  is_default BOOLEAN DEFAULT false, -- user's primary brand
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  version INTEGER DEFAULT 1
);

-- Brand Assets Table (logos, images, etc.)
CREATE TABLE brand_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_profile_id UUID REFERENCES brand_profiles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  asset_type TEXT NOT NULL CHECK (asset_type IN ('logo', 'icon', 'banner', 'pattern', 'image')),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL, -- Supabase Storage path
  file_url TEXT NOT NULL, -- Supabase Storage URL
  file_size INTEGER,
  mime_type TEXT,
  
  -- Asset metadata
  width INTEGER,
  height INTEGER,
  is_primary BOOLEAN DEFAULT false, -- primary logo/asset of its type
  
  -- Generation metadata (if AI generated)
  ai_prompt TEXT,
  ai_model TEXT,
  generation_params JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Brand Names Table (generated names and favorites)
CREATE TABLE brand_names (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_profile_id UUID REFERENCES brand_profiles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  niche TEXT,
  style TEXT, -- 'compound', 'invented', 'real-word', etc.
  
  -- Domain availability
  domain_available BOOLEAN,
  domain_checked_at TIMESTAMPTZ,
  available_extensions TEXT[], -- ['.com', '.io', '.co']
  
  -- User actions
  is_favorite BOOLEAN DEFAULT false,
  is_claimed BOOLEAN DEFAULT false, -- user registered the domain
  
  -- AI metadata
  ai_prompt TEXT,
  generation_batch_id UUID, -- group names generated together
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Social Media Posts Table (generated content)
CREATE TABLE social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_profile_id UUID REFERENCES brand_profiles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'linkedin', 'twitter', 'tiktok', 'facebook')),
  content TEXT NOT NULL,
  hashtags TEXT[],
  
  -- Post metadata
  character_count INTEGER,
  is_draft BOOLEAN DEFAULT true,
  scheduled_for TIMESTAMPTZ,
  posted_at TIMESTAMPTZ,
  
  -- AI generation metadata
  ai_prompt TEXT,
  tone_override TEXT, -- if different from brand profile
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Brand Exports Table (PDF/Notion exports)
CREATE TABLE brand_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_profile_id UUID REFERENCES brand_profiles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  export_type TEXT NOT NULL CHECK (export_type IN ('pdf', 'notion', 'markdown')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  
  file_path TEXT, -- Supabase Storage path when completed
  file_url TEXT, -- Download URL
  file_size INTEGER,
  
  -- Export options
  export_options JSONB, -- includes logo, colors, fonts, etc.
  
  -- Processing
  error_message TEXT,
  processed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'), -- cleanup after 7 days
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Background Jobs Table (for async processing)
CREATE TABLE background_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  job_type TEXT NOT NULL CHECK (job_type IN ('logo_generation', 'brand_export', 'domain_check_batch')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  
  -- Job data
  input_data JSONB NOT NULL,
  output_data JSONB,
  error_message TEXT,
  
  -- Processing metadata
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX brand_profiles_user_id_idx ON brand_profiles(user_id);
CREATE INDEX brand_profiles_default_idx ON brand_profiles(user_id, is_default);
CREATE INDEX brand_assets_profile_idx ON brand_assets(brand_profile_id, asset_type);
CREATE INDEX brand_assets_primary_idx ON brand_assets(brand_profile_id, asset_type, is_primary);
CREATE INDEX brand_names_profile_idx ON brand_names(brand_profile_id);
CREATE INDEX brand_names_favorites_idx ON brand_names(user_id, is_favorite);
CREATE INDEX social_posts_profile_idx ON social_posts(brand_profile_id);
CREATE INDEX social_posts_drafts_idx ON social_posts(user_id, is_draft);
CREATE INDEX brand_exports_user_idx ON brand_exports(user_id, status);
CREATE INDEX background_jobs_status_idx ON background_jobs(status, created_at);
CREATE INDEX background_jobs_user_idx ON background_jobs(user_id, job_type);

-- Updated timestamp trigger function (reuse existing)
CREATE TRIGGER brand_profiles_updated_at
  BEFORE UPDATE ON brand_profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER social_posts_updated_at
  BEFORE UPDATE ON social_posts
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();