import json
import os
import psycopg2

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
                       created_at, updated_at, deleted_at
                FROM olympiad_applications
                WHERE deleted_at IS NOT NULL AND olympiad_type = %s
                ORDER BY deleted_at DESC
            """, (olympiad_type,))
        else:
            cursor.execute("""
                SELECT id, full_name, age, study_year, teacher, institution,
                       work_title, email, olympiad_type, status, payment_status,
                       created_at, updated_at, deleted_at
                FROM olympiad_applications
                WHERE deleted_at IS NULL AND olympiad_type = %s
                ORDER BY created_at DESC
            """, (olympiad_type,))

        rows = cursor.fetchall()
        result = []
        for row in rows:
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
