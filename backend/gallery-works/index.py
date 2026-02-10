import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    '''API для получения работ для галереи (только с согласием на публикацию)'''
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }

    if method == 'GET':
        try:
            dsn = os.environ.get('DATABASE_URL')
            conn = psycopg2.connect(dsn)
            cur = conn.cursor()

            cur.execute("""
                SELECT 
                    id,
                    full_name,
                    age,
                    work_title,
                    contest_name,
                    work_file_url,
                    created_at
                FROM t_p93576920_talent_studio_projec.results
                WHERE gallery_consent = true 
                    AND work_file_url IS NOT NULL
                ORDER BY created_at DESC
            """)

            rows = cur.fetchall()
            works = []
            for row in rows:
                works.append({
                    'id': row[0],
                    'full_name': row[1],
                    'age': row[2],
                    'work_title': row[3],
                    'contest_name': row[4],
                    'work_file_url': row[5],
                    'created_at': row[6].isoformat() if row[6] else None
                })

            cur.close()
            conn.close()

            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(works, ensure_ascii=False)
            }

        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': str(e)}, ensure_ascii=False)
            }

    return {
        'statusCode': 405,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': 'Method not allowed'}, ensure_ascii=False)
    }
