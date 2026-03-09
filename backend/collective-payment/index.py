import json
import os
import uuid
import requests
import boto3
from base64 import b64encode


def handler(event: dict, context) -> dict:
    '''API для создания коллективного платежа через ЮКассу. Список участников сохраняется в S3, заявки создаются после успешной оплаты через webhook.'''

    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
            'body': '',
            'isBase64Encoded': False,
        }

    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False,
        }

    raw_body = event.get('body') or '{}'
    body = json.loads(raw_body) if raw_body.strip() else {}

    amount = body.get('amount')
    description = body.get('description')
    email = body.get('email')
    participants = body.get('participants', [])

    if not amount or not description or not participants:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Missing required fields: amount, description, participants'}),
            'isBase64Encoded': False,
        }

    if not isinstance(participants, list) or len(participants) == 0:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'participants must be a non-empty list'}),
            'isBase64Encoded': False,
        }

    # Проверяем что сумма соответствует количеству участников
    expected_amount = len(participants) * 200
    if int(float(amount)) != expected_amount:
        amount = expected_amount

    aws_access_key = os.environ.get('AWS_ACCESS_KEY_ID')
    aws_secret_key = os.environ.get('AWS_SECRET_ACCESS_KEY')

    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=aws_access_key,
        aws_secret_access_key=aws_secret_key,
    )

    pending_id = str(uuid.uuid4())

    pending_data = {
        'type': 'collective',
        'email': email,
        'participants': participants,
    }

    s3.put_object(
        Bucket='files',
        Key=f'pending_applications/{pending_id}.json',
        Body=json.dumps(pending_data, ensure_ascii=False),
        ContentType='application/json',
    )

    shop_id = os.environ.get('YOOKASSA_SHOP_ID')
    secret_key = os.environ.get('YOOKASSA_SECRET_KEY')

    if not shop_id or not secret_key:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'YooKassa credentials not configured'}),
            'isBase64Encoded': False,
        }

    auth_string = f"{shop_id}:{secret_key}"
    auth_header = b64encode(auth_string.encode()).decode()
    idempotence_key = str(uuid.uuid4())

    payment_data = {
        "amount": {
            "value": f"{amount:.2f}",
            "currency": "RUB",
        },
        "confirmation": {
            "type": "redirect",
            "return_url": "https://preview--talent-studio-project.poehali.dev/?section=home",
        },
        "capture": True,
        "description": description,
        "metadata": {
            "pending_id": pending_id,
            "type": "collective",
        },
    }

    if email:
        payment_data["receipt"] = {
            "customer": {"email": email},
            "items": [
                {
                    "description": f"Участие в конкурсе (участник {i + 1})",
                    "quantity": "1",
                    "amount": {"value": "200.00", "currency": "RUB"},
                    "vat_code": 1,
                }
                for i in range(len(participants))
            ],
        }

    headers = {
        'Authorization': f'Basic {auth_header}',
        'Idempotence-Key': idempotence_key,
        'Content-Type': 'application/json',
    }

    response = requests.post(
        'https://api.yookassa.ru/v3/payments',
        json=payment_data,
        headers=headers,
    )

    if response.status_code in [200, 201]:
        payment_response = response.json()
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'payment_id': payment_response['id'],
                'confirmation_url': payment_response['confirmation']['confirmation_url'],
                'status': payment_response['status'],
                'pending_id': pending_id,
            }),
            'isBase64Encoded': False,
        }
    else:
        return {
            'statusCode': response.status_code,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': response.text}),
            'isBase64Encoded': False,
        }