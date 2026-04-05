ALTER TABLE olympiad_applications
  ADD COLUMN IF NOT EXISTS olympiad_status VARCHAR(50) DEFAULT 'paid';

UPDATE olympiad_applications
  SET olympiad_status = 'paid'
  WHERE olympiad_status IS NULL;
