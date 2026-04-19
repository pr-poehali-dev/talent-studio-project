-- Меняем place с integer на varchar для хранения "grand_prix", "1", "2", "3"
ALTER TABLE t_p93576920_talent_studio_projec.olympiad_applications
  ALTER COLUMN place TYPE character varying(50) USING place::character varying;

-- Добавляем флаг публикации в Итогах
ALTER TABLE t_p93576920_talent_studio_projec.olympiad_applications
  ADD COLUMN IF NOT EXISTS result_published boolean NOT NULL DEFAULT false;
