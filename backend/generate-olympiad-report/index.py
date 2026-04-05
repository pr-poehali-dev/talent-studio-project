import json
import os
import base64
import psycopg2
from io import BytesIO
from datetime import datetime
import urllib.request

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
}

OLYMPIAD_NAMES = {
    'palette': 'Палитра талантов',
    'grani': 'Грани творчества',
}

STATUS_LABELS = {
    'new': 'Новая',
    'viewed': 'Просмотрена',
    'sent': 'Отправлена',
}

FONT_REGULAR_URL = 'https://cdn.jsdelivr.net/gh/dejavu-fonts/dejavu-fonts@master/ttf/DejaVuSans.ttf'
FONT_BOLD_URL = 'https://cdn.jsdelivr.net/gh/dejavu-fonts/dejavu-fonts@master/ttf/DejaVuSans-Bold.ttf'
FONT_REGULAR_PATH = '/tmp/DejaVuSans.ttf'
FONT_BOLD_PATH = '/tmp/DejaVuSans-Bold.ttf'

def ensure_fonts():
    for path, url in [(FONT_REGULAR_PATH, FONT_REGULAR_URL), (FONT_BOLD_PATH, FONT_BOLD_URL)]:
        if not os.path.exists(path):
            print(f'[FONT] Downloading {url} -> {path}')
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=20) as r, open(path, 'wb') as f:
                f.write(r.read())
            print(f'[FONT] Done: {path} ({os.path.getsize(path)} bytes)')
        else:
            print(f'[FONT] Cached: {path}')

def handler(event: dict, context) -> dict:
    """Генерирует PDF-отчёт по заявке олимпиады с ответами участника"""

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    params = event.get('queryStringParameters') or {}
    app_id = params.get('app_id')

    if not app_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'app_id is required'})
        }

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    conn.autocommit = True
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, full_name, age, study_year, teacher, institution,
               work_title, email, olympiad_type, status, payment_status,
               created_at, payment_id, olympiad_status
        FROM olympiad_applications
        WHERE id = %s AND deleted_at IS NULL
    """, (app_id,))
    app_row = cursor.fetchone()
    if not app_row:
        cursor.close(); conn.close()
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Заявка не найдена'})
        }

    app = {
        'id': app_row[0], 'full_name': app_row[1], 'age': app_row[2],
        'study_year': app_row[3], 'teacher': app_row[4], 'institution': app_row[5],
        'work_title': app_row[6], 'email': app_row[7], 'olympiad_type': app_row[8],
        'status': app_row[9], 'payment_status': app_row[10],
        'created_at': app_row[11], 'payment_id': app_row[12],
    }

    cursor.execute("""
        SELECT oa.task_id, oa.answer, ot.question, ot.correct_answer, ot.task_type, ot.sort_order
        FROM olympiad_answers oa
        LEFT JOIN olympiad_tasks ot ON oa.task_id = ot.id
        WHERE oa.payment_id = %s AND oa.olympiad_type = %s
        ORDER BY ot.sort_order ASC, oa.task_id ASC
    """, (app['payment_id'], app['olympiad_type']))
    answer_rows = cursor.fetchall()
    cursor.close(); conn.close()

    answers = []
    for row in answer_rows:
        task_type = row[4] or 'quiz'
        given = row[1] or ''
        correct = row[3] or ''
        if task_type == 'wordsearch':
            is_correct = given == '__wordsearch_done__'
        else:
            is_correct = given.strip().lower() == correct.strip().lower() if correct else None
        answers.append({
            'task_id': row[0], 'answer': given, 'question': (row[2] or '').replace('\n', ' ').strip(),
            'correct_answer': correct, 'task_type': task_type, 'is_correct': is_correct,
        })

    total = len(answers)
    correct_count = sum(1 for a in answers if a['is_correct'] is True)
    wrong_count = sum(1 for a in answers if a['is_correct'] is False)
    wordsearch_done = sum(1 for a in answers if a['task_type'] == 'wordsearch' and a['is_correct'])

    # Загрузка шрифтов
    ensure_fonts()

    from fpdf import FPDF

    class PDF(FPDF):
        def header(self):
            pass
        def footer(self):
            self.set_y(-15)
            self.set_font('PTSerif', '', 8)
            self.set_text_color(160, 160, 160)
            self.cell(0, 10, f'Сформировано: {datetime.now().strftime("%d.%m.%Y %H:%M")}', align='C')

    pdf = PDF(orientation='P', unit='mm', format='A4')
    pdf.add_font('PTSerif', '', FONT_REGULAR_PATH)
    pdf.add_font('PTSerif', 'B', FONT_BOLD_PATH)
    pdf.set_auto_page_break(auto=True, margin=20)
    pdf.add_page()
    pdf.set_margins(20, 20, 20)

    W = 170  # ширина контента

    # ===== Заголовок =====
    pdf.set_font('PTSerif', 'B', 18)
    pdf.set_text_color(26, 26, 26)
    pdf.cell(W, 10, 'ОТЧЁТ ОБ УЧАСТИИ В ОЛИМПИАДЕ', align='C', new_x='LMARGIN', new_y='NEXT')
    pdf.set_font('PTSerif', '', 12)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(W, 8, OLYMPIAD_NAMES.get(app['olympiad_type'], app['olympiad_type']), align='C', new_x='LMARGIN', new_y='NEXT')
    pdf.set_draw_color(254, 215, 170)
    pdf.set_line_width(0.8)
    pdf.line(20, pdf.get_y() + 3, 190, pdf.get_y() + 3)
    pdf.ln(8)

    # ===== Данные участника =====
    pdf.set_font('PTSerif', 'B', 13)
    pdf.set_text_color(194, 65, 12)
    pdf.cell(W, 8, 'Данные участника', new_x='LMARGIN', new_y='NEXT')
    pdf.ln(2)

    fields = [
        ('ФИО участника', app['full_name']),
        ('Возраст', f"{app['age']} лет"),
        ('Год обучения', f"{app['study_year']} год"),
        ('Название работы', app['work_title']),
        ('Email', app['email']),
        ('Педагог', app['teacher'] or '—'),
        ('Учреждение', app['institution'] or '—'),
        ('Дата регистрации', app['created_at'].strftime('%d.%m.%Y %H:%M') if app['created_at'] else '—'),
        ('Статус заявки', STATUS_LABELS.get(app['status'], app['status'])),
    ]

    for label, value in fields:
        x = pdf.get_x()
        y = pdf.get_y()
        pdf.set_fill_color(255, 247, 237)
        pdf.rect(x, y, 55, 8, 'F')
        pdf.set_draw_color(229, 231, 235)
        pdf.rect(x, y, W, 8)
        pdf.set_font('PTSerif', 'B', 9)
        pdf.set_text_color(55, 65, 81)
        pdf.set_xy(x + 2, y + 1)
        pdf.cell(51, 6, label)
        pdf.set_font('PTSerif', '', 9)
        pdf.set_text_color(26, 26, 26)
        pdf.set_xy(x + 57, y + 1)
        pdf.cell(W - 57, 6, str(value)[:80])
        pdf.set_xy(x, y + 8)
        pdf.ln(0)

    pdf.ln(10)

    # ===== Статистика =====
    pdf.set_font('PTSerif', 'B', 13)
    pdf.set_text_color(194, 65, 12)
    pdf.cell(W, 8, 'Результаты олимпиады', new_x='LMARGIN', new_y='NEXT')
    pdf.ln(3)

    col_w = W / 4
    stat_blocks = [
        ('Всего заданий', str(total), (243, 244, 246), (26, 26, 26)),
        ('Правильных', str(correct_count), (220, 252, 231), (21, 128, 61)),
        ('Неправильных', str(wrong_count), (254, 226, 226), (220, 38, 38)),
        ('Искалок выполнено', str(wordsearch_done), (219, 234, 254), (29, 78, 216)),
    ]
    y0 = pdf.get_y()
    for i, (lbl, val, bg, fg) in enumerate(stat_blocks):
        x0 = 20 + i * col_w
        pdf.set_fill_color(*bg)
        pdf.set_draw_color(229, 231, 235)
        pdf.rect(x0, y0, col_w, 20, 'FD')
        pdf.set_font('PTSerif', 'B', 20)
        pdf.set_text_color(*fg)
        pdf.set_xy(x0, y0 + 1)
        pdf.cell(col_w, 10, val, align='C')
        pdf.set_font('PTSerif', '', 8)
        pdf.set_text_color(100, 100, 100)
        pdf.set_xy(x0, y0 + 12)
        pdf.cell(col_w, 6, lbl, align='C')

    pdf.set_xy(20, y0 + 22)
    pdf.ln(8)

    # ===== Детальные ответы =====
    if answers:
        pdf.set_font('PTSerif', 'B', 13)
        pdf.set_text_color(194, 65, 12)
        pdf.cell(W, 8, 'Детальный отчёт по заданиям', new_x='LMARGIN', new_y='NEXT')
        pdf.ln(3)

        for i, ans in enumerate(answers, 1):
            is_ws = ans['task_type'] == 'wordsearch'
            correct = ans['is_correct']

            if correct is True:
                bg = (240, 253, 244); badge = 'Верно'; badge_color = (21, 128, 61)
            elif correct is False:
                bg = (254, 242, 242); badge = 'Неверно'; badge_color = (220, 38, 38)
            else:
                bg = (255, 251, 235); badge = 'Нет ответа'; badge_color = (146, 64, 14)

            # Определяем высоту строки
            q_text = ans['question'][:150] + ('...' if len(ans['question']) > 150 else '')
            row_h = 22 if not is_ws else 16

            if pdf.get_y() + row_h > 270:
                pdf.add_page()

            x = 20; y = pdf.get_y()

            # Фон строки
            pdf.set_fill_color(*bg)
            pdf.set_draw_color(229, 231, 235)
            pdf.rect(x, y, W, row_h, 'FD')

            # Номер
            pdf.set_font('PTSerif', 'B', 9)
            pdf.set_text_color(55, 65, 81)
            pdf.set_xy(x + 2, y + 2)
            pdf.cell(10, 5, f'#{i}')

            # Вопрос
            pdf.set_font('PTSerif', '', 8)
            pdf.set_text_color(26, 26, 26)
            pdf.set_xy(x + 13, y + 2)
            pdf.multi_cell(W - 13 - 28, 4.5, q_text, max_line_height=4.5)

            # Бейдж
            pdf.set_font('PTSerif', 'B', 8)
            pdf.set_text_color(*badge_color)
            pdf.set_xy(x + W - 26, y + 2)
            pdf.cell(24, 5, badge, align='C')

            if not is_ws:
                given_text = ans['answer'] if ans['answer'] else '—'
                correct_text = ans['correct_answer'] if ans['correct_answer'] else '—'

                pdf.set_font('PTSerif', '', 7.5)
                pdf.set_text_color(107, 114, 128)
                pdf.set_xy(x + 13, y + row_h - 8)
                pdf.cell(20, 4, 'Ответ:')
                pdf.set_text_color(26, 26, 26)
                pdf.cell(60, 4, given_text[:50])

                if ans['correct_answer']:
                    pdf.set_text_color(107, 114, 128)
                    pdf.cell(22, 4, 'Правильно:')
                    pdf.set_font('PTSerif', 'B', 7.5)
                    pdf.set_text_color(21, 128, 61)
                    pdf.cell(50, 4, correct_text[:50])
            else:
                given_label = 'Все слова найдены' if ans['answer'] == '__wordsearch_done__' else 'Не завершено'
                pdf.set_font('PTSerif', '', 7.5)
                pdf.set_text_color(107, 114, 128)
                pdf.set_xy(x + 13, y + row_h - 6)
                pdf.cell(20, 4, 'Результат:')
                pdf.set_text_color(26, 26, 26)
                pdf.cell(60, 4, given_label)

            pdf.set_xy(20, y + row_h + 2)

    # Генерируем PDF
    pdf_bytes = bytes(pdf.output())
    pdf_b64 = base64.b64encode(pdf_bytes).decode('utf-8')

    safe_name = app['full_name'].replace(' ', '_')
    filename = f"olympiad_report_{safe_name}_{app['id']}.pdf"

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