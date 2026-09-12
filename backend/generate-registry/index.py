import json
import os
import base64
import urllib.request
import psycopg2
from psycopg2.extras import RealDictCursor
from io import BytesIO
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor, black, white
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from datetime import date


RESULT_LABELS = {
    'grand_prix': 'Гран-При',
    'first_degree': 'Диплом I степени',
    'second_degree': 'Диплом II степени',
    'third_degree': 'Диплом III степени',
    'laureate_1': 'Лауреат I степени',
    'laureate_2': 'Лауреат II степени',
    'laureate_3': 'Лауреат III степени',
    'participant': 'Участник',
}

MONTHS_RU = [
    'январь', 'февраль', 'март', 'апрель', 'май', 'июнь',
    'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'
]

LOGO_URL = 'https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/cb267483-96ab-40f3-ae87-4f18740f3e6e.png'
SIGN_STAMP_URL = 'https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/57089395-3617-4837-8eb4-5a611478b79f.png'

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
}

_img_cache: dict = {}


def fetch_image(url: str) -> BytesIO:
    if url in _img_cache:
        return BytesIO(_img_cache[url])
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=15) as resp:
        data = resp.read()
    _img_cache[url] = data
    return BytesIO(data)


_fonts_registered = False

SYSTEM_FONT_CANDIDATES = [
    ('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'),
    ('/usr/share/fonts/dejavu/DejaVuSans.ttf', '/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf'),
    ('/usr/share/fonts/liberation/LiberationSans-Regular.ttf', '/usr/share/fonts/liberation/LiberationSans-Bold.ttf'),
    ('/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf', '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'),
    ('/usr/share/fonts/truetype/freefont/FreeSans.ttf', '/usr/share/fonts/truetype/freefont/FreeSansBold.ttf'),
]


def ensure_fonts():
    global _fonts_registered
    if _fonts_registered:
        return
    for regular_path, bold_path in SYSTEM_FONT_CANDIDATES:
        if os.path.exists(regular_path) and os.path.exists(bold_path):
            pdfmetrics.registerFont(TTFont('DejaVu', regular_path))
            pdfmetrics.registerFont(TTFont('DejaVu-Bold', bold_path))
            _fonts_registered = True
            return
    raise RuntimeError('No suitable Cyrillic TTF font found')


def build_pdf(rows: list, month: int, year: int) -> bytes:
    ensure_fonts()
    F, FB = 'DejaVu', 'DejaVu-Bold'

    buffer = BytesIO()
    pagesize = landscape(A4)
    doc = SimpleDocTemplate(
        buffer, pagesize=pagesize,
        leftMargin=12 * mm, rightMargin=12 * mm, topMargin=10 * mm, bottomMargin=10 * mm,
    )
    width, _ = pagesize
    usable_width = width - 24 * mm
    styles = getSampleStyleSheet()

    def S(name, **kw):
        return ParagraphStyle(name, parent=styles['Normal'], **kw)

    approve_label_style = S('AL', fontSize=14, fontName=FB, alignment=TA_CENTER)
    approve_text_style = S('AT', fontSize=10, fontName=F, alignment=TA_CENTER, leading=13)
    approve_name_style = S('AN', fontSize=12, fontName=FB, alignment=TA_CENTER)

    title_style = S('T', fontSize=22, fontName=FB, alignment=TA_CENTER, leading=27, spaceAfter=2 * mm)
    subtitle_style = S('ST', fontSize=14, fontName=F, alignment=TA_CENTER, spaceAfter=5 * mm)

    cell_style = S('C', fontSize=9, fontName=F, leading=11)
    header_cell_style = S('HC', fontSize=9, fontName=FB, alignment=TA_CENTER, leading=11, textColor=white)

    story = []

    try:
        logo_img = Image(fetch_image(LOGO_URL), width=95 * mm, height=95 * mm, kind='proportional')
    except Exception:
        logo_img = Spacer(1, 95 * mm)

    try:
        sign_img = Image(fetch_image(SIGN_STAMP_URL), width=32 * mm, height=32 * mm, kind='proportional')
    except Exception:
        sign_img = Spacer(1, 32 * mm)

    approve_block = [
        Paragraph('УТВЕРЖДАЮ', approve_label_style),
        Paragraph('Руководитель Студии талантов<br/>«Мечтай, твори, дерзай!»', approve_text_style),
        Spacer(1, 2 * mm),
        Paragraph('Мозжерина Анна Владимировна', approve_name_style),
        sign_img,
    ]

    header_table = Table(
        [[logo_img, approve_block]],
        colWidths=[usable_width * 0.6, usable_width * 0.4],
    )
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('ALIGN', (0, 0), (0, 0), 'LEFT'),
        ('ALIGN', (1, 0), (1, 0), 'CENTER'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 4 * mm))

    month_name = MONTHS_RU[month - 1]
    story.append(Paragraph('РЕЕСТР', title_style))
    story.append(Paragraph(
        f'сведений об участниках и результатах за {month_name} {year} года',
        subtitle_style
    ))

    header_row = [
        Paragraph('№', header_cell_style),
        Paragraph('Дата<br/>вручения', header_cell_style),
        Paragraph('ФИО участника', header_cell_style),
        Paragraph('Возраст', header_cell_style),
        Paragraph('Конкурс / олимпиада', header_cell_style),
        Paragraph('Результат', header_cell_style),
        Paragraph('Педагог', header_cell_style),
        Paragraph('Учреждение', header_cell_style),
    ]

    data = [header_row]
    for i, r in enumerate(rows, start=1):
        issued = r.get('diploma_issued_at') or ''
        try:
            issued_str = date.fromisoformat(str(issued)[:10]).strftime('%d.%m.%Y')
        except Exception:
            issued_str = '—'
        data.append([
            Paragraph(str(i), cell_style),
            Paragraph(issued_str, cell_style),
            Paragraph(r.get('full_name') or '—', cell_style),
            Paragraph(str(r.get('age') or '—'), cell_style),
            Paragraph(r.get('contest_name') or '—', cell_style),
            Paragraph(RESULT_LABELS.get(r.get('result'), r.get('result') or '—'), cell_style),
            Paragraph(r.get('teacher') or '—', cell_style),
            Paragraph(r.get('institution') or '—', cell_style),
        ])

    fixed_widths_mm = [10, 24, 40, 22, 45, 32, 45]
    col_widths = [w * mm for w in fixed_widths_mm]
    col_widths.append(usable_width - sum(col_widths))

    table = Table(data, colWidths=col_widths, repeatRows=1)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), HexColor('#1a1a2e')),
        ('GRID', (0, 0), (-1, -1), 0.5, black),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 2 * mm),
        ('RIGHTPADDING', (0, 0), (-1, -1), 2 * mm),
        ('TOPPADDING', (0, 0), (-1, -1), 1.5 * mm),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 1.5 * mm),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [white, HexColor('#f5f5f5')]),
    ]))
    story.append(table)

    doc.build(story)
    return buffer.getvalue()


def handler(event: dict, context) -> dict:
    '''Генерация PDF-реестра сведений об участниках и результатах за выбранный месяц и год'''
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
        }

    params = event.get('queryStringParameters') or {}
    month_raw = params.get('month')
    year_raw = params.get('year')

    if not month_raw or not year_raw:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Parameters month and year are required'}),
        }

    try:
        month = int(month_raw)
        year = int(year_raw)
        if month < 1 or month > 12:
            raise ValueError
    except ValueError:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid month or year'}),
        }

    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                "SELECT full_name, age, teacher, institution, contest_name, result, diploma_issued_at "
                "FROM results "
                "WHERE diploma_issued_at IS NOT NULL "
                "AND EXTRACT(MONTH FROM diploma_issued_at) = %s "
                "AND EXTRACT(YEAR FROM diploma_issued_at) = %s "
                "ORDER BY diploma_issued_at ASC",
                (month, year)
            )
            rows = [dict(r) for r in cur.fetchall()]
    finally:
        conn.close()

    for r in rows:
        if r.get('diploma_issued_at'):
            r['diploma_issued_at'] = r['diploma_issued_at'].isoformat()

    pdf_bytes = build_pdf(rows, month, year)
    pdf_b64 = base64.b64encode(pdf_bytes).decode('utf-8')

    filename = f'reestr_{month:02d}_{year}.pdf'

    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/pdf',
            'Content-Disposition': f'attachment; filename="{filename}"',
            'Access-Control-Allow-Origin': '*',
        },
        'body': pdf_b64,
        'isBase64Encoded': True,
    }