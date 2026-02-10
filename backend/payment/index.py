import json
import os
import uuid
import requests
from base64 import b64encode

def handler(event: dict, context) -> dict:
    '''API для создания платежа через ЮКассу'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method == 'POST':
        try:
            body = json.loads(event.get('body', '{}'))
            
            amount = body.get('amount')
            description = body.get('description')
            contest_name = body.get('contest_name')
            email = body.get('email')
            application_data = body.get('application_data', {})
            
            if not amount or not description:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Missing amount or description'}),
                    'isBase64Encoded': False
                }
            
            shop_id = os.environ.get('YOOKASSA_SHOP_ID')
            secret_key = os.environ.get('YOOKASSA_SECRET_KEY')
            
            if not shop_id or not secret_key:
                return {
                    'statusCode': 500,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'YooKassa credentials not configured'}),
                    'isBase64Encoded': False
                }
            
            auth_string = f"{shop_id}:{secret_key}"
            auth_header = b64encode(auth_string.encode()).decode()
            
            idempotence_key = str(uuid.uuid4())
            
            payment_data = {
                "amount": {
                    "value": str(amount),
                    "currency": "RUB"
                },
                "confirmation": {
                    "type": "redirect",
                    "return_url": "https://preview--talent-studio-project.poehali.dev/?section=home"
                },
                "capture": True,
                "description": description,
                "metadata": {
                    "contest_name": contest_name,
                    "email": email,
                    "application_data": json.dumps(application_data)
                }
            }
            
            headers = {
                'Authorization': f'Basic {auth_header}',
                'Idempotence-Key': idempotence_key,
                'Content-Type': 'application/json'
            }
            
            response = requests.post(
                'https://api.yookassa.ru/v3/payments',
                json=payment_data,
                headers=headers
            )
            
            if response.status_code in [200, 201]:
                payment_response = response.json()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'payment_id': payment_response['id'],
                        'confirmation_url': payment_response['confirmation']['confirmation_url'],
                        'status': payment_response['status']
                    }),
                    'isBase64Encoded': False
                }
            else:
                return {
                    'statusCode': response.status_code,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': response.text}),
                    'isBase64Encoded': False
                }
                
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': str(e)}),
                'isBase64Encoded': False
            }
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }
