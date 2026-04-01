import json
import os
import psycopg2

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
}

def handler(event: dict, context) -> dict:
    """API для управления заданиями олимпиады"""

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cursor = conn.cursor()

    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}

    try:
        # GET: получить список заданий по типу олимпиады
        if method == 'GET':
            olympiad_type = params.get('type', 'palette')
            # Публичный запрос: только активные, без правильных ответов
            is_admin = params.get('admin') == 'true'

            if is_admin:
                cursor.execute("""
                    SELECT id, olympiad_type, title, description, question,
                           image_url, options, correct_answer, sort_order, is_active,
                           created_at, updated_at
                    FROM olympiad_tasks
                    WHERE olympiad_type = %s
                    ORDER BY sort_order ASC, id ASC
                """, (olympiad_type,))
            else:
                cursor.execute("""
                    SELECT id, olympiad_type, title, description, question,
                           image_url, options, NULL as correct_answer, sort_order, is_active,
                           created_at, updated_at
                    FROM olympiad_tasks
                    WHERE olympiad_type = %s AND is_active = TRUE
                    ORDER BY sort_order ASC, id ASC
                """, (olympiad_type,))

            rows = cursor.fetchall()
            result = []
            for row in rows:
                result.append({
                    'id': row[0],
                    'olympiad_type': row[1],
                    'title': row[2],
                    'description': row[3],
                    'question': row[4],
                    'image_url': row[5],
                    'options': row[6],
                    'correct_answer': row[7],
                    'sort_order': row[8],
                    'is_active': row[9],
                    'created_at': row[10].isoformat() if row[10] else None,
                    'updated_at': row[11].isoformat() if row[11] else None,
                })

            cursor.close()
            conn.close()
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(result)
            }

        # POST: создать новое задание
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))

            olympiad_type = body.get('olympiad_type', 'palette')
            title = body.get('title', '').strip()
            description = body.get('description', '')
            question = body.get('question', '').strip()
            image_url = body.get('image_url', '')
            options = body.get('options')  # JSONB: list of strings or null
            correct_answer = body.get('correct_answer', '')
            sort_order = body.get('sort_order', 0)
            is_active = body.get('is_active', True)

            if not title or not question:
                cursor.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'title and question are required'})
                }

            cursor.execute("""
                INSERT INTO olympiad_tasks
                    (olympiad_type, title, description, question, image_url, options, correct_answer, sort_order, is_active)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (
                olympiad_type, title, description, question,
                image_url or None,
                json.dumps(options) if options is not None else None,
                correct_answer or None,
                sort_order, is_active
            ))
            new_id = cursor.fetchone()[0]
            conn.commit()
            cursor.close()
            conn.close()
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'id': new_id, 'success': True})
            }

        # PUT: обновить задание
        if method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            task_id = body.get('id')

            if not task_id:
                cursor.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'id is required'})
                }

            title = body.get('title', '').strip()
            description = body.get('description', '')
            question = body.get('question', '').strip()
            image_url = body.get('image_url', '')
            options = body.get('options')
            correct_answer = body.get('correct_answer', '')
            sort_order = body.get('sort_order', 0)
            is_active = body.get('is_active', True)

            cursor.execute("""
                UPDATE olympiad_tasks
                SET title = %s, description = %s, question = %s,
                    image_url = %s, options = %s, correct_answer = %s,
                    sort_order = %s, is_active = %s, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
            """, (
                title, description, question,
                image_url or None,
                json.dumps(options) if options is not None else None,
                correct_answer or None,
                sort_order, is_active, task_id
            ))
            conn.commit()
            cursor.close()
            conn.close()
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True})
            }

        # DELETE: удалить задание
        if method == 'DELETE':
            body = json.loads(event.get('body', '{}'))
            task_id = body.get('id')

            if not task_id:
                cursor.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'id is required'})
                }

            cursor.execute("DELETE FROM olympiad_tasks WHERE id = %s", (task_id,))
            conn.commit()
            cursor.close()
            conn.close()
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True})
            }

    except Exception as e:
        if not cursor.closed:
            cursor.close()
        if not conn.closed:
            conn.close()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }

    cursor.close()
    conn.close()
    return {
        'statusCode': 405,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }
