-- Add latitude and longitude columns for geographic mapping
-- This allows plotting alumni locations on a globe/map

-- Add latitude column
ALTER TABLE alumni
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);

-- Add longitude column
ALTER TABLE alumni
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Add country code for better data consistency
ALTER TABLE alumni
ADD COLUMN IF NOT EXISTS country_code VARCHAR(2);

-- Add comments to document the columns
COMMENT ON COLUMN alumni.latitude IS 'Geographic latitude coordinate for mapping (-90 to 90)';
COMMENT ON COLUMN alumni.longitude IS 'Geographic longitude coordinate for mapping (-180 to 180)';
COMMENT ON COLUMN alumni.country_code IS 'ISO 3166-1 alpha-2 country code (e.g., IN, US, GB)';

-- Create an index for faster geographic queries
CREATE INDEX IF NOT EXISTS idx_alumni_location ON alumni(latitude, longitude);

-- Note: After running this migration, update the TypeScript types in src/types/database.types.ts
