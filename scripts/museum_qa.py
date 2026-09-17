from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / 'docs'
errors = []
 warnings = []

# Markdown page hygiene
for path in DOCS.rglob('*.md'):
    text = path.read_text(encoding='utf-8')
    if '\ufffd' in text:
        errors.append(f'{path}: contains replacement character �')
    if re.search(r'https?://[^\s)]+placeholder[^\s)]*', text, re.I):
        errors.append(f'{path}: placeholder image URL')

# Public frontend hygiene: internal identifiers must not appear in user-facing JS.
for path in (DOCS / 'javascripts').glob('*.js'):
    text = path.read_text(encoding='utf-8')
    if re.search(r'\.relation_type\b|后台知识条目|后端知识条目', text):
        warnings.append(f'{path}: possible internal/backend wording in public JS')
    if re.search(r'42490/177595/main-image', text):
        errors.append(f'{path}: legacy generic Met image URL remains')

# Navigation target existence check.
# MkDocs nav targets are relative to docs_dir. Resolve both the normal docs-relative
# form and a repository-relative fallback so this guard catches real missing targets
# without depending on the current working directory.
mk = ROOT / 'mkdocs.yml'
if mk.exists():
    text = mk.read_text(encoding='utf-8')
    for label, raw in re.findall(r'(?m)^\s*-\s+(.+?):\s*([^\n]+)$', text):
        target = raw.strip().strip('"\'')
        if not target.endswith('.md') or target.startswith(('http://', 'https://')):
            continue
        candidates = [DOCS / target, ROOT / target]
        if not any(candidate.exists() for candidate in candidates):
            errors.append(f'mkdocs.yml: missing nav target - {label.strip()}: {target}')

# Ensure the public image policy is present.
policy = DOCS / 'javascripts' / 'media-policy.js'
if not policy.exists():
    errors.append('missing docs/javascripts/media-policy.js')

if warnings:
    print('WARNINGS:')
    for item in warnings:
        print(' -', item)

if errors:
    print('ERRORS:')
    for item in errors:
        print(' -', item)
    sys.exit(1)

print('Museum QA passed.')
