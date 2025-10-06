-- Fix RLS Policies for Email Verification
-- Run these queries in your Supabase SQL Editor

-- First, drop the existing restrictive policies
DROP POLICY IF EXISTS "Users can insert their own profile" ON alumni;
DROP POLICY IF EXISTS "Users can update their own profile" ON alumni;
DROP POLICY IF EXISTS "Enable insert for authenticated users during registration" ON alumni;
DROP POLICY IF EXISTS "Enable update for authenticated users on their own profile" ON alumni;
DROP POLICY IF EXISTS "Enable update for service role" ON alumni;

-- Create more permissive policies for registration and verification
CREATE POLICY "Enable insert for authenticated users during registration" ON alumni
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for authenticated users on their own profile" ON alumni
    FOR UPDATE TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Allow users to read their own profiles
CREATE POLICY "Users can view their own profile" ON alumni
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

-- Allow public read access to verified profiles (optional)
CREATE POLICY "Public profiles are viewable by everyone" ON alumni
    FOR SELECT TO anon, authenticated
    USING (verified = true AND profile_completed = true);

-- Test if policies are working correctly by running this query after creating a user:
-- SELECT id, email, verified FROM alumni WHERE id = auth.uid();

-- Verify the policies are active:
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'alumni' 
ORDER BY policyname;