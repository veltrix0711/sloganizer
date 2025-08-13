-- Brand Voice Training System Database Schema
-- Extends existing brand_profiles system with voice training capabilities

-- Brand voice training content samples
CREATE TABLE IF NOT EXISTS brand_voice_samples (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_profile_id UUID REFERENCES brand_profiles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Content data
    content_text TEXT NOT NULL,
    content_source VARCHAR(100) NOT NULL, -- 'website', 'social', 'email', 'document', 'manual'
    source_url TEXT, -- Original URL if scraped from web
    file_name TEXT, -- Original filename if uploaded
    
    -- Content metadata
    word_count INTEGER,
    character_count INTEGER,
    language VARCHAR(10) DEFAULT 'en',
    content_type VARCHAR(50), -- 'marketing', 'blog', 'social', 'email', 'product'
    
    -- Processing status
    processing_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'analyzed', 'failed'
    analysis_completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Content quality scores
    quality_score DECIMAL(3,2), -- 0.0-1.0 based on content usefulness for training
    uniqueness_score DECIMAL(3,2), -- 0.0-1.0 based on content uniqueness
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analyzed voice characteristics and patterns
CREATE TABLE IF NOT EXISTS brand_voice_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_profile_id UUID REFERENCES brand_profiles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Core voice characteristics (0.0-1.0 scales)
    tone_formal_score DECIMAL(3,2) DEFAULT 0.5, -- 0=casual, 1=formal
    tone_friendly_score DECIMAL(3,2) DEFAULT 0.5, -- 0=professional, 1=friendly
    tone_confident_score DECIMAL(3,2) DEFAULT 0.5, -- 0=humble, 1=confident
    complexity_score DECIMAL(3,2) DEFAULT 0.5, -- 0=simple, 1=complex
    emotional_score DECIMAL(3,2) DEFAULT 0.5, -- 0=neutral, 1=emotional
    
    -- Linguistic patterns
    avg_sentence_length DECIMAL(5,2),
    avg_paragraph_length DECIMAL(5,2),
    vocabulary_complexity DECIMAL(3,2),
    readability_score DECIMAL(3,2), -- Flesch reading ease equivalent
    
    -- Brand-specific patterns
    common_phrases JSONB DEFAULT '[]', -- ["phrase1", "phrase2"]
    technical_terms JSONB DEFAULT '[]', -- ["term1", "term2"]  
    brand_keywords JSONB DEFAULT '[]', -- Most frequently used brand terms
    avoided_terms JSONB DEFAULT '[]', -- Terms this brand avoids
    
    -- Style markers
    uses_contractions BOOLEAN DEFAULT false,
    uses_exclamations BOOLEAN DEFAULT false,
    uses_questions BOOLEAN DEFAULT false,
    uses_humor BOOLEAN DEFAULT false,
    uses_storytelling BOOLEAN DEFAULT false,
    preferred_pronouns JSONB DEFAULT '[]', -- ["we", "you", "I"]
    
    -- Sentence structure patterns
    simple_sentence_ratio DECIMAL(3,2), -- % of simple sentences
    compound_sentence_ratio DECIMAL(3,2), -- % of compound sentences
    complex_sentence_ratio DECIMAL(3,2), -- % of complex sentences
    
    -- Content structure preferences
    uses_bullet_points BOOLEAN DEFAULT false,
    uses_numbered_lists BOOLEAN DEFAULT false,
    uses_subheadings BOOLEAN DEFAULT false,
    paragraph_style VARCHAR(20) DEFAULT 'medium', -- 'short', 'medium', 'long'
    
    -- Training metadata
    training_sample_count INTEGER DEFAULT 0,
    total_word_count INTEGER DEFAULT 0,
    confidence_score DECIMAL(3,2) DEFAULT 0.0, -- Overall confidence in voice profile
    last_trained_at TIMESTAMP WITH TIME ZONE,
    training_version INTEGER DEFAULT 1, -- Increment when retrained
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Voice training jobs and progress tracking
CREATE TABLE IF NOT EXISTS brand_voice_training_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_profile_id UUID REFERENCES brand_profiles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Job details
    job_type VARCHAR(50) DEFAULT 'full_analysis', -- 'full_analysis', 'incremental_update', 'retraining'
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed', 'cancelled'
    
    -- Progress tracking
    progress_percentage INTEGER DEFAULT 0,
    current_step VARCHAR(100), -- Description of current processing step
    total_samples INTEGER DEFAULT 0,
    processed_samples INTEGER DEFAULT 0,
    failed_samples INTEGER DEFAULT 0,
    
    -- Timing
    estimated_completion_time TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Results and errors
    result_summary JSONB, -- Summary of training results
    error_message TEXT,
    error_details JSONB, -- Detailed error information
    
    -- Configuration
    job_config JSONB, -- Job-specific configuration options
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Individual voice analysis results for each sample
CREATE TABLE IF NOT EXISTS brand_voice_sample_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sample_id UUID REFERENCES brand_voice_samples(id) ON DELETE CASCADE,
    brand_profile_id UUID REFERENCES brand_profiles(id) ON DELETE CASCADE,
    
    -- Analysis results (mirror voice_profiles structure for individual samples)
    tone_formal_score DECIMAL(3,2),
    tone_friendly_score DECIMAL(3,2),
    tone_confident_score DECIMAL(3,2),
    complexity_score DECIMAL(3,2),
    emotional_score DECIMAL(3,2),
    
    -- Sample-specific metrics
    sentence_count INTEGER,
    word_count INTEGER,
    unique_word_count INTEGER,
    avg_sentence_length DECIMAL(5,2),
    readability_score DECIMAL(3,2),
    
    -- Extracted patterns
    phrases_found JSONB DEFAULT '[]',
    keywords_found JSONB DEFAULT '[]',
    style_markers JSONB DEFAULT '{}', -- Various style indicators
    
    -- Quality assessment
    analysis_confidence DECIMAL(3,2),
    content_relevance DECIMAL(3,2), -- How relevant this sample is for training
    
    -- AI processing metadata
    ai_model_used VARCHAR(50),
    processing_time_ms INTEGER,
    tokens_used INTEGER,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Voice training feedback and improvements
CREATE TABLE IF NOT EXISTS brand_voice_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_profile_id UUID REFERENCES brand_profiles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Feedback context
    generated_content_id UUID, -- Reference to generated content
    feedback_type VARCHAR(50), -- 'voice_accuracy', 'tone_match', 'style_match', 'overall_quality'
    
    -- Feedback data
    rating INTEGER CHECK (rating >= 1 AND rating <= 5), -- 1-5 star rating
    feedback_text TEXT, -- Optional detailed feedback
    suggested_improvements JSONB, -- Structured improvement suggestions
    
    -- Content context
    content_type VARCHAR(50), -- What type of content was generated
    generation_prompt TEXT, -- Original prompt used
    generated_content TEXT, -- The content that was rated
    
    -- Learning data
    voice_profile_version INTEGER, -- Which version of voice profile was used
    incorporated_into_training BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_voice_samples_brand_profile ON brand_voice_samples(brand_profile_id);
CREATE INDEX IF NOT EXISTS idx_voice_samples_status ON brand_voice_samples(processing_status);
CREATE INDEX IF NOT EXISTS idx_voice_samples_source ON brand_voice_samples(content_source);
CREATE INDEX IF NOT EXISTS idx_voice_samples_created ON brand_voice_samples(created_at);

CREATE INDEX IF NOT EXISTS idx_voice_profiles_brand_profile ON brand_voice_profiles(brand_profile_id);
CREATE INDEX IF NOT EXISTS idx_voice_profiles_confidence ON brand_voice_profiles(confidence_score);
CREATE INDEX IF NOT EXISTS idx_voice_profiles_updated ON brand_voice_profiles(updated_at);

CREATE INDEX IF NOT EXISTS idx_voice_training_jobs_brand_profile ON brand_voice_training_jobs(brand_profile_id);
CREATE INDEX IF NOT EXISTS idx_voice_training_jobs_status ON brand_voice_training_jobs(status);
CREATE INDEX IF NOT EXISTS idx_voice_training_jobs_created ON brand_voice_training_jobs(created_at);

CREATE INDEX IF NOT EXISTS idx_voice_analysis_sample ON brand_voice_sample_analysis(sample_id);
CREATE INDEX IF NOT EXISTS idx_voice_analysis_brand_profile ON brand_voice_sample_analysis(brand_profile_id);

CREATE INDEX IF NOT EXISTS idx_voice_feedback_brand_profile ON brand_voice_feedback(brand_profile_id);
CREATE INDEX IF NOT EXISTS idx_voice_feedback_rating ON brand_voice_feedback(rating);
CREATE INDEX IF NOT EXISTS idx_voice_feedback_type ON brand_voice_feedback(feedback_type);

-- Add voice training status to existing brand_profiles table
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS voice_training_status VARCHAR(20) DEFAULT 'not_started';
-- Values: 'not_started', 'collecting_samples', 'training', 'trained', 'needs_update'

ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS voice_training_sample_count INTEGER DEFAULT 0;
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS voice_confidence_score DECIMAL(3,2) DEFAULT 0.0;
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS last_voice_training_at TIMESTAMP WITH TIME ZONE;

-- Create a view for easy voice profile access with brand data
CREATE OR REPLACE VIEW brand_voice_summary AS
SELECT 
    bp.id as brand_profile_id,
    bp.name as brand_name,
    bp.voice_training_status,
    bp.voice_training_sample_count,
    bp.voice_confidence_score,
    bp.last_voice_training_at,
    vp.tone_formal_score,
    vp.tone_friendly_score,
    vp.tone_confident_score,
    vp.complexity_score,
    vp.emotional_score,
    vp.avg_sentence_length,
    vp.vocabulary_complexity,
    vp.common_phrases,
    vp.technical_terms,
    vp.brand_keywords,
    vp.uses_contractions,
    vp.uses_exclamations,
    vp.uses_questions,
    vp.preferred_pronouns,
    vp.confidence_score as profile_confidence,
    vp.training_version,
    vp.updated_at as profile_updated_at
FROM brand_profiles bp
LEFT JOIN brand_voice_profiles vp ON bp.id = vp.brand_profile_id;

-- Function to calculate overall voice training progress
CREATE OR REPLACE FUNCTION get_voice_training_progress(brand_profile_uuid UUID)
RETURNS JSONB AS $$
DECLARE
    sample_count INTEGER;
    analyzed_count INTEGER;
    confidence_score DECIMAL(3,2);
    training_status VARCHAR(20);
    progress_data JSONB;
BEGIN
    -- Get sample counts
    SELECT COUNT(*) INTO sample_count
    FROM brand_voice_samples 
    WHERE brand_profile_id = brand_profile_uuid;
    
    SELECT COUNT(*) INTO analyzed_count
    FROM brand_voice_samples 
    WHERE brand_profile_id = brand_profile_uuid 
    AND processing_status = 'analyzed';
    
    -- Get confidence score
    SELECT COALESCE(confidence_score, 0.0) INTO confidence_score
    FROM brand_voice_profiles 
    WHERE brand_profile_id = brand_profile_uuid;
    
    -- Get training status
    SELECT voice_training_status INTO training_status
    FROM brand_profiles 
    WHERE id = brand_profile_uuid;
    
    -- Build progress object
    progress_data := jsonb_build_object(
        'total_samples', sample_count,
        'analyzed_samples', analyzed_count,
        'analysis_progress', CASE WHEN sample_count > 0 THEN (analyzed_count::DECIMAL / sample_count::DECIMAL) * 100 ELSE 0 END,
        'confidence_score', confidence_score,
        'training_status', COALESCE(training_status, 'not_started'),
        'ready_for_generation', (confidence_score >= 0.7 AND analyzed_count >= 5),
        'recommended_min_samples', 10,
        'recommended_min_words', 2000
    );
    
    RETURN progress_data;
END;
$$ LANGUAGE plpgsql;

-- Function to update brand profile voice training summary
CREATE OR REPLACE FUNCTION update_brand_voice_summary(brand_profile_uuid UUID)
RETURNS VOID AS $$
DECLARE
    sample_count INTEGER;
    total_words INTEGER;
    avg_confidence DECIMAL(3,2);
BEGIN
    -- Calculate summary statistics
    SELECT 
        COUNT(*),
        COALESCE(SUM(word_count), 0),
        COALESCE(AVG(quality_score), 0.0)
    INTO sample_count, total_words, avg_confidence
    FROM brand_voice_samples 
    WHERE brand_profile_id = brand_profile_uuid 
    AND processing_status = 'analyzed';
    
    -- Update brand profile
    UPDATE brand_profiles 
    SET 
        voice_training_sample_count = sample_count,
        voice_confidence_score = avg_confidence,
        voice_training_status = CASE 
            WHEN sample_count = 0 THEN 'not_started'
            WHEN sample_count < 5 THEN 'collecting_samples'
            WHEN avg_confidence < 0.7 THEN 'training'
            ELSE 'trained'
        END,
        updated_at = NOW()
    WHERE id = brand_profile_uuid;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update brand voice summary when samples change
CREATE OR REPLACE FUNCTION trigger_update_brand_voice_summary()
RETURNS TRIGGER AS $$
BEGIN
    -- Update for the affected brand profile
    IF TG_OP = 'DELETE' THEN
        PERFORM update_brand_voice_summary(OLD.brand_profile_id);
        RETURN OLD;
    ELSE
        PERFORM update_brand_voice_summary(NEW.brand_profile_id);
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_voice_samples_summary
    AFTER INSERT OR UPDATE OR DELETE ON brand_voice_samples
    FOR EACH ROW EXECUTE FUNCTION trigger_update_brand_voice_summary();

-- Sample data for testing (optional - remove in production)
-- INSERT INTO brand_voice_samples (brand_profile_id, user_id, content_text, content_source, word_count, character_count, content_type, processing_status) 
-- VALUES 
-- (uuid_generate_v4(), uuid_generate_v4(), 'Sample brand content for testing voice analysis...', 'manual', 50, 300, 'marketing', 'pending');