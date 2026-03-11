import json
import os
import psycopg2
import boto3

def handler(event: dict, context) -> dict:
    '''Обработка webhook от ЮКассы. При успешной оплате создаёт заявку(и) в БД из временных данных в S3.
    Для коллективных заявок создаёт отдельную заявку для каждого участника с данными педагога.'''
    
    method = event.get('httpMethod', 'POST')
    
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
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        body = json.loads(event.get('body', '{}'))
        
        event_type = body.get('event')
        payment_obj = body.get('object', {})
        
        if event_type != 'payment.succeeded':
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'status': 'ignored', 'event': event_type})
            }
        
        metadata = payment_obj.get('metadata', {})
        pending_id = metadata.get('pending_id')
        
        if not pending_id:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Missing pending_id in metadata'})
            }
        
        aws_access_key = os.environ.get('AWS_ACCESS_KEY_ID')
        aws_secret_key = os.environ.get('AWS_SECRET_ACCESS_KEY')
        
        s3 = boto3.client('s3',
            endpoint_url='https://bucket.poehali.dev',
            aws_access_key_id=aws_access_key,
            aws_secret_access_key=aws_secret_key
        )
        
        s3_key = f'pending_applications/{pending_id}.json'
        obj = s3.get_object(Bucket='files', Key=s3_key)
        app_data = json.loads(obj['Body'].read().decode('utf-8'))
        
        dsn = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        participants = app_data.get('participants')
        application_ids = []
        
        if participants and isinstance(participants, list):
            # Коллективная заявка — создаём отдельную запись для каждого участника
            for participant in participants:
                cur.execute(
                    '''INSERT INTO applications 
                       (full_name, age, teacher, institution, work_title, email, contest_name,
                        contest_id, gallery_consent, payment_status, work_file_url, is_collective, created_at)
                       VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
                       RETURNING id''',
                    (
                        participant.get('full_name'),
                        participant.get('age'),
                        participant.get('teacher'),
                        participant.get('institution'),
                        participant.get('work_title'),
                        participant.get('email'),
                        participant.get('contest_name'),
                        participant.get('contest_id'),
                        participant.get('gallery_consent', False),
                        'paid',
                        participant.get('work_file_url', ''),
                        True
                    )
                )
                application_ids.append(cur.fetchone()[0])
        else:
            # Одиночная заявка
            cur.execute(
                '''INSERT INTO applications 
                   (full_name, age, teacher, institution, work_title, email, contest_name,
                    file_name, file_type, gallery_consent, payment_status, work_file_url, created_at)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
                   RETURNING id''',
                (
                    app_data.get('full_name'),
                    app_data.get('age'),
                    app_data.get('teacher'),
                    app_data.get('institution'),
                    app_data.get('work_title'),
                    app_data.get('email'),
                    app_data.get('contest_name'),
                    app_data.get('file_name'),
                    app_data.get('file_type'),
                    app_data.get('gallery_consent', False),
                    'paid',
                    app_data.get('work_file_url', '')
                )
            )
            application_ids.append(cur.fetchone()[0])
        
        conn.commit()
        cur.close()
        conn.close()
        
        try:
            s3.delete_object(Bucket='files', Key=s3_key)
        except Exception:
            pass
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'status': 'success',
                'application_ids': application_ids,
                'application_id': application_ids[0] if application_ids else None,
                'payment_status': 'paid'
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }