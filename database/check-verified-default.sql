-- Check the current default value for the verified column
-- Run this in Supabase SQL Editor to see the actual table definition

-- View column defaults
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

-- View all recent alumni with their verified status
SELECT 
    id, 
    name, 
    email, 
    verified, 
    profile_completed,
    created_at
FROM 
    alumni
ORDER BY 
    created_at DESC
LIMIT 10;

-- If the default is wrong, fix it with:
-- ALTER TABLE alumni ALTER COLUMN verified SET DEFAULT false;
