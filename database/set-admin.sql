-- Give Admin Access to admin@abmectpune.in

-- Option 1: If the profile already exists, just update the role
UPDATE alumni 
SET role = 'admin', 
    verified = true,
    profile_completed = true
WHERE email = 'admin@abmectpune.in';

-- Option 2: If the profile doesn't exist yet, create it
-- First get the auth user ID for admin@abmectpune.in from:
-- Supabase Dashboard → Authentication → Users
-- Then uncomment and run the INSERT below:

/*
INSERT INTO alumni (
  id,
  email,
  name,
  batch_year,
  role,
  verified,
  profile_completed,
  created_at,
  updated_at
) VALUES (
  'PASTE-AUTH-USER-ID-HERE',  -- Get this from Authentication → Users
  'admin@abmectpune.in',
  'Admin',
  2024,
  'admin',
  true,
  true,
  NOW(),
  NOW()
);
*/

-- Verify admin access was granted
SELECT id, email, name, batch_year, role, verified 
FROM alumni 
WHERE email = 'admin@abmectpune.in';
