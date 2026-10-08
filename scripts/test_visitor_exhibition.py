"""Real visitor optimization contract; local and production, read-only requests."""
import os,json,shutil,urllib.parse,functools,http.server,tempfile,threading
from pathlib import Path
from playwright.sync_api import sync_playwright
BASE=os.getenv('UX_BASE_URL')
if not BASE:
 workspace=tempfile.TemporaryDirectory(prefix='visitor-exhibition-');root=Path(workspace.name)
 (root/'jingdezhen-porcelain-wiki').symlink_to(Path(os.getenv('VISITOR_SITE_DIR','site')).resolve(),target_is_directory=True)
 server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(http.server.SimpleHTTPRequestHandler,directory=str(root)))
 threading.Thread(target=server.serve_forever,daemon=True).start();BASE=f'http://127.0.0.1:{server.server_port}/jingdezhen-porcelain-wiki/'
BASE=BASE.rstrip('/')+'/'
OUT=Path(os.getenv('EXHIBITION_OUTPUT','/tmp/visitor-exhibition'));OUT.mkdir(parents=True,exist_ok=True)
checks=[]
def check(name,ok,detail=None):
 checks.append({'check':name,'passed':bool(ok),'detail':detail})
 if not ok: print('FAIL',name,detail,flush=True)
with sync_playwright() as p:
 opts={'headless':True,'executable_path':shutil.which('chromium')}
 if os.getenv('HTTPS_PROXY'):
  u=urllib.parse.urlsplit(os.environ['HTTPS_PROXY']);opts['proxy']={'server':f'{u.scheme}://{u.hostname}:{u.port or 80}','bypass':'127.0.0.1,localhost'}
 b=p.chromium.launch(**opts)
 c=b.new_context(ignore_https_errors=True,viewport={'width':390,'height':844},reduced_motion='reduce');page=c.new_page()
 for width in [320,390,768,1440]:
  page.set_viewport_size({'width':width,'height':900})
  for theme in ['default','slate']:
   page.goto(BASE);page.evaluate('(s)=>document.body.setAttribute("data-md-color-scheme",s)',theme)
   image=page.locator('.visitor-hero-object img');image.wait_for();page.wait_for_function('document.querySelector(".visitor-hero-object img").naturalWidth>0')
   check(f'hero real image in first screen {width} {theme}',image.bounding_box()['y']+image.bounding_box()['height']<900)
   check(f'hero source and eager loading {width} {theme}',image.get_attribute('loading')=='eager' and page.locator('.visitor-hero-object a[href*="42490"]').count()==1)
   check(f'brand readable {width} {theme}',page.locator('.md-header__topic').first.evaluate('(e)=>e.scrollWidth<=e.clientWidth+1'))
   check(f'hero no overflow {width} {theme}',page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
   page.screenshot(path=str(OUT/f'home-{width}-{theme}.png'))
 page.set_viewport_size({'width':390,'height':844});page.goto(BASE+'museum/catalog/');page.locator('.catalog-card').first.wait_for(timeout=60000)
 panel=page.locator('.visitor-catalog-filters')
 check('mobile filters initially folded',panel.get_attribute('open') is None)
 check('mobile first object visible',page.locator('.catalog-card').first.bounding_box()['y']<844)
 count=page.locator('.catalog-card').count();panel.locator('summary').click();check('all six filters retained',panel.locator('select').count()==6)
 page.locator('#catalog-glaze').select_option('铜红釉');check('combination state visible','铜红釉' in page.locator('.visitor-filter-status').inner_text())
 panel.get_by_role('button',name='查看结果').click();check('closing preserves filter',page.locator('#catalog-glaze').input_value()=='铜红釉')
 page.locator('.catalog-card a[href*="/entry/"]').first.click();page.locator('.wiki-entry-body').wait_for();page.go_back();page.locator('.catalog-card').first.wait_for();check('Back preserves selected filter',page.locator('#catalog-glaze').input_value()=='铜红釉')
 panel=page.locator('.visitor-catalog-filters');panel.evaluate('(e)=>e.open=true');panel.get_by_role('button',name='清除条件').click();check('clear restores catalogue',page.locator('.catalog-card').count()==count)
 page.screenshot(path=str(OUT/'catalog-390.png'))
 page.goto(BASE+'entry/ming-kinrande-jar/');check('pending object explicitly identified','馆藏资料待核' in page.locator('.visitor-provenance').inner_text());check('short object compact',page.locator('.visitor-entry-compact').count()==1)
 page.locator('a[href="#entry-references"]').click();check('references shortcut works',page.url.endswith('#entry-references'))
 page.screenshot(path=str(OUT/'pending-390.png'))
 page.goto(BASE+'entry/chenghua-doucai-chicken-cup/');check('confirmed object exact original record',page.locator('.visitor-provenance a[href$="42515"]').count()==1 and '1987.85' in page.locator('.visitor-provenance').inner_text())
 page.goto(BASE+'craft/technology-tree/');page.locator('.tech-node').first.wait_for(timeout=60000);check('all72 retained',page.locator('.tech-node').count()==72);check('six-stage introduction',page.locator('.visitor-craft-route a').count()==6)
 page.locator('.tech-node').first.focus();page.keyboard.press('Enter');check('craft detail keyboard accessible',bool(page.locator('#tech-tree-detail').inner_text().strip()))
 page.goto(BASE);page.locator('.visitor-footer a[href*="/issues/new"]').last.click();d=page.locator('dialog[open]');d.locator('textarea').fill('测试记录，不提交');link=d.get_by_role('link',name='在 GitHub 发送反馈（需要账户）');address=urllib.parse.parse_qs(urllib.parse.urlsplit(link.get_attribute('href')).query);check('real issue prefilled with page and description','测试记录，不提交' in address['body'][0] and 'https://justinxyj.github.io/jingdezhen-porcelain-wiki/' in address['body'][0]);check('no-account limitation honest','没有匿名接收渠道' in d.inner_text());page.keyboard.press('Escape')
 page.route('**/*.supabase.co/**',lambda route:route.abort());page.goto(BASE+'search/?q=唐英');page.locator('.jdm-search-result h2 a[href$="/entry/tang-ying/"]').wait_for(timeout=60000);check('search static fallback real canonical entry',True);page.unroute('**/*.supabase.co/**')
 page.goto(BASE+'search/?q=金襕');page.locator('.jdm-search-result').first.wait_for(timeout=60000);page.locator('.jdm-search-result .visitor-provenance').first.wait_for(timeout=30000);check('search pending label matches entry',True)
 c.close();b.close()
(OUT/'results.json').write_text(json.dumps({'base':BASE,'checks':checks,'passed':sum(x['passed'] for x in checks),'failed':sum(not x['passed'] for x in checks)},ensure_ascii=False,indent=2)+'\n')
print(f'{len(checks)} checks, {sum(not x["passed"] for x in checks)} failed')
raise SystemExit(any(not x['passed'] for x in checks))
