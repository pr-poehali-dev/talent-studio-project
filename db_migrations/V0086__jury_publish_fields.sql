ALTER TABLE jury_applications ADD COLUMN IF NOT EXISTS number INTEGER;
ALTER TABLE jury_applications ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE jury_applications ADD COLUMN IF NOT EXISTS certificate_url TEXT NULL;

UPDATE jury_applications j SET number = s.rn
FROM (SELECT id, ROW_NUMBER() OVER (ORDER BY created_at, id) AS rn FROM jury_applications) s
WHERE j.id = s.id AND j.number IS NULL;

CREATE SEQUENCE IF NOT EXISTS jury_applications_number_seq;
SELECT setval('jury_applications_number_seq', COALESCE((SELECT MAX(number) FROM jury_applications), 0) + 1, false);
ALTER TABLE jury_applications ALTER COLUMN number SET DEFAULT nextval('jury_applications_number_seq');
