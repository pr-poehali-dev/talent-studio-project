-- Обновляем совпадающие task_id
UPDATE t_p93576920_talent_studio_projec.olympiad_answers SET answer = 'зелёный' WHERE olympiad_application_id = 49 AND task_id = 35;
UPDATE t_p93576920_talent_studio_projec.olympiad_answers SET answer = '__wordsearch_done__' WHERE olympiad_application_id = 49 AND task_id = 43;

-- Перепрофилируем остальные существующие строки под нужные task_id и ответы
UPDATE t_p93576920_talent_studio_projec.olympiad_answers SET task_id = 23, answer = 'пейзаж' WHERE olympiad_application_id = 49 AND task_id = 13;
UPDATE t_p93576920_talent_studio_projec.olympiad_answers SET task_id = 24, answer = 'красный, жёлтый, синий' WHERE olympiad_application_id = 49 AND task_id = 14;
UPDATE t_p93576920_talent_studio_projec.olympiad_answers SET task_id = 25, answer = 'палитра' WHERE olympiad_application_id = 49 AND task_id = 21;
UPDATE t_p93576920_talent_studio_projec.olympiad_answers SET task_id = 27, answer = 'эскиз' WHERE olympiad_application_id = 49 AND task_id = 19;
UPDATE t_p93576920_talent_studio_projec.olympiad_answers SET task_id = 28, answer = 'натюрморт' WHERE olympiad_application_id = 49 AND task_id = 15;
UPDATE t_p93576920_talent_studio_projec.olympiad_answers SET task_id = 29, answer = 'синий, голубой, фиолетовый' WHERE olympiad_application_id = 49 AND task_id = 16;
UPDATE t_p93576920_talent_studio_projec.olympiad_answers SET task_id = 30, answer = 'свет и тень' WHERE olympiad_application_id = 49 AND task_id = 17;
UPDATE t_p93576920_talent_studio_projec.olympiad_answers SET task_id = 31, answer = 'мольберт' WHERE olympiad_application_id = 49 AND task_id = 18;
UPDATE t_p93576920_talent_studio_projec.olympiad_answers SET task_id = 32, answer = 'оранжевый' WHERE olympiad_application_id = 49 AND task_id = 20;
UPDATE t_p93576920_talent_studio_projec.olympiad_answers SET task_id = 45, answer = '0:0,1:1,2:2,3:3' WHERE olympiad_application_id = 49 AND task_id = 22;
UPDATE t_p93576920_talent_studio_projec.olympiad_answers SET task_id = 59, answer = '1' WHERE olympiad_application_id = 49 AND task_id = 52;
UPDATE t_p93576920_talent_studio_projec.olympiad_answers SET task_id = 60, answer = '2' WHERE olympiad_application_id = 49 AND task_id = 53;
UPDATE t_p93576920_talent_studio_projec.olympiad_answers SET task_id = 61, answer = '1' WHERE olympiad_application_id = 49 AND task_id = 58;
UPDATE t_p93576920_talent_studio_projec.olympiad_answers SET task_id = 63, answer = 'Гризайль' WHERE olympiad_application_id = 49 AND task_id = 63;

-- Добавляем единственный недостающий task_id = 63 (если ещё не существует)
INSERT INTO t_p93576920_talent_studio_projec.olympiad_answers (olympiad_application_id, payment_id, olympiad_type, task_id, answer)
SELECT 49, 'TEST-PALETTE-001', 'izo', 63, 'Гризайль'
WHERE NOT EXISTS (SELECT 1 FROM t_p93576920_talent_studio_projec.olympiad_answers WHERE olympiad_application_id = 49 AND task_id = 63);
