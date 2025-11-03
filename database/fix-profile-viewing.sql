-- Fix RLS Policies to allow verified users to view all profiles
-- Run this in your Supabase SQL Editor

-- Drop existing SELECT policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON alumni;
DROP POLICY IF EXISTS "Users can view their own profile" ON alumni;

-- Policy 1: Users can always view their own profile
CREATE POLICY "Users can view their own profile" ON alumni
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

-- Policy 2: Verified users can view all other profiles
CREATE POLICY "Verified users can view all profiles" ON alumni
    FOR SELECT TO authenticated
    USING (
        -- Check if the current user is verified
        EXISTS (
            SELECT 1 FROM alumni
            WHERE id = auth.uid()
            AND verified = true
        )
    );

-- Policy 3: Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON alumni
    FOR SELECT TO authenticated
    USING (
        -- Check if the current user is an admin
        EXISTS (
            SELECT 1 FROM alumni
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- Verify the new policies
SELECT 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual
FROM pg_policies 
WHERE tablename = 'alumni' 
  AND cmd = 'SELECT'
ORDER BY policyname;

-- Test queries (replace YOUR_USER_ID with your actual user ID):
-- SELECT verified FROM alumni WHERE id = auth.uid();
-- SELECT id, name, verified FROM alumni LIMIT 5;
