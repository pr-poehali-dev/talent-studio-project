import json
import os
import psycopg2

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}

def handler(event: dict, context) -> dict:
    '''Возвращает уникальные email участников конкурсов и олимпиад с указанием где участвовали'''

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cursor = conn.cursor()

    schema = 't_p93576920_talent_studio_projec'

    cursor.execute(f'''
        SELECT
            email,
            ARRAY_AGG(DISTINCT source_label ORDER BY source_label) AS sources,
            MIN(created_at) AS first_seen,
            MAX(created_at) AS last_seen,
            COUNT(*) AS total_entries
        FROM (
            SELECT
                LOWER(TRIM(email)) AS email,
                CONCAT('Конкурс: ', contest_name) AS source_label,
                created_at
            FROM {schema}.applications
            WHERE deleted_at IS NULL AND email IS NOT NULL AND email <> ''

            UNION ALL

            SELECT
                LOWER(TRIM(email)) AS email,
                CASE olympiad_type
                    WHEN 'izo' THEN 'Олимпиада: Палитра талантов (ИЗО)'
                    WHEN 'dpi' THEN 'Олимпиада: Грани мастерства (ДПИ)'
                    ELSE CONCAT('Олимпиада: ', olympiad_type)
                END AS source_label,
                created_at
            FROM {schema}.olympiad_applications
            WHERE deleted_at IS NULL AND email IS NOT NULL AND email <> ''
        ) combined
        GROUP BY email
        ORDER BY last_seen DESC
    ''')

    rows = cursor.fetchall()
    conn.close()

    result = [
        {
            'email': r[0],
            'sources': r[1],
            'first_seen': str(r[2]),
            'last_seen': str(r[3]),
            'total_entries': r[4],
        }
        for r in rows
    ]

    return {
        'statusCode': 200,
        'headers': CORS_HEADERS,
        'body': json.dumps(result, ensure_ascii=False),
    }
