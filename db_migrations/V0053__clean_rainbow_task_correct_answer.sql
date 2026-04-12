-- Чистим correct_answer в задании 52: убираем URL||Название -> оставляем только Название
UPDATE olympiad_tasks
SET correct_answer = CASE
  WHEN correct_answer LIKE '%||%' THEN split_part(correct_answer, '||', array_length(string_to_array(correct_answer, '||'), 1))
  ELSE correct_answer
END
WHERE id = 52;