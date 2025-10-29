-- ============================================
-- COMPLETE ADMIN SETUP - ONE-CLICK EXECUTION
-- ============================================
-- 
-- INSTRUCTIONS:
-- 1. First, create admin user in Supabase Auth Dashboard:
--    - Go to Authentication > Users > Add User
--    - Email: admin@abmectpune.edu.in
--    - Password: abmectpune@123
--    - Auto Confirm User: YES
--    - Copy the generated UUID
-- 
-- 2. Replace 'YOUR_ADMIN_UUID_HERE' below with the actual UUID
-- 
-- 3. Run this entire SQL script in Supabase SQL Editor
-- 
-- ============================================

-- ============================================
-- PART 1: CREATE ADMIN PROFILE
-- ============================================

INSERT INTO public.alumni (
    id,
    email,
    full_name,
    batch,
    branch,
    phone,
    role,
    verified,
    profile_completed,
    created_at
)
VALUES (
    'YOUR_ADMIN_UUID_HERE', -- ⚠️ REPLACE THIS WITH ACTUAL UUID FROM SUPABASE AUTH
    'admin@abmectpune.edu.in',
    'Admin - ABMECT Pune',
    '2024',
    'Administration',
    '1234567890',
    'admin',
    true,
    true,
    NOW()
)
ON CONFLICT (id) DO UPDATE
SET 
    role = 'admin',
    verified = true,
    profile_completed = true,
    email = 'admin@abmectpune.edu.in',
    full_name = 'Admin - ABMECT Pune';

-- ============================================
-- PART 2: UPDATE ALUMNI TABLE RLS POLICIES
-- ============================================

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.alumni;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.alumni;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.alumni;

-- Create admin-friendly policies
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

-- ============================================
-- PART 3: ADMIN POLICIES FOR JOBS TABLE
-- ============================================

-- Admin can view all jobs (including inactive)
CREATE POLICY "Admins can view all jobs" ON public.jobs
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.alumni
        WHERE alumni.id = auth.uid()
        AND alumni.role = 'admin'
    )
);

-- Admin can update any job
CREATE POLICY "Admins can update any job" ON public.jobs
FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.alumni
        WHERE alumni.id = auth.uid()
        AND alumni.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.alumni
        WHERE alumni.id = auth.uid()
        AND alumni.role = 'admin'
    )
);

-- Admin can delete any job
CREATE POLICY "Admins can delete any job" ON public.jobs
FOR DELETE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.alumni
        WHERE alumni.id = auth.uid()
        AND alumni.role = 'admin'
    )
);

-- ============================================
-- PART 4: ADMIN POLICIES FOR EVENTS TABLE
-- ============================================

-- Admin can view all events (including inactive)
CREATE POLICY "Admins can view all events" ON public.events
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.alumni
        WHERE alumni.id = auth.uid()
        AND alumni.role = 'admin'
    )
);

-- Admin can update any event
CREATE POLICY "Admins can update any event" ON public.events
FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.alumni
        WHERE alumni.id = auth.uid()
        AND alumni.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.alumni
        WHERE alumni.id = auth.uid()
        AND alumni.role = 'admin'
    )
);

-- Admin can delete any event
CREATE POLICY "Admins can delete any event" ON public.events
FOR DELETE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.alumni
        WHERE alumni.id = auth.uid()
        AND alumni.role = 'admin'
    )
);

-- ============================================
-- PART 5: ADMIN POLICIES FOR JOB APPLICATIONS
-- ============================================

-- Admin can view all job applications
CREATE POLICY "Admins can view all job applications" ON public.job_applications
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.alumni
        WHERE alumni.id = auth.uid()
        AND alumni.role = 'admin'
    )
);

-- Admin can manage job applications
CREATE POLICY "Admins can manage job applications" ON public.job_applications
FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.alumni
        WHERE alumni.id = auth.uid()
        AND alumni.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.alumni
        WHERE alumni.id = auth.uid()
        AND alumni.role = 'admin'
    )
);

CREATE POLICY "Admins can delete job applications" ON public.job_applications
FOR DELETE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.alumni
        WHERE alumni.id = auth.uid()
        AND alumni.role = 'admin'
    )
);

-- ============================================
-- PART 6: ADMIN POLICIES FOR EVENT REGISTRATIONS
-- ============================================

-- Admin can view all event registrations
CREATE POLICY "Admins can view all event registrations" ON public.event_registrations
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.alumni
        WHERE alumni.id = auth.uid()
        AND alumni.role = 'admin'
    )
);

-- Admin can manage event registrations
CREATE POLICY "Admins can manage event registrations" ON public.event_registrations
FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.alumni
        WHERE alumni.id = auth.uid()
        AND alumni.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.alumni
        WHERE alumni.id = auth.uid()
        AND alumni.role = 'admin'
    )
);

CREATE POLICY "Admins can delete event registrations" ON public.event_registrations
FOR DELETE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.alumni
        WHERE alumni.id = auth.uid()
        AND alumni.role = 'admin'
    )
);

-- ============================================
-- PART 7: HELPER FUNCTIONS
-- ============================================

-- Function to check if user is admin (useful for frontend)
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

-- Function to get admin stats (optional - for dashboard)
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS JSON AS $$
DECLARE
    stats JSON;
BEGIN
    SELECT json_build_object(
        'total_users', (SELECT COUNT(*) FROM public.alumni),
        'verified_users', (SELECT COUNT(*) FROM public.alumni WHERE verified = true),
        'total_jobs', (SELECT COUNT(*) FROM public.jobs),
        'active_jobs', (SELECT COUNT(*) FROM public.jobs WHERE is_active = true),
        'total_events', (SELECT COUNT(*) FROM public.events),
        'active_events', (SELECT COUNT(*) FROM public.events WHERE is_active = true),
        'recent_signups', (SELECT COUNT(*) FROM public.alumni WHERE created_at > NOW() - INTERVAL '7 days')
    ) INTO stats;
    
    RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_admin_stats TO authenticated;

-- ============================================
-- PART 8: GRANT PERMISSIONS
-- ============================================

-- Grant full permissions on all tables
GRANT ALL ON public.alumni TO authenticated;
GRANT ALL ON public.jobs TO authenticated;
GRANT ALL ON public.events TO authenticated;
GRANT ALL ON public.job_applications TO authenticated;
GRANT ALL ON public.event_registrations TO authenticated;

-- ============================================
-- PART 9: VERIFICATION
-- ============================================

-- Verify admin was created successfully
DO $$
DECLARE
    admin_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO admin_count 
    FROM public.alumni 
    WHERE email = 'admin@abmectpune.edu.in' 
    AND role = 'admin';
    
    IF admin_count > 0 THEN
        RAISE NOTICE '✅ Admin user created successfully!';
        RAISE NOTICE 'Email: admin@abmectpune.edu.in';
        RAISE NOTICE 'Role: admin';
        RAISE NOTICE 'Verified: true';
    ELSE
        RAISE WARNING '⚠️ Admin user not found. Please check if UUID was correctly replaced.';
    END IF;
END $$;

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- 
-- Next Steps:
-- 1. Go to http://localhost:5173/auth/login
-- 2. Login with:
--    Email: admin@abmectpune.edu.in
--    Password: abmectpune@123
-- 3. You will be redirected to /admin/dashboard
-- 4. Enjoy full admin access!
-- 
-- ============================================
