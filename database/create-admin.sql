-- Create Admin User for Alumni Connect Platform
-- Admin Email: admin@abmectpune.edu.in
-- Admin Password: abmectpune@123

-- This script creates a super admin account with full platform access

-- Step 1: Create the admin auth user in Supabase Auth
-- Note: This needs to be done via Supabase Dashboard or API
-- Go to Authentication > Users > Add User
-- Email: admin@abmectpune.edu.in
-- Password: abmectpune@123
-- Email Confirm: true

-- Step 2: Insert admin record into alumni table
-- Replace 'YOUR_ADMIN_UUID' with the actual UUID from Supabase Auth
-- You can find this in Authentication > Users after creating the user

INSERT INTO public.alumni (
    id,
    email,
    full_name,
    batch,
    branch,
    phone,
    role,
    verified,
    created_at
)
VALUES (
    'YOUR_ADMIN_UUID_HERE', -- Replace with actual UUID from Supabase Auth
    'admin@abmectpune.edu.in',
    'Admin - ABMECT Pune',
    '2024',
    'Administration',
    '1234567890',
    'admin',
    true,
    NOW()
)
ON CONFLICT (id) DO UPDATE
SET 
    role = 'admin',
    verified = true,
    email = 'admin@abmectpune.edu.in';

-- Step 3: Update RLS policies to give admin full access

-- Drop existing restrictive policies and create admin-friendly ones
DROP POLICY IF EXISTS "Users can view their own profile" ON public.alumni;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.alumni;

-- Create comprehensive policies that include admin access
CREATE POLICY "Users and admins can view profiles"
ON public.alumni FOR SELECT
TO authenticated
USING (
    id = auth.uid() 
    OR verified = true
    OR EXISTS (
        SELECT 1 FROM public.alumni
        WHERE alumni.id = auth.uid()
        AND alumni.role = 'admin'
    )
);

CREATE POLICY "Users can update own profile, admins can update all"
ON public.alumni FOR UPDATE
TO authenticated
USING (
    id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.alumni
        WHERE alumni.id = auth.uid()
        AND alumni.role = 'admin'
    )
)
WITH CHECK (
    id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.alumni
        WHERE alumni.id = auth.uid()
        AND alumni.role = 'admin'
    )
);

CREATE POLICY "Admins can delete any user"
ON public.alumni FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.alumni
        WHERE alumni.id = auth.uid()
        AND alumni.role = 'admin'
    )
);

-- Jobs table - admin override policies
CREATE POLICY "Admins can view all jobs"
ON public.jobs FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.alumni
        WHERE alumni.id = auth.uid()
        AND alumni.role = 'admin'
    )
);

CREATE POLICY "Admins can update any job"
ON public.jobs FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.alumni
        WHERE alumni.id = auth.uid()
        AND alumni.role = 'admin'
    )
);

CREATE POLICY "Admins can delete any job"
ON public.jobs FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.alumni
        WHERE alumni.id = auth.uid()
        AND alumni.role = 'admin'
    )
);

-- Events table - admin override policies
CREATE POLICY "Admins can view all events"
ON public.events FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.alumni
        WHERE alumni.id = auth.uid()
        AND alumni.role = 'admin'
    )
);

CREATE POLICY "Admins can update any event"
ON public.events FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.alumni
        WHERE alumni.id = auth.uid()
        AND alumni.role = 'admin'
    )
);

CREATE POLICY "Admins can delete any event"
ON public.events FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.alumni
        WHERE alumni.id = auth.uid()
        AND alumni.role = 'admin'
    )
);

-- Job applications - admin can view all
CREATE POLICY "Admins can view all job applications"
ON public.job_applications FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.alumni
        WHERE alumni.id = auth.uid()
        AND alumni.role = 'admin'
    )
);

-- Event registrations - admin can view all
CREATE POLICY "Admins can view all event registrations"
ON public.event_registrations FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.alumni
        WHERE alumni.id = auth.uid()
        AND alumni.role = 'admin'
    )
);

-- Grant full permissions to admin
GRANT ALL ON public.alumni TO authenticated;
GRANT ALL ON public.jobs TO authenticated;
GRANT ALL ON public.events TO authenticated;
GRANT ALL ON public.job_applications TO authenticated;
GRANT ALL ON public.event_registrations TO authenticated;

-- Create a function to check if user is admin (useful for frontend)
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.alumni
        WHERE id = user_id
        AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION is_admin TO authenticated;
