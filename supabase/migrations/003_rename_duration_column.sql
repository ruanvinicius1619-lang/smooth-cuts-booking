-- Rename duration column to duration_minutes in services table
ALTER TABLE public.services 
RENAME COLUMN duration TO duration_minutes;

-- Update any existing data if needed (this is safe since we're just renaming)
-- No data transformation needed as the column already contains duration in minutes