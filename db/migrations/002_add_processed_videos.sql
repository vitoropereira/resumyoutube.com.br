-- ========================================
-- Migration 002: Add processed_videos table
-- Created: 2025-01-14
-- Description: Table for storing processed video data
-- ========================================

-- Drop summaries table and create processed_videos table
DROP TABLE IF EXISTS summaries;

-- Processed Videos table (replacing summaries)
CREATE TABLE IF NOT EXISTS processed_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    video_id VARCHAR NOT NULL,
    title VARCHAR NOT NULL,
    description TEXT,
    channel_id VARCHAR NOT NULL,
    channel_name VARCHAR NOT NULL,
    published_at TIMESTAMPTZ,
    duration VARCHAR,
    thumbnail_url VARCHAR,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    summary_text TEXT,
    sent_to_user BOOLEAN DEFAULT false,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, video_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_processed_videos_user_id ON processed_videos(user_id);
CREATE INDEX IF NOT EXISTS idx_processed_videos_channel_id ON processed_videos(channel_id);
CREATE INDEX IF NOT EXISTS idx_processed_videos_status ON processed_videos(status);
CREATE INDEX IF NOT EXISTS idx_processed_videos_published_at ON processed_videos(published_at);
CREATE INDEX IF NOT EXISTS idx_processed_videos_sent_to_user ON processed_videos(sent_to_user);

-- Add trigger for updated_at
CREATE TRIGGER update_processed_videos_updated_at 
    BEFORE UPDATE ON processed_videos 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();