-- ========================================
-- RLS Policies for processed_videos table
-- ========================================

-- Enable Row Level Security
ALTER TABLE processed_videos ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own processed videos
CREATE POLICY "Users can view own processed videos" ON processed_videos
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own processed videos
CREATE POLICY "Users can insert own processed videos" ON processed_videos
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own processed videos
CREATE POLICY "Users can update own processed videos" ON processed_videos
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own processed videos
CREATE POLICY "Users can delete own processed videos" ON processed_videos
    FOR DELETE USING (auth.uid() = user_id);

-- Policy: Service role can do everything (for admin operations)
CREATE POLICY "Service role full access to processed videos" ON processed_videos
    FOR ALL USING (auth.role() = 'service_role');

-- Create index on user_id for RLS performance
CREATE INDEX IF NOT EXISTS idx_processed_videos_user_id_rls ON processed_videos(user_id) WHERE auth.uid() = user_id;