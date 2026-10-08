"""Read-only consistency and recovery checks for this consolidated editorial review.
Never connects to a database or executes publishing SQL.
"""
import copy, hashlib, json, re
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
    preflight=load(HERE/'copyedit-preflight.json')
    current={r['slug']:r for r in preflight['entries']}
    assert len(current)==43 and len(preflight['entry_relations'])==3
    assert not preflight['database_write'] and not preflight['database_transaction_dry_run']
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
        row=current[d['slug']];guard(row,d)
        assert d['before']=={k:row[k] for k in d['before']}
        assert apply_diff(d['before'],d['field_diffs'])==d['after']
        assert d['rollback_original_values']==d['before']
        assert d['proposed_after_sha256']==digest(d['after'])
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
    package=load(HERE/'production-diff.json');assert package['tables']=={'entries':43,'entry_relations':3,'media_conditional_inserts':0}
    assert package['existing_row_updates']==46 and package['new_rows_conditional']==0
    assert package['media_conditional_inserts']==[] and package['excluded_image_candidates']['count']==2
    assert not package['excluded_image_candidates']['blocks_current_release']
    for p,d in zip(package['entries'],drafts):
        assert all(p[k]==d[k] for k in p if k!='table')
    relation_review=load(HERE/'relation-image-review.json');assert len(relation_review['relation_candidates'])==58
    rels=preflight['entry_relations']
    for p in relation_review['relation_note_drafts']:
        matches=[r for r in rels if all(r[k]==v for k,v in p['key'].items())];assert len(matches)==1
        assert digest(matches[0])==p['expected_record_sha256']
        assert p['before']=={'note':matches[0]['note']} and list(p['after'])==['note']
        assert apply_diff(p['before'],p['field_diffs'])==p['after']
        assert p['rollback_original_values']==p['before'] and p['proposed_after_sha256']==digest(p['after'])
        assert not re.search(r'https?://|www\.',p['after']['note'])
        assert p['source_refs'] and all(ref['claim_ids'] and set(ref['claim_ids'])<=set(p['claim_ids']) for ref in p['source_refs'])
        assert all(ref['url']==next(s['url'] for s in evidence['sources'] if s['id']==ref['source_id']) for ref in p['source_refs'])
    assert package['entry_relations']==relation_review['relation_note_drafts']
    for p in relation_review['image_insert_drafts']:
        assert p['values']['entry_id']==by[p['slug']]['id']
        assert p['values']['creator'] is None and p['values']['captured_at'] is None
        assert 'CC0' in p['values']['license'] and p['delivery_condition']
        assert p['expected_entry_record_sha256']==digest(by[p['slug']])
        assert not p['production_applied'] and p['sql_preflight']
        assert p['included_in_current_release'] is False
    provenance=load(HERE/'object-provenance.json');assert len(provenance['objects'])==25 and provenance['verified_original_identity']==0
    assert all(r['object_number'] is None and r['image_url'] is None for r in provenance['objects'])
    object_slugs={r['slug'] for r in provenance['objects']}
    object_drafts=[d for d in drafts if d['slug'] in object_slugs]
    assert len(object_drafts)==25
    for d in object_drafts:
        assert d['content_html'].count('<p>')==1 and len(d['content_html'])<100
        assert not any(s in d['content_html'] for s in ['题名所指的题名','资料限度','现有参考资料中的','本页','该节点','此条目'])
        assert len(d['sources'])>=1
        assert all('不作为本器物身份出处' in s['label'] for s in d['sources'])
        assert not any('search/42507' in s['url'] or 'A_PDF-560' in s['url'] for s in d['sources'])
        obj=next(x for x in provenance['objects'] if x['slug']==d['slug'])
        assert len(obj['source_review'])==4
        assert sum(x['action']=='移除错误对象引用' for x in obj['source_review'])==2
        assert all(x['supports_specific_object_identity'] is False for x in obj['source_review'])
        assert [x['proposed'] for x in obj['source_review'] if x['action']=='保留一般背景']==d['sources']
    lang=next(d for d in drafts if d['slug']=='lang-tingji')
    assert '中国国家博物馆' not in lang['content_html'] and '故宫博物院藏郎窑红梅瓶' in lang['content_html']
    assert lang['copyedit_source_alignment']['url'] in [s['url'] for s in lang['sources']]
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
    result={'status':'PASS','entries_with_decision':250,'draft_entries':43,'object_identity_unresolved':25,'relation_candidates':58,'relation_note_drafts':3,'conditional_image_drafts':2,'current_release_media_writes':0,'images_excluded_from_release':True,'priority_24_closed':24,'protected_body_overlap':0,'negative_guard_checks_rejected':rejection_checks,'offline_field_diff_and_original_value_restore':'PASS','draft_html_allowlist':{'passed':len(drafts),'failed':0},'copyedit_checks':{'short_object_notices':25,'per_object_source_reviews':25,'url_free_relation_notes':3,'lang_source_alignment':'PASS','fresh_read_entry_guards':43,'fresh_read_relation_guards':3,'production_package_matches_drafts':'PASS'},'live_database_dry_run':False,'production_write':False,'limits':'Consistency/guards are tested. This does not independently validate every historical claim.'}
    (HERE/'validation-results.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(json.dumps(result,ensure_ascii=False))
if __name__=='__main__':main()
