"""Targeted production/local regression for the UX quality fixes; no database writes."""
import json,os,shutil,urllib.parse
from pathlib import Path
from playwright.sync_api import sync_playwright
BASE=os.getenv('UX_BASE_URL','http://127.0.0.1:8020/jingdezhen-porcelain-wiki/')
OUT=Path(os.getenv('UX_QUALITY_OUTPUT','/tmp/uxq-local'));OUT.mkdir(parents=True,exist_ok=True)
checks=[];metrics=[];errors=[]
def record(name,ok,detail=''):
 checks.append({'check':name,'passed':bool(ok),'detail':detail});print(name,bool(ok),detail,flush=True)
with sync_playwright() as p:
 opts={'executable_path':shutil.which('chromium'),'headless':True}
 if os.getenv('HTTPS_PROXY'):
  u=urllib.parse.urlsplit(os.environ['HTTPS_PROXY']);opts['proxy']={'server':f'{u.scheme}://{u.hostname}:{u.port or 80}','bypass':'127.0.0.1,localhost'}
 b=p.chromium.launch(**opts);context=b.new_context(ignore_https_errors=True,viewport={'width':390,'height':844},reduced_motion='reduce',accept_downloads=True);page=context.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
 routes=[('', '.visitor-hero'),('museum/catalog/','.catalog-card'),('museum/people/','.person-card'),('entry/qingbai-porcelain/','.wiki-entry-body'),('entry/tang-ying/','.wiki-entry-body'),('search/?q=青花','.jdm-search-result'),('craft/technology-tree/','.tech-node'),('museum/timeline/','.compare-node'),('museum/kiln-map/','.global-kiln-list-item'),('contemporary/','.modern-closing-actions')]
 for width in [320,375,390,768,1440]:
  page.set_viewport_size({'width':width,'height':844})
  for route,ready in routes:
   page.goto(BASE+route);page.locator(ready).first.wait_for(timeout=60000);page.wait_for_timeout(200)
   for scheme in ['default','slate']:
    page.evaluate('(s)=>document.body.setAttribute("data-md-color-scheme",s)',scheme)
    record(f'layout {route} {width} {scheme}',page.evaluate('document.documentElement.scrollWidth-innerWidth')<=1)
   page.evaluate('document.body.setAttribute("data-md-color-scheme","default")')
   if route=='museum/catalog/':page.locator('.visitor-catalog-filters').evaluate('(e)=>e.open=true')
   selects=page.locator('.museum-toolbar select').evaluate_all('(es)=>es.map(e=>({id:e.id,width:e.getBoundingClientRect().width,label:e.selectedOptions[0]?.textContent}))')
   if selects:
    record(f'full filter set {route} {width}',len(selects)==(6 if 'catalog' in route else 3))
    record(f'readable filters {route} {width}',all(s['width']>=110 for s in selects),selects)
   missing=page.locator('.wiki-entry-header>.visitor-missing-image')
   if missing.count():record(f'compact no image {route} {width}',missing.bounding_box()['height']<=80)
   if route=='':
    image=page.locator('.visitor-object-grid img').first;record(f'existing gallery immediately after hero {width}',page.locator('.visitor-home>section').nth(1).locator('.visitor-object-grid').count()==1)
    metrics.append({'width':width,'first_image_document_y':image.evaluate('(e)=>e.getBoundingClientRect().top+scrollY')})
    if width==390:image.scroll_into_view_if_needed();page.wait_for_function('document.querySelector(".visitor-object-grid img").naturalWidth>0',timeout=30000);record('actual Palace Museum home image loads',True)
   if page.locator('.md-header__inner .visitor-search-trigger').count():record(f'header search stays in row {route} {width}',page.locator('.md-header__inner .visitor-search-trigger').evaluate('(e)=>{const a=e.getBoundingClientRect(),b=e.parentElement.getBoundingClientRect();return a.top>=b.top&&a.bottom<=b.bottom+1}'))
   if width in [320,375,390] and route in ['', 'museum/catalog/','museum/people/','entry/qingbai-porcelain/']:
    if selects:page.locator('.museum-toolbar').scroll_into_view_if_needed()
    page.screenshot(path=str(OUT/(('home' if not route else route.replace('/','-'))+str(width)+'.png')))
 # Real filter selections and clearing preserve the full original result count.
 page.set_viewport_size({'width':390,'height':844})
 for route,prefix,card,field,val in [('museum/catalog/','catalog','.catalog-card','glaze','铜红釉'),('museum/people/','people','.person-card','era','qing')]:
  page.goto(BASE+route);page.locator(card).first.wait_for(timeout=60000);count=page.locator(card).count();
  if prefix=='catalog':page.locator('.visitor-catalog-filters summary').click()
  page.locator('#'+prefix+'-'+field).select_option(val);page.wait_for_timeout(100)
  record(prefix+' selected state visible',val in page.locator('.visitor-filter-status').inner_text() or '清' in page.locator('.visitor-filter-status').inner_text())
  page.locator('.visitor-filter-status').scroll_into_view_if_needed();page.screenshot(path=str(OUT/(prefix+'-selected-390.png')))
  page.get_by_role('button',name='清除全部筛选').click();record(prefix+' clear restores results',page.locator(card).count()==count and page.locator('#'+prefix+'-'+field).input_value()=='')
 page.goto(BASE+'entry/qingbai-porcelain/');page.locator('.visitor-references').wait_for();page.locator('.visitor-references summary').click();text=page.locator('.visitor-references').inner_text()
 record('Qingbai all existing references resolve',all(code in text for code in ['R01','R09','R10']) and page.locator('.wiki-entry-source-links a').count()==3 and '已核验' not in text)
 page.wait_for_function('typeof window.JDM_KNOWLEDGE?.get==="function"');actual=page.evaluate('async()=>{const e=await window.JDM_KNOWLEDGE.get("qingbai-porcelain");return {version:e.version,updated_at:e.updated_at}}')
 record('Revision uses production timestamp/version',page.locator('.visitor-entry-revision time').get_attribute('datetime')==actual['updated_at'] and ('版本 '+str(actual['version'])) in page.locator('.visitor-entry-revision').inner_text())
 record('shared Material header and search',page.locator('.md-header').count()==1 and page.locator('.visitor-primary-nav').count()==1 and page.locator('.md-header .visitor-search-trigger').count()==1 and page.locator('.visitor-static-nav').count()==0)
 page.locator('.visitor-feedback a').click();dialog=page.locator('dialog[open]');record('visitor feedback no account/no fake submission','需要 GitHub 账户' in dialog.inner_text() and '没有匿名接收渠道' in dialog.inner_text() and '尚未发送' in dialog.inner_text())
 page.add_script_tag(path=os.getenv('AXE_SCRIPT','/tmp/ux2-a11y/node_modules/axe-core/axe.min.js'))
 for scheme in ['default','slate']:
  page.evaluate('(s)=>document.body.setAttribute("data-md-color-scheme",s)',scheme)
  violations=page.evaluate("async()=>{const r=await axe.run(document.querySelector('dialog[open]'),{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}});return r.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))}")
  record('feedback dialog accessibility '+scheme,not violations,violations)
 page.evaluate('document.body.setAttribute("data-md-color-scheme","default")');page.screenshot(path=str(OUT/'feedback-390.png'))
 record('feedback dialog no horizontal scroll',dialog.evaluate('(e)=>e.scrollWidth<=e.clientWidth+1'))
 dialog.locator('textarea').fill('回归测试：说明显示问题，不提交。')
 with page.expect_download() as download:dialog.get_by_role('button',name='下载反馈记录').click()
 file=download.value.path();record('feedback download real content','回归测试' in Path(file).read_text() and 'qingbai-porcelain' in Path(file).read_text())
 for _ in range(9):page.keyboard.press('Tab');record('feedback dialog keyboard containment',dialog.evaluate('(e)=>e.contains(document.activeElement)'))
 page.keyboard.press('Escape');page.wait_for_function('!document.querySelector("dialog.visitor-dialog")');record('feedback ESC focus return',page.locator('.visitor-feedback a').evaluate('(e)=>e===document.activeElement'))
 # Correct internal URLs are followed, not merely inspected as strings.
 for label,target,ready in [('时间轴','museum/timeline/','.compare-node'),('窑址地图','museum/kiln-map/','.global-kiln-list-item'),('器物图谱','museum/catalog/','.catalog-card')]:
  page.goto(BASE+'contemporary/');page.locator('.modern-closing-actions a').filter(has_text=label).click();page.locator(ready).first.wait_for(timeout=60000);record('contemporary real navigation '+label,target in page.url)
 page.goto(BASE+'entry/huang-yunpeng/');page.locator('.wiki-entry-v2-relations a').first.wait_for(timeout=60000)
 record('object never labelled person','相关器物' in page.locator('.wiki-entry-v2-relations a[href$="/blue-and-white/"] span').inner_text() and '相关人物' not in page.locator('.wiki-entry-v2-relations a[href$="/blue-and-white/"] span').inner_text())
 record('generic card template removed','阅读相关内容的历史与参考资料' not in page.locator('.wiki-entry-v2-relations').inner_text())
 # Explicit failure and retry, using new contexts to avoid cached successful requests.
 for route,ready in [('museum/catalog/','.catalog-card'),('museum/people/','.person-card'),('search/?q=青花','.jdm-search-result'),('craft/technology-tree/','.tech-node'),('museum/timeline/','.compare-node'),('museum/kiln-map/','.global-kiln-list-item')]:
  c=b.new_context(ignore_https_errors=True,viewport={'width':390,'height':844});f=c.new_page();f.route('**/*.supabase.co/**',lambda r:r.abort());f.goto(BASE+route)
  try:
   if route.startswith('search/'):
    f.locator(ready).first.wait_for(timeout=40000);record('search static fallback under database failure','构建时的百科索引' in f.locator('#jdm-search-status').inner_text())
    f.unroute('**/*.supabase.co/**');f.reload();f.locator(ready).first.wait_for(timeout=60000);record('search live recovery', '构建时的百科索引' not in f.locator('#jdm-search-status').inner_text())
   else:
    f.locator('.visitor-state-error').first.wait_for(timeout=40000);record('failure state '+route,'暂时无法加载' in f.locator('.visitor-state-error').first.inner_text())
    f.unroute('**/*.supabase.co/**');f.get_by_role('button',name='重新加载',exact=True).first.click();f.locator(ready).first.wait_for(timeout=60000);record('retry recovers '+route,True)
  except Exception as e:record('failure/retry '+route,False,str(e)[:180])
  c.close()
 # Simulated slow initial REST reads: release only after the visible loading state is checked.
 c=b.new_context(ignore_https_errors=True);slow=c.new_page();held=[];slow.route('**/*.supabase.co/**',lambda r:held.append(r));slow.goto(BASE+'museum/catalog/',wait_until='domcontentloaded');slow.locator('.visitor-state-loading').wait_for();record('weak network loading/busy semantics',slow.locator('#catalog-list').get_attribute('aria-busy')=='true');slow.wait_for_timeout(1200);
 for r in tuple(held):r.continue_()
 slow.unroute('**/*.supabase.co/**')
 slow.locator('.catalog-card').first.wait_for(timeout=60000);record('weak network eventually recovers',True);c.close()
 record('no browser runtime errors',not errors,errors);b.close()
(OUT/'results.json').write_text(json.dumps({'base':BASE,'checks':checks,'home_metrics':metrics,'errors':errors},ensure_ascii=False,indent=2)+'\n')
if any(not c['passed'] for c in checks):raise SystemExit(1)
