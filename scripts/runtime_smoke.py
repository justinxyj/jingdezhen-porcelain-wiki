#!/usr/bin/env python3
"""Anonymous Supabase runtime smoke checks using the browser-safe publishable key."""
import argparse, json, re, urllib.error, urllib.parse, urllib.request
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
text=(ROOT/"docs/javascripts/runtime-config.js").read_text(encoding="utf-8")
URL=re.search(r"supabaseUrl:\s*'([^']+)'",text).group(1)
KEY=re.search(r"supabaseAnonKey:\s*'([^']+)'",text).group(1)
HEADERS={"apikey":KEY,"Accept":"application/json"}

def get(path, params=None):
    qs=urllib.parse.urlencode(params or {})
    req=urllib.request.Request(f"{URL}/rest/v1/{path}?{qs}",headers=HEADERS)
    try:
        with urllib.request.urlopen(req,timeout=10) as res:
            status=res.status; body=res.read().decode()
    except urllib.error.HTTPError as exc:
        status=exc.code; body=exc.read().decode()
    try: data=json.loads(body) if body else []
    except json.JSONDecodeError: data=body
    return status,data

def expect_ok(path,params):
    status,data=get(path,params)
    if status!=200: raise RuntimeError(f"{path}: expected 200, got {status}: {str(data)[:300]}")
    return data

def check_entries():
    data=expect_ok("entries",{"select":"id,slug,status","status":"eq.published","limit":"5"})
    if not data: raise RuntimeError("published entries query returned no rows")
    print(f"PASS entries={len(data)}")

def check_media():
    data=expect_ok("media_public",{"select":"id,entry_id,path","limit":"5"})
    if any("status" in x or "review_state" in x for x in data):
        raise RuntimeError("media_public leaked internal review columns")
    print(f"PASS media_public={len(data)}")

def check_craft():
    data=expect_ok("craft_processes",{"select":"id,sequence,name_zh","order":"sequence.asc","limit":"1000"})
    if len(data)!=72: raise RuntimeError(f"craft_processes expected 72 rows, got {len(data)}")
    print("PASS craft_processes=72")

def blocked(path,select="id"):
    status,data=get(path,{"select":select,"limit":"1"})
    if status in (400,401,403,404): return status
    if status==200:
        if data: raise RuntimeError(f"{path}: protected data was anonymously readable")
        return status
    raise RuntimeError(f"{path}: unexpected status {status}: {str(data)[:300]}")

def check_sensitive():
    rev=blocked("entry_revisions")
    media=blocked("media","verification_note")
    print(f"PASS revisions_blocked={rev} media_internal_field_blocked={media}")

parser=argparse.ArgumentParser()
parser.add_argument("--check",choices=["entries","media","craft","sensitive"],required=True)
args=parser.parse_args()
{"entries":check_entries,"media":check_media,"craft":check_craft,"sensitive":check_sensitive}[args.check]()
