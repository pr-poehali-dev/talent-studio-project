import json
import os
import io
import uuid
import urllib.request
import boto3
from PIL import Image

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}

def handler(event: dict, context) -> dict:
    """Поворот изображения на 90° по часовой стрелке и сохранение в S3"""

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    body = json.loads(event.get('body') or '{}')
    image_url = body.get('image_url', '')

    if not image_url:
        return {
            'statusCode': 400,
            'headers': CORS_HEADERS,
            'body': json.dumps({'error': 'image_url is required'}),
        }

    req = urllib.request.Request(image_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=30) as resp:
        img_data = resp.read()

    img = Image.open(io.BytesIO(img_data))
    img = img.rotate(-90, expand=True)

    ext = image_url.split('?')[0].rsplit('.', 1)[-1].lower()
    fmt = 'PNG' if ext == 'png' else 'JPEG'
    mime = 'image/png' if ext == 'png' else 'image/jpeg'
    suffix = ext if ext in ('png', 'jpg', 'jpeg') else 'jpg'

    out = io.BytesIO()
    img.save(out, format=fmt, quality=92)
    out.seek(0)

    key = f"works/rotated_{uuid.uuid4()}.{suffix}"

    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )
    s3.put_object(Bucket='files', Key=key, Body=out.read(), ContentType=mime)

    cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"

    return {
        'statusCode': 200,
        'headers': CORS_HEADERS,
        'body': json.dumps({'url': cdn_url}),
    }
