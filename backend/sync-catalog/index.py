'''
Business: Синхронизация каталога товаров из внешних источников (парсинг сайтов, Google Таблицы)
Args: event с httpMethod, body, queryStringParameters
Returns: HTTP response с результатом синхронизации
'''

import json
import os
import re
import psycopg2
from typing import Dict, Any, List
from datetime import datetime
from urllib.parse import urlparse
import urllib.request

def parse_google_sheets_url(url: str) -> str:
    """Конвертирует URL Google Sheets в CSV export URL"""
    if 'docs.google.com/spreadsheets' in url:
        match = re.search(r'/d/([a-zA-Z0-9-_]+)', url)
        if match:
            sheet_id = match.group(1)
            gid = '0'
            gid_match = re.search(r'[#&]gid=([0-9]+)', url)
            if gid_match:
                gid = gid_match.group(1)
            return f'https://docs.google.com/spreadsheets/d/{sheet_id}/export?format=csv&gid={gid}'
    return url

def fetch_google_sheets(url: str) -> List[Dict[str, Any]]:
    """Загружает данные из Google Таблицы"""
    csv_url = parse_google_sheets_url(url)
    
    req = urllib.request.Request(csv_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=30) as response:
        content = response.read().decode('utf-8')
    
    lines = content.strip().split('\n')
    if len(lines) < 2:
        return []
    
    headers = [h.strip().lower() for h in lines[0].split(',')]
    products = []
    
    for line in lines[1:]:
        values = line.split(',')
        if len(values) < len(headers):
            continue
        
        product = {}
        for i, header in enumerate(headers):
            if i < len(values):
                value = values[i].strip().strip('"')
                if header in ['цена', 'price']:
                    try:
                        product['price'] = float(re.sub(r'[^\d.]', '', value))
                    except:
                        product['price'] = 0
                elif header in ['название', 'name', 'наименование']:
                    product['name'] = value
                elif header in ['категория', 'category']:
                    product['category'] = value
                elif header in ['описание', 'description']:
                    product['description'] = value
                elif header in ['дозировка', 'dosage']:
                    product['dosage'] = value
                elif header in ['количество', 'count']:
                    product['count'] = value
                elif header in ['emoji', 'эмодзи']:
                    product['emoji'] = value
                elif header in ['рейтинг', 'rating']:
                    try:
                        product['rating'] = float(value)
                    except:
                        product['rating'] = 0
        
        if product.get('name'):
            products.append(product)
    
    return products

def parse_website(url: str) -> List[Dict[str, Any]]:
    """Парсит товары с веб-сайта"""
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=30) as response:
        html = response.read().decode('utf-8', errors='ignore')
    
    products = []
    
    price_patterns = [
        r'(\d+(?:\s?\d+)*)\s*(?:руб|₽|rub)',
        r'price["\']?\s*:\s*["\']?(\d+)',
        r'<[^>]*price[^>]*>.*?(\d+)',
    ]
    
    name_patterns = [
        r'<h[1-6][^>]*>([^<]+)</h[1-6]>',
        r'product[_-]?name["\']?\s*:\s*["\']([^"\']+)',
        r'<[^>]*product[_-]?title[^>]*>([^<]+)',
    ]
    
    price_matches = []
    for pattern in price_patterns:
        price_matches.extend(re.findall(pattern, html, re.IGNORECASE))
    
    name_matches = []
    for pattern in name_patterns:
        name_matches.extend(re.findall(pattern, html, re.IGNORECASE))
    
    for i, name in enumerate(name_matches[:20]):
        price = 0
        if i < len(price_matches):
            try:
                price_str = price_matches[i].replace(' ', '').replace('\xa0', '')
                price = float(price_str)
            except:
                pass
        
        products.append({
            'name': name.strip(),
            'price': price,
            'category': 'Импорт',
            'description': f'Товар импортирован с {urlparse(url).netloc}',
        })
    
    return products

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
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
        # GET - получить настройки и логи синхронизации
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            resource = params.get('resource', 'settings')
            
            if resource == 'settings':
                cur.execute('''
                    SELECT id, sync_type, is_active, source_url, schedule_minutes,
                           update_prices_only, last_sync_at, last_sync_status, settings
                    FROM sync_settings
                    ORDER BY id DESC
                ''')
                
                settings = []
                for row in cur.fetchall():
                    settings.append({
                        'id': row[0],
                        'syncType': row[1],
                        'isActive': row[2],
                        'sourceUrl': row[3],
                        'scheduleMinutes': row[4],
                        'updatePricesOnly': row[5],
                        'lastSyncAt': row[6].isoformat() if row[6] else None,
                        'lastSyncStatus': row[7],
                        'settings': row[8]
                    })
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'settings': settings})
                }
            
            elif resource == 'logs':
                setting_id = params.get('setting_id')
                query = '''
                    SELECT id, sync_setting_id, started_at, finished_at, status,
                           items_processed, items_added, items_updated, items_skipped, error_message
                    FROM sync_logs
                '''
                if setting_id:
                    query += f' WHERE sync_setting_id = {setting_id}'
                query += ' ORDER BY started_at DESC LIMIT 50'
                
                cur.execute(query)
                
                logs = []
                for row in cur.fetchall():
                    logs.append({
                        'id': row[0],
                        'syncSettingId': row[1],
                        'startedAt': row[2].isoformat() if row[2] else None,
                        'finishedAt': row[3].isoformat() if row[3] else None,
                        'status': row[4],
                        'itemsProcessed': row[5],
                        'itemsAdded': row[6],
                        'itemsUpdated': row[7],
                        'itemsSkipped': row[8],
                        'errorMessage': row[9]
                    })
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'logs': logs})
                }
        
        # POST - создать настройку синхронизации или запустить синхронизацию
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            params = event.get('queryStringParameters') or {}
            action = params.get('action', 'create')
            
            if action == 'sync':
                setting_id = body_data.get('settingId')
                
                cur.execute('''
                    SELECT sync_type, source_url, update_prices_only, settings
                    FROM sync_settings WHERE id = %s
                ''', (setting_id,))
                row = cur.fetchone()
                
                if not row:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'isBase64Encoded': False,
                        'body': json.dumps({'error': 'Настройка не найдена'})
                    }
                
                sync_type, source_url, update_prices_only, settings = row
                
                cur.execute('''
                    INSERT INTO sync_logs (sync_setting_id, status)
                    VALUES (%s, %s) RETURNING id
                ''', (setting_id, 'running'))
                log_id = cur.fetchone()[0]
                conn.commit()
                
                try:
                    products = []
                    
                    if sync_type == 'google_sheets':
                        products = fetch_google_sheets(source_url)
                    elif sync_type == 'website':
                        products = parse_website(source_url)
                    
                    items_added = 0
                    items_updated = 0
                    items_skipped = 0
                    
                    for product in products:
                        if not product.get('name'):
                            items_skipped += 1
                            continue
                        
                        if update_prices_only:
                            cur.execute('''
                                UPDATE products SET price = %s, updated_at = CURRENT_TIMESTAMP
                                WHERE LOWER(name) = LOWER(%s)
                            ''', (product.get('price', 0), product['name']))
                            if cur.rowcount > 0:
                                items_updated += 1
                            else:
                                items_skipped += 1
                        else:
                            cur.execute('''
                                SELECT id FROM products WHERE LOWER(name) = LOWER(%s)
                            ''', (product['name'],))
                            existing = cur.fetchone()
                            
                            if existing:
                                cur.execute('''
                                    UPDATE products
                                    SET price = %s, category = COALESCE(%s, category),
                                        description = COALESCE(%s, description),
                                        dosage = COALESCE(%s, dosage),
                                        count = COALESCE(%s, count),
                                        emoji = COALESCE(%s, emoji),
                                        rating = COALESCE(%s, rating),
                                        updated_at = CURRENT_TIMESTAMP
                                    WHERE id = %s
                                ''', (
                                    product.get('price', 0),
                                    product.get('category'),
                                    product.get('description'),
                                    product.get('dosage'),
                                    product.get('count'),
                                    product.get('emoji'),
                                    product.get('rating'),
                                    existing[0]
                                ))
                                items_updated += 1
                            else:
                                cur.execute('''
                                    INSERT INTO products (
                                        name, category, price, dosage, count, description,
                                        emoji, rating, popular, external_url, in_stock
                                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                                ''', (
                                    product['name'],
                                    product.get('category', 'Импорт'),
                                    product.get('price', 0),
                                    product.get('dosage', ''),
                                    product.get('count', ''),
                                    product.get('description', ''),
                                    product.get('emoji', '💊'),
                                    product.get('rating', 0),
                                    False,
                                    source_url,
                                    True
                                ))
                                items_added += 1
                    
                    cur.execute('''
                        UPDATE sync_logs
                        SET finished_at = CURRENT_TIMESTAMP, status = %s,
                            items_processed = %s, items_added = %s,
                            items_updated = %s, items_skipped = %s
                        WHERE id = %s
                    ''', ('success', len(products), items_added, items_updated, items_skipped, log_id))
                    
                    cur.execute('''
                        UPDATE sync_settings
                        SET last_sync_at = CURRENT_TIMESTAMP, last_sync_status = %s
                        WHERE id = %s
                    ''', ('success', setting_id))
                    
                    conn.commit()
                    
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'isBase64Encoded': False,
                        'body': json.dumps({
                            'success': True,
                            'itemsProcessed': len(products),
                            'itemsAdded': items_added,
                            'itemsUpdated': items_updated,
                            'itemsSkipped': items_skipped
                        })
                    }
                
                except Exception as e:
                    error_msg = str(e)
                    cur.execute('''
                        UPDATE sync_logs
                        SET finished_at = CURRENT_TIMESTAMP, status = %s, error_message = %s
                        WHERE id = %s
                    ''', ('error', error_msg, log_id))
                    
                    cur.execute('''
                        UPDATE sync_settings
                        SET last_sync_status = %s
                        WHERE id = %s
                    ''', ('error', setting_id))
                    
                    conn.commit()
                    
                    return {
                        'statusCode': 500,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'isBase64Encoded': False,
                        'body': json.dumps({'error': error_msg})
                    }
            
            else:
                cur.execute('''
                    INSERT INTO sync_settings (
                        sync_type, is_active, source_url, schedule_minutes,
                        update_prices_only, settings
                    ) VALUES (%s, %s, %s, %s, %s, %s)
                    RETURNING id
                ''', (
                    body_data.get('syncType'),
                    body_data.get('isActive', False),
                    body_data.get('sourceUrl'),
                    body_data.get('scheduleMinutes', 60),
                    body_data.get('updatePricesOnly', False),
                    json.dumps(body_data.get('settings', {}))
                ))
                
                new_id = cur.fetchone()[0]
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'success': True, 'id': new_id})
                }
        
        # PUT - обновить настройку
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            setting_id = body_data.get('id')
            
            cur.execute('''
                UPDATE sync_settings
                SET sync_type = COALESCE(%s, sync_type),
                    is_active = COALESCE(%s, is_active),
                    source_url = COALESCE(%s, source_url),
                    schedule_minutes = COALESCE(%s, schedule_minutes),
                    update_prices_only = COALESCE(%s, update_prices_only),
                    settings = COALESCE(%s, settings),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
            ''', (
                body_data.get('syncType'),
                body_data.get('isActive'),
                body_data.get('sourceUrl'),
                body_data.get('scheduleMinutes'),
                body_data.get('updatePricesOnly'),
                json.dumps(body_data.get('settings')) if body_data.get('settings') else None,
                setting_id
            ))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'success': True})
            }
        
        # DELETE - удалить настройку
        elif method == 'DELETE':
            params = event.get('queryStringParameters') or {}
            setting_id = params.get('id')
            
            cur.execute('UPDATE sync_settings SET is_active = false WHERE id = %s', (setting_id,))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'success': True})
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    finally:
        cur.close()
        conn.close()
