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

# Validate explicit markdown links relative to the file containing the link.
# Directory links are valid when their index.md or README.md exists.
for path in DOCS.rglob('*.md'):
    text = path.read_text(encoding='utf-8')
    for href in re.findall(r'\]\((?!https?://|mailto:)([^)#]+)(?:#[^)]+)?\)', text):
        href = href.strip()
        target = (path.parent / href).resolve()
        if target.suffix == '.md':
            if not target.exists():
                errors.append(f'{path}: missing markdown link target {href}')
        elif not target.exists():
            # MkDocs renders directory links from index.md. README.md is also accepted
            # because several source sections use README as their canonical overview.
            if not ((target / 'index.md').exists() or (target / 'README.md').exists()):
                errors.append(f'{path}: missing local link target {href}')

if (ROOT / 'site').exists():
    errors.append('generated site/ directory should not be committed')

if errors:
    print('Site structure check failed:')
    for e in errors:
        print(' -', e)
    sys.exit(1)
print('Site structure check passed.')
