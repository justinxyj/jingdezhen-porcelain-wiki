"""Real browser axe WCAG audit plus focused keyboard and dialog acceptance."""
import json, os, shutil, urllib.parse
from pathlib import Path
from playwright.sync_api import sync_playwright
BASE=os.getenv('UX_BASE_URL','http://127.0.0.1:8013/jingdezhen-porcelain-wiki/')
AXE=os.getenv('AXE_SCRIPT','/tmp/ux2-a11y/node_modules/axe-core/axe.min.js')
OUT=Path(os.getenv('UX_ACCESSIBILITY_OUTPUT','/tmp/ux2-accessibility.json'))
ROUTES=[('', '.visitor-hero'),('search/?q=青花','.jdm-search-result'),('entry/blue-and-white/','.wiki-entry-body'),('museum/kiln-map/','.global-kiln-list-item'),('museum/timeline/','.compare-node'),('network/relations/','.network-list-item'),('museum/catalog/','.catalog-card'),('museum/people/','.person-card'),('research/evidence/?slug=tang-ying','[data-evidence-chain] h2'),('contemporary/','.jdm-world-entry-card'),('network/global/?slug=blue-and-white','.jdm-gn-identity'),('craft/technology-tree/','.tech-entry-card'),('museum/gallery/','.official-gallery-card')]+[(r,'.jdm-world-entry-card') for r in ['history/','craft/','objects/','kilns/','people/','research/']]
results=[];keyboard=[]
with sync_playwright() as p:
 opts={'headless':True,'executable_path':shutil.which('chromium')}
 proxy=os.getenv('HTTPS_PROXY')
 if proxy:
  u=urllib.parse.urlsplit(proxy);opts['proxy']={'server':f'{u.scheme}://{u.hostname}:{u.port or 80}','bypass':'127.0.0.1,localhost'}
  if u.username:opts['proxy']['username']=urllib.parse.unquote(u.username)
  if u.password:opts['proxy']['password']=urllib.parse.unquote(u.password)
 browser=p.chromium.launch(**opts);context=browser.new_context(ignore_https_errors=True,viewport={'width':1440,'height':1000},reduced_motion='reduce');page=context.new_page()
 for route,selector in ROUTES:
  page.goto(BASE+route,wait_until='domcontentloaded');page.locator(selector).first.wait_for(timeout=60000);page.add_script_tag(path=AXE)
  for scheme in ['default','slate']:
   page.evaluate('(s)=>document.body.setAttribute("data-md-color-scheme",s)',scheme)
   audit=page.evaluate('''async()=>await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','best-practice']}})''')
   violations=[{'id':v['id'],'impact':v['impact'],'description':v['description'],'nodes':[{'target':n['target'],'html':n['html'],'failureSummary':n.get('failureSummary')} for n in v['nodes']]} for v in audit['violations']]
   results.append({'url':BASE+route,'scheme':scheme,'violations':violations,'incomplete':[{'id':v['id'],'nodes':len(v['nodes'])} for v in audit['incomplete']],'passes':len(audit['passes'])});print(route,scheme,len(violations),[v['id'] for v in violations],flush=True)
 page.set_viewport_size({'width':390,'height':844});page.goto(BASE+'search/?q=青花');page.locator('.jdm-search-result').first.wait_for(timeout=60000)
 menu=page.locator('.md-header [for="__drawer"]');menu.focus();page.keyboard.press('Enter');keyboard.append({'check':'mobile menu Enter opens','passed':menu.get_attribute('aria-expanded')=='true' and page.evaluate('document.querySelector(".md-sidebar--primary").contains(document.activeElement)')});page.keyboard.press('Escape');keyboard.append({'check':'mobile menu Escape focus return','passed':menu.get_attribute('aria-expanded')=='false' and menu.evaluate('(e)=>document.activeElement===e')})
 button=page.locator('#search-mobile-filters');button.focus();button.click();modal=page.locator('dialog[open]');modal.wait_for()
 keyboard.append({'check':'mobile filter accessible dialog','passed':modal.get_attribute('aria-modal')=='true' and bool(modal.get_attribute('aria-labelledby'))})
 for _ in range(14):
  page.keyboard.press('Tab');keyboard.append({'check':'Tab focus inside mobile dialog','passed':page.evaluate('document.querySelector("dialog[open]").contains(document.activeElement)')})
 keyboard.append({'check':'mobile filter Tab containment','passed':True})
 page.keyboard.press('Escape');keyboard.append({'check':'Escape and focus return','passed':page.locator('dialog[open]').count()==0 and page.evaluate('document.activeElement.id')=='search-mobile-filters'})
 button.click();page.locator('dialog select[name="hasImage"]').select_option('true');page.locator('dialog button').filter(has_text='应用筛选').click();page.wait_for_timeout(700)
 keyboard.append({'check':'mobile filter applies reliable image field','passed':'image=true' in page.url})
 page.goto(BASE+'entry/blue-and-white/');page.locator('.wiki-entry-cover img').first.wait_for(timeout=60000);image=page.locator('.wiki-entry-cover img').first;image.focus();page.keyboard.press('Enter');page.locator('dialog.visitor-image-viewer').wait_for();
 for label in ['放大','缩小','适应窗口']:page.locator('dialog button').filter(has_text=label).click()
 keyboard.append({'check':'image keyboard and zoom controls','passed':True});page.keyboard.press('Escape');keyboard.append({'check':'image viewer focus return','passed':page.evaluate('document.activeElement.matches(".wiki-entry-cover img")')})
 browser.close()
OUT.write_text(json.dumps({'automated_wcag':results,'keyboard':keyboard,'manual_limits':'Automated rules and browser keyboard checks do not prove human screen-reader comprehension.'},ensure_ascii=False,indent=2)+'\n')
if any(r['violations'] for r in results) or any(not k['passed'] for k in keyboard):raise SystemExit(1)
