ALTER TABLE jury_applications ADD COLUMN IF NOT EXISTS gender VARCHAR(1) NULL;
UPDATE jury_applications SET confirmation_url = NULL WHERE confirmation_url IS NOT NULL;