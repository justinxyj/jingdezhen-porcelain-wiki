#!/usr/bin/env python3
"""Public Supabase runtime smoke test. Uses only the browser-safe publishable key."""
import json
import sys
import urllib.parse
import urllib.request
import urllib.error
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
config=json.loads("null") if False else None
text=(ROOT/"docs/javascripts/runtime-config.js").read_text(encoding="utf-8")
import re
url=re.search(r"supabaseUrl:\s*'([^']+)'",text).group(1)
key=re.search(r"supabaseAnonKey:\s*'([^']+)'",text).group(1)

def get(path, params=None, expect=(200,)):
    qs=urllib.parse.urlencode(params or {})
    req=urllib.request.Request(f"{url}/rest/v1/{path}?{qs}",headers={"apikey":key,"Authorization":f"Bearer {key}","Accept":"application/json"})
    try:
        with urllib.request.urlopen(req,timeout=10) as res:
            status=res.status; body=res.read().decode()
    except urllib.error.HTTPError as exc:
        status=exc.code; body=exc.read().decode()
    if status not in expect:
        raise RuntimeError(f"{path}: expected {expect}, got {status}: {body[:300]}")
    try:return status,json.loads(body) if body else None
    except json.JSONDecodeError:return status,body

_,entries=get("entries",{"select":"id,slug,status","status":"eq.published","limit":"5"})
if not entries: raise RuntimeError("published entries query returned no rows")
_,media=get("media_public",{"select":"id,entry_id,path","limit":"5"})
if any("status" in x or "review_state" in x for x in media):
    raise RuntimeError("media_public leaked internal review columns")
_,craft=get("craft_processes",{"select":"id,sequence,name_zh","order":"sequence.asc","limit":"1000"})
if len(craft)!=72: raise RuntimeError(f"craft_processes expected 72 rows, got {len(craft)}")
def get_blocked(path, select="id"):
    qs=urllib.parse.urlencode({"select":select,"limit":"1"})
    req=urllib.request.Request(f"{url}/rest/v1/{path}?{qs}",headers={"apikey":key,"Authorization":f"Bearer {key}","Accept":"application/json"})
    try:
        with urllib.request.urlopen(req,timeout=10) as res:
            status=res.status; body=res.read().decode()
    except urllib.error.HTTPError as exc:
        status=exc.code; body=exc.read().decode()
    if status in (400,401,403,404):
        return status
    if status==200:
        data=json.loads(body) if body else []
        if data:
            raise RuntimeError(f"{path}: protected field was anonymously readable")
        return status
    raise RuntimeError(f"{path}: unexpected status {status}: {body[:300]}")

rev_status=get_blocked("entry_revisions")
media_status=get_blocked("media","verification_note")
print(f"PASS entries={len(entries)} media_public_sample={len(media)} craft_processes={len(craft)} raw_revisions_blocked={rev_status} media_internal_field_blocked={media_status}")
