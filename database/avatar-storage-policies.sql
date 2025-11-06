-- Storage policies for avatar uploads
-- Run this in Supabase SQL Editor

-- First, make sure the avatars bucket exists (create it in Storage UI if not)

-- Allow authenticated users to upload avatars
CREATE POLICY "Users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
);

-- Allow authenticated users to update avatars
CREATE POLICY "Users can update avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars');

-- Allow authenticated users to delete their avatars
CREATE POLICY "Users can delete avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars');

-- Allow public to view avatars (if bucket is public)
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Alumni table policy - allow users to update their own profile_photo_url
-- Your alumni table uses 'id' which equals auth.uid()
-- The existing RLS policies should already cover this, but if you're still getting errors:

-- Check existing policies first:
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'alumni' 
ORDER BY policyname;

-- If the UPDATE policy doesn't exist or is too restrictive, run this:
DROP POLICY IF EXISTS "Enable update for authenticated users on their own profile" ON alumni;
CREATE POLICY "Enable update for authenticated users on their own profile" ON alumni
    FOR UPDATE TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
