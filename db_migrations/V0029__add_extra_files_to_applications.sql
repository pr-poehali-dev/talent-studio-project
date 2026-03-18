ALTER TABLE applications ADD COLUMN IF NOT EXISTS extra_files TEXT[] DEFAULT '{}';
