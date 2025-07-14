-- ========================================
-- RLS Policies: YouTube Channels Table
-- Description: Row Level Security policies for youtube_channels table
-- ========================================

-- Enable RLS on youtube_channels table
ALTER TABLE youtube_channels ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own channels
CREATE POLICY "Users can view their own channels" ON youtube_channels
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own channels
CREATE POLICY "Users can insert their own channels" ON youtube_channels
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own channels
CREATE POLICY "Users can update their own channels" ON youtube_channels
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own channels
CREATE POLICY "Users can delete their own channels" ON youtube_channels
    FOR DELETE USING (auth.uid() = user_id);

-- Policy: Service role can manage all channels
CREATE POLICY "Service role can manage all channels" ON youtube_channels
    FOR ALL USING (auth.role() = 'service_role');

-- Grant necessary permissions
GRANT ALL ON youtube_channels TO authenticated;
GRANT ALL ON youtube_channels TO service_role;