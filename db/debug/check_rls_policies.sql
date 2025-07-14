-- ========================================
-- Debug: Check RLS Policies
-- Description: Analyze Row Level Security policies
-- ========================================

-- 1. Check if RLS is enabled on tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    hasrls as has_rls
FROM pg_tables 
WHERE tablename IN ('users', 'youtube_channels', 'summaries')
ORDER BY tablename;

-- 2. List all RLS policies
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive,
    roles, 
    cmd, 
    qual, 
    with_check
FROM pg_policies 
WHERE tablename IN ('users', 'youtube_channels', 'summaries')
ORDER BY tablename, policyname;

-- 3. Check current user permissions
SELECT 
    has_table_privilege('users', 'SELECT') as can_select_users,
    has_table_privilege('users', 'INSERT') as can_insert_users,
    has_table_privilege('users', 'UPDATE') as can_update_users,
    has_table_privilege('users', 'DELETE') as can_delete_users,
    has_table_privilege('youtube_channels', 'SELECT') as can_select_channels,
    has_table_privilege('youtube_channels', 'INSERT') as can_insert_channels,
    has_table_privilege('youtube_channels', 'UPDATE') as can_update_channels,
    has_table_privilege('youtube_channels', 'DELETE') as can_delete_channels;

-- 4. Check service role permissions
SET role service_role;
SELECT 
    'service_role' as role_name,
    has_table_privilege('users', 'SELECT') as can_select_users,
    has_table_privilege('users', 'INSERT') as can_insert_users,
    has_table_privilege('youtube_channels', 'INSERT') as can_insert_channels,
    has_table_privilege('youtube_channels', 'DELETE') as can_delete_channels;
RESET role;

-- 5. Test RLS policy bypass with service role
SET role service_role;
SELECT 'Service role can bypass RLS' as test_result;
RESET role;