-- ============================================
-- FIX ADMIN VISIBILITY FOR JOBS AND EVENTS
-- ============================================
-- 
-- This script updates RLS policies so admins can see ALL jobs and events
-- (including inactive ones) while regular users only see active items.
-- 
-- Run this in Supabase SQL Editor if you already have the tables created
-- but admin can't see inactive jobs/events.
-- 
-- ============================================

-- ============================================
-- PART 1: FIX JOBS TABLE POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Verified users can view active jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can update their own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can delete their own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Admins can view all jobs" ON public.jobs;
DROP POLICY IF EXISTS "Admins can update any job" ON public.jobs;
DROP POLICY IF EXISTS "Admins can delete any job" ON public.jobs;

-- Recreate with admin override
CREATE POLICY "Verified users can view active jobs"
ON public.jobs FOR SELECT
TO authenticated
USING (
    -- Admin can see ALL jobs (active and inactive)
    EXISTS (
        SELECT 1 FROM public.alumni
        WHERE alumni.id = auth.uid()
        AND alumni.role = 'admin'
    )
    OR
    -- Regular verified users can only see active jobs
    (
        is_active = true 
        AND EXISTS (
            SELECT 1 FROM public.alumni
            WHERE alumni.id = auth.uid()
            AND alumni.verified = true
        )
    )
);

CREATE POLICY "Users can update their own jobs"
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

CREATE POLICY "Users can delete their own jobs"
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

-- ============================================
-- PART 2: FIX EVENTS TABLE POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Verified users can view active events" ON public.events;
DROP POLICY IF EXISTS "Users can update their own events" ON public.events;
DROP POLICY IF EXISTS "Users can delete their own events" ON public.events;
DROP POLICY IF EXISTS "Admins can view all events" ON public.events;
DROP POLICY IF EXISTS "Admins can update any event" ON public.events;
DROP POLICY IF EXISTS "Admins can delete any event" ON public.events;

-- Recreate with admin override
CREATE POLICY "Verified users can view active events"
ON public.events FOR SELECT
TO authenticated
USING (
    -- Admin can see ALL events (active and inactive)
    EXISTS (
        SELECT 1 FROM public.alumni
        WHERE alumni.id = auth.uid()
        AND alumni.role = 'admin'
    )
    OR
    -- Regular verified users can only see active events
    (
        is_active = true 
        AND EXISTS (
            SELECT 1 FROM public.alumni
            WHERE alumni.id = auth.uid()
            AND alumni.verified = true
        )
    )
);

CREATE POLICY "Users can update their own events"
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

CREATE POLICY "Users can delete their own events"
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

-- ============================================
-- VERIFICATION
-- ============================================

-- Check policies were created successfully
DO $$
DECLARE
    jobs_policies INTEGER;
    events_policies INTEGER;
BEGIN
    SELECT COUNT(*) INTO jobs_policies 
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'jobs';
    
    SELECT COUNT(*) INTO events_policies 
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'events';
    
    RAISE NOTICE '✅ Jobs table has % policies', jobs_policies;
    RAISE NOTICE '✅ Events table has % policies', events_policies;
    
    IF jobs_policies >= 3 AND events_policies >= 3 THEN
        RAISE NOTICE '✅ RLS policies updated successfully!';
        RAISE NOTICE 'Admin can now see ALL jobs and events (including inactive ones)';
        RAISE NOTICE 'Regular users can only see active jobs and events';
    ELSE
        RAISE WARNING '⚠️ Some policies may be missing. Please check manually.';
    END IF;
END $$;

-- ============================================
-- COMPLETE!
-- ============================================
-- 
-- Admin should now be able to see:
-- ✅ ALL jobs (active and inactive)
-- ✅ ALL events (active and inactive)
-- ✅ Edit/delete any job or event
-- 
-- Regular users will only see:
-- ✅ Active jobs only
-- ✅ Active events only
-- ✅ Can only edit/delete their own posts
-- 
-- ============================================
