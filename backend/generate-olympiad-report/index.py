import json
import os
import base64
import psycopg2
import requests as req_lib
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

def study_year_matches(study_years, participant_year):
    if not study_years:
        return True
    for sy in study_years:
        if sy == '7+':
            if participant_year >= 7:
                return True
        elif '-' in str(sy):
            parts = str(sy).split('-')
            try:
                lo, hi = int(parts[0]), int(parts[1])
                if lo <= participant_year <= hi:
                    return True
            except (ValueError, IndexError):
                pass
    return False


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
        SELECT ot.id, oa.answer, ot.question, ot.correct_answer, ot.task_type, ot.sort_order, ot.study_years, ot.options
        FROM olympiad_tasks ot
        LEFT JOIN olympiad_answers oa ON oa.task_id = ot.id AND oa.payment_id = %s
        WHERE ot.olympiad_type = %s AND ot.is_active = TRUE
        ORDER BY ot.sort_order ASC, ot.id ASC
    """, (app['payment_id'], app['olympiad_type']))
    answer_rows = cursor.fetchall()
    cursor.close(); conn.close()

    participant_study_year = int(app['study_year']) if app['study_year'] else None

    def parse_matching_pairs(answer, options):
        """Разбирает ответ matching "leftIdx:rightOrigIdx,..." в список пар с именами."""
        if not answer or not options:
            return []
        pairs = []
        for p in answer.split(','):
            parts = p.split(':')
            if len(parts) != 2:
                continue
            try:
                li, ri = int(parts[0]), int(parts[1])
                left_name = options[li].split('|')[0] if li < len(options) else f'#{li}'
                right_opt = options[ri].split('|') if ri < len(options) else []
                right_name = right_opt[1] if len(right_opt) > 1 else (right_opt[0] if right_opt else f'#{ri}')
                pairs.append({'left': left_name, 'right': right_name, 'correct': li == ri})
            except Exception:
                continue
        return pairs

    answers = []
    for row in answer_rows:
        task_study_years = row[6]
        if participant_study_year is not None and not study_year_matches(task_study_years, participant_study_year):
            continue
        task_type = row[4] or 'quiz'
        given = row[1] or ''
        correct = row[3] or ''
        raw_options = row[7]
        options = raw_options if isinstance(raw_options, list) else (json.loads(raw_options) if raw_options else [])
        if task_type == 'wordsearch':
            is_correct = given == '__wordsearch_done__'
        elif task_type == 'coloring':
            is_correct = bool(given and given != '__coloring__')
        elif task_type == 'matching':
            try:
                pairs_list = [p.split(':') for p in given.split(',') if ':' in p]
                is_correct = len(pairs_list) > 0 and all(l == r for l, r in pairs_list)
            except Exception:
                is_correct = False
        elif task_type == 'color-mix':
            given_set = set(c.strip().lower() for c in given.split(',') if c.strip())
            correct_set = set(c.strip().lower() for c in correct.split(',') if c.strip())
            is_correct = bool(given_set) and given_set == correct_set if correct else False
        else:
            is_correct = given.strip().lower() == correct.strip().lower() if correct else False
        answers.append({
            'task_id': row[0], 'answer': given,
            'question': (row[2] or '').replace('\n', ' ').strip(),
            'correct_answer': correct, 'task_type': task_type, 'is_correct': is_correct,
            'options': options,
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
                row_bg   = colors.HexColor('#f0fdf4')
                badge_txt = '✓ Верно'
                badge_col = colors.HexColor('#15803d')
            elif ans['is_correct'] is False:
                row_bg   = colors.HexColor('#fef2f2')
                badge_txt = '✗ Неверно'
                badge_col = colors.HexColor('#dc2626')
            else:
                row_bg   = colors.HexColor('#fffbeb')
                badge_txt = '— Нет ответа'
                badge_col = colors.HexColor('#92400e')

            q_text = ans['question'][:200] + ('…' if len(ans['question']) > 200 else '')
            badge_ps = ParagraphStyle(f'badge{i}', fontName='B', fontSize=8,
                                      alignment=TA_CENTER, textColor=badge_col)

            is_matching = ans['task_type'] == 'matching'
            is_coloring = ans['task_type'] == 'coloring'
            is_color_mix = ans['task_type'] == 'color-mix'
            # quiz с опциями вида "Название||#hex" (задание с радугой и подобные)
            opts = ans.get('options', [])
            is_hex_options = (
                ans['task_type'] == 'quiz' and
                opts and
                all('||' in str(o) and str(o).split('||')[1].startswith('#') for o in opts)
            )

            if is_coloring:
                # Раскраска: показываем картинку если есть URL
                coloring_url = ans['answer'] if ans['answer'] and ans['answer'].startswith('http') else None
                rows = [
                    [Paragraph(f'#{i}', lbl_s), Paragraph(q_text, body_s), Paragraph(badge_txt, badge_ps)],
                ]
                if coloring_url:
                    try:
                        img_resp = req_lib.get(coloring_url, timeout=10)
                        img_data = BytesIO(img_resp.content)
                        from reportlab.platypus import Image as RLImage
                        rl_img = RLImage(img_data, width=8*cm, height=8*cm)
                        rl_img.hAlign = 'LEFT'
                        rows.append(['', rl_img, ''])
                    except Exception:
                        rows.append(['', Paragraph('Изображение недоступно', small_s), ''])
                else:
                    rows.append(['', Paragraph('Раскраска не была завершена', small_s), ''])
                spans = [('SPAN',(0,0),(0,len(rows)-1)), ('SPAN',(2,0),(2,len(rows)-1))]
                num_rows = len(rows)
            elif is_ws:
                given_txt   = 'Все слова найдены' if ans['answer'] == '__wordsearch_done__' else 'Не завершено'
                # Для искалки: 2 строки — вопрос + результат
                rows = [
                    [Paragraph(f'#{i}', lbl_s),  Paragraph(q_text, body_s),            Paragraph(badge_txt, badge_ps)],
                    ['',                           Paragraph(f'Результат: {given_txt}', small_s), ''],
                ]
                spans = [('SPAN',(0,0),(0,1)), ('SPAN',(2,0),(2,1))]
                num_rows = 2
            elif is_matching:
                # Matching: вопрос + строки по каждой паре
                pairs_decoded = parse_matching_pairs(ans['answer'], ans.get('options', []))
                pair_rows_data = [[Paragraph(f'#{i}', lbl_s), Paragraph(q_text, body_s), Paragraph(badge_txt, badge_ps)]]
                for pair in pairs_decoded:
                    tick = '✓' if pair['correct'] else '✗'
                    col = colors.HexColor('#15803d') if pair['correct'] else colors.HexColor('#dc2626')
                    pair_label_ps = ParagraphStyle(f'pair{i}_{pair["left"]}', fontName='R', fontSize=8, textColor=col, leading=11)
                    pair_rows_data.append(['', Paragraph(f'{tick}  {pair["left"]}  →  {pair["right"]}', pair_label_ps), ''])
                rows = pair_rows_data
                spans = [('SPAN',(0,0),(0,len(pair_rows_data)-1)), ('SPAN',(2,0),(2,len(pair_rows_data)-1))]
                num_rows = len(pair_rows_data)
            elif is_color_mix or is_hex_options:
                # Строим маппинг label->hex из опций
                hex_map = {}
                for o in (opts or []):
                    parts = str(o).split('||')
                    if len(parts) == 2 and parts[1].startswith('#'):
                        hex_map[parts[0].strip().lower()] = parts[1].strip()

                def color_swatch_text(names_str):
                    """Возвращает строку вида '● Красный, ● Белый' для PDF"""
                    if not names_str:
                        return '—'
                    parts = [n.strip() for n in names_str.split(',') if n.strip()]
                    return ',  '.join(parts) if parts else '—'

                given_names = ans['answer'] if ans['answer'] else ''
                correct_names = ans['correct_answer'] if ans['correct_answer'] else ''

                given_display = color_swatch_text(given_names)
                correct_display = color_swatch_text(correct_names)

                given_label_ps   = ParagraphStyle(f'gl{i}', fontName='R', fontSize=8, textColor=colors.HexColor('#1a1a1a'), leading=11)
                correct_label_ps = ParagraphStyle(f'cl{i}', fontName='B', fontSize=8, textColor=colors.HexColor('#15803d'), leading=11)

                rows = [
                    [Paragraph(f'#{i}', lbl_s), Paragraph(q_text, body_s), Paragraph(badge_txt, badge_ps)],
                    ['', Table([[Paragraph('Ответ участника:', small_s), Paragraph(given_display, given_label_ps)]], colWidths=[3.5*cm, 8.5*cm]), ''],
                    ['', Table([[Paragraph('Правильный ответ:', small_s), Paragraph(correct_display, correct_label_ps)]], colWidths=[3.5*cm, 8.5*cm]), ''],
                ]
                spans = [('SPAN',(0,0),(0,2)), ('SPAN',(2,0),(2,2))]
                num_rows = 3
            else:
                given_txt   = ans['answer'][:80]   if ans['answer']        else '—'
                correct_txt = ans['correct_answer'][:80] if ans['correct_answer'] else '—'

                given_label_ps   = ParagraphStyle(f'gl{i}', fontName='R', fontSize=8, textColor=colors.HexColor('#1a1a1a'), leading=11)
                correct_label_ps = ParagraphStyle(f'cl{i}', fontName='B', fontSize=8, textColor=colors.HexColor('#15803d'), leading=11)

                # 3 строки: вопрос / ответ участника / правильный ответ
                rows = [
                    [Paragraph(f'#{i}', lbl_s),
                     Paragraph(q_text, body_s),
                     Paragraph(badge_txt, badge_ps)],
                    ['',
                     Table([[Paragraph('Ответ участника:', small_s), Paragraph(given_txt, given_label_ps)]], colWidths=[3.5*cm, 8.5*cm]),
                     ''],
                    ['',
                     Table([[Paragraph('Правильный ответ:', small_s), Paragraph(correct_txt, correct_label_ps)]], colWidths=[3.5*cm, 8.5*cm]),
                     ''],
                ]
                spans = [('SPAN',(0,0),(0,2)), ('SPAN',(2,0),(2,2))]
                num_rows = 3

            col_w = [1.2*cm, 12.3*cm, 3.2*cm]
            task_tbl = Table(rows, colWidths=col_w)

            style_cmds = [
                ('BACKGROUND',   (0,0),(-1,-1), row_bg),
                ('GRID',         (0,0),(-1,-1), 0.3, colors.HexColor('#e5e7eb')),
                ('VALIGN',       (0,0),(-1,-1), 'TOP'),
                ('TOPPADDING',   (0,0),(-1,-1), 4),
                ('BOTTOMPADDING',(0,0),(-1,-1), 4),
                ('LEFTPADDING',  (0,0),(-1,-1), 5),
                ('RIGHTPADDING', (0,0),(-1,-1), 5),
                ('ALIGN',        (2,0),(2,0),   'CENTER'),
                ('VALIGN',       (0,0),(0,-1),  'MIDDLE'),
                ('VALIGN',       (2,0),(2,-1),  'MIDDLE'),
                # Подсветка строки с правильным ответом
            ] + [('SPAN', s[1], s[2]) for s in spans]

            if not is_ws and not is_matching and not is_coloring:
                if num_rows >= 3:
                    style_cmds.append(('BACKGROUND', (1,2),(1,2), colors.HexColor('#f0fdf4')))

            task_tbl.setStyle(TableStyle(style_cmds))
            story += [task_tbl, Spacer(1, 4)]

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