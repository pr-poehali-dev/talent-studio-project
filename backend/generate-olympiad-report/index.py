import json
import os
import base64
import psycopg2
from io import BytesIO
from datetime import datetime

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

def get_font_paths():
    """Берём DejaVuSans из пакета matplotlib — он всегда там есть"""
    import matplotlib
    mpl_data = matplotlib.get_data_path()
    regular = os.path.join(mpl_data, 'fonts', 'ttf', 'DejaVuSans.ttf')
    bold = os.path.join(mpl_data, 'fonts', 'ttf', 'DejaVuSans-Bold.ttf')
    print(f'[FONT] regular={regular} exists={os.path.exists(regular)}')
    print(f'[FONT] bold={bold} exists={os.path.exists(bold)}')
    return regular, bold

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
               created_at, payment_id
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
            'task_id': row[0], 'answer': given,
            'question': (row[2] or '').replace('\n', ' ').strip(),
            'correct_answer': correct, 'task_type': task_type, 'is_correct': is_correct,
        })

    total = len(answers)
    correct_count = sum(1 for a in answers if a['is_correct'] is True)
    wrong_count = sum(1 for a in answers if a['is_correct'] is False)
    wordsearch_done = sum(1 for a in answers if a['task_type'] == 'wordsearch' and a['is_correct'])

    # ===== PDF =====
    from reportlab.lib.pagesizes import A4
    from reportlab.lib import colors
    from reportlab.lib.units import cm
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
    from reportlab.lib.styles import ParagraphStyle
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    from reportlab.lib.enums import TA_CENTER, TA_LEFT

    font_regular, font_bold = get_font_paths()

    pdfmetrics.registerFont(TTFont('R', font_regular))
    pdfmetrics.registerFont(TTFont('B', font_bold))

    def ps(name, font='R', size=9, align=TA_LEFT, color='#1a1a1a', space_after=3, leading=13):
        return ParagraphStyle(name, fontName=font, fontSize=size,
                              alignment=align, textColor=colors.HexColor(color),
                              spaceAfter=space_after, leading=leading)

    title_s  = ps('title',  'B', 16, TA_CENTER, '#1a1a1a', 4, 20)
    sub_s    = ps('sub',    'R', 11, TA_CENTER, '#666666', 10, 14)
    sec_s    = ps('sec',    'B', 12, TA_LEFT,   '#c2410c', 4, 15)
    lbl_s    = ps('lbl',    'B', 9,  TA_LEFT,   '#374151', 2, 11)
    val_s    = ps('val',    'R', 9,  TA_LEFT,   '#1a1a1a', 2, 11)
    body_s   = ps('body',   'R', 8,  TA_LEFT,   '#1a1a1a', 2, 11)
    small_s  = ps('small',  'R', 7.5,TA_LEFT,   '#6b7280', 1, 10)
    corr_s   = ps('corr',   'B', 8,  TA_LEFT,   '#15803d', 2, 11)
    wrong_s  = ps('wrongv', 'R', 8,  TA_LEFT,   '#1a1a1a', 2, 11)
    num_s    = ps('num',    'B', 20, TA_CENTER,  '#1a1a1a', 2, 24)
    num_g_s  = ps('num_g',  'B', 20, TA_CENTER,  '#15803d', 2, 24)
    num_r_s  = ps('num_r',  'B', 20, TA_CENTER,  '#dc2626', 2, 24)
    num_b_s  = ps('num_b',  'B', 20, TA_CENTER,  '#1d4ed8', 2, 24)
    cap_s    = ps('cap',    'R', 8,  TA_CENTER,  '#6b7280', 2, 10)

    buf = BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4,
                            leftMargin=2*cm, rightMargin=2*cm,
                            topMargin=2*cm, bottomMargin=2.5*cm)

    story = []

    # Заголовок
    story += [
        Paragraph('ОТЧЁТ ОБ УЧАСТИИ В ОЛИМПИАДЕ', title_s),
        Paragraph(OLYMPIAD_NAMES.get(app['olympiad_type'], app['olympiad_type']), sub_s),
        HRFlowable(width='100%', thickness=1, color=colors.HexColor('#fed7aa')),
        Spacer(1, 8),
    ]

    # Данные участника
    story.append(Paragraph('Данные участника', sec_s))
    story.append(Spacer(1, 4))

    fields = [
        ('ФИО участника',    app['full_name']),
        ('Возраст',          f"{app['age']} лет"),
        ('Год обучения',     f"{app['study_year']} год"),
        ('Название работы',  app['work_title']),
        ('Email',            app['email']),
        ('Педагог',          app['teacher'] or '—'),
        ('Учреждение',       app['institution'] or '—'),
        ('Дата регистрации', app['created_at'].strftime('%d.%m.%Y %H:%M') if app['created_at'] else '—'),
        ('Статус заявки',    STATUS_LABELS.get(app['status'], app['status'])),
    ]
    pt = Table(
        [[Paragraph(l, lbl_s), Paragraph(str(v)[:100], val_s)] for l, v in fields],
        colWidths=[5*cm, 11.7*cm]
    )
    pt.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#fff7ed')),
        ('GRID',       (0, 0), (-1,-1), 0.5, colors.HexColor('#e5e7eb')),
        ('VALIGN',     (0, 0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1,-1), 5),
        ('BOTTOMPADDING',(0,0),(-1,-1), 5),
        ('LEFTPADDING',(0, 0), (-1,-1), 7),
        ('RIGHTPADDING',(0,0), (-1,-1), 7),
    ]))
    story += [pt, Spacer(1, 12)]

    # Статистика
    story.append(Paragraph('Результаты олимпиады', sec_s))
    story.append(Spacer(1, 4))

    stat = Table([
        [Paragraph(str(total), num_s),   Paragraph(str(correct_count), num_g_s),
         Paragraph(str(wrong_count), num_r_s), Paragraph(str(wordsearch_done), num_b_s)],
        [Paragraph('Всего заданий', cap_s), Paragraph('Правильных', cap_s),
         Paragraph('Неправильных', cap_s), Paragraph('Искалок выполнено', cap_s)],
    ], colWidths=[4.175*cm]*4)
    stat.setStyle(TableStyle([
        ('BACKGROUND', (0,0),(0,-1), colors.HexColor('#f3f4f6')),
        ('BACKGROUND', (1,0),(1,-1), colors.HexColor('#dcfce7')),
        ('BACKGROUND', (2,0),(2,-1), colors.HexColor('#fee2e2')),
        ('BACKGROUND', (3,0),(3,-1), colors.HexColor('#dbeafe')),
        ('GRID',       (0,0),(-1,-1), 0.5, colors.HexColor('#e5e7eb')),
        ('ALIGN',      (0,0),(-1,-1), 'CENTER'),
        ('VALIGN',     (0,0),(-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0),(-1,-1), 6),
        ('BOTTOMPADDING',(0,0),(-1,-1), 6),
    ]))
    story += [stat, Spacer(1, 14)]

    # Детальные ответы
    if answers:
        story.append(Paragraph('Детальный отчёт по заданиям', sec_s))
        story.append(Spacer(1, 4))

        for i, ans in enumerate(answers, 1):
            is_ws = ans['task_type'] == 'wordsearch'
            if ans['is_correct'] is True:
                row_bg = colors.HexColor('#f0fdf4')
                badge_txt = '✓ Верно'
                badge_col = colors.HexColor('#15803d')
            elif ans['is_correct'] is False:
                row_bg = colors.HexColor('#fef2f2')
                badge_txt = '✗ Неверно'
                badge_col = colors.HexColor('#dc2626')
            else:
                row_bg = colors.HexColor('#fffbeb')
                badge_txt = '— Нет ответа'
                badge_col = colors.HexColor('#92400e')

            q_text = ans['question'][:180] + ('…' if len(ans['question']) > 180 else '')

            if is_ws:
                given_txt = 'Все слова найдены' if ans['answer'] == '__wordsearch_done__' else 'Не завершено'
                detail_row = [Paragraph('Результат:', small_s),
                              Paragraph(given_txt, val_s), '']
            else:
                given_txt = ans['answer'][:60] if ans['answer'] else '—'
                correct_txt = ans['correct_answer'][:60] if ans['correct_answer'] else '—'
                detail_row = [
                    Paragraph('Ответ:', small_s),
                    Paragraph(given_txt, wrong_s),
                    Paragraph(f"Правильно: {correct_txt}", corr_s) if ans['correct_answer'] else '',
                ]

            badge_ps = ParagraphStyle('badge', fontName='B', fontSize=8,
                                      alignment=TA_CENTER, textColor=badge_col)
            task_tbl = Table([
                [Paragraph(f'#{i}', lbl_s), Paragraph(q_text, body_s), Paragraph(badge_txt, badge_ps)],
                ['', detail_row[1] if not is_ws else Paragraph(given_txt, val_s),
                      detail_row[2] if not is_ws else ''],
            ], colWidths=[1.2*cm, 12.3*cm, 3.2*cm])

            task_tbl.setStyle(TableStyle([
                ('BACKGROUND',  (0,0),(-1,-1), row_bg),
                ('GRID',        (0,0),(-1,-1), 0.3, colors.HexColor('#e5e7eb')),
                ('VALIGN',      (0,0),(-1,-1), 'TOP'),
                ('TOPPADDING',  (0,0),(-1,-1), 4),
                ('BOTTOMPADDING',(0,0),(-1,-1), 4),
                ('LEFTPADDING', (0,0),(-1,-1), 5),
                ('RIGHTPADDING',(0,0),(-1,-1), 5),
                ('SPAN',        (0,0),(0,1)),
                ('VALIGN',      (0,0),(0,1), 'MIDDLE'),
                ('ALIGN',       (2,0),(2,0), 'CENTER'),
                ('SPAN',        (2,0),(2,1)),
                ('VALIGN',      (2,0),(2,1), 'MIDDLE'),
            ]))
            story += [task_tbl, Spacer(1, 3)]

    # Футер
    story += [
        Spacer(1, 10),
        HRFlowable(width='100%', thickness=0.5, color=colors.HexColor('#e5e7eb')),
        Spacer(1, 5),
        Paragraph(
            f'Сформировано: {datetime.now().strftime("%d.%m.%Y %H:%M")}',
            ps('footer', 'R', 8, TA_CENTER, '#9ca3af')
        ),
    ]

    doc.build(story)
    pdf_b64 = base64.b64encode(buf.getvalue()).decode('utf-8')
    safe = app['full_name'].replace(' ', '_')
    filename = f"report_{safe}_{app['id']}.pdf"

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
