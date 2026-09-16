from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / 'docs'
errors = []

# Detect obvious duplicate/legacy assets in public source.
seen = {}
for path in (DOCS / 'javascripts').glob('*.js'):
    text = path.read_text(encoding='utf-8')
    for token in re.findall(r'https?://[^\"\'`\s)]+', text):
        seen.setdefault(token, []).append(str(path))
for token, files in seen.items():
    if len(files) > 3 and any(x in token.lower() for x in ('placeholder','noimage','no-image','42490/177595')):
        errors.append(f'legacy or placeholder URL repeated: {token}')

# Every explicit local Markdown href in docs should point to an existing target where possible.
for path in DOCS.rglob('*.md'):
    text = path.read_text(encoding='utf-8')
    for href in re.findall(r'\]\((?!https?://|mailto:)([^)#]+)(?:#[^)]+)?\)', text):
        if href.startswith('/') or href.startswith('../'):
            target = (path.parent / href).resolve()
        else:
            target = (path.parent / href).resolve()
        if target.suffix == '.md' and not target.exists():
            errors.append(f'{path}: missing markdown link target {href}')
        elif target.suffix == '' and not target.exists() and not (target / 'index.md').exists():
            # MkDocs directory links are usually represented by a directory index.
            errors.append(f'{path}: missing local link target {href}')

# No committed build output.
if (ROOT / 'site').exists():
    errors.append('generated site/ directory should not be committed')

if errors:
    print('Site structure check failed:')
    for e in errors:
        print(' -', e)
    sys.exit(1)
print('Site structure check passed.')
