"""Visitor journeys and responsive regressions. Build entries + MkDocs and serve first.
UX_BASE_URL=http://127.0.0.1:8001/jingdezhen-porcelain-wiki/ python scripts/ux_browser_smoke.py
"""
import json, os, shutil, urllib.parse
from pathlib import Path
from playwright.sync_api import sync_playwright
BASE=os.getenv('UX_BASE_URL','http://127.0.0.1:8001/jingdezhen-porcelain-wiki/')
OUT=Path(os.getenv('UX_ARTIFACTS','/tmp/jdm-ux-artifacts'));OUT.mkdir(parents=True,exist_ok=True)
results=[];errors=[];failures=[]
def record(name,ok,detail=''):
 results.append({'check':name,'passed':bool(ok),'detail':detail});print(('PASS ' if ok else 'FAIL ')+name+' '+str(detail),flush=True)
 if not ok:failures.append(name)
with sync_playwright() as p:
 opts={'headless':True}
 executable=os.getenv('CHROMIUM_EXECUTABLE') or shutil.which('chromium')
 if executable:opts['executable_path']=executable
 proxy=os.getenv('HTTPS_PROXY')
 if proxy:
  u=urllib.parse.urlsplit(proxy);opts['proxy']={'server':f'{u.scheme}://{u.hostname}:{u.port or 80}','bypass':'127.0.0.1,localhost'}
  if u.username:opts['proxy']['username']=urllib.parse.unquote(u.username)
  if u.password:opts['proxy']['password']=urllib.parse.unquote(u.password)
 browser=p.chromium.launch(**opts)
 context=browser.new_context(ignore_https_errors=True,viewport={'width':1440,'height':1000},reduced_motion='reduce')
 page=context.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
 routes=[('', '.visitor-hero'),('search/?q=青花','.jdm-search-result'),('museum/kiln-map/','.global-kiln-list-item'),('museum/timeline/','.compare-node'),('museum/catalog/','.catalog-card'),('museum/people/','.person-card'),('network/relations/','.network-list-item'),('network/global/?slug=blue-and-white','.jdm-gn-identity'),('entry/blue-and-white/','.wiki-entry-body'),('research/','h1'),('museum/gallery/','.official-gallery-card')]
 for route,selector in routes:
  try:
   response=page.goto(BASE+route,wait_until='domcontentloaded');record('HTTP '+route,response.status==200)
   page.locator(selector).first.wait_for(timeout=45000)
   record('single h1 '+route,page.locator('h1').count()==1,page.locator('h1').count())
   for width in [375,390,430,1366,1440,1920]:
    page.set_viewport_size({'width':width,'height':844 if width<700 else 1000})
    for scheme in ['default','slate']:
     page.evaluate('(scheme)=>document.body.setAttribute("data-md-color-scheme",scheme)',scheme)
     page.wait_for_timeout(70)
     overflow=page.evaluate('document.documentElement.scrollWidth-document.documentElement.clientWidth')
     record(f'layout {route} {width} {scheme}',overflow<=1,overflow)
    if width in [390,1440]:page.screenshot(path=str(OUT/((route.split('?')[0].replace('/','-') or 'home')+f'-{width}.png')))
   page.evaluate('document.body.setAttribute("data-md-color-scheme","default")');page.set_viewport_size({'width':1440,'height':1000})
  except Exception as e:record('render '+route,False,str(e)[:160])
 # Global keyboard search, canonical navigation and focus restoration.
 page.goto(BASE,wait_until='domcontentloaded');page.locator('.visitor-search-trigger').focus();page.keyboard.press('Control+k');page.locator('dialog[open]').wait_for()
 page.locator('#visitor-search').fill('tangying');page.locator('.visitor-suggestions a').first.wait_for(timeout=30000)
 record('global suggestions canonical', '/entry/tang-ying/' in page.locator('.visitor-suggestions a').first.get_attribute('href'))
 page.keyboard.press('Escape');page.wait_for_function('!document.querySelector("dialog[open]")');record('dialog focus restore',page.locator('.visitor-search-trigger').evaluate('(e)=>e===document.activeElement'))
 # Search actual pagination, empty state and filter reset.
 page.goto(BASE+'search/?q=青花',wait_until='domcontentloaded');page.locator('.jdm-search-result').first.wait_for(timeout=30000)
 first=page.locator('.jdm-search-open').evaluate_all('(els)=>els.map(e=>e.href)');page.locator('#jdm-search-more').click();page.wait_for_function('document.querySelectorAll(".jdm-search-result").length>12')
 urls=page.locator('.jdm-search-open').evaluate_all('(els)=>els.map(e=>e.href)');record('search pagination unique',len(urls)==24 and len(set(urls))==24)
 page.locator('#jdm-entry-search-input').fill('不存在xyz987654');page.locator('#jdm-entry-search-submit').click();page.locator('.jdm-search-empty').wait_for(timeout=30000);record('empty search',True)
 # Core journey A: search blue and white -> related Yuan entry.
 page.goto(BASE+'entry/blue-and-white/',wait_until='domcontentloaded');page.locator('.wiki-entry-v2-relations a').first.wait_for(timeout=30000)
 yuan=page.locator('.visitor-reading-path a').filter(has_text='元');record('journey A Yuan reading route',yuan.count()>0)
 # B: Tang Ying -> imperial kiln -> map. C: map -> Hutian -> related objects.
 page.goto(BASE+'entry/tang-ying/',wait_until='domcontentloaded');page.locator('.wiki-entry-v2-relations a').first.wait_for(timeout=30000)
 record('journey B imperial link',page.locator('.wiki-entry-v2-relations a[href*="imperial"]').count()>0)
 page.goto(BASE+'entry/imperial-kiln/',wait_until='domcontentloaded');page.locator('.visitor-entry-shortcuts a[href*="kiln-map"]').wait_for(timeout=30000);record('entry map shortcut',True)
 page.goto(BASE+'museum/kiln-map/',wait_until='domcontentloaded');hutian=page.locator('[data-slug="hutian-kiln"]');hutian.wait_for(timeout=30000);record('map default Jingdezhen',page.locator('[data-region="jdz"]').get_attribute('aria-pressed')=='true')
 hutian.click();page.locator('dialog[open]').wait_for();page.keyboard.press('Tab');record('modal keyboard contained',page.evaluate('document.querySelector("dialog").contains(document.activeElement)'))
 page.locator('dialog a.visitor-primary').click();page.locator('.wiki-entry-v2-relations a').first.wait_for(timeout=30000);record('journey C related objects',page.locator('.visitor-reading-path a[href*="qingbai-porcelain"]').count()>0)
 # D: timeline dialog -> complete article and sources.
 page.goto(BASE+'museum/timeline/',wait_until='domcontentloaded');page.locator('.compare-node').first.wait_for(timeout=30000);page.locator('.compare-node').first.click();page.locator('dialog .visitor-primary').click();page.locator('.wiki-entry-source-links a').first.wait_for(timeout=30000);record('journey D full entry sources',True)
 # Original query URL is still supported.
 page.goto(BASE+'entry/?slug=tang-ying',wait_until='domcontentloaded');page.locator('.wiki-entry-header h1').wait_for(timeout=30000);record('legacy query URL',page.locator('.wiki-entry-header h1').inner_text()=='唐英')
 # Static reading with JavaScript disabled.
 nojs=browser.new_context(java_script_enabled=False,ignore_https_errors=True,viewport={'width':390,'height':844});static=nojs.new_page()
 for route,selector in [('', '.visitor-hero h1'),('entry/tang-ying/','.wiki-entry-body'),('kilns/hutian-kiln/','h1'),('museum/kiln-map/','a[href*="hutian-kiln"]'),('network/relations/','a[href*="qinghua"]')]:
  static.goto(BASE+route,wait_until='domcontentloaded');record('no JS '+route,any(node.is_visible() for node in static.locator('main').locator(selector).all()))
 # Backend failure must not erase static entry body or source anchors.
 broken=browser.new_context(ignore_https_errors=True);broken.route('**/*.supabase.co/**',lambda route:route.abort());offline=broken.new_page()
 offline.goto(BASE+'entry/tang-ying/',wait_until='domcontentloaded');offline.wait_for_timeout(1500);record('backend failure preserves entry',offline.locator('.wiki-entry-body').is_visible() and offline.locator('.wiki-entry-source-links a').count()>0)
 # No heavy dependencies on home.
 page.goto(BASE,wait_until='domcontentloaded');scripts=page.locator('script[src]').evaluate_all('(els)=>els.map(e=>e.src)');record('homepage light resources',not any(('supabase.min' in x or 'leaflet.js' in x or 'knowledge-store' in x) for x in scripts))
 record('browser runtime errors',len(errors)==0,errors)
 browser.close()
(OUT/'results.json').write_text(json.dumps({'checks':results,'errors':errors,'failures':failures},ensure_ascii=False,indent=2))
if failures:raise SystemExit(f'{len(failures)} checks failed; see {OUT}/results.json')
print(f'All {len(results)} checks passed; artifacts: {OUT}',flush=True)
