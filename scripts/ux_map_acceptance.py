"""Live map data: mutually exclusive regions and bidirectional keyboard interaction."""
import json,os,shutil,urllib.parse
from pathlib import Path
from playwright.sync_api import sync_playwright
BASE=os.getenv('UX_BASE_URL','http://127.0.0.1:8013/jingdezhen-porcelain-wiki/')
checks=[]
def check(name,value):checks.append({'check':name,'passed':bool(value)});print(name,bool(value),flush=True)
with sync_playwright() as p:
 opts={'headless':True,'executable_path':shutil.which('chromium')}
 if os.getenv('HTTPS_PROXY'):
  u=urllib.parse.urlsplit(os.environ['HTTPS_PROXY']);opts['proxy']={'server':f'{u.scheme}://{u.hostname}:{u.port or 80}','bypass':'127.0.0.1,localhost'}
  if u.username:opts['proxy']['username']=urllib.parse.unquote(u.username)
  if u.password:opts['proxy']['password']=urllib.parse.unquote(u.password)
 b=p.chromium.launch(**opts);page=b.new_page(ignore_https_errors=True,viewport={'width':1440,'height':1000},reduced_motion='reduce')
 page.goto(BASE+'museum/kiln-map/');page.locator('[data-slug="hutian-kiln"]').wait_for(timeout=60000)
 button=page.locator('[data-slug="hutian-kiln"]');button.hover();check('List hover highlights marker',page.locator('.leaflet-marker-icon.is-highlighted').count()==1)
 button.focus();check('List focus highlights marker',page.locator('.leaflet-marker-icon.is-highlighted').count()==1)
 marker=page.locator('.leaflet-marker-icon[title="湖田窑"]');marker.focus();check('Marker focus highlights list',button.evaluate('(e)=>e.classList.contains("is-highlighted")'))
 marker.click();page.locator('dialog[open]').wait_for();check('Marker click selects and scrolls list',button.get_attribute('aria-pressed')=='true');page.keyboard.press('Escape');check('Map modal focus returns to list',button.evaluate('(e)=>document.activeElement===e'))
 button.click();page.locator('dialog[open]').wait_for();page.keyboard.press('Escape');check('List click centers map on its marker',marker.is_visible())
 groups={}
 for key in ['world','jdz','china','japan','korea','southeast','west','europe','other']:
  page.locator('[data-region="'+key+'"]').click();groups[key]=set(page.locator('[data-slug]').evaluate_all('(rows)=>rows.map(r=>r.dataset.slug)'))
 seen=set();disjoint=True
 for key,slugs in groups.items():
  if key=='world':continue
  disjoint=disjoint and not bool(seen&slugs);seen|=slugs
 check('Regional filters are mutually exclusive',disjoint);check('Regional union equals all locations',seen==groups['world'])
 page.goto(BASE+'museum/kiln-map/?slug=imperial-kiln');page.locator('dialog[open]').wait_for(timeout=60000);page.locator('dialog .map-related a[href*="tang-ying-jun-vase"]').wait_for(timeout=60000)
 check('Map real related object',True);check('Map real related person',page.locator('dialog .map-related a[href*="tang-ying/"]').count()>0)
 b.close()
Path('/tmp/ux2-map-acceptance.json').write_text(json.dumps({'checks':checks,'region_sizes':{key:len(v) for key,v in groups.items()}},ensure_ascii=False,indent=2)+'\n')
if not all(x['passed'] for x in checks):raise SystemExit(1)
