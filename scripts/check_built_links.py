"""Check local page/asset targets, including HTML embedded in Markdown."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin,urlsplit,unquote
import sys
root=Path(sys.argv[1] if len(sys.argv)>1 else 'site')
base='/jingdezhen-porcelain-wiki/'
class Links(HTMLParser):
 def __init__(self):super().__init__();self.urls=[]
 def handle_starttag(self,tag,attrs):
  for name,value in attrs:
   if (tag=='a' and name=='href') or (tag in ['script','img'] and name=='src') or (tag=='link' and name=='href'):self.urls.append(value)
failures=[];checked=0
for page in root.rglob('*.html'):
 parser=Links();parser.feed(page.read_text())
 origin='https://justinxyj.github.io'+base+str(page.relative_to(root))
 for raw in parser.urls:
  if not raw or raw.startswith(('#','data:','mailto:','javascript:')):continue
  url=urlsplit(urljoin(origin,raw))
  if url.netloc!='justinxyj.github.io':continue
  if not url.path.startswith(base):
   failures.append((str(page.relative_to(root)),raw+' [outside project path]'));checked+=1;continue
  path=root/unquote(url.path[len(base):])
  if path.is_dir():path=path/'index.html'
  checked+=1
  if not path.exists():failures.append((str(page.relative_to(root)),raw))
for page,url in sorted(set(failures)):print('MISSING',page,url)
print(f'{checked} local targets checked; {len(set(failures))} missing')
raise SystemExit(bool(failures))
