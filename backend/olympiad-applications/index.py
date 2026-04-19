import json
import os
import psycopg2
import urllib.request

def ensure_table(cursor):
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS olympiad_applications (
            id SERIAL PRIMARY KEY,
            full_name VARCHAR(255) NOT NULL,
            age INTEGER NOT NULL,
            study_year INTEGER NOT NULL,
            teacher VARCHAR(255),
            institution VARCHAR(255),
            work_title VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            olympiad_type VARCHAR(100) NOT NULL DEFAULT 'palette',
            status VARCHAR(50) DEFAULT 'new',
            payment_status VARCHAR(50) DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            deleted_at TIMESTAMP
        )
    """)

def handler(event: dict, context) -> dict:
    """API для управления заявками на олимпиады (для админки)"""

    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cursor = conn.cursor()
    ensure_table(cursor)
    conn.commit()

    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}

    if method == 'GET':
        olympiad_type = params.get('type', 'palette')
        show_deleted = params.get('deleted') == 'true'


        if show_deleted:
            cursor.execute("""
                SELECT id, full_name, age, study_year, teacher, institution,
                       work_title, email, olympiad_type, status, payment_status,
                       created_at, updated_at, deleted_at, payment_id, olympiad_status, place, result_published
                FROM olympiad_applications
                WHERE deleted_at IS NOT NULL AND olympiad_type = %s
                ORDER BY deleted_at DESC
            """, (olympiad_type,))
        else:
            cursor.execute("""
                SELECT id, full_name, age, study_year, teacher, institution,
                       work_title, email, olympiad_type, status, payment_status,
                       created_at, updated_at, deleted_at, payment_id, olympiad_status, place, result_published
                FROM olympiad_applications
                WHERE deleted_at IS NULL AND olympiad_type = %s
                ORDER BY created_at DESC
            """, (olympiad_type,))

        rows = cursor.fetchall()
        result = []
        for row in rows:
            pid = row[14]
            otype = row[8]
            study_yr = row[3]
            task_url = None
            if pid:
                task_url = f"/olympiad/tasks?type={otype}&study_year={study_yr}&payment_id={pid}"
            result.append({
                'id': row[0],
                'full_name': row[1],
                'age': row[2],
                'study_year': row[3],
                'teacher': row[4],
                'institution': row[5],
                'work_title': row[6],
                'email': row[7],
                'olympiad_type': row[8],
                'status': row[9],
                'payment_status': row[10],
                'created_at': row[11].isoformat() if row[11] else None,
                'updated_at': row[12].isoformat() if row[12] else None,
                'deleted_at': row[13].isoformat() if row[13] else None,
                'payment_id': pid,
                'olympiad_status': row[15] or 'paid',
                'task_url': task_url,
                'place': row[16],
                'result_published': row[17] or False,
            })

        cursor.close()
        conn.close()
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(result)
        }

    if method == 'PUT':
        body = json.loads(event.get('body', '{}'))
        app_id = body.get('id')
        if not app_id:
            cursor.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'id is required'})
            }

        action = body.get('action')
        if action == 'delete':
            cursor.execute(
                "UPDATE olympiad_applications SET deleted_at = CURRENT_TIMESTAMP WHERE id = %s",
                (app_id,)
            )
        elif action == 'restore':
            cursor.execute(
                "UPDATE olympiad_applications SET deleted_at = NULL WHERE id = %s",
                (app_id,)
            )
        elif action == 'set_place':
            place_value = body.get('place')
            cursor.execute("""
                UPDATE olympiad_applications
                SET place = %s, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
            """, (place_value, app_id))
        elif action == 'publish_result':
            # Получаем данные заявки
            cursor.execute("""
                SELECT full_name, age, teacher, institution, work_title, email, olympiad_type, place
                FROM olympiad_applications WHERE id = %s
            """, (app_id,))
            app_row = cursor.fetchone()
            if not app_row:
                cursor.close()
                conn.close()
                return {'statusCode': 404, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Application not found'})}

            place_to_result = {
                'grand_prix': 'grand_prix',
                '1': 'first_degree',
                '2': 'second_degree',
                '3': 'third_degree',
            }
            place_val = app_row[7] or ''
            result_val = place_to_result.get(place_val, 'participant')

            olympiad_names = {
                'izo': 'Олимпиада по ИЗО «Палитра талантов»',
                'palette': 'Олимпиада по ИЗО «Палитра талантов»',
                'dpi': 'Олимпиада по ДПИ «Грани таланта»',
                'grani': 'Олимпиада по ДПИ «Грани таланта»',
            }
            contest_name = olympiad_names.get(app_row[6], 'Олимпиада')

            results_url = 'https://functions.poehali.dev/e1f9698c-ec8a-4b24-89c2-72bb579d7f9b'
            payload = json.dumps({
                'full_name': app_row[0],
                'age': app_row[1],
                'teacher': app_row[2],
                'institution': app_row[3],
                'work_title': app_row[4],
                'email': app_row[5],
                'contest_name': contest_name,
                'result': result_val,
                'place': None,
                'gallery_consent': True,
                'diploma_issued_at': None,
            }).encode('utf-8')
            req = urllib.request.Request(results_url, data=payload, headers={'Content-Type': 'application/json'}, method='POST')
            urllib.request.urlopen(req, timeout=10)

            cursor.execute("""
                UPDATE olympiad_applications
                SET result_published = TRUE, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
            """, (app_id,))
        else:
            cursor.execute("""
                UPDATE olympiad_applications
                SET status = %s, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
            """, (body.get('status', 'new'), app_id))

        conn.commit()
        cursor.close()
        conn.close()
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': True})
        }

    cursor.close()
    conn.close()
    return {
        'statusCode': 405,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }