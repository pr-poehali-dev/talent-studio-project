import json
import os
import psycopg2

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}

def handler(event: dict, context) -> dict:
    '''API для управления клиентами (список email-адресов)'''

    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cursor = conn.cursor()

    if method == 'GET':
        cursor.execute('SELECT id, email, name, created_at FROM t_p93576920_talent_studio_projec.clients ORDER BY created_at DESC')
        rows = cursor.fetchall()
        clients = [{'id': r[0], 'email': r[1], 'name': r[2], 'created_at': str(r[3])} for r in rows]
        conn.close()
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps(clients, ensure_ascii=False)}

    if method == 'POST':
        body = json.loads(event.get('body') or '{}')
        action = body.get('action')

        if action == 'add':
            email = (body.get('email') or '').strip().lower()
            name = (body.get('name') or '').strip()
            if not email:
                conn.close()
                return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Email обязателен'})}
            cursor.execute(
                'INSERT INTO t_p93576920_talent_studio_projec.clients (email, name) VALUES (%s, %s) ON CONFLICT (email) DO NOTHING RETURNING id',
                (email, name or None)
            )
            row = cursor.fetchone()
            conn.commit()
            conn.close()
            if row:
                return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'ok': True, 'id': row[0]})}
            else:
                return {'statusCode': 409, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Такой email уже существует'})}

        if action == 'dedup':
            cursor.execute('''
                DELETE FROM t_p93576920_talent_studio_projec.clients
                WHERE id NOT IN (
                    SELECT MIN(id) FROM t_p93576920_talent_studio_projec.clients GROUP BY email
                )
            ''')
            deleted = cursor.rowcount
            conn.commit()
            conn.close()
            return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'ok': True, 'deleted': deleted})}

        conn.close()
        return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Неизвестное действие'})}

    if method == 'DELETE':
        body = json.loads(event.get('body') or '{}')
        client_id = body.get('id')
        if not client_id:
            conn.close()
            return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'id обязателен'})}
        cursor.execute('DELETE FROM t_p93576920_talent_studio_projec.clients WHERE id = %s', (client_id,))
        conn.commit()
        conn.close()
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'ok': True})}

    conn.close()
    return {'statusCode': 405, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Method not allowed'})}
