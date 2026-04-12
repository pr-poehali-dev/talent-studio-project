-- Чистим ответы участников в задании 52: URL||Название -> Название, hex||Название -> Название
UPDATE olympiad_answers
SET answer = split_part(answer, '||', array_length(string_to_array(answer, '||'), 1))
WHERE task_id = 52 AND answer LIKE '%||%';