-- Add new profile fields: college_name, profession, company_name

-- Add college_name column
ALTER TABLE public.alumni 
ADD COLUMN IF NOT EXISTS college_name TEXT;

-- Add profession column
ALTER TABLE public.alumni 
ADD COLUMN IF NOT EXISTS profession TEXT;

-- Add company_name column (optional field)
ALTER TABLE public.alumni 
ADD COLUMN IF NOT EXISTS company_name TEXT;

-- Add comments for documentation
COMMENT ON COLUMN public.alumni.college_name IS 'Name of the college/university attended';
COMMENT ON COLUMN public.alumni.profession IS 'Current profession or occupation';
COMMENT ON COLUMN public.alumni.company_name IS 'Current company or business name (optional)';

-- Verify columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'alumni'
AND column_name IN ('college_name', 'profession', 'company_name')
ORDER BY column_name;
