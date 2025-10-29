-- Jobs and Events Tables for Alumni Connect

-- Jobs Table
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('full-time', 'part-time', 'contract', 'internship')),
    salary_range TEXT,
    description TEXT NOT NULL,
    requirements TEXT[] DEFAULT '{}',
    posted_by UUID NOT NULL REFERENCES public.alumni(id) ON DELETE CASCADE,
    posted_date TIMESTAMPTZ DEFAULT NOW(),
    application_link TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events Table
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    location TEXT NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('meetup', 'workshop', 'webinar', 'conference', 'social', 'other')),
    max_attendees INTEGER,
    current_attendees INTEGER DEFAULT 0,
    organized_by UUID NOT NULL REFERENCES public.alumni(id) ON DELETE CASCADE,
    image_url TEXT,
    registration_link TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event Registrations Table (to track who registered for events)
CREATE TABLE IF NOT EXISTS public.event_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    alumni_id UUID NOT NULL REFERENCES public.alumni(id) ON DELETE CASCADE,
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    attendance_status TEXT DEFAULT 'registered' CHECK (attendance_status IN ('registered', 'attended', 'cancelled', 'no-show')),
    UNIQUE(event_id, alumni_id)
);

-- Job Applications Table (to track who applied for jobs)
CREATE TABLE IF NOT EXISTS public.job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    alumni_id UUID NOT NULL REFERENCES public.alumni(id) ON DELETE CASCADE,
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'applied' CHECK (status IN ('applied', 'shortlisted', 'interviewed', 'offered', 'rejected', 'withdrawn')),
    notes TEXT,
    UNIQUE(job_id, alumni_id)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_jobs_posted_by ON public.jobs(posted_by);
CREATE INDEX IF NOT EXISTS idx_jobs_posted_date ON public.jobs(posted_date DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_is_active ON public.jobs(is_active);
CREATE INDEX IF NOT EXISTS idx_jobs_type ON public.jobs(type);

CREATE INDEX IF NOT EXISTS idx_events_organized_by ON public.events(organized_by);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON public.events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_is_active ON public.events(is_active);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON public.events(event_type);

CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON public.event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_alumni_id ON public.event_registrations(alumni_id);

CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON public.job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_alumni_id ON public.job_applications(alumni_id);

-- RLS Policies for Jobs Table
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Allow verified users to read active jobs, admins can read ALL jobs
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

-- Allow verified users to insert jobs
CREATE POLICY "Verified users can create jobs"
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

-- Allow users to update their own jobs, admins can update any job
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

-- Allow users to delete their own jobs, admins can delete any job
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

-- RLS Policies for Events Table
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Allow verified users to read active events, admins can read ALL events
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

-- Allow verified users to create events
CREATE POLICY "Verified users can create events"
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

-- Allow users to update their own events, admins can update any event
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

-- Allow users to delete their own events, admins can delete any event
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

-- RLS Policies for Event Registrations
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own registrations
CREATE POLICY "Users can view their own event registrations"
ON public.event_registrations FOR SELECT
TO authenticated
USING (alumni_id = auth.uid());

-- Allow event organizers to view registrations for their events
CREATE POLICY "Event organizers can view registrations"
ON public.event_registrations FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.events
        WHERE events.id = event_registrations.event_id
        AND events.organized_by = auth.uid()
    )
);

-- Allow verified users to register for events
CREATE POLICY "Verified users can register for events"
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

-- Allow users to cancel their own registrations
CREATE POLICY "Users can update their own registrations"
ON public.event_registrations FOR UPDATE
TO authenticated
USING (alumni_id = auth.uid())
WITH CHECK (alumni_id = auth.uid());

-- RLS Policies for Job Applications
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own applications
CREATE POLICY "Users can view their own job applications"
ON public.job_applications FOR SELECT
TO authenticated
USING (alumni_id = auth.uid());

-- Allow job posters to view applications for their jobs
CREATE POLICY "Job posters can view applications"
ON public.job_applications FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.jobs
        WHERE jobs.id = job_applications.job_id
        AND jobs.posted_by = auth.uid()
    )
);

-- Allow verified users to apply for jobs
CREATE POLICY "Verified users can apply for jobs"
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

-- Allow users to update their own applications
CREATE POLICY "Users can update their own applications"
ON public.job_applications FOR UPDATE
TO authenticated
USING (alumni_id = auth.uid())
WITH CHECK (alumni_id = auth.uid());

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update current_attendees count when someone registers
CREATE OR REPLACE FUNCTION update_event_attendees()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.events
        SET current_attendees = current_attendees + 1
        WHERE id = NEW.event_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.events
        SET current_attendees = GREATEST(0, current_attendees - 1)
        WHERE id = OLD.event_id;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_event_attendees_trigger
AFTER INSERT OR DELETE ON public.event_registrations
FOR EACH ROW EXECUTE FUNCTION update_event_attendees();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.jobs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_registrations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.job_applications TO authenticated;

-- No sequences needed - using UUID with gen_random_uuid()

-- Insert some sample data for testing
INSERT INTO public.jobs (title, company, location, type, salary_range, description, requirements, posted_by, application_link)
SELECT 
    'Senior Software Engineer',
    'Tech Corp India',
    'Bangalore, Karnataka',
    'full-time',
    '₹15-25 LPA',
    'We are looking for a senior software engineer with 3+ years of experience in React and Node.js. Join our growing team and work on exciting projects.',
    ARRAY['3+ years React experience', 'Node.js proficiency', 'Bachelor''s degree in CS or related field', 'Strong problem-solving skills'],
    id,
    'https://example.com/apply'
FROM public.alumni
WHERE verified = true
LIMIT 1;

INSERT INTO public.jobs (title, company, location, type, salary_range, description, requirements, posted_by, application_link)
SELECT 
    'Product Manager',
    'StartupXYZ',
    'Mumbai, Maharashtra',
    'full-time',
    '₹20-30 LPA',
    'Join our growing startup as a product manager to drive product strategy and execution. Looking for someone with technical background and excellent communication skills.',
    ARRAY['2+ years PM experience', 'Technical background preferred', 'Strong communication skills', 'Experience with agile methodologies'],
    id,
    'https://example.com/apply'
FROM public.alumni
WHERE verified = true
LIMIT 1;

INSERT INTO public.events (title, description, event_date, event_time, location, event_type, max_attendees, organized_by, registration_link)
SELECT 
    'Annual Alumni Meet 2025',
    'Join us for our annual gathering to reconnect with old friends and make new connections. Food, entertainment, and networking opportunities await!',
    '2025-12-15',
    '10:00:00',
    'Campus Main Hall',
    'meetup',
    200,
    id,
    'https://example.com/register'
FROM public.alumni
WHERE verified = true
LIMIT 1;

INSERT INTO public.events (title, description, event_date, event_time, location, event_type, max_attendees, organized_by, registration_link)
SELECT 
    'Career Guidance Workshop',
    'Industry experts will share insights on career opportunities, skill development, and navigating the job market. Open Q&A session included.',
    '2025-11-20',
    '14:00:00',
    'Online (Zoom)',
    'workshop',
    150,
    id,
    'https://example.com/register'
FROM public.alumni
WHERE verified = true
LIMIT 1;
