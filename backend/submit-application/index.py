import json
import os
import psycopg2
import base64

def handler(event: dict, context) -> dict:
    '''API для подачи заявок на участие в конкурсах'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }
    
    if method == 'POST':
        try:
            body = json.loads(event.get('body', '{}'))
            
            full_name = body.get('full_name')
            age = body.get('age')
            teacher = body.get('teacher')
            institution = body.get('institution')
            work_title = body.get('work_title')
            email = body.get('email')
            contest_name = body.get('contest_name')
            work_file = body.get('work_file')
            file_name = body.get('file_name')
            file_type = body.get('file_type')
            
            if not all([full_name, age, work_title, email, contest_name, work_file, file_name]):
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Missing required fields'})
                }
            
            aws_access_key = os.environ.get('AWS_ACCESS_KEY_ID')
            aws_secret_key = os.environ.get('AWS_SECRET_ACCESS_KEY')
            
            import boto3
            s3 = boto3.client('s3',
                endpoint_url='https://bucket.poehali.dev',
                aws_access_key_id=aws_access_key,
                aws_secret_access_key=aws_secret_key
            )
            
            file_data = base64.b64decode(work_file)
            file_key = f'works/{file_name}'
            
            s3.put_object(
                Bucket='files',
                Key=file_key,
                Body=file_data,
                ContentType=file_type
            )
            
            work_file_url = f"https://cdn.poehali.dev/projects/{aws_access_key}/bucket/{file_key}"
            
            dsn = os.environ.get('DATABASE_URL')
            conn = psycopg2.connect(dsn)
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT INTO applications 
                (full_name, age, teacher, institution, work_title, email, contest_name, work_file_url, status)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'new')
                RETURNING id
            """, (full_name, age, teacher, institution, work_title, email, contest_name, work_file_url))
            
            app_id = cursor.fetchone()[0]
            conn.commit()
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'application_id': app_id,
                    'work_url': work_file_url
                })
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
