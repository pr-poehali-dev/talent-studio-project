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

    # Данные заявки
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
        'created_at': app_row[11], 'payment_id': app_row[12], 'olympiad_status': app_row[13],
    }

    # Ответы участника + задания
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
        is_wordsearch = task_type == 'wordsearch'
        given = row[1] or ''
        correct = row[3] or ''
        if is_wordsearch:
            is_correct = given == '__wordsearch_done__'
        else:
            is_correct = given.strip().lower() == correct.strip().lower() if correct else None
        answers.append({
            'task_id': row[0], 'answer': given, 'question': row[2] or '',
            'correct_answer': correct, 'task_type': task_type,
            'is_correct': is_correct, 'sort_order': row[5] or 0,
        })

    total = len(answers)
    correct_count = sum(1 for a in answers if a['is_correct'] is True)
    wrong_count = sum(1 for a in answers if a['is_correct'] is False)
    wordsearch_count = sum(1 for a in answers if a['task_type'] == 'wordsearch')

    # Генерация PDF через reportlab
    from reportlab.lib.pagesizes import A4
    from reportlab.lib import colors
    from reportlab.lib.units import cm
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    from reportlab.lib.enums import TA_CENTER, TA_LEFT

    # Шрифт с кириллицей
    font_path = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
    font_bold_path = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
    try:
        pdfmetrics.registerFont(TTFont('DejaVu', font_path))
        pdfmetrics.registerFont(TTFont('DejaVu-Bold', font_bold_path))
        base_font = 'DejaVu'
        bold_font = 'DejaVu-Bold'
    except Exception:
        base_font = 'Helvetica'
        bold_font = 'Helvetica-Bold'

    buf = BytesIO()
    doc = SimpleDocTemplate(
        buf, pagesize=A4,
        leftMargin=2*cm, rightMargin=2*cm, topMargin=2*cm, bottomMargin=2*cm
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('title', fontName=bold_font, fontSize=16, alignment=TA_CENTER, spaceAfter=6, textColor=colors.HexColor('#1a1a1a'))
    subtitle_style = ParagraphStyle('subtitle', fontName=base_font, fontSize=10, alignment=TA_CENTER, spaceAfter=16, textColor=colors.HexColor('#666666'))
    section_style = ParagraphStyle('section', fontName=bold_font, fontSize=12, spaceBefore=12, spaceAfter=6, textColor=colors.HexColor('#c2410c'))
    body_style = ParagraphStyle('body', fontName=base_font, fontSize=9, spaceAfter=4, leading=13, textColor=colors.HexColor('#1a1a1a'))
    label_style = ParagraphStyle('label', fontName=bold_font, fontSize=9, textColor=colors.HexColor('#374151'))
    small_style = ParagraphStyle('small', fontName=base_font, fontSize=8, textColor=colors.HexColor('#6b7280'))

    story = []

    # Заголовок
    story.append(Paragraph('ОТЧЁТ ОБ УЧАСТИИ В ОЛИМПИАДЕ', title_style))
    story.append(Paragraph(OLYMPIAD_NAMES.get(app['olympiad_type'], app['olympiad_type']), subtitle_style))
    story.append(HRFlowable(width='100%', thickness=1, color=colors.HexColor('#fed7aa')))
    story.append(Spacer(1, 10))

    # Данные участника
    story.append(Paragraph('Данные участника', section_style))
    participant_data = [
        ['ФИО участника', app['full_name']],
        ['Возраст', f"{app['age']} лет"],
        ['Год обучения', f"{app['study_year']} год"],
        ['Название работы', app['work_title']],
        ['Email', app['email']],
        ['Педагог', app['teacher'] or '—'],
        ['Учреждение', app['institution'] or '—'],
        ['Дата регистрации', app['created_at'].strftime('%d.%m.%Y %H:%M') if app['created_at'] else '—'],
        ['ID заявки', str(app['id'])],
        ['Статус заявки', STATUS_LABELS.get(app['status'], app['status'])],
    ]
    pt = Table(
        [[Paragraph(r[0], label_style), Paragraph(str(r[1]), body_style)] for r in participant_data],
        colWidths=[5*cm, 11.7*cm]
    )
    pt.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,-1), colors.HexColor('#fff7ed')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e5e7eb')),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(pt)
    story.append(Spacer(1, 12))

    # Итоговая статистика
    story.append(Paragraph('Результаты олимпиады', section_style))
    stat_color_correct = colors.HexColor('#dcfce7')
    stat_color_wrong = colors.HexColor('#fee2e2')
    stat_color_ws = colors.HexColor('#dbeafe')

    stat_data = [
        [
            Paragraph('Всего заданий', label_style),
            Paragraph('Правильных', label_style),
            Paragraph('Неправильных', label_style),
            Paragraph('Искалок слов', label_style),
        ],
        [
            Paragraph(str(total), ParagraphStyle('v', fontName=bold_font, fontSize=18, alignment=TA_CENTER, textColor=colors.HexColor('#1a1a1a'))),
            Paragraph(str(correct_count), ParagraphStyle('v', fontName=bold_font, fontSize=18, alignment=TA_CENTER, textColor=colors.HexColor('#15803d'))),
            Paragraph(str(wrong_count), ParagraphStyle('v', fontName=bold_font, fontSize=18, alignment=TA_CENTER, textColor=colors.HexColor('#dc2626'))),
            Paragraph(str(wordsearch_count), ParagraphStyle('v', fontName=bold_font, fontSize=18, alignment=TA_CENTER, textColor=colors.HexColor('#1d4ed8'))),
        ]
    ]
    st = Table(stat_data, colWidths=[4.17*cm]*4)
    st.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#f3f4f6')),
        ('BACKGROUND', (1,1), (1,1), stat_color_correct),
        ('BACKGROUND', (2,1), (2,1), stat_color_wrong),
        ('BACKGROUND', (3,1), (3,1), stat_color_ws),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e5e7eb')),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(st)
    story.append(Spacer(1, 14))

    # Детальные ответы
    if answers:
        story.append(Paragraph('Детальный отчёт по заданиям', section_style))

        for i, ans in enumerate(answers, 1):
            is_ws = ans['task_type'] == 'wordsearch'
            correct = ans['is_correct']
            if correct is True:
                row_bg = colors.HexColor('#f0fdf4')
                badge_text = '✓ Верно'
                badge_color = colors.HexColor('#15803d')
            elif correct is False:
                row_bg = colors.HexColor('#fef2f2')
                badge_text = '✗ Неверно'
                badge_color = colors.HexColor('#dc2626')
            else:
                row_bg = colors.HexColor('#fffbeb')
                badge_text = '— Без ответа'
                badge_color = colors.HexColor('#92400e')

            # Вопрос (обрезаем если длинный)
            question_text = ans['question'].replace('\n', ' ').strip()
            if len(question_text) > 200:
                question_text = question_text[:200] + '...'

            if is_ws:
                given_text = 'Все слова найдены' if ans['answer'] == '__wordsearch_done__' else 'Не завершено'
                correct_text = '(задание-искалка)'
            else:
                given_text = ans['answer'] if ans['answer'] else '—'
                correct_text = ans['correct_answer'] if ans['correct_answer'] else '—'

            task_data = [
                [
                    Paragraph(f'<b>№{i}</b>', ParagraphStyle('n', fontName=bold_font, fontSize=9, textColor=colors.HexColor('#374151'))),
                    Paragraph(question_text, body_style),
                    Paragraph(badge_text, ParagraphStyle('badge', fontName=bold_font, fontSize=9, alignment=TA_CENTER, textColor=badge_color)),
                ],
                [
                    Paragraph('Ответ:', small_style),
                    Paragraph(given_text, body_style),
                    '',
                ],
            ]
            if not is_ws and ans['correct_answer']:
                task_data.append([
                    Paragraph('Правильно:', small_style),
                    Paragraph(correct_text, ParagraphStyle('corr', fontName=bold_font, fontSize=9, textColor=colors.HexColor('#15803d'))),
                    '',
                ])

            tt = Table(task_data, colWidths=[1.5*cm, 12.5*cm, 2.7*cm])
            tt.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), row_bg),
                ('GRID', (0,0), (-1,-1), 0.3, colors.HexColor('#e5e7eb')),
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
                ('TOPPADDING', (0,0), (-1,-1), 5),
                ('BOTTOMPADDING', (0,0), (-1,-1), 5),
                ('LEFTPADDING', (0,0), (-1,-1), 6),
                ('RIGHTPADDING', (0,0), (-1,-1), 6),
                ('SPAN', (0,0), (0,-1)),
                ('ALIGN', (2,0), (2,0), 'CENTER'),
                ('VALIGN', (2,0), (2,0), 'MIDDLE'),
                ('SPAN', (2,0), (2,-1)),
            ]))
            story.append(tt)
            story.append(Spacer(1, 4))

    # Футер
    story.append(Spacer(1, 12))
    story.append(HRFlowable(width='100%', thickness=0.5, color=colors.HexColor('#e5e7eb')))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        f'Отчёт сформирован: {datetime.now().strftime("%d.%m.%Y %H:%M")}',
        ParagraphStyle('footer', fontName=base_font, fontSize=8, alignment=TA_CENTER, textColor=colors.HexColor('#9ca3af'))
    ))

    doc.build(story)
    pdf_bytes = buf.getvalue()
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
