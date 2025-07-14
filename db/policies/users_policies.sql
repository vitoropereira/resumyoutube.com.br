-- ========================================
-- RLS Policies: Users Table
-- Description: Row Level Security policies for users table
-- ========================================

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Policy: Users can create their own profile
CREATE POLICY "Users can create their own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy: Service role can manage all users
CREATE POLICY "Service role can manage all users" ON users
    FOR ALL USING (auth.role() = 'service_role');

-- Grant necessary permissions
GRANT ALL ON users TO authenticated;
GRANT ALL ON users TO service_role;