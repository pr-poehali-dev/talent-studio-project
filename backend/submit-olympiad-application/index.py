import json
import os
import psycopg2
import base64

def ensure_table(cursor):
    """Создаём таблицу если не существует"""
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
    """API для подачи заявок на участие в олимпиадах"""

    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }

    if event.get('httpMethod') != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }

    raw_body = event.get('body', '{}')
    if event.get('isBase64Encoded'):
        raw_body = base64.b64decode(raw_body).decode('utf-8')
    body = json.loads(raw_body)

    full_name = body.get('full_name')
    age = body.get('age')
    study_year = body.get('study_year')
    teacher = body.get('teacher')
    institution = body.get('institution')
    work_title = body.get('work_title')
    email = body.get('email')
    olympiad_type = body.get('olympiad_type', 'palette')

    if not all([full_name, age, study_year, work_title, email]):
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Missing required fields'})
        }

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cursor = conn.cursor()
    ensure_table(cursor)

    cursor.execute("""
        INSERT INTO olympiad_applications
            (full_name, age, study_year, teacher, institution, work_title, email, olympiad_type, status, payment_status)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'new', 'paid')
        RETURNING id
    """, (full_name, age, study_year, teacher, institution, work_title, email, olympiad_type))

    app_id = cursor.fetchone()[0]
    conn.commit()
    cursor.close()
    conn.close()

    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True, 'application_id': app_id})
    }
