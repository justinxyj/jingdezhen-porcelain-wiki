"""Resolve existing Rxx references from the site's maintained bibliography."""
import re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def source_catalog():
    result={}
    for line in (ROOT/'docs/research/sources.md').read_text().splitlines():
        match=re.match(r'\*\*\[(R\d+)\] (.+?)\*\*',line)
        if not match:continue
        links=re.findall(r'\[([^\]]+)\]\((https?://[^\s)]+)\)',line)
        if not links:continue
        code,title=match.groups();label,url=links[0]
        result[code]={'url':url,'label':code+' · '+title,'title':title}
    return result

def resolve_sources(value):
    if not isinstance(value,list):return []
    catalog=source_catalog()
    return [catalog.get(item,item) if isinstance(item,str) else item for item in (value or [])]
