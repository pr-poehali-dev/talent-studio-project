import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    '''API для управления заявками на конкурсы'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }
    
    dsn = os.environ.get('DATABASE_URL')
    
    if method == 'GET':
        try:
            conn = psycopg2.connect(dsn)
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT id, full_name, age, teacher, institution, work_title, 
                       email, contest_id, contest_name, work_file_url, 
                       status, result, created_at, updated_at
                FROM applications
                ORDER BY created_at DESC
            """)
            
            rows = cursor.fetchall()
            
            applications = []
            for row in rows:
                applications.append({
                    'id': row[0],
                    'full_name': row[1],
                    'age': row[2],
                    'teacher': row[3],
                    'institution': row[4],
                    'work_title': row[5],
                    'email': row[6],
                    'contest_id': row[7],
                    'contest_name': row[8],
                    'work_file_url': row[9],
                    'status': row[10],
                    'result': row[11],
                    'created_at': row[12].isoformat() if row[12] else None,
                    'updated_at': row[13].isoformat() if row[13] else None
                })
            
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(applications)
            }
            
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': str(e)})
            }
    
    if method == 'PUT':
        try:
            body = json.loads(event.get('body', '{}'))
            
            app_id = body.get('id')
            if not app_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Missing id'})
                }
            
            conn = psycopg2.connect(dsn)
            cursor = conn.cursor()
            
            cursor.execute("""
                UPDATE applications 
                SET full_name = %s, age = %s, teacher = %s, institution = %s,
                    work_title = %s, email = %s, status = %s, result = %s,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
            """, (
                body.get('full_name'),
                body.get('age'),
                body.get('teacher'),
                body.get('institution'),
                body.get('work_title'),
                body.get('email'),
                body.get('status'),
                body.get('result'),
                app_id
            ))
            
            conn.commit()
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True})
            }
            
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': str(e)})
            }
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }
