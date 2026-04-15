"""
Сохранение и получение ответов участников олимпиады.
POST — сохранить/отправить ответы участника.
GET  — получить ответы по payment_id (для участника) или по application_id (для админа).
"""

import json
import os
import psycopg2


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def study_year_matches(study_years, participant_year):
    if not study_years:
        return True
    for sy in study_years:
        if sy == '7+':
            if participant_year >= 7:
                return True
        elif '-' in str(sy):
            parts = str(sy).split('-')
            try:
                lo, hi = int(parts[0]), int(parts[1])
                if lo <= participant_year <= hi:
                    return True
            except (ValueError, IndexError):
                pass
    return False


CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-User-Id, X-Auth-Token",
}


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": {**CORS_HEADERS, "Access-Control-Max-Age": "86400"}, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}

    # GET — получить ответы (для участника или для админа)
    if method == "GET":
        payment_id = params.get("payment_id")
        application_id = params.get("application_id")

        conn = get_conn()
        cur = conn.cursor()

        if application_id:
            cur.execute("""
                SELECT olympiad_type, study_year FROM t_p93576920_talent_studio_projec.olympiad_applications
                WHERE id = %s LIMIT 1
            """, (int(application_id),))
            app_row = cur.fetchone()
            olympiad_type = app_row[0] if app_row else 'palette'
            study_year = int(app_row[1]) if app_row and app_row[1] else None

            cur.execute("""
                SELECT a.id, t.id, t.title, t.question, t.options, a.answer, a.submitted_at, t.correct_answer, t.task_type, t.study_years
                FROM t_p93576920_talent_studio_projec.olympiad_tasks t
                LEFT JOIN t_p93576920_talent_studio_projec.olympiad_answers a
                    ON a.task_id = t.id AND a.olympiad_application_id = %s
                WHERE t.olympiad_type = %s AND t.is_active = TRUE
                ORDER BY t.sort_order
            """, (int(application_id), olympiad_type))
        elif payment_id:
            cur.execute("""
                SELECT olympiad_type, study_year FROM t_p93576920_talent_studio_projec.olympiad_applications
                WHERE payment_id = %s LIMIT 1
            """, (payment_id,))
            app_row = cur.fetchone()
            olympiad_type = app_row[0] if app_row else 'palette'
            study_year = int(app_row[1]) if app_row and app_row[1] else None

            cur.execute("""
                SELECT a.id, t.id, t.title, t.question, t.options, a.answer, a.submitted_at, t.correct_answer, t.task_type, t.study_years
                FROM t_p93576920_talent_studio_projec.olympiad_tasks t
                LEFT JOIN t_p93576920_talent_studio_projec.olympiad_answers a
                    ON a.task_id = t.id AND a.payment_id = %s
                WHERE t.olympiad_type = %s AND t.is_active = TRUE
                ORDER BY t.sort_order
            """, (payment_id, olympiad_type))
        else:
            cur.close()
            conn.close()
            return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "payment_id or application_id required"})}

        rows = cur.fetchall()
        cur.close()
        conn.close()

        result = []
        for row in rows:
            task_study_years = row[9]
            if study_year is not None and not study_year_matches(task_study_years, study_year):
                continue
            opts = row[4]
            if isinstance(opts, str):
                try:
                    opts = json.loads(opts)
                except Exception:
                    opts = None
            correct_answer = row[7]
            user_answer = row[5]
            task_type = row[8] or 'quiz'
            if task_type == 'wordsearch':
                is_correct = user_answer == '__wordsearch_done__'
            elif task_type == 'coloring':
                is_correct = bool(user_answer and user_answer != '__coloring__')
            elif task_type == 'matching':
                # Ответ: "leftIdx:rightOrigIdx,..." — правильно если каждый leftIdx == rightOrigIdx
                if not user_answer or user_answer == '__matching_done__':
                    is_correct = False
                else:
                    try:
                        pairs = [p.split(':') for p in user_answer.split(',') if ':' in p]
                        is_correct = len(pairs) > 0 and all(l == r for l, r in pairs)
                    except Exception:
                        is_correct = False
            elif task_type == 'color-mix':
                # Ответ: "Цвет1,Цвет2" (сортированные), правильный ответ тоже через запятую
                if not user_answer or not correct_answer:
                    is_correct = False
                else:
                    user_set = set(x.strip().lower() for x in user_answer.split(',') if x.strip())
                    correct_set = set(x.strip().lower() for x in correct_answer.split(',') if x.strip())
                    is_correct = user_set == correct_set
            elif task_type == 'image-select':
                # Ответ: "0,2,4" (индексы выбранных картин), правильные — с флагом ||1 в опциях
                if not user_answer:
                    is_correct = False
                else:
                    correct_indices = set(str(idx) for idx, o in enumerate(opts) if str(o).split('||')[-1].strip() == '1')
                    given_indices = set(c.strip() for c in user_answer.split(',') if c.strip())
                    is_correct = bool(given_indices) and given_indices == correct_indices if correct_indices else False
            elif task_type == 'odd-one-out':
                # Ответ: индекс лишней картины (строка), correct_answer — тоже индекс
                if not user_answer or correct_answer is None:
                    is_correct = False
                else:
                    is_correct = str(user_answer).strip() == str(correct_answer).strip()
            elif task_type == 'icon-search':
                # Ответ: "0,3,7" — индексы выбранных иконок, correct_answer — количество правильных
                # Проверяем что выбраны именно те иконки с тегом izo
                if not user_answer:
                    is_correct = False
                else:
                    izo_indices = set(str(idx) for idx, o in enumerate(opts) if str(o).split('||')[1].strip() == 'izo') if opts else set()
                    given_indices = set(c.strip() for c in user_answer.split(',') if c.strip())
                    is_correct = bool(given_indices) and given_indices == izo_indices if izo_indices else False
            elif user_answer is None:
                is_correct = False
            else:
                # Ответ может содержать "Название||доп_данные" — сравниваем только часть до ||
                normalized_user = str(user_answer).split('||')[0].strip().lower()
                normalized_correct = str(correct_answer).split('||')[0].strip().lower()
                is_correct = correct_answer is not None and normalized_user == normalized_correct
            result.append({
                "id": row[0],
                "task_id": row[1],
                "title": row[2],
                "question": row[3],
                "options": opts,
                "answer": user_answer,
                "correct_answer": correct_answer,
                "is_correct": is_correct,
                "task_type": task_type,
                "submitted_at": row[6].isoformat() if row[6] else None,
            })

        return {"statusCode": 200, "headers": CORS_HEADERS, "body": json.dumps(result, ensure_ascii=False)}

    # POST — сохранить ответы и пометить как отправленные
    if method == "POST":
        body = json.loads(event.get("body") or "{}")
        payment_id = body.get("payment_id")
        olympiad_type = body.get("olympiad_type")
        answers = body.get("answers")  # {task_id: answer_text}
        submitted = body.get("submitted", False)

        if not payment_id or not answers:
            return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "payment_id and answers required"})}

        conn = get_conn()
        cur = conn.cursor()

        # Найти application_id по payment_id
        cur.execute("""
            SELECT id FROM t_p93576920_talent_studio_projec.olympiad_applications
            WHERE payment_id = %s LIMIT 1
        """, (payment_id,))
        row = cur.fetchone()
        application_id = row[0] if row else 0

        # Сохранить все ответы одним батч-запросом
        if answers:
            values = [
                (application_id, payment_id, olympiad_type or "", int(task_id_str), answer_text)
                for task_id_str, answer_text in answers.items()
            ]
            args = b','.join(
                cur.mogrify("(%s,%s,%s,%s,%s,NOW())", v) for v in values
            )
            cur.execute(
                b"""
                INSERT INTO t_p93576920_talent_studio_projec.olympiad_answers
                    (olympiad_application_id, payment_id, olympiad_type, task_id, answer, submitted_at)
                VALUES """ + args + b"""
                ON CONFLICT (payment_id, task_id)
                DO UPDATE SET answer = EXCLUDED.answer, submitted_at = NOW()
                """
            )

        # Обновить olympiad_status: 'started' при любом сохранении, 'finished' при финальной отправке
        if application_id:
            if submitted:
                cur.execute("""
                    UPDATE t_p93576920_talent_studio_projec.olympiad_applications
                    SET status = 'sent', olympiad_status = 'finished', updated_at = NOW()
                    WHERE id = %s
                """, (application_id,))
            else:
                cur.execute("""
                    UPDATE t_p93576920_talent_studio_projec.olympiad_applications
                    SET olympiad_status = CASE WHEN olympiad_status = 'finished' THEN 'finished' ELSE 'started' END,
                        updated_at = NOW()
                    WHERE id = %s
                """, (application_id,))

        conn.commit()
        cur.close()
        conn.close()

        return {"statusCode": 200, "headers": CORS_HEADERS, "body": json.dumps({"ok": True, "saved": len(answers)})}

    return {"statusCode": 405, "headers": CORS_HEADERS, "body": json.dumps({"error": "Method not allowed"})}