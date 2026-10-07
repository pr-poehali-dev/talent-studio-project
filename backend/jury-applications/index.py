import json
import os
import uuid
from base64 import b64encode

import boto3
import psycopg2
import requests

from confirmation_pdf import build_confirmation_pdf

PLACES = {
    'grand_prix': 'Гран-при',
    'first_degree': 'Лауреат 1 степени',
    'second_degree': 'Лауреат 2 степени',
    'third_degree': 'Лауреат 3 степени',
}

IMAGE_REGEX = r'\.(jpe?g|jfif|png|webp|gif)(\?.*)?$'
DEFAULT_PRICE = 200
DEFAULT_RETURN_URL = 'https://preview--talent-studio-project.poehali.dev/?section=sostav'

CORS = {'Access-Control-Allow-Origin': '*'}


def resp(code: int, data) -> dict:
    return {
        'statusCode': code,
        'headers': {'Content-Type': 'application/json', **CORS},
        'body': json.dumps(data, ensure_ascii=False, default=str),
        'isBase64Encoded': False,
    }


def get_price(cur) -> int:
    cur.execute("SELECT value FROM site_settings WHERE key = 'jury_application_price'")
    row = cur.fetchone()
    try:
        return int(float(row[0])) if row else DEFAULT_PRICE
    except (ValueError, TypeError):
        return DEFAULT_PRICE


def handler(event: dict, context) -> dict:
    '''API заявок педагогов на вхождение в состав жюри: список конкурсов, случайные работы для оценки, цена, создание платежа и список заявок для админки.'''

    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                **CORS,
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Authorization',
                'Access-Control-Max-Age': '86400',
            },
            'body': '',
            'isBase64Encoded': False,
        }

    params = event.get('queryStringParameters') or {}
    action = params.get('action', 'list')

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    if method == 'GET':
        if action == 'price':
            price = get_price(cur)
            conn.close()
            return resp(200, {'price': price})

        if action == 'contests':
            cur.execute(
                """
                SELECT c.id, c.title, COUNT(a.id) AS cnt,
                       COALESCE(cc.name, 'Другие конкурсы') AS category_name
                FROM contests c
                JOIN applications a ON (a.contest_id = c.id OR (a.contest_id IS NULL AND a.contest_name = c.title))
                LEFT JOIN contest_categories cc ON cc.category_id = c.category_id
                WHERE a.deleted_at IS NULL AND a.work_file_url ~* %s
                GROUP BY c.id, c.title, cc.name
                HAVING COUNT(a.id) >= 3
                ORDER BY COALESCE(cc.name, 'Другие конкурсы'), c.title
                """,
                (IMAGE_REGEX,),
            )
            rows = cur.fetchall()
            conn.close()
            return resp(200, [{'id': r[0], 'title': r[1], 'works_count': r[2], 'category_name': r[3]} for r in rows])

        if action == 'works':
            try:
                contest_id = int(params.get('contest_id', ''))
            except ValueError:
                conn.close()
                return resp(400, {'error': 'contest_id is required'})
            cur.execute(
                """
                SELECT id, work_file_url, age, study_year, work_title
                FROM applications
                WHERE (contest_id = %s OR (contest_id IS NULL AND contest_name = (SELECT title FROM contests WHERE id = %s)))
                  AND deleted_at IS NULL AND work_file_url ~* %s
                ORDER BY random()
                LIMIT 3
                """,
                (contest_id, contest_id, IMAGE_REGEX),
            )
            rows = cur.fetchall()
            conn.close()
            return resp(200, [
                {'id': r[0], 'image_url': r[1], 'age': r[2], 'study_year': r[3], 'work_title': r[4]} for r in rows
            ])

        if action == 'confirmation':
            try:
                number = int(params.get('number', ''))
            except ValueError:
                conn.close()
                return resp(400, {'error': 'number is required'})
            cur.execute(
                """
                SELECT j.id, j.number, j.full_name, j.position, j.institution, j.location, j.participation_date, j.contest_name, j.confirmation_url, j.gender,
                       (SELECT c.category_id FROM contests c WHERE c.id = j.contest_id)
                FROM jury_applications j
                WHERE j.number = %s AND j.is_published = true
                """,
                (number,),
            )
            row = cur.fetchone()
            if not row:
                conn.close()
                return resp(404, {'error': 'Заявка не найдена'})
            if row[8]:
                conn.close()
                return resp(200, {'url': row[8]})
            item = dict(zip(['id', 'number', 'full_name', 'position', 'institution', 'location', 'participation_date', 'contest_name'], row[:8]))
            item['gender'] = row[9]
            item['category_id'] = row[10]
            pdf_bytes = build_confirmation_pdf(item)
            key = f"jury-confirmations/{item['number']}-{uuid.uuid4().hex[:8]}.pdf"
            s3 = boto3.client(
                's3',
                endpoint_url='https://bucket.poehali.dev',
                aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
                aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
            )
            s3.put_object(Bucket='files', Key=key, Body=pdf_bytes, ContentType='application/pdf')
            url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"
            cur.execute("UPDATE jury_applications SET confirmation_url = %s WHERE id = %s AND confirmation_url IS NULL", (url, item['id']))
            conn.commit()
            conn.close()
            return resp(200, {'url': url})

        if action == 'published':
            cur.execute(
                """
                SELECT number, full_name, institution, location, participation_date, contest_name, certificate_url
                FROM jury_applications
                WHERE is_published = true AND certificate_url IS NOT NULL AND certificate_url <> ''
                ORDER BY number
                """
            )
            pub_cols = ['number', 'full_name', 'institution', 'location', 'participation_date', 'contest_name', 'certificate_url']
            items = [dict(zip(pub_cols, r)) for r in cur.fetchall()]
            conn.close()
            return resp(200, items)

        cur.execute(
            """
            SELECT id, full_name, position, institution, location, email, contest_id,
                   contest_name, ratings, price, payment_status, payment_id, created_at, participation_date, is_viewed,
                   number, is_published, certificate_url, gender
            FROM jury_applications
            ORDER BY created_at DESC
            """
        )
        cols = ['id', 'full_name', 'position', 'institution', 'location', 'email', 'contest_id',
                'contest_name', 'ratings', 'price', 'payment_status', 'payment_id', 'created_at', 'participation_date', 'is_viewed',
                'number', 'is_published', 'certificate_url', 'gender']
        items = [dict(zip(cols, r)) for r in cur.fetchall()]
        conn.close()
        return resp(200, items)

    if method == 'POST':
        raw = event.get('body') or '{}'
        body = json.loads(raw) if raw.strip() else {}

        if action == 'view':
            try:
                app_id = int(body.get('id'))
            except (ValueError, TypeError):
                conn.close()
                return resp(400, {'error': 'id is required'})
            cur.execute("UPDATE jury_applications SET is_viewed = true WHERE id = %s", (app_id,))
            conn.commit()
            conn.close()
            return resp(200, {'ok': True})

        if action == 'update':
            try:
                app_id = int(body.get('id'))
            except (ValueError, TypeError):
                conn.close()
                return resp(400, {'error': 'id is required'})
            vals = {k: str(body.get(k) or '').strip() for k in ('full_name', 'position', 'institution', 'email', 'contest_name')}
            if not vals['full_name']:
                conn.close()
                return resp(400, {'error': 'ФИО обязательно'})
            pdate = str(body.get('participation_date') or '').strip() or None
            cur.execute(
                "UPDATE jury_applications SET full_name = %s, position = %s, institution = %s, email = %s, contest_name = %s, participation_date = %s, confirmation_url = NULL WHERE id = %s",
                (vals['full_name'], vals['position'], vals['institution'], vals['email'], vals['contest_name'], pdate, app_id),
            )
            conn.commit()
            conn.close()
            return resp(200, {'ok': True})

        if action == 'gender':
            try:
                app_id = int(body.get('id'))
            except (ValueError, TypeError):
                conn.close()
                return resp(400, {'error': 'id is required'})
            gender = body.get('gender')
            if gender not in ('M', 'F'):
                conn.close()
                return resp(400, {'error': 'gender must be M or F'})
            cur.execute("UPDATE jury_applications SET gender = %s, confirmation_url = NULL WHERE id = %s", (gender, app_id))
            conn.commit()
            conn.close()
            return resp(200, {'ok': True})

        if action == 'publish':
            try:
                app_id = int(body.get('id'))
            except (ValueError, TypeError):
                conn.close()
                return resp(400, {'error': 'id is required'})
            is_published = bool(body.get('is_published'))
            certificate_url = (body.get('certificate_url') or '').strip() or None
            if is_published and not certificate_url:
                conn.close()
                return resp(400, {'error': 'Прикрепите файл сертификата перед публикацией'})
            if is_published:
                cur.execute("SELECT gender FROM jury_applications WHERE id = %s", (app_id,))
                g = cur.fetchone()
                if not g or g[0] not in ('M', 'F'):
                    conn.close()
                    return resp(400, {'error': 'Сначала укажите пол'})
            cur.execute(
                "UPDATE jury_applications SET is_published = %s, certificate_url = %s WHERE id = %s",
                (is_published, certificate_url, app_id),
            )
            conn.commit()
            conn.close()
            return resp(200, {'ok': True})

        if action == 'price':
            try:
                new_price = int(float(body.get('price')))
            except (ValueError, TypeError):
                conn.close()
                return resp(400, {'error': 'price must be a number'})
            if new_price < 1:
                conn.close()
                return resp(400, {'error': 'price must be positive'})
            cur.execute(
                "INSERT INTO site_settings (key, value, updated_at) VALUES ('jury_application_price', %s, NOW()) "
                "ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()",
                (str(new_price),),
            )
            conn.commit()
            conn.close()
            return resp(200, {'ok': True, 'price': new_price})

        full_name = (body.get('full_name') or '').strip()
        position = (body.get('position') or '').strip()
        institution = (body.get('institution') or '').strip()
        location = ''
        email = (body.get('email') or '').strip()
        contest_id = body.get('contest_id')
        participation_date = (body.get('participation_date') or '').strip()
        ratings_in = body.get('ratings') or []

        if not all([full_name, position, institution, email, contest_id, participation_date]):
            conn.close()
            return resp(400, {'error': 'Заполните все поля заявки'})

        if not isinstance(ratings_in, list) or len(ratings_in) != 3:
            conn.close()
            return resp(400, {'error': 'Нужно оценить 3 работы'})

        cur.execute("SELECT title FROM contests WHERE id = %s", (int(contest_id),))
        contest_row = cur.fetchone()
        if not contest_row:
            conn.close()
            return resp(400, {'error': 'Конкурс не найден'})
        contest_name = contest_row[0]

        ratings = []
        for item in ratings_in:
            place = item.get('place')
            if place not in PLACES:
                conn.close()
                return resp(400, {'error': 'Выберите место для каждой работы'})
            cur.execute(
                "SELECT id, work_file_url, age, study_year, work_title FROM applications "
                "WHERE id = %s AND (contest_id = %s OR (contest_id IS NULL AND contest_name = %s))",
                (int(item.get('work_id')), int(contest_id), contest_name),
            )
            w = cur.fetchone()
            if not w:
                conn.close()
                return resp(400, {'error': 'Работа не найдена'})
            ratings.append({
                'work_id': w[0],
                'image_url': w[1],
                'age': w[2],
                'study_year': w[3],
                'work_title': w[4],
                'place': place,
                'place_label': PLACES[place],
            })

        price = get_price(cur)
        conn.close()

        shop_id = os.environ.get('YOOKASSA_SHOP_ID')
        secret_key = os.environ.get('YOOKASSA_SECRET_KEY')
        if not shop_id or not secret_key:
            return resp(500, {'error': 'YooKassa credentials not configured'})

        pending_id = str(uuid.uuid4())
        pending_data = {
            'type': 'jury',
            'jury_application': {
                'full_name': full_name,
                'position': position,
                'institution': institution,
                'location': location,
                'email': email,
                'contest_id': int(contest_id),
                'contest_name': contest_name,
                'participation_date': participation_date,
                'ratings': ratings,
                'price': price,
            },
        }

        s3 = boto3.client(
            's3',
            endpoint_url='https://bucket.poehali.dev',
            aws_access_key_id=os.environ.get('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.environ.get('AWS_SECRET_ACCESS_KEY'),
        )
        s3.put_object(
            Bucket='files',
            Key=f'pending_applications/{pending_id}.json',
            Body=json.dumps(pending_data, ensure_ascii=False),
            ContentType='application/json',
        )

        auth_header = b64encode(f'{shop_id}:{secret_key}'.encode()).decode()
        payment_data = {
            'amount': {'value': f'{price:.2f}', 'currency': 'RUB'},
            'confirmation': {
                'type': 'redirect',
                'return_url': body.get('return_url') or DEFAULT_RETURN_URL,
            },
            'capture': True,
            'description': f'Заявка на вхождение в состав жюри: {contest_name}'[:128],
            'metadata': {'pending_id': pending_id, 'type': 'jury'},
            'receipt': {
                'customer': {'email': email},
                'items': [{
                    'description': 'Заявка на вхождение в состав жюри',
                    'quantity': '1',
                    'amount': {'value': f'{price:.2f}', 'currency': 'RUB'},
                    'vat_code': 1,
                }],
            },
        }
        r = requests.post(
            'https://api.yookassa.ru/v3/payments',
            json=payment_data,
            headers={
                'Authorization': f'Basic {auth_header}',
                'Idempotence-Key': str(uuid.uuid4()),
                'Content-Type': 'application/json',
            },
        )
        if r.status_code in (200, 201):
            pr = r.json()
            return resp(200, {
                'payment_id': pr['id'],
                'confirmation_url': pr['confirmation']['confirmation_url'],
                'pending_id': pending_id,
            })
        return resp(r.status_code, {'error': r.text})

    conn.close()
    return resp(405, {'error': 'Method not allowed'})
