ALTER TABLE jury_applications ADD COLUMN IF NOT EXISTS contest_type TEXT NOT NULL DEFAULT '';
UPDATE jury_applications SET confirmation_url = NULL WHERE confirmation_url IS NOT NULL;