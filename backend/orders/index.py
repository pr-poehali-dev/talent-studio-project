import json
import os
import psycopg2
import uuid
import base64
import requests
from datetime import datetime
from typing import Dict, Any

def create_yookassa_payment(order_id: int, order_number: str, amount: float, customer_email: str, return_url: str) -> Dict[str, Any]:
    '''Создание платежа через ЮKassa'''
    shop_id = os.environ.get('YOOMONEY_SHOP_ID')
    secret_key = os.environ.get('YOOMONEY_SECRET_KEY')
    
    idempotence_key = str(uuid.uuid4())
    
    payment_data = {
        'amount': {
            'value': f'{amount:.2f}',
            'currency': 'RUB'
        },
        'confirmation': {
            'type': 'redirect',
            'return_url': return_url
        },
        'capture': True,
        'description': f'Заказ {order_number}',
        'metadata': {
            'order_id': order_id,
            'order_number': order_number
        }
    }
    
    if customer_email:
        payment_data['receipt'] = {
            'customer': {
                'email': customer_email
            },
            'items': [{
                'description': 'Витаминный курс',
                'quantity': '1',
                'amount': {
                    'value': f'{amount:.2f}',
                    'currency': 'RUB'
                },
                'vat_code': 1
            }]
        }
    
    auth_string = f'{shop_id}:{secret_key}'
    auth_header = base64.b64encode(auth_string.encode()).decode()
    
    headers = {
        'Authorization': f'Basic {auth_header}',
        'Idempotence-Key': idempotence_key,
        'Content-Type': 'application/json'
    }
    
    response = requests.post(
        'https://api.yookassa.ru/v3/payments',
        json=payment_data,
        headers=headers,
        timeout=10
    )
    
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f'ЮKassa error: {response.text}')

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для создания заказов и работы с платежами через ЮKassa
    Args: event с httpMethod, body, queryStringParameters
    Returns: HTTP response с данными заказа, ссылкой на оплату или списком заказов
    '''
    method: str = event.get('httpMethod', 'GET')
    path: str = event.get('requestContext', {}).get('http', {}).get('path', event.get('path', '/'))
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    db_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    try:
        if method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            # Webhook от ЮKassa
            if 'event' in body_data and body_data.get('event') == 'payment.succeeded':
                payment_id = body_data['object']['id']
                order_number = body_data['object']['metadata'].get('order_number')
                
                cur.execute('''
                    UPDATE orders 
                    SET payment_status = 'paid', 
                        payment_id = %s,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE order_number = %s
                ''', (payment_id, order_number))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json'},
                    'body': json.dumps({'success': True}),
                    'isBase64Encoded': False
                }
            
            # Создание заказа с оплатой
            order_number = f"VIT-{datetime.now().strftime('%Y%m%d')}-{datetime.now().timestamp():.0f}"
            
            cur.execute('''
                INSERT INTO orders (
                    order_number, customer_name, customer_email, customer_phone,
                    delivery_method, delivery_address, delivery_city, delivery_postal_code,
                    total_amount, items, survey_data, status, payment_status
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id, order_number, created_at
            ''', (
                order_number,
                body_data.get('customerName'),
                body_data.get('customerEmail'),
                body_data.get('customerPhone'),
                body_data.get('deliveryMethod'),
                body_data.get('deliveryAddress'),
                body_data.get('deliveryCity'),
                body_data.get('deliveryPostalCode'),
                body_data.get('totalAmount'),
                json.dumps(body_data.get('items', [])),
                json.dumps(body_data.get('surveyData')),
                'pending',
                'pending'
            ))
            
            result = cur.fetchone()
            order_id, order_num, created = result
            conn.commit()
            
            # Создаём платёж в ЮKassa
            host = event.get('headers', {}).get('host', 'localhost')
            return_url = f"https://{host}/order-success?order={order_num}"
            
            try:
                payment_response = create_yookassa_payment(
                    order_id=order_id,
                    order_number=order_num,
                    amount=body_data.get('totalAmount'),
                    customer_email=body_data.get('customerEmail'),
                    return_url=return_url
                )
                
                payment_id = payment_response['id']
                confirmation_url = payment_response['confirmation']['confirmation_url']
                
                # Сохраняем payment_id
                cur.execute('''
                    UPDATE orders 
                    SET payment_id = %s,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                ''', (payment_id, order_id))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({
                        'success': True,
                        'orderId': order_id,
                        'orderNumber': order_num,
                        'createdAt': created.isoformat(),
                        'paymentUrl': confirmation_url
                    })
                }
            except Exception as e:
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({
                        'success': True,
                        'orderId': order_id,
                        'orderNumber': order_num,
                        'createdAt': created.isoformat(),
                        'paymentError': str(e)
                    })
                }
        
        elif method == 'GET':
            params = event.get('queryStringParameters') or {}
            order_number = params.get('orderNumber')
            
            if order_number:
                cur.execute('''
                    SELECT id, order_number, customer_name, customer_email,
                           delivery_method, total_amount, status, payment_status,
                           tracking_number, created_at
                    FROM orders WHERE order_number = %s
                ''', (order_number,))
                
                row = cur.fetchone()
                if not row:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Order not found'}),
                        'isBase64Encoded': False
                    }
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({
                        'id': row[0],
                        'orderNumber': row[1],
                        'customerName': row[2],
                        'customerEmail': row[3],
                        'deliveryMethod': row[4],
                        'totalAmount': row[5],
                        'status': row[6],
                        'paymentStatus': row[7],
                        'trackingNumber': row[8],
                        'createdAt': row[9].isoformat()
                    })
                }
            else:
                cur.execute('''
                    SELECT id, order_number, customer_name, total_amount,
                           status, payment_status, created_at
                    FROM orders ORDER BY created_at DESC LIMIT 50
                ''')
                
                orders = []
                for row in cur.fetchall():
                    orders.append({
                        'id': row[0],
                        'orderNumber': row[1],
                        'customerName': row[2],
                        'totalAmount': row[3],
                        'status': row[4],
                        'paymentStatus': row[5],
                        'createdAt': row[6].isoformat()
                    })
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'orders': orders})
                }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            order_id = body_data.get('orderId')
            
            cur.execute('''
                UPDATE orders 
                SET status = %s, tracking_number = %s, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
                RETURNING order_number
            ''', (
                body_data.get('status'),
                body_data.get('trackingNumber'),
                order_id
            ))
            
            result = cur.fetchone()
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'success': True, 'orderNumber': result[0]})
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    finally:
        cur.close()
        conn.close()