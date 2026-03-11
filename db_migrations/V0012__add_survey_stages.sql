-- Добавление полей для отслеживания этапов анкеты
ALTER TABLE t_p97156157_vitamin_assistant_pr.user_surveys 
ADD COLUMN IF NOT EXISTS stage1_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS stage2_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS stage3_completed BOOLEAN DEFAULT false;

-- Добавление поля stage для отслеживания текущего этапа в survey_answers
ALTER TABLE t_p97156157_vitamin_assistant_pr.survey_answers
ADD COLUMN IF NOT EXISTS stage_number INTEGER DEFAULT 1;

-- Обновление существующих записей: этап 1 уже завершён для всех
UPDATE t_p97156157_vitamin_assistant_pr.user_surveys SET stage1_completed = true WHERE id > 0;

-- Создание индекса для быстрого поиска по этапам
CREATE INDEX IF NOT EXISTS idx_survey_answers_stage ON t_p97156157_vitamin_assistant_pr.survey_answers(survey_id, stage_number);
