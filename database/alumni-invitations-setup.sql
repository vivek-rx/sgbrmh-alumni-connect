-- Create alumni_invitations table for tracking batchmate invitations
CREATE TABLE IF NOT EXISTS public.alumni_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invited_by UUID REFERENCES public.alumni(id) ON DELETE CASCADE,
  invited_email TEXT NOT NULL,
  invited_name TEXT NOT NULL,
  batch_year INTEGER,
  invitation_token TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(invited_email)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_alumni_invitations_email ON public.alumni_invitations(invited_email);
CREATE INDEX IF NOT EXISTS idx_alumni_invitations_invited_by ON public.alumni_invitations(invited_by);
CREATE INDEX IF NOT EXISTS idx_alumni_invitations_status ON public.alumni_invitations(status);

-- Enable Row Level Security
ALTER TABLE public.alumni_invitations ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view invitations they sent
CREATE POLICY "Users can view their own invitations"
ON public.alumni_invitations
FOR SELECT
TO authenticated
USING (invited_by = auth.uid());

-- Allow verified users to create invitations
CREATE POLICY "Verified users can create invitations"
ON public.alumni_invitations
FOR INSERT
TO authenticated
WITH CHECK (
  invited_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.alumni
    WHERE id = auth.uid()
    AND verified = true
  )
);

-- Allow users to update invitations they sent
CREATE POLICY "Users can update their own invitations"
ON public.alumni_invitations
FOR UPDATE
TO authenticated
USING (invited_by = auth.uid());

-- Allow admins to view all invitations
CREATE POLICY "Admins can view all invitations"
ON public.alumni_invitations
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.alumni
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Add comment to table
COMMENT ON TABLE public.alumni_invitations IS 'Stores invitations sent by verified alumni to invite their batchmates';
