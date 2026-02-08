import json
import os
import base64
import boto3
import uuid
from datetime import datetime

def handler(event: dict, context) -> dict:
    """API для загрузки файлов в S3 хранилище"""
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Authorization'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        body = json.loads(event.get('body', '{}'))
        file_base64 = body.get('file')
        file_name = body.get('fileName')
        file_type = body.get('fileType', 'application/pdf')
        folder = body.get('folder', 'contests')
        
        if not file_base64 or not file_name:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Отсутствует файл или имя файла'}),
                'isBase64Encoded': False
            }
        
        file_data = base64.b64decode(file_base64)
        
        file_extension = file_name.split('.')[-1] if '.' in file_name else 'pdf'
        unique_file_name = f"{folder}/{uuid.uuid4()}.{file_extension}"
        
        s3 = boto3.client('s3',
            endpoint_url='https://bucket.poehali.dev',
            aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
            aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
        )
        
        s3.put_object(
            Bucket='files',
            Key=unique_file_name,
            Body=file_data,
            ContentType=file_type
        )
        
        cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{unique_file_name}"
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'url': cdn_url,
                'fileName': file_name,
                'message': 'Файл успешно загружен'
            }),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
