import json
import os
import psycopg2
import boto3
from botocore.exceptions import ClientError

def handler(event: dict, context) -> dict:
    '''Обработка webhook от ЮКассы. При успешной оплате создаёт заявку(и) в БД из временных данных в S3.
    Для коллективных заявок создаёт отдельную заявку для каждого участника с данными педагога.
    Идемпотентность: S3-файл удаляется ДО записи в БД.
    Каждый участник — отдельная транзакция, ошибка одного не блокирует остальных.'''
    
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
        
        # Читаем данные из S3
        try:
            obj = s3.get_object(Bucket='files', Key=s3_key)
            app_data = json.loads(obj['Body'].read().decode('utf-8'))
        except ClientError as e:
            if e.response['Error']['Code'] in ('NoSuchKey', '404'):
                print(f'[IDEMPOTENT] pending_id={pending_id} already processed, skipping')
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'status': 'already_processed'})
                }
            raise
        
        participants = app_data.get('participants')
        print(f'[INFO] pending_id={pending_id}, type={app_data.get("type")}, participants_count={len(participants) if participants else 0}')
        
        # Удаляем S3-файл ДО записи в БД — идемпотентность при повторных webhook'ах
        s3.delete_object(Bucket='files', Key=s3_key)
        
        dsn = os.environ.get('DATABASE_URL')
        application_ids = []
        failed_participants = []
        
        if participants and isinstance(participants, list):
            # Коллективная заявка — каждый участник в отдельной транзакции
            for i, participant in enumerate(participants):
                age_raw = participant.get('age')
                try:
                    age = int(age_raw) if age_raw is not None else None
                except (ValueError, TypeError):
                    age = None
                
                print(f'[INFO] Inserting participant {i+1}/{len(participants)}: {participant.get("full_name")}, age={age}, contest_id={participant.get("contest_id")}')
                
                conn = psycopg2.connect(dsn)
                cur = conn.cursor()
                try:
                    # Проверяем contest_id на существование
                    contest_id = participant.get('contest_id')
                    if contest_id:
                        cur.execute('SELECT id FROM contests WHERE id = %s', (int(contest_id),))
                        if not cur.fetchone():
                            print(f'[WARN] contest_id={contest_id} not found, setting NULL')
                            contest_id = None
                        else:
                            contest_id = int(contest_id)
                    
                    cur.execute(
                        '''INSERT INTO applications 
                           (full_name, age, teacher, institution, work_title, email, contest_name,
                            contest_id, gallery_consent, payment_status, work_file_url, is_collective, created_at)
                           VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
                           RETURNING id''',
                        (
                            participant.get('full_name'),
                            age,
                            participant.get('teacher'),
                            participant.get('institution'),
                            participant.get('work_title'),
                            participant.get('email'),
                            participant.get('contest_name'),
                            contest_id,
                            participant.get('gallery_consent', False),
                            'paid',
                            participant.get('work_file_url', ''),
                            True
                        )
                    )
                    app_id = cur.fetchone()[0]
                    conn.commit()
                    application_ids.append(app_id)
                    print(f'[SUCCESS] Participant {i+1} saved as application id={app_id}')
                except Exception as pe:
                    conn.rollback()
                    print(f'[ERROR] Participant {i+1} ({participant.get("full_name")}) failed: {str(pe)}')
                    failed_participants.append({'index': i+1, 'name': participant.get('full_name'), 'error': str(pe)})
                finally:
                    cur.close()
                    conn.close()
        else:
            # Одиночная заявка
            conn = psycopg2.connect(dsn)
            cur = conn.cursor()
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
        
        print(f'[DONE] Created {len(application_ids)} applications: {application_ids}, failed: {len(failed_participants)}')
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'status': 'success',
                'application_ids': application_ids,
                'application_id': application_ids[0] if application_ids else None,
                'payment_status': 'paid',
                'failed': failed_participants
            })
        }
        
    except Exception as e:
        print(f'[ERROR] {str(e)}')
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
