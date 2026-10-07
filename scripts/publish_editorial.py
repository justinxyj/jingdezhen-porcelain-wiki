#!/usr/bin/env python3
"""Optimistic, all-or-nothing editorial release. Default is a rolled-back preview.

Requires H3_DB_URL via secure environment configuration. Never prints the URL.
A protected backup and content diff are written before an optional commit.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def digest(value):
    return hashlib.sha256(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()

def plans():
    folder = ROOT / 'content/editorial'
    entries = json.loads((folder / 'entry-drafts.json').read_text())['entries']
    processes = [r for r in json.loads((folder / 'process-drafts.json').read_text())['processes'] if r.get('editorial_review') == 'accepted_as_general_process_explanation']
    contexts = json.loads((folder / 'timeline-drafts.json').read_text())['contexts']
    if (len(entries), len(processes), len(contexts)) != (79, 65, 16):
        raise ValueError('Release cardinality must be exactly 79 / 65 / 16')
    rows = []
    for row in entries:
        if not row.get('expected_record_sha256') or set(row.get('expected_record_fields', [])) != {'id', 'slug', 'category', 'zh', 'en', 'ja', 'sources', 'status', 'version'}:
            raise ValueError('Entry release requires the complete original-record guard: ' + row['slug'])
        rows.append(('entries', 'id', row['id'], row))
    for row in processes:
        rows.append(('craft_processes', 'id', row['id'], row))
    for row in contexts:
        rows.append(('timeline_context', 'entry_id', row['entry_id'], row))
    if len({(t, k) for t, _, k, _ in rows}) != 160:
        raise ValueError('Duplicate release target')
    return rows

def replacement(table, before, draft):
    if table == 'entries':
        if before['slug'] != draft['slug'] or before['status'] != 'published':
            raise ValueError('Entry identity or publication status changed')
        if before['version'] != draft['expected_version'] or digest(before['zh']) != draft['expected_zh_sha256']:
            raise ValueError('Entry changed since editorial snapshot: ' + draft['slug'])
        if draft.get('expected_record_sha256') and digest({k:before.get(k) for k in draft['expected_record_fields']}) != draft['expected_record_sha256']:
            raise ValueError('Entry record changed since editorial snapshot: ' + draft['slug'])
        zh = dict(before['zh'])
        zh.update(title=draft['title'], summary=draft['summary'], content=draft['content_html'], sources=draft['sources'])
        if draft.get('metadata_updates'):
            zh['meta'] = {**zh.get('meta', {}), **draft['metadata_updates']}
        return {'zh': zh, 'sources': draft['sources'], 'version': before['version'] + 1, 'updated_by': None}
    if digest(before) != draft['expected_row_sha256']:
        raise ValueError('Row changed since editorial snapshot: ' + draft['slug'])
    if table == 'craft_processes':
        if before['slug'] != draft['slug']:
            raise ValueError('Process identity changed')
        return {'description_zh': draft['description_zh']}
    # Editorial prose is not museum verbatim text; preserve all official fields.
    return {'historical_role': draft['historical_role'], 'relationship_to_jingdezhen': draft['relationship_to_jingdezhen'], 'ai_summary': draft['editorial_summary'], 'description_source_type': 'editorial_synthesis'}

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--apply', action='store_true')
    parser.add_argument('--preview-sha256', help='Required for apply: digest of previously reviewed preview')
    parser.add_argument('--output', type=Path, required=True, help='New protected directory for backup, diff and receipt')
    args = parser.parse_args()
    targets = plans()
    url = os.environ.get('H3_DB_URL') or os.environ.get('DATABASE_URL')
    if not url:
        parser.exit(2, 'BLOCKED: H3_DB_URL / DATABASE_URL is not configured. No writes performed.\n')
    import psycopg
    from psycopg import sql
    args.output.mkdir(mode=0o700, parents=True, exist_ok=False)
    os.chmod(args.output, 0o700)
    backup, changes = [], []
    with psycopg.connect(url) as conn:
        with conn.cursor() as cur:
            cur.execute('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE')
            cur.execute("SET LOCAL lock_timeout = '10s'")
            cur.execute("SET LOCAL statement_timeout = '60s'")
            for table, key_column, key, draft in targets:
                cur.execute(sql.SQL('SELECT row_to_json(t) FROM public.{} AS t WHERE {} = %s FOR UPDATE').format(sql.Identifier(table), sql.Identifier(key_column)), (key,))
                result = cur.fetchone()
                if not result:
                    raise ValueError('Missing release target: ' + draft['slug'])
                before = result[0]
                after = replacement(table, before, draft)
                backup.append({'table': table, 'key_column': key_column, 'key': key, 'row': before})
                changes.append({'table': table, 'key_column': key_column, 'key': key, 'slug': draft['slug'], 'before': {k: before.get(k) for k in after}, 'after': after})
            preview_hash = digest(changes)
            if args.apply and args.preview_sha256 != preview_hash:
                raise ValueError('Apply requires the exact SHA256 of the reviewed live preview')
            (args.output / 'backup.json').write_text(json.dumps(backup, ensure_ascii=False, indent=2) + '\n')
            (args.output / 'diff.json').write_text(json.dumps(changes, ensure_ascii=False, indent=2) + '\n')
            for change in changes:
                fields, values = [], []
                for column, value in change['after'].items():
                    fields.append(sql.SQL('{} = %s').format(sql.Identifier(column)))
                    values.append(psycopg.types.json.Jsonb(value) if isinstance(value, (dict, list)) else value)
                fields.append(sql.SQL('updated_at = now()'))
                cur.execute(sql.SQL('UPDATE public.{} SET {} WHERE {} = %s').format(sql.Identifier(change['table']), sql.SQL(', ').join(fields), sql.Identifier(change['key_column'])), (*values, change['key']))
                if cur.rowcount != 1:
                    raise ValueError('Unexpected update count')
                cur.execute(sql.SQL('SELECT row_to_json(t) FROM public.{} AS t WHERE {} = %s').format(sql.Identifier(change['table']), sql.Identifier(change['key_column'])), (change['key'],))
                written = cur.fetchone()[0]
                if any(written[k] != v for k, v in change['after'].items()):
                    raise ValueError('Database did not preserve requested values')
            if args.apply:
                conn.commit()
                (args.output / 'receipt.json').write_text(json.dumps({'mode':'production_committed_reread_pending','preview_sha256':preview_hash,'database_verified':False,'website_verified':False},indent=2)+'\n')
            else:
                conn.rollback()
        # Verify a committed release through a new read transaction.
        if args.apply:
            with conn.cursor() as cur:
                for change in changes:
                    cur.execute(sql.SQL('SELECT row_to_json(t) FROM public.{} AS t WHERE {} = %s').format(sql.Identifier(change['table']), sql.Identifier(change['key_column'])), (change['key'],))
                    stored = cur.fetchone()[0]
                    if any(stored[k] != v for k, v in change['after'].items()):
                        raise ValueError('Post-commit verification failed; protected backup retained')
    receipt = {'mode': 'production_committed_and_reread' if args.apply else 'live_preview_rolled_back', 'preview_sha256': preview_hash, 'entries': 79, 'processes': 65, 'contexts': 16, 'website_verified': False, 'database_verified': bool(args.apply)}
    (args.output / 'receipt.json').write_text(json.dumps(receipt, indent=2) + '\n')
    print(json.dumps(receipt))

if __name__ == '__main__':
    main()
