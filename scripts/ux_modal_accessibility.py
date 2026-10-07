"""Audit open interactive states, complementing the page and keyboard audit."""
import json,os,shutil,urllib.parse
from pathlib import Path
from playwright.sync_api import sync_playwright
BASE=os.getenv('UX_BASE_URL','https://justinxyj.github.io/jingdezhen-porcelain-wiki/')
OUT=Path(os.getenv('UX_MODAL_OUTPUT','/tmp/ux2-production-modal-a11y.json'))
AXE=os.getenv('AXE_SCRIPT','/tmp/ux2-a11y/node_modules/axe-core/axe.min.js')
results=[];keyboard=[]
with sync_playwright() as p:
 opts={'headless':True,'executable_path':shutil.which('chromium')}
 if os.getenv('HTTPS_PROXY'):
  u=urllib.parse.urlsplit(os.environ['HTTPS_PROXY']);opts['proxy']={'server':f'{u.scheme}://{u.hostname}:{u.port or 80}','bypass':'127.0.0.1,localhost'}
  if u.username:opts['proxy']['username']=urllib.parse.unquote(u.username)
  if u.password:opts['proxy']['password']=urllib.parse.unquote(u.password)
 b=p.chromium.launch(**opts);page=b.new_page(ignore_https_errors=True,viewport={'width':1440,'height':1000},reduced_motion='reduce')
 cases=[('Global search','','.visitor-hero','search'),('Mobile filters','search/?q=青花','.jdm-search-result','filters'),('Image viewer','entry/blue-and-white/','.visitor-entry-shortcuts','image'),('Map detail','museum/kiln-map/','[data-slug="hutian-kiln"]','map'),('Timeline detail','museum/timeline/','.compare-node','timeline'),('Expanded graph','network/relations/','.network-list-item','graph'),('Mobile menu','search/?q=青花','.jdm-search-result','menu')]
 for name,route,ready,action in cases:
  page.set_viewport_size({'width':390 if action in ['filters','menu'] else 1440,'height':844 if action in ['filters','menu'] else 1000});page.goto(BASE+route);page.locator(ready).first.wait_for(timeout=60000)
  if action=='search':page.locator('.visitor-search-trigger').click()
  if action=='filters':page.locator('#search-mobile-filters').click()
  if action=='image':page.locator('.wiki-entry-cover img').first.click()
  if action=='map':page.locator('[data-slug="hutian-kiln"]').click()
  if action=='timeline':page.locator('.compare-node[data-entry-slug="hutian-kiln"]').first.click()
  if action=='menu':page.locator('.md-header [for="__drawer"]').focus();page.keyboard.press('Enter')
  if action=='graph':
   page.locator('#network-graph-toggle summary').click();node=page.locator('.network-node-svg[aria-description]').first;node.wait_for(timeout=30000);node_id=node.get_attribute('data-node-id');node.focus();page.keyboard.press('Enter');keyboard.append({'check':'Graph selection retains keyboard focus','passed':page.evaluate('(id)=>document.activeElement.getAttribute("data-node-id")===id',node_id)})
   cdp=page.context.new_cdp_session(page);tree=cdp.send('Accessibility.getFullAXTree')['nodes'];buttons=[n for n in tree if not n.get('ignored') and n.get('role',{}).get('value')=='button' and n.get('name',{}).get('value')==node.get_attribute('aria-label')]
   keyboard.append({'check':'Expanded graph keyboard node exposed to accessibility tree','passed':bool(buttons)})
   keyboard.append({'check':'Truncated graph label retains full accessible description','passed':any(n.get('description',{}).get('value')==node.get_attribute('aria-description') for n in buttons)})
  elif action!='menu':page.locator('dialog[open]').first.wait_for(timeout=30000)
  page.add_script_tag(path=AXE)
  for scheme in ['default','slate']:
   page.evaluate('(s)=>document.body.setAttribute("data-md-color-scheme",s)',scheme)
   result=page.evaluate('''async()=>await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','best-practice']}})''')
   violations=[{'id':v['id'],'impact':v['impact'],'nodes':[{'target':n['target'],'failureSummary':n.get('failureSummary')} for n in v['nodes']]} for v in result['violations']]
   results.append({'state':name,'scheme':scheme,'violations':violations,'incomplete':[{'id':v['id'],'nodes':len(v['nodes'])} for v in result['incomplete']]});print(name,scheme,len(violations),[v['id'] for v in violations],flush=True)
 b.close()
OUT.write_text(json.dumps({'states':results,'keyboard':keyboard},ensure_ascii=False,indent=2)+'\n')
if any(x['violations'] for x in results) or any(not x['passed'] for x in keyboard):raise SystemExit(1)
