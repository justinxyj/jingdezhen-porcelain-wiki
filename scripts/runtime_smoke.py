#!/usr/bin/env python3
"""Anonymous Supabase runtime smoke checks using the browser-safe publishable key."""
import argparse, json, os, re, urllib.error, urllib.parse, urllib.request
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
text=(ROOT/"docs/javascripts/runtime-config.js").read_text(encoding="utf-8")
URL=os.environ.get("SUPABASE_URL") or re.search(r"supabaseUrl:\s*'([^']+)'",text).group(1)
KEY=os.environ.get("SUPABASE_KEY") or re.search(r"supabaseAnonKey:\s*'([^']+)'",text).group(1)
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
        raise RuntimeError("media leaked internal review columns")
    print(f"PASS public_media={len(data)}")

def check_craft():
    data=expect_ok("craft_processes",{"select":"id,sequence,name_zh","order":"sequence.asc","limit":"1000"})
    if len(data)!=72: raise RuntimeError(f"craft_processes expected 72 rows, got {len(data)}")
    print("PASS craft_processes=72")

def blocked(path,select="id",extra=None):
    params={"select":select,"limit":"1"};params.update(extra or {})
    status,data=get(path,params)
    if status in (400,401,403,404): return status
    if status==200:
        if data: raise RuntimeError(f"{path}: protected data was anonymously readable")
        return status
    raise RuntimeError(f"{path}: unexpected status {status}: {str(data)[:300]}")

def check_sensitive():
    rev=blocked("entry_revisions")
    media=blocked("media","verification_note")
    drafts=blocked("entries","id,slug,status",{"status":"neq.published"})
    print(f"PASS revisions_blocked={rev} media_internal_field_blocked={media} drafts_blocked={drafts}")

def check_worlds():
    worlds=expect_ok("knowledge_worlds",{"select":"slug,title,display_order","order":"display_order.asc","limit":"20"})
    if len(worlds)!=7: raise RuntimeError(f"knowledge_worlds expected 7 rows, got {len(worlds)}")
    published=expect_ok("entries",{"select":"id","status":"eq.published","limit":"1000"})
    published_ids={x["id"] for x in published}
    if not published_ids: raise RuntimeError("published entries query returned no rows")
    links=expect_ok("entry_worlds",{"select":"entry_id,world_slug,role","limit":"2000"})
    mapped_ids={x["entry_id"] for x in links}
    if not published_ids.issubset(mapped_ids):
        missing=published_ids-mapped_ids
        raise RuntimeError(f"not all published entries are mapped to a knowledge world (missing={len(missing)})")
    primary_count=sum(1 for x in links if x["role"]=="primary" and x["entry_id"] in published_ids)
    if primary_count!=len(published_ids): raise RuntimeError(f"expected exactly one primary world for each published entry, got {primary_count}/{len(published_ids)}")
    print(f"PASS knowledge_worlds=7 mapped_entries={len(published_ids)} mappings={len(links)}")

def check_acl():
    check_entries()
    check_media()
    check_sensitive()
    check_worlds()
    print("PASS public ACL snapshot")

parser=argparse.ArgumentParser()
parser.add_argument("--check",choices=["entries","media","craft","sensitive","worlds","acl"],required=True)
args=parser.parse_args()
{"entries":check_entries,"media":check_media,"craft":check_craft,"sensitive":check_sensitive,"worlds":check_worlds,"acl":check_acl}[args.check]()


