-- ========================================
-- Migration 001: Initial Schema Setup
-- Created: 2025-01-14
-- Description: Initial tables and basic structure
-- ========================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (profiles)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL,
    email VARCHAR UNIQUE,
    phone_number VARCHAR UNIQUE,
    subscription_status VARCHAR DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'expired', 'trialing')),
    max_channels INTEGER DEFAULT 3,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- YouTube Channels table
CREATE TABLE IF NOT EXISTS youtube_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    channel_id VARCHAR NOT NULL,
    channel_name VARCHAR NOT NULL,
    channel_url VARCHAR NOT NULL,
    channel_description TEXT,
    subscriber_count INTEGER,
    video_count INTEGER,
    last_video_id VARCHAR,
    last_check_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, channel_id)
);

-- Summaries table
CREATE TABLE IF NOT EXISTS summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    channel_id UUID REFERENCES youtube_channels(id) ON DELETE CASCADE,
    video_id VARCHAR NOT NULL,
    video_title VARCHAR NOT NULL,
    video_url VARCHAR NOT NULL,
    summary_text TEXT,
    status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    sent_via_whatsapp BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_youtube_channels_user_id ON youtube_channels(user_id);
CREATE INDEX IF NOT EXISTS idx_youtube_channels_active ON youtube_channels(is_active);
CREATE INDEX IF NOT EXISTS idx_summaries_user_id ON summaries(user_id);
CREATE INDEX IF NOT EXISTS idx_summaries_channel_id ON summaries(channel_id);
CREATE INDEX IF NOT EXISTS idx_summaries_status ON summaries(status);

-- Add updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_youtube_channels_updated_at BEFORE UPDATE ON youtube_channels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_summaries_updated_at BEFORE UPDATE ON summaries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();