import json
import os
import requests
import boto3
import psycopg2
from base64 import b64encode
from botocore.exceptions import ClientError

def handler(event: dict, context) -> dict:
    '''Диагностика и восстановление заявок по payment_id из ЮКассы.
    GET /?payment_ids=id1,id2 — получить метаданные платежей
    POST {"payment_ids": [...], "restore": true} — восстановить заявки из S3 или из метаданных'''

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type'}, 'body': ''}

    shop_id = os.environ.get('YOOKASSA_SHOP_ID')
    secret_key = os.environ.get('YOOKASSA_SECRET_KEY')
    auth_header = b64encode(f"{shop_id}:{secret_key}".encode()).decode()
    yk_headers = {'Authorization': f'Basic {auth_header}', 'Content-Type': 'application/json'}

    aws_access_key = os.environ.get('AWS_ACCESS_KEY_ID')
    aws_secret_key = os.environ.get('AWS_SECRET_ACCESS_KEY')
    s3 = boto3.client('s3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=aws_access_key,
        aws_secret_access_key=aws_secret_key
    )

    method = event.get('httpMethod', 'GET')

    if method == 'GET':
        qp = event.get('queryStringParameters') or {}
        ids_raw = qp.get('payment_ids', '')
        payment_ids = [x.strip() for x in ids_raw.split(',') if x.strip()]

        results = []
        for pid in payment_ids:
            resp = requests.get(f'https://api.yookassa.ru/v3/payments/{pid}', headers=yk_headers)
            if resp.status_code != 200:
                results.append({'payment_id': pid, 'error': resp.text})
                continue

            payment = resp.json()
            metadata = payment.get('metadata', {})
            pending_id = metadata.get('pending_id')
            status = payment.get('status')
            amount = payment.get('amount', {})
            created_at = payment.get('created_at')

            s3_data = None
            s3_exists = False
            if pending_id:
                try:
                    obj = s3.get_object(Bucket='files', Key=f'pending_applications/{pending_id}.json')
                    s3_data = json.loads(obj['Body'].read().decode('utf-8'))
                    s3_exists = True
                except ClientError as e:
                    if e.response['Error']['Code'] in ('NoSuchKey', '404'):
                        s3_exists = False
                    else:
                        raise

            results.append({
                'payment_id': pid,
                'status': status,
                'amount': amount,
                'created_at': created_at,
                'pending_id': pending_id,
                's3_file_exists': s3_exists,
                's3_data': s3_data,
                'description': payment.get('description'),
                'metadata': metadata
            })

        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'results': results}, ensure_ascii=False)
        }

    if method == 'POST':
        body = json.loads(event.get('body', '{}'))
        payment_ids = body.get('payment_ids', [])
        restore = body.get('restore', False)

        dsn = os.environ.get('DATABASE_URL')
        results = []

        for pid in payment_ids:
            resp = requests.get(f'https://api.yookassa.ru/v3/payments/{pid}', headers=yk_headers)
            if resp.status_code != 200:
                results.append({'payment_id': pid, 'error': f'YooKassa error: {resp.text}'})
                continue

            payment = resp.json()
            if payment.get('status') != 'succeeded':
                results.append({'payment_id': pid, 'error': f'Payment status is {payment.get("status")}, not succeeded'})
                continue

            metadata = payment.get('metadata', {})
            pending_id = metadata.get('pending_id')

            if not pending_id:
                results.append({'payment_id': pid, 'error': 'No pending_id in metadata'})
                continue

            try:
                obj = s3.get_object(Bucket='files', Key=f'pending_applications/{pending_id}.json')
                app_data = json.loads(obj['Body'].read().decode('utf-8'))
            except ClientError as e:
                if e.response['Error']['Code'] in ('NoSuchKey', '404'):
                    results.append({'payment_id': pid, 'pending_id': pending_id, 'error': 'S3 file already deleted — payment may have been processed or lost'})
                    continue
                raise

            if not restore:
                results.append({'payment_id': pid, 'pending_id': pending_id, 'status': 'found', 'app_data': app_data})
                continue

            # Восстанавливаем заявку
            participants = app_data.get('participants')
            conn = psycopg2.connect(dsn)
            cur = conn.cursor()
            application_ids = []

            try:
                if participants and isinstance(participants, list):
                    for participant in participants:
                        age_raw = participant.get('age')
                        try:
                            age = int(age_raw) if age_raw is not None else None
                        except (ValueError, TypeError):
                            age = None
                        cur.execute(
                            '''INSERT INTO applications
                               (full_name, age, teacher, institution, work_title, email, contest_name,
                                gallery_consent, payment_status, work_file_url, is_collective, created_at)
                               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
                               RETURNING id''',
                            (
                                participant.get('full_name'), age,
                                participant.get('teacher'), participant.get('institution'),
                                participant.get('work_title'), participant.get('email'),
                                participant.get('contest_name'), participant.get('gallery_consent', False),
                                'paid', participant.get('work_file_url', ''), True
                            )
                        )
                        application_ids.append(cur.fetchone()[0])
                else:
                    extra_files = app_data.get('extra_files', [])
                    extra_files_sql = '{' + ','.join('"' + f.replace('"', '\\"') + '"' for f in extra_files) + '}' if extra_files else '{}'
                    cur.execute(
                        '''INSERT INTO applications
                           (full_name, age, teacher, institution, work_title, email, contest_name,
                            file_name, file_type, gallery_consent, payment_status, work_file_url, extra_files, created_at)
                           VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
                           RETURNING id''',
                        (
                            app_data.get('full_name'), app_data.get('age'),
                            app_data.get('teacher'), app_data.get('institution'),
                            app_data.get('work_title'), app_data.get('email'),
                            app_data.get('contest_name'), app_data.get('file_name'),
                            app_data.get('file_type'), app_data.get('gallery_consent', False),
                            'paid', app_data.get('work_file_url', ''), extra_files_sql
                        )
                    )
                    application_ids.append(cur.fetchone()[0])

                conn.commit()
                # Удаляем S3-файл после успешного восстановления
                s3.delete_object(Bucket='files', Key=f'pending_applications/{pending_id}.json')
                results.append({'payment_id': pid, 'pending_id': pending_id, 'status': 'restored', 'application_ids': application_ids})
            except Exception as e:
                conn.rollback()
                results.append({'payment_id': pid, 'pending_id': pending_id, 'error': f'DB error: {str(e)}'})
            finally:
                cur.close()
                conn.close()

        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'results': results}, ensure_ascii=False)
        }

    return {'statusCode': 405, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': ''}
