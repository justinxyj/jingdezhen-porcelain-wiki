#!/usr/bin/env python3
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
errors = []

def read(path):
    return (ROOT / path).read_text(encoding="utf-8")

auth = read("docs/javascripts/auth-manager.js")
timeline = read("docs/javascripts/timeline-interactive.js")
store = read("docs/javascripts/knowledge-store.js")
schema = read("supabase/schema.sql")
tests = read("supabase/tests/concurrency_and_function_boundaries.sql")
migration = read("supabase/migrations/20260920_final_security_performance_hardening.sql")

if "function safeHref" not in auth or "window.JDM_AUTH={getClient" not in auth:
    errors.append("shared safeHref policy missing")
if 'href="${esc(source)}"' in timeline:
    errors.append("timeline source still interpolates escaped-only href")
if "img.src=safeHref(im.path)||im.path" in timeline:
    errors.append("timeline media has unsafe URL fallback")
if "Promise.allSettled" in store:
    errors.append("knowledge-store still silently uses Promise.allSettled")
if "const allEntries=await all()" in store:
    errors.append("entryNetworkContext still performs full all() scan")
if "entry_timeline_peers" not in store or "entry_space_peers" not in store:
    errors.append("targeted Entry peer RPCs not wired")
if "const idLike=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(key);" not in store or "return idLike?q.eq('id',key):q.eq('slug',key);" not in store:
    errors.append("Entry Detail get() must resolve both slug and UUID inputs")
if "JDM_NODE_ID_CONTRACT" not in store:
    errors.append("graph node-id contract missing")
if "is_staff must be SECURITY INVOKER" in tests:
    errors.append("security test still contains old invoker contract")
if "media_path_https_check" not in schema or "media_source_url_https_check" not in schema:
    errors.append("canonical media HTTPS constraints missing")
if "revoke all on function private.is_staff() from public;" not in migration or "grant execute on function private.is_staff() to authenticated, service_role;" not in migration:
    errors.append("final private is_staff execution boundary missing")
if "create or replace function public.entry_timeline_peers" not in migration:
    errors.append("final timeline peer function missing")
if "create or replace function public.entry_space_peers" not in migration:
    errors.append("final space peer function missing")

# --- H-3 L0: required catalog files ---
h3_required = [
    "supabase/security/h3_catalog_assertions.sql",
    "supabase/security/expected_catalog_snapshot.json",
    "scripts/h3_catalog_probe.py",
]
for rel in h3_required:
    if not (ROOT / rel).is_file():
        errors.append(f"H3 required file missing: {rel}")

golden_path = ROOT / "supabase/security/expected_catalog_snapshot.json"
if golden_path.is_file():
    import json
    try:
        golden = json.loads(golden_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        errors.append(f"H3 golden JSON invalid: {exc}")
    else:
        if golden.get("schema_version") != 1:
            errors.append("H3 golden schema_version must be 1")
        debt = golden.get("known_debt") or []
        if sorted(debt) != ["C2", "C3"]:
            errors.append('H3 golden known_debt must be ["C2","C3"]')
        checks = golden.get("checks") or {}
        for cid in ("A1", "A2", "A3", "B1", "B2", "B3", "B4", "C1", "C2", "C3", "D1"):
            if cid not in checks:
                errors.append(f"H3 golden missing check {cid}")
                continue
            # Non-known_debt golden entries must stay ok:true (L0 guard against accidental drift).
            if cid not in debt and checks[cid].get("ok") is not True:
                errors.append(f"H3 golden {cid}.ok must be true for non-known_debt checks")

# --- H-3 L0: dangerous GRANT EXECUTE … is_staff … anon ---
# Match a single SQL statement (semicolon-bounded). Skip historical migrations.
DANGEROUS_GRANT = re.compile(
    r"grant\s+execute\s+on\s+function\s+[\w.]*is_staff\s*\([^;]*?\bto\b[^;]*\banon\b",
    re.IGNORECASE | re.DOTALL,
)

scan_files = []
for item in [
    ROOT / "supabase" / "security",
    ROOT / "scripts",
    ROOT / "supabase" / "schema.sql",
    ROOT / "supabase" / "tests",
    ROOT / ".github" / "workflows",
]:
    if item.is_file():
        scan_files.append(item)
    elif item.is_dir():
        for p in item.rglob("*"):
            if not p.is_file():
                continue
            if p.name == "security_static_smoke.py":
                continue  # detector source must not self-match
            if p.suffix.lower() in {".sql", ".py", ".yml", ".yaml", ".json", ".md"}:
                scan_files.append(p)

for path in sorted(set(scan_files)):
    try:
        body = path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        continue
    if DANGEROUS_GRANT.search(body):
        rel = path.relative_to(ROOT).as_posix()
        errors.append(f"dangerous GRANT EXECUTE is_staff to anon pattern in {rel}")

if errors:
    print("SECURITY_STATIC_SMOKE_FAIL")
    for error in errors:
        print("-", error)
    sys.exit(1)
print("SECURITY_STATIC_SMOKE_PASS")
