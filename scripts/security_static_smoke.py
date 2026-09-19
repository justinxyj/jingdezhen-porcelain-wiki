#!/usr/bin/env python3
from pathlib import Path
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
if "revoke execute on function public.is_staff() from public, anon;" not in migration:
    errors.append("final anon is_staff revoke missing")
if "create or replace function public.entry_timeline_peers" not in migration:
    errors.append("final timeline peer function missing")
if "create or replace function public.entry_space_peers" not in migration:
    errors.append("final space peer function missing")

if errors:
    print("SECURITY_STATIC_SMOKE_FAIL")
    for error in errors:
        print("-", error)
    sys.exit(1)
print("SECURITY_STATIC_SMOKE_PASS")
