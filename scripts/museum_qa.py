from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
errors = []
warnings = []


def read_text(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except UnicodeDecodeError as exc:
        errors.append(f"{path}: invalid UTF-8 ({exc})")
        return ""


# Markdown page hygiene.
for path in DOCS.rglob("*.md"):
    text = read_text(path)
    if "\ufffd" in text:
        errors.append(f"{path}: contains replacement character �")
    if re.search(r"https?://[^\s)]+placeholder[^\s)]*", text, re.I):
        errors.append(f"{path}: placeholder image URL")


# Public frontend hygiene: internal identifiers must not appear in user-facing JS.
js_root = DOCS / "javascripts"
if js_root.exists():
    for path in js_root.glob("*.js"):
        text = read_text(path)
        if re.search(r"\.relation_type\b|后台知识条目|后端知识条目", text):
            warnings.append(f"{path}: possible internal/backend wording in public JS")
        if re.search(r"42490/177595/main-image", text):
            errors.append(f"{path}: legacy generic Met image URL remains")
        if path.name == "museum-admin.js":
            for forbidden in ("select('id,slug,category,zh,status,confidence", "select('id,entry_id,path,title,source,license,status,verification_status", "from('sources')"):
                if forbidden in text:
                    errors.append(f"{path}: references retired schema field/table - {forbidden}")


# Navigation target existence check.
# MkDocs interprets nav targets relative to docs_dir. This is the only location
# that matters for the site's real build, so do not use repository-root fallback.
mk = ROOT / "mkdocs.yml"
if mk.exists():
    text = read_text(mk)
    # Same-line targets only: do not let \s after ":" swallow the next YAML child line.
    for label, raw in re.findall(r"(?m)^\s*-\s+([^:\n]+):[ \t]+(\S+\.md)\s*$", text):
        target = raw.strip().strip("\"'")
        if target.startswith(("http://", "https://")):
            continue
        candidate = DOCS / target
        if not candidate.is_file():
            errors.append(f"mkdocs.yml: missing nav target - {label.strip()}: {target}")


# Ensure the public image policy is present.
policy = DOCS / "javascripts" / "media-policy.js"
if not policy.is_file():
    errors.append("missing docs/javascripts/media-policy.js")


if warnings:
    print("WARNINGS:")
    for item in warnings:
        print(" -", item)

if errors:
    print("ERRORS:")
    for item in errors:
        print(" -", item)
    sys.exit(1)

print("Museum QA passed.")
