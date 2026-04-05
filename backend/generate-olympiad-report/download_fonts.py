#!/usr/bin/env python3
"""
Run this once locally to generate fonts_data.py:
  python3 download_fonts.py
"""
import urllib.request
import base64
import os

FONTS = {
    'DEJAVU_REGULAR': 'https://github.com/dejavu-fonts/dejavu-fonts/releases/download/version_2_37/dejavu-fonts-ttf-2.37.tar.bz2',
}

# Use direct ttf from sourceforge mirror
FONT_URLS = [
    ('DEJAVU_REGULAR_B64', 'https://sourceforge.net/projects/dejavu/files/dejavu/2.37/dejavu-fonts-ttf-2.37.tar.bz2'),
]

# Actually download raw TTF files
TTF_URLS = {
    'DEJAVU_REGULAR_B64': 'https://raw.githubusercontent.com/dejavu-fonts/dejavu-fonts/master/ttf/DejaVuSans.ttf',
    'DEJAVU_BOLD_B64': 'https://raw.githubusercontent.com/dejavu-fonts/dejavu-fonts/master/ttf/DejaVuSans-Bold.ttf',
}

out = []
out.append('# Auto-generated font data — do not edit manually')
out.append('import base64, os')
out.append('')

for var, url in TTF_URLS.items():
    print(f'Downloading {url}...')
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=60) as r:
        data = r.read()
    b64 = base64.b64encode(data).decode('ascii')
    fname = 'DejaVuSans.ttf' if 'REGULAR' in var else 'DejaVuSans-Bold.ttf'
    print(f'  -> {len(data)} bytes, b64 length {len(b64)}')
    out.append(f'{var} = "{b64}"')
    out.append('')

out.append('def extract_fonts(regular_path, bold_path):')
out.append('    if not os.path.exists(regular_path):')
out.append('        with open(regular_path, "wb") as f:')
out.append('            f.write(base64.b64decode(DEJAVU_REGULAR_B64))')
out.append('    if not os.path.exists(bold_path):')
out.append('        with open(bold_path, "wb") as f:')
out.append('            f.write(base64.b64decode(DEJAVU_BOLD_B64))')
out.append('')

with open('fonts_data.py', 'w') as f:
    f.write('\n'.join(out))

print('Done! fonts_data.py written.')
