"""Protect the published text and URLs while testing presentation of all 250 entries.
Uses the exact public build snapshot; no database requests or inferred relations.
"""
import json,re
from pathlib import Path
import generate_entry_pages as g
snapshot=json.loads((g.DOCS/'assets/visitor-entry-snapshot.json').read_text())
assert len(snapshot['entries'])==250
pending=set(snapshot['pending_objects']);assert len(pending)==25
compact=full=toc=0
for e in snapshot['entries']:
 out=g.entry_html(e,{}, {}, {})
 assert out.count('class="wiki-entry-card ')==1 and 'data-static-rendered="true"' in out
 assert f'/entry/{e["slug"]}/' in out
 assert 'href="#entry-references"' in out and 'id="entry-references"' in out
 intro=(g.person_importance(e) if e.get('category')=='人物' else '') or g.intro_for(e)
 content=str(e['zh'].get('content') or '')
 expected=g.clean_body_html(content,intro) if content.strip() else f'<p>{g.html.escape(intro)}</p>'
 body=re.search(r'<section class="wiki-entry-body"><h2>详细介绍</h2>(.*?)</section>',out,re.S).group(1)
 body=re.sub(r'<nav class="visitor-entry-toc"[^>]*>.*?</nav>','',body,flags=re.S)
 body=re.sub(r' id="entry-section-\d+"','',body)
 assert body==expected, f'{e["slug"]}: published reading body changed'
 compact+='visitor-entry-compact' in out;full+='visitor-entry-full' in out;toc+='class="visitor-entry-toc"' in out
 if e['slug'] in pending:
  assert '馆藏资料待核' in out
  assert '当前器物身份已经确认' in out or '编辑选读' in out
  assert '查看原始对象记录' not in out
print(json.dumps({'entries':250,'pending_objects':25,'compact':compact,'full':full,'with_toc':toc,'unchanged_body':250},ensure_ascii=False))
