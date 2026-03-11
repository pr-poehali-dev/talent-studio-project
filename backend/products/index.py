import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для работы с каталогом товаров (CRUD операции)
    Args: event с httpMethod, body, queryStringParameters
    Returns: HTTP response с данными товаров
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            product_id = params.get('id')
            category = params.get('category')
            
            if product_id:
                cur.execute('''
                    SELECT id, name, category, price, dosage, count, description, 
                           emoji, rating, popular, in_stock, images, main_image,
                           about_description, about_usage, documents, videos,
                           composition_description, composition_table, recommendation_tags
                    FROM products 
                    WHERE id = %s
                ''', (product_id,))
                
                row = cur.fetchone()
                if not row:
                    return {
                        'statusCode': 404,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'isBase64Encoded': False,
                        'body': json.dumps({'error': 'Product not found'})
                    }
                
                product = {
                    'id': row[0],
                    'name': row[1],
                    'category': row[2],
                    'price': row[3],
                    'dosage': row[4],
                    'count': row[5],
                    'description': row[6],
                    'emoji': row[7],
                    'rating': float(row[8]) if row[8] else 0,
                    'popular': row[9],
                    'inStock': row[10],
                    'images': row[11] if row[11] else [],
                    'mainImage': row[12],
                    'aboutDescription': row[13],
                    'aboutUsage': row[14],
                    'documents': row[15] if row[15] else [],
                    'videos': row[16] if row[16] else [],
                    'compositionDescription': row[17],
                    'compositionTable': row[18] if row[18] else [],
                    'recommendation_tags': row[19] if row[19] else []
                }
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({'product': product})
                }
            
            elif category and category != 'Все':
                cur.execute('''
                    SELECT id, name, category, price, dosage, count, description, 
                           emoji, rating, popular, in_stock, images, main_image,
                           about_description, about_usage, documents, videos,
                           composition_description, composition_table, recommendation_tags
                    FROM products 
                    WHERE category = %s AND in_stock = true
                    ORDER BY popular DESC, rating DESC
                ''', (category,))
            else:
                cur.execute('''
                    SELECT id, name, category, price, dosage, count, description, 
                           emoji, rating, popular, in_stock, images, main_image,
                           about_description, about_usage, documents, videos,
                           composition_description, composition_table, recommendation_tags
                    FROM products 
                    WHERE in_stock = true
                    ORDER BY popular DESC, rating DESC
                ''')
            
            products = []
            for row in cur.fetchall():
                products.append({
                    'id': row[0],
                    'name': row[1],
                    'category': row[2],
                    'price': row[3],
                    'dosage': row[4],
                    'count': row[5],
                    'description': row[6],
                    'emoji': row[7],
                    'rating': float(row[8]) if row[8] else 0,
                    'popular': row[9],
                    'inStock': row[10],
                    'images': row[11] if row[11] else [],
                    'mainImage': row[12],
                    'aboutDescription': row[13],
                    'aboutUsage': row[14],
                    'documents': row[15] if row[15] else [],
                    'videos': row[16] if row[16] else [],
                    'compositionDescription': row[17],
                    'compositionTable': row[18] if row[18] else [],
                    'recommendation_tags': row[19] if row[19] else []
                })
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'products': products})
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            cur.execute('''
                INSERT INTO products (
                    name, category, price, dosage, count, description, 
                    emoji, rating, popular, in_stock, images, main_image,
                    about_description, about_usage, documents, videos,
                    composition_description, composition_table, recommendation_tags
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            ''', (
                body_data.get('name'),
                body_data.get('category'),
                body_data.get('price'),
                body_data.get('dosage'),
                body_data.get('count'),
                body_data.get('description'),
                body_data.get('emoji'),
                body_data.get('rating', 0),
                body_data.get('popular', False),
                body_data.get('inStock', True),
                json.dumps(body_data.get('images', [])),
                body_data.get('mainImage'),
                body_data.get('aboutDescription'),
                body_data.get('aboutUsage'),
                json.dumps(body_data.get('documents', [])),
                json.dumps(body_data.get('videos', [])),
                body_data.get('compositionDescription'),
                json.dumps(body_data.get('compositionTable', [])),
                json.dumps(body_data.get('recommendation_tags', []))
            ))
            
            product_id = cur.fetchone()[0]
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'success': True, 'productId': product_id})
            }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            product_id = body_data.get('id')
            
            cur.execute('''
                UPDATE products 
                SET name = %s, category = %s, price = %s, dosage = %s, 
                    count = %s, description = %s, emoji = %s, rating = %s,
                    popular = %s, in_stock = %s, images = %s, main_image = %s,
                    about_description = %s, about_usage = %s, documents = %s, videos = %s,
                    composition_description = %s, composition_table = %s, recommendation_tags = %s,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
            ''', (
                body_data.get('name'),
                body_data.get('category'),
                body_data.get('price'),
                body_data.get('dosage'),
                body_data.get('count'),
                body_data.get('description'),
                body_data.get('emoji'),
                body_data.get('rating'),
                body_data.get('popular'),
                body_data.get('inStock'),
                json.dumps(body_data.get('images', [])) if body_data.get('images') is not None else None,
                body_data.get('mainImage'),
                body_data.get('aboutDescription'),
                body_data.get('aboutUsage'),
                json.dumps(body_data.get('documents', [])) if body_data.get('documents') is not None else None,
                json.dumps(body_data.get('videos', [])) if body_data.get('videos') is not None else None,
                body_data.get('compositionDescription'),
                json.dumps(body_data.get('compositionTable', [])) if body_data.get('compositionTable') is not None else None,
                json.dumps(body_data.get('recommendation_tags', [])),
                product_id
            ))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'success': True})
            }
        
        elif method == 'DELETE':
            params = event.get('queryStringParameters') or {}
            product_id = params.get('id')
            
            cur.execute('UPDATE products SET in_stock = false WHERE id = %s', (product_id,))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'success': True})
            }
        
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    finally:
        cur.close()
        conn.close()