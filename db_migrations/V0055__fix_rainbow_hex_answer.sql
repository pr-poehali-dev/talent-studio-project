-- Один ответ попал как #hex вместо названия — чистим через опции задания
UPDATE olympiad_answers
SET answer = 'Синий'
WHERE task_id = 52 AND answer = '#1565c0';