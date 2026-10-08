"""Index rendered, public prose pages. No inferred provenance or verification."""
import json
import re
from html.parser import HTMLParser
from pathlib import Path

class Prose(HTMLParser):
    def __init__(self):
        super().__init__(); self.parts=[]; self.images=[]; self.skip=0
    def handle_starttag(self, tag, attrs):
        attrs=dict(attrs)
        if tag in ('script','style'): self.skip+=1
        if tag=='img' and attrs.get('src'): self.images.append({'path':attrs['src'],'title':attrs.get('alt','')})
    def handle_endtag(self,tag):
        if tag in ('script','style'): self.skip=max(0,self.skip-1)
        if tag in ('p','h1','h2','h3','li'): self.parts.append(' ')
    def handle_data(self,data):
        if not self.skip:self.parts.append(data)

_records=[]
def on_pre_build(config):
    _records.clear()

def on_page_content(html,page,config,files):
    source=page.file.src_uri
    search=page.meta.get('search',{})
    if source.startswith(('entry/','en/','ja/','admin/')) or (isinstance(search,dict) and search.get('exclude',False)):return html
    if any(x in html for x in ('data-entry-search','curator-root','wiki-entry-root')):return html
    parser=Prose();parser.feed(html)
    text=re.sub(r'\s+',' ',''.join(parser.parts)).strip()
    # Short widget/landing shells are not independent articles.
    if len(text)<250:return html
    meta=page.meta.get('search_metadata',{})
    if not isinstance(meta,dict):meta={}
    _records.append({'title':page.title,'url':page.url,'type':meta.get('type','专题'),
      'era':meta.get('era',''),'summary':page.meta.get('description') or text[:180],
      'text':text,'image':parser.images[0] if parser.images else None,
      'keywords':meta.get('keywords',[]),'sources':meta.get('sources',[]),
      'world':meta.get('world',''),'source_type':'markdown'})
    return html

def on_post_build(config):
    target=Path(config.site_dir)/'assets'/'topic-search.json'
    target.parent.mkdir(parents=True,exist_ok=True)
    target.write_text(json.dumps(_records,ensure_ascii=False,separators=(',',':')),encoding='utf-8')

    import sys
    sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
    from source_reference_catalog import source_catalog
    (target.parent/'source-references.js').write_text('window.JDM_SOURCE_REFERENCES='+json.dumps(source_catalog(),ensure_ascii=False).replace('</','<\\/')+';\n',encoding='utf-8')
