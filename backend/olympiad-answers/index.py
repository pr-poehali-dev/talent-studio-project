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
                SELECT a.id, a.task_id, t.title, t.question, t.options, a.answer, a.submitted_at
                FROM t_p93576920_talent_studio_projec.olympiad_answers a
                JOIN t_p93576920_talent_studio_projec.olympiad_tasks t ON t.id = a.task_id
                WHERE a.olympiad_application_id = %s
                ORDER BY t.sort_order
            """, (int(application_id),))
        elif payment_id:
            cur.execute("""
                SELECT a.id, a.task_id, t.title, t.question, t.options, a.answer, a.submitted_at
                FROM t_p93576920_talent_studio_projec.olympiad_answers a
                JOIN t_p93576920_talent_studio_projec.olympiad_tasks t ON t.id = a.task_id
                WHERE a.payment_id = %s
                ORDER BY t.sort_order
            """, (payment_id,))
        else:
            cur.close()
            conn.close()
            return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "payment_id or application_id required"})}

        rows = cur.fetchall()
        cur.close()
        conn.close()

        result = []
        for row in rows:
            opts = row[4]
            if isinstance(opts, str):
                try:
                    opts = json.loads(opts)
                except Exception:
                    opts = None
            result.append({
                "id": row[0],
                "task_id": row[1],
                "title": row[2],
                "question": row[3],
                "options": opts,
                "answer": row[5],
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

        # Сохранить каждый ответ через UPSERT
        for task_id_str, answer_text in answers.items():
            task_id = int(task_id_str)
            cur.execute("""
                INSERT INTO t_p93576920_talent_studio_projec.olympiad_answers
                    (olympiad_application_id, payment_id, olympiad_type, task_id, answer, submitted_at)
                VALUES (%s, %s, %s, %s, %s, NOW())
                ON CONFLICT (payment_id, task_id)
                DO UPDATE SET answer = EXCLUDED.answer, submitted_at = NOW()
            """, (application_id, payment_id, olympiad_type or "", task_id, answer_text))

        # Если финальная отправка — обновить статус заявки
        if submitted and application_id:
            cur.execute("""
                UPDATE t_p93576920_talent_studio_projec.olympiad_applications
                SET status = 'sent'
                WHERE id = %s
            """, (application_id,))

        conn.commit()
        cur.close()
        conn.close()

        return {"statusCode": 200, "headers": CORS_HEADERS, "body": json.dumps({"ok": True, "saved": len(answers)})}

    return {"statusCode": 405, "headers": CORS_HEADERS, "body": json.dumps({"error": "Method not allowed"})}
