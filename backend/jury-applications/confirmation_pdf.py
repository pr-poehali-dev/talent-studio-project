import os
import urllib.request
from datetime import date
from io import BytesIO

from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import HRFlowable, Image, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

SIGN_STAMP_URL = 'https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/57089395-3617-4837-8eb4-5a611478b79f.png'
LOGO_URL = 'https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/cb267483-96ab-40f3-ae87-4f18740f3e6e.png'

FONT_CANDIDATES = [
    ('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'),
    ('/usr/share/fonts/dejavu/DejaVuSans.ttf', '/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf'),
    ('/usr/share/fonts/liberation/LiberationSans-Regular.ttf', '/usr/share/fonts/liberation/LiberationSans-Bold.ttf'),
    ('/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf', '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'),
    ('/usr/share/fonts/truetype/freefont/FreeSans.ttf', '/usr/share/fonts/truetype/freefont/FreeSansBold.ttf'),
]

ACCENT = HexColor('#e94560')
PRIMARY = HexColor('#1a1a2e')
DARK = HexColor('#333333')
MUTED = HexColor('#666666')

_fonts_ready = False


def ensure_fonts():
    global _fonts_ready
    if _fonts_ready:
        return
    for regular, bold in FONT_CANDIDATES:
        if os.path.exists(regular) and os.path.exists(bold):
            pdfmetrics.registerFont(TTFont('CF', regular))
            pdfmetrics.registerFont(TTFont('CF-Bold', bold))
            _fonts_ready = True
            return
    raise RuntimeError('No Cyrillic font found')


def build_confirmation_pdf(item: dict) -> bytes:
    ensure_fonts()
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, leftMargin=25 * mm, rightMargin=20 * mm, topMargin=15 * mm, bottomMargin=20 * mm)
    usable = A4[0] - 45 * mm
    base = getSampleStyleSheet()['Normal']

    def S(name, **kw):
        kw.setdefault('fontName', 'CF')
        kw.setdefault('textColor', DARK)
        return ParagraphStyle(name, parent=base, **kw)

    sub = S('sub', fontSize=11, alignment=TA_CENTER, textColor=MUTED, spaceAfter=1 * mm)
    num = S('num', fontSize=8, alignment=TA_RIGHT, textColor=MUTED)
    title = S('title', fontSize=22, alignment=TA_CENTER, fontName='CF-Bold', textColor=PRIMARY, leading=28, spaceAfter=2 * mm)
    body = S('body', fontSize=12, alignment=TA_JUSTIFY, leading=20, firstLineIndent=10 * mm)
    left = S('left', fontSize=11, alignment=TA_LEFT, leading=15)
    right = S('right', fontSize=11, alignment=TA_RIGHT, leading=15)

    female = item.get('gender') == 'F'
    male = item.get('gender') == 'M'
    took = 'приняла' if female else ('принял' if male else 'принял(а)')
    held = 'провела' if female else ('провёл' if male else 'провёл(а)')
    analyzed = 'проанализировала' if female else ('проанализировал' if male else 'проанализировал(а)')

    pdate = item.get('participation_date')
    issued = pdate.strftime('%d.%m.%Y') if hasattr(pdate, 'strftime') else (str(pdate) if pdate else date.today().strftime('%d.%m.%Y'))
    pdate_str = issued

    story = []
    try:
        req = urllib.request.Request(LOGO_URL, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as r:
            logo = Image(BytesIO(r.read()), width=45 * mm, height=45 * mm, kind='proportional')
        logo.hAlign = 'CENTER'
        story.append(logo)
        story.append(Spacer(1, 2 * mm))
    except Exception:
        pass

    story.append(Paragraph('СПРАВКА-ПОДТВЕРЖДЕНИЕ', title))
    story.append(Paragraph('участия в составе жюри', sub))
    story.append(Spacer(1, 3 * mm))
    story.append(HRFlowable(width=usable, thickness=2, color=ACCENT, spaceAfter=3 * mm))
    story.append(Paragraph(f"№ {item['number']} от {issued}", num))
    story.append(Spacer(1, 8 * mm))

    text = (
        f"Настоящая справка подтверждает, что <b>{item['full_name']}</b> — "
        f"{item['position']} {item['institution']} "
        f"{pdate_str} {took} участие в составе жюри из числа приглашённых экспертов "
        f"Всероссийского конкурса декоративно-прикладного искусства «{item['contest_name']}» "
        f"и {held} экспертную оценку конкурсных работ — {analyzed} художественные решения, "
        f"технику исполнения и соответствие заявленной тематике."
    )
    story.append(Paragraph(text, body))
    story.append(Spacer(1, 6 * mm))
    story.append(Paragraph('Справка выдана для предоставления по месту требования.', body))
    story.append(Spacer(1, 20 * mm))

    try:
        req = urllib.request.Request(SIGN_STAMP_URL, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as r:
            stamp = Image(BytesIO(r.read()), width=55 * mm, height=55 * mm, kind='proportional')
    except Exception:
        stamp = Spacer(1, 40 * mm)

    sign = Table(
        [[
            [Paragraph('Руководитель студии', left), Spacer(1, 2 * mm), Paragraph('А.В. Мозжерина', left), Spacer(1, 2 * mm), Paragraph(f'Дата: {issued}', left)],
            stamp,
        ]],
        colWidths=[usable * 0.5, usable * 0.5],
    )
    sign.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'MIDDLE'), ('ALIGN', (1, 0), (1, 0), 'RIGHT')]))
    story.append(sign)

    doc.build(story)
    return buffer.getvalue()
