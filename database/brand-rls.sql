-- Row Level Security Policies for Brand Profile System
-- Ensures users can only access their own brand data

-- Enable RLS on all brand tables
ALTER TABLE brand_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_names ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE background_jobs ENABLE ROW LEVEL SECURITY;

-- Brand Profiles Policies
CREATE POLICY "Users can view own brand profiles" ON brand_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own brand profiles" ON brand_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own brand profiles" ON brand_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own brand profiles" ON brand_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Brand Assets Policies
CREATE POLICY "Users can view own brand assets" ON brand_assets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own brand assets" ON brand_assets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own brand assets" ON brand_assets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own brand assets" ON brand_assets
  FOR DELETE USING (auth.uid() = user_id);

-- Brand Names Policies
CREATE POLICY "Users can view own brand names" ON brand_names
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own brand names" ON brand_names
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own brand names" ON brand_names
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own brand names" ON brand_names
  FOR DELETE USING (auth.uid() = user_id);

-- Social Posts Policies
CREATE POLICY "Users can view own social posts" ON social_posts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own social posts" ON social_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own social posts" ON social_posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own social posts" ON social_posts
  FOR DELETE USING (auth.uid() = user_id);

-- Brand Exports Policies
CREATE POLICY "Users can view own brand exports" ON brand_exports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own brand exports" ON brand_exports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own brand exports" ON brand_exports
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own brand exports" ON brand_exports
  FOR DELETE USING (auth.uid() = user_id);

-- Background Jobs Policies
CREATE POLICY "Users can view own background jobs" ON background_jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own background jobs" ON background_jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own background jobs" ON background_jobs
  FOR UPDATE USING (auth.uid() = user_id);

-- Service role policies (for background processing)
CREATE POLICY "Service role can manage all background jobs" ON background_jobs
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can update brand exports" ON brand_exports
  FOR UPDATE TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can create brand assets" ON brand_assets
  FOR INSERT TO service_role
  WITH CHECK (true);

-- Storage policies for brand assets
INSERT INTO storage.buckets (id, name, public) VALUES ('brand-assets', 'brand-assets', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('brand-exports', 'brand-exports', true);

CREATE POLICY "Users can upload their own brand assets" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'brand-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own brand assets" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'brand-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own brand assets" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'brand-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own brand assets" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'brand-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Public access to brand assets (for sharing brand kits)
CREATE POLICY "Public can view brand assets" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'brand-assets');

-- Brand exports storage policies
CREATE POLICY "Users can upload their own brand exports" ON storage.objects
  FOR INSERT TO service_role
  WITH CHECK (bucket_id = 'brand-exports');

CREATE POLICY "Users can view their own brand exports" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'brand-exports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own brand exports" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'brand-exports' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Public access to brand exports (for download links)
CREATE POLICY "Public can view brand exports" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'brand-exports');