import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
import hashlib


def handler(event: dict, context) -> dict:
    '''Обработка webhook от ЮКассы для подтверждения оплаты'''
    
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
        
        payment_id = payment_obj.get('id')
        status = payment_obj.get('status')
        metadata = payment_obj.get('metadata', {})
        application_id = metadata.get('application_id')
        
        if not application_id:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Missing application_id in metadata'})
            }
        
        dsn = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(dsn)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        if status == 'succeeded':
            cur.execute(
                "UPDATE applications SET status = 'paid', payment_status = %s WHERE id = %s",
                (status, application_id)
            )
            conn.commit()
            
            cur.execute("SELECT * FROM applications WHERE id = %s", (application_id,))
            application = cur.fetchone()
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'status': 'success',
                    'application_id': application_id,
                    'payment_status': status,
                    'application': dict(application) if application else None
                })
            }
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'status': 'processed', 'payment_status': status})
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
