-- Fix the verified column to ensure new users are NOT auto-verified
-- Run this in Supabase SQL Editor

-- Set the correct default for verified column
ALTER TABLE alumni 
ALTER COLUMN verified SET DEFAULT false;

-- Update any incorrectly auto-verified users to false
-- (Only run this if you want to reset all users to unverified)
-- UPDATE alumni SET verified = false WHERE verified = true;

-- Verify the change
SELECT 
    column_name, 
    column_default, 
    is_nullable, 
    data_type
FROM 
    information_schema.columns
WHERE 
    table_name = 'alumni' 
    AND column_name = 'verified';

-- Success message
SELECT 'Default value for verified column has been set to FALSE' as status;
