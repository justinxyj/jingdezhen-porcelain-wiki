"""Read-only consistency and recovery checks for this consolidated editorial review.
Never connects to a database or executes publishing SQL.
"""
import copy, hashlib, json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
HERE=Path(__file__).resolve().parent

def load(path):return json.loads(path.read_text())
def digest(value):return hashlib.sha256(json.dumps(value,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def guard(row,draft):
    assert row['id']==draft['id'] and row['slug']==draft['slug']
    assert row['version']==draft['expected_version']
    assert digest({k:row[k] for k in draft['expected_record_fields']})==draft['expected_record_sha256']
def apply_diff(value,diffs):
    result=copy.deepcopy(value)
    for change in diffs:
        keys=change['path'].strip('/').split('/');parent=result
        for key in keys[:-1]:parent=parent[key]
        key=keys[-1];op=change['operation']
        if op=='add':assert key not in parent
        else:assert parent[key]==change['before']
        if op=='remove':del parent[key]
        else:parent[key]=copy.deepcopy(change['after'])
    return result

def main():
    baseline=load(HERE.parent/'baseline-records.json')['entries'];by={r['slug']:r for r in baseline}
    rows=load(HERE/'quality-governance.json')['entries'];drafts=load(HERE/'entry-drafts.json')['entries'];evidence=load(HERE/'source-evidence.json');claims={c['id']:c for c in evidence['claims']};source_ids={s['id'] for s in evidence['sources']}
    assert len(rows)==len({r['slug'] for r in rows})==250 and {r['slug'] for r in rows}==set(by)
    assert all(r['decision'] in ['保持原文','修订正文','修正来源','修正资料字段','待核保留'] for r in rows)
    assert all(r['decision_reason'] and r['actual_result'] and not r['production_write'] for r in rows)
    assert sum(r['body_equals_summary'] for r in rows)==95
    assert [r['slug'] for r in rows if r['empty_body']]==['eastern-jin-tang']
    assert sum(r['priority']=='P0' for r in rows)==34 and sum(r['priority']=='P1' for r in rows)==32
    original=load(ROOT/'content/editorial/entry-drafts.json')['entries'];protected={r['slug'] for r in original}
    assert len(protected)==79
    assert len(drafts)==len({d['id'] for d in drafts})==len({d['slug'] for d in drafts})==43
    assert not protected.intersection(d['slug'] for d in drafts)
    for d in drafts:
        row=by[d['slug']];guard(row,d)
        assert d['before']=={k:row[k] for k in d['before']}
        assert apply_diff(d['before'],d['field_diffs'])==d['after']
        assert d['rollback_original_values']==d['before']
        assert d['after']['version']==d['before']['version']+1
        assert d['after']['zh']['sources']==d['after']['sources']
        assert all(d['after']['zh'].get(k)==v for k,v in row['zh'].items() if k not in ['summary','content','sources','meta'])
        oldmeta=row['zh'].get('meta',{});newmeta=d['after']['zh'].get('meta',{})
        assert set(oldmeta)<=set(newmeta)
        assert all(newmeta[k]==v for k,v in oldmeta.items() if k not in d['metadata_updates'])
        assert d['content_html']==d['after']['zh'].get('content','') and d['summary']==d['after']['zh']['summary']
        assert d['claim_ids'] and set(d['claim_ids'])<=set(claims)
        assert not d['production_applied']
    for c in claims.values():assert c['source_id'] in source_ids and c['quote'] and c['locator']
    import sys
    sys.path.insert(0,str(ROOT/'scripts'))
    import generate_entry_pages
    assert all(generate_entry_pages.sanitize(d['content_html'])==d['content_html'] for d in drafts)
    for row in rows:assert row['baseline_record_sha256']==digest(by[row['slug']])
    package=load(HERE/'production-diff.json');assert package['tables']=={'entries':43,'entry_relations':3,'media_conditional_inserts':2}
    assert package['existing_row_updates']==46 and package['new_rows_conditional']==2
    relation_review=load(HERE/'relation-image-review.json');assert len(relation_review['relation_candidates'])==58
    support=load(HERE.parent/'supporting-data-baseline.json')['tables'];rels=support['entry_relations']
    for p in relation_review['relation_note_drafts']:
        matches=[r for r in rels if all(r[k]==v for k,v in p['key'].items())];assert len(matches)==1
        assert digest(matches[0])==p['expected_record_sha256']
        assert p['before']=={'note':matches[0]['note']} and list(p['after'])==['note']
        assert apply_diff(p['before'],p['field_diffs'])==p['after']
    for p in relation_review['image_insert_drafts']:
        assert p['values']['entry_id']==by[p['slug']]['id']
        assert p['values']['creator'] is None and p['values']['captured_at'] is None
        assert 'CC0' in p['values']['license'] and p['delivery_condition']
        assert p['expected_entry_record_sha256']==digest(by[p['slug']])
        assert not p['production_applied'] and p['sql_preflight']
    provenance=load(HERE/'object-provenance.json');assert len(provenance['objects'])==25 and provenance['verified_original_identity']==0
    assert all(r['object_number'] is None and r['image_url'] is None for r in provenance['objects'])
    pending=load(HERE/'pending-review.json');assert len(pending['priority_24'])==24
    assert sum(x['result']=='待批准编辑稿已准备' for x in pending['priority_24'])==20
    assert len(list(__import__('csv').reader((HERE/'quality-governance.csv').open())))==251
    # Negative controls demonstrate stale version, identity or text edits are rejected.
    rejection_checks=[]
    for key,value in [('version',999),('slug','different-slug'),('zh',{'content':'concurrent edit'})]:
        altered=copy.deepcopy(by[drafts[0]['slug']]);altered[key]=value
        try:guard(altered,drafts[0])
        except AssertionError:rejection_checks.append(key)
        else:raise AssertionError('stale edit accepted: '+key)
    altered=copy.deepcopy(drafts[0]['field_diffs']);altered[0]['before']='wrong original value'
    try:apply_diff(drafts[0]['before'],altered)
    except AssertionError:rejection_checks.append('incorrect diff original')
    else:raise AssertionError('incorrect diff accepted')
    result={'status':'PASS','entries_with_decision':250,'draft_entries':43,'object_identity_unresolved':25,'relation_candidates':58,'relation_note_drafts':3,'conditional_image_drafts':2,'priority_24_closed':24,'protected_body_overlap':0,'negative_guard_checks_rejected':rejection_checks,'offline_field_diff_and_original_value_restore':'PASS','draft_html_allowlist':{'passed':len(drafts),'failed':0},'live_database_dry_run':False,'production_write':False,'limits':'Consistency/guards are tested. This does not independently validate every historical claim.'}
    (HERE/'validation-results.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(json.dumps(result,ensure_ascii=False))
if __name__=='__main__':main()
