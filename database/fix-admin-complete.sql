-- ============================================
-- DIAGNOSE AND FIX ADMIN VISIBILITY ISSUES
-- ============================================
-- 
-- This script will:
-- 1. Show all current policies
-- 2. Remove ALL conflicting policies
-- 3. Create clean, working policies
-- 
-- ============================================

-- ============================================
-- STEP 1: DIAGNOSE - Show Current Policies
-- ============================================

-- Show all policies on jobs table
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
WHERE schemaname = 'public' 
AND tablename = 'jobs'
ORDER BY policyname;

-- Show all policies on events table
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
WHERE schemaname = 'public' 
AND tablename = 'events'
ORDER BY policyname;

-- ============================================
-- STEP 2: NUCLEAR OPTION - Remove ALL Policies
-- ============================================

-- Drop ALL jobs policies (regardless of name)
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'jobs') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.jobs';
        RAISE NOTICE 'Dropped policy: %', r.policyname;
    END LOOP;
END $$;

-- Drop ALL events policies (regardless of name)
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'events') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.events';
        RAISE NOTICE 'Dropped policy: %', r.policyname;
    END LOOP;
END $$;

-- Drop ALL job_applications policies
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'job_applications') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.job_applications';
        RAISE NOTICE 'Dropped policy: %', r.policyname;
    END LOOP;
END $$;

-- Drop ALL event_registrations policies
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'event_registrations') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.event_registrations';
        RAISE NOTICE 'Dropped policy: %', r.policyname;
    END LOOP;
END $$;

-- ============================================
-- STEP 3: Create Clean Policies
-- ============================================

-- ===== JOBS TABLE =====

-- SELECT: Admin sees ALL, verified users see active only
CREATE POLICY "jobs_select_policy"
ON public.jobs FOR SELECT
TO authenticated
USING (
    -- Check if user is admin
    EXISTS (
        SELECT 1 FROM public.alumni
        WHERE alumni.id = auth.uid()
        AND alumni.role = 'admin'
    )
    OR
    -- OR check if user is verified AND job is active
    (
        is_active = true 
        AND EXISTS (
            SELECT 1 FROM public.alumni
            WHERE alumni.id = auth.uid()
            AND alumni.verified = true
        )
    )
);

-- INSERT: Verified users can create jobs
CREATE POLICY "jobs_insert_policy"
ON public.jobs FOR INSERT
TO authenticated
WITH CHECK (
    posted_by = auth.uid()
    AND EXISTS (
        SELECT 1 FROM public.alumni
        WHERE alumni.id = auth.uid()
        AND alumni.verified = true
    )
);

-- UPDATE: Users update own, admin updates all
CREATE POLICY "jobs_update_policy"
ON public.jobs FOR UPDATE
TO authenticated
USING (
    posted_by = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.alumni
        WHERE alumni.id = auth.uid()
        AND alumni.role = 'admin'
    )
)
WITH CHECK (
    posted_by = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.alumni
        WHERE alumni.id = auth.uid()
        AND alumni.role = 'admin'
    )
);

-- DELETE: Users delete own, admin deletes all
CREATE POLICY "jobs_delete_policy"
ON public.jobs FOR DELETE
TO authenticated
USING (
    posted_by = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.alumni
        WHERE alumni.id = auth.uid()
        AND alumni.role = 'admin'
    )
);

-- ===== EVENTS TABLE =====

-- SELECT: Admin sees ALL, verified users see active only
CREATE POLICY "events_select_policy"
ON public.events FOR SELECT
TO authenticated
USING (
    -- Check if user is admin
    EXISTS (
        SELECT 1 FROM public.alumni
        WHERE alumni.id = auth.uid()
        AND alumni.role = 'admin'
    )
    OR
    -- OR check if user is verified AND event is active
    (
        is_active = true 
        AND EXISTS (
            SELECT 1 FROM public.alumni
            WHERE alumni.id = auth.uid()
            AND alumni.verified = true
        )
    )
);

-- INSERT: Verified users can create events
CREATE POLICY "events_insert_policy"
ON public.events FOR INSERT
TO authenticated
WITH CHECK (
    organized_by = auth.uid()
    AND EXISTS (
        SELECT 1 FROM public.alumni
        WHERE alumni.id = auth.uid()
        AND alumni.verified = true
    )
);

-- UPDATE: Users update own, admin updates all
CREATE POLICY "events_update_policy"
ON public.events FOR UPDATE
TO authenticated
USING (
    organized_by = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.alumni
        WHERE alumni.id = auth.uid()
        AND alumni.role = 'admin'
    )
)
WITH CHECK (
    organized_by = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.alumni
        WHERE alumni.id = auth.uid()
        AND alumni.role = 'admin'
    )
);

-- DELETE: Users delete own, admin deletes all
CREATE POLICY "events_delete_policy"
ON public.events FOR DELETE
TO authenticated
USING (
    organized_by = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.alumni
        WHERE alumni.id = auth.uid()
        AND alumni.role = 'admin'
    )
);

-- ===== JOB APPLICATIONS TABLE =====

-- SELECT: Users see own applications, job posters see applications for their jobs, admin sees all
CREATE POLICY "job_applications_select_policy"
ON public.job_applications FOR SELECT
TO authenticated
USING (
    alumni_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.jobs
        WHERE jobs.id = job_applications.job_id
        AND jobs.posted_by = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM public.alumni
        WHERE alumni.id = auth.uid()
        AND alumni.role = 'admin'
    )
);

-- INSERT: Verified users can apply
CREATE POLICY "job_applications_insert_policy"
ON public.job_applications FOR INSERT
TO authenticated
WITH CHECK (
    alumni_id = auth.uid()
    AND EXISTS (
        SELECT 1 FROM public.alumni
        WHERE alumni.id = auth.uid()
        AND alumni.verified = true
    )
);

-- UPDATE: Users update own, admin updates all
CREATE POLICY "job_applications_update_policy"
ON public.job_applications FOR UPDATE
TO authenticated
USING (
    alumni_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.alumni
        WHERE alumni.id = auth.uid()
        AND alumni.role = 'admin'
    )
)
WITH CHECK (
    alumni_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.alumni
        WHERE alumni.id = auth.uid()
        AND alumni.role = 'admin'
    )
);

-- DELETE: Users delete own, admin deletes all
CREATE POLICY "job_applications_delete_policy"
ON public.job_applications FOR DELETE
TO authenticated
USING (
    alumni_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.alumni
        WHERE alumni.id = auth.uid()
        AND alumni.role = 'admin'
    )
);

-- ===== EVENT REGISTRATIONS TABLE =====

-- SELECT: Users see own registrations, organizers see their event registrations, admin sees all
CREATE POLICY "event_registrations_select_policy"
ON public.event_registrations FOR SELECT
TO authenticated
USING (
    alumni_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.events
        WHERE events.id = event_registrations.event_id
        AND events.organized_by = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM public.alumni
        WHERE alumni.id = auth.uid()
        AND alumni.role = 'admin'
    )
);

-- INSERT: Verified users can register
CREATE POLICY "event_registrations_insert_policy"
ON public.event_registrations FOR INSERT
TO authenticated
WITH CHECK (
    alumni_id = auth.uid()
    AND EXISTS (
        SELECT 1 FROM public.alumni
        WHERE alumni.id = auth.uid()
        AND alumni.verified = true
    )
);

-- UPDATE: Users update own, admin updates all
CREATE POLICY "event_registrations_update_policy"
ON public.event_registrations FOR UPDATE
TO authenticated
USING (
    alumni_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.alumni
        WHERE alumni.id = auth.uid()
        AND alumni.role = 'admin'
    )
)
WITH CHECK (
    alumni_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.alumni
        WHERE alumni.id = auth.uid()
        AND alumni.role = 'admin'
    )
);

-- DELETE: Users delete own, admin deletes all
CREATE POLICY "event_registrations_delete_policy"
ON public.event_registrations FOR DELETE
TO authenticated
USING (
    alumni_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.alumni
        WHERE alumni.id = auth.uid()
        AND alumni.role = 'admin'
    )
);

-- ============================================
-- STEP 4: VERIFICATION
-- ============================================

-- Show final policy count
DO $$
DECLARE
    jobs_count INTEGER;
    events_count INTEGER;
    apps_count INTEGER;
    regs_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO jobs_count FROM pg_policies WHERE schemaname = 'public' AND tablename = 'jobs';
    SELECT COUNT(*) INTO events_count FROM pg_policies WHERE schemaname = 'public' AND tablename = 'events';
    SELECT COUNT(*) INTO apps_count FROM pg_policies WHERE schemaname = 'public' AND tablename = 'job_applications';
    SELECT COUNT(*) INTO regs_count FROM pg_policies WHERE schemaname = 'public' AND tablename = 'event_registrations';
    
    RAISE NOTICE '';
    RAISE NOTICE '====================================';
    RAISE NOTICE '✅ POLICY CLEANUP COMPLETE';
    RAISE NOTICE '====================================';
    RAISE NOTICE 'Jobs table: % policies', jobs_count;
    RAISE NOTICE 'Events table: % policies', events_count;
    RAISE NOTICE 'Job applications: % policies', apps_count;
    RAISE NOTICE 'Event registrations: % policies', regs_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Expected: 4 policies per table (SELECT, INSERT, UPDATE, DELETE)';
    RAISE NOTICE '';
    
    IF jobs_count = 4 AND events_count = 4 THEN
        RAISE NOTICE '✅ SUCCESS! All policies created correctly.';
        RAISE NOTICE '';
        RAISE NOTICE 'Admin can now:';
        RAISE NOTICE '  ✅ See ALL jobs (active + inactive)';
        RAISE NOTICE '  ✅ See ALL events (active + inactive)';
        RAISE NOTICE '  ✅ Edit/delete any job or event';
        RAISE NOTICE '  ✅ View all applications and registrations';
        RAISE NOTICE '';
        RAISE NOTICE 'Regular users:';
        RAISE NOTICE '  ✅ See only active jobs and events';
        RAISE NOTICE '  ✅ Can only edit/delete their own posts';
    ELSE
        RAISE WARNING '⚠️ Policy count mismatch. Please check manually.';
    END IF;
END $$;

-- Show final policies for verification
SELECT 
    tablename,
    policyname,
    cmd as operation
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('jobs', 'events', 'job_applications', 'event_registrations')
ORDER BY tablename, cmd;

-- ============================================
-- COMPLETE!
-- ============================================
