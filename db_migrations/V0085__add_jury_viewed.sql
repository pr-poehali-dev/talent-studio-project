ALTER TABLE jury_applications ADD COLUMN IF NOT EXISTS is_viewed BOOLEAN NOT NULL DEFAULT false;
UPDATE jury_applications SET is_viewed = true;
