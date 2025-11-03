-- Migration: Add invitation_token column to alumni_invitations table
-- Run this ONLY if you already created the alumni_invitations table without the invitation_token column

-- Add invitation_token column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'alumni_invitations' 
    AND column_name = 'invitation_token'
  ) THEN
    ALTER TABLE public.alumni_invitations 
    ADD COLUMN invitation_token TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::text;
    
    RAISE NOTICE 'Column invitation_token added successfully';
  ELSE
    RAISE NOTICE 'Column invitation_token already exists, skipping';
  END IF;
END $$;

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_alumni_invitations_token ON public.alumni_invitations(invitation_token);

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'alumni_invitations'
ORDER BY ordinal_position;
