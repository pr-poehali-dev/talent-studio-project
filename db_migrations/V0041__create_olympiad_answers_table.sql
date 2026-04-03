CREATE TABLE IF NOT EXISTS t_p93576920_talent_studio_projec.olympiad_answers (
  id SERIAL PRIMARY KEY,
  olympiad_application_id INTEGER NOT NULL,
  payment_id TEXT NOT NULL,
  olympiad_type TEXT NOT NULL,
  task_id INTEGER NOT NULL REFERENCES t_p93576920_talent_studio_projec.olympiad_tasks(id),
  answer TEXT NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(payment_id, task_id)
);

CREATE INDEX IF NOT EXISTS idx_olympiad_answers_payment_id ON t_p93576920_talent_studio_projec.olympiad_answers(payment_id);
CREATE INDEX IF NOT EXISTS idx_olympiad_answers_application_id ON t_p93576920_talent_studio_projec.olympiad_answers(olympiad_application_id);
