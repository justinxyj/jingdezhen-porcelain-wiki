"""Check actual keyboard focus, reduced-motion styles and shared text contrasts."""
import json,os,shutil,urllib.parse
from pathlib import Path
from playwright.sync_api import sync_playwright
BASE=os.getenv('UX_BASE_URL','https://justinxyj.github.io/jingdezhen-porcelain-wiki/')
checks=[]
with sync_playwright() as p:
 opts={'headless':True,'executable_path':shutil.which('chromium')}
 if os.getenv('HTTPS_PROXY'):
  u=urllib.parse.urlsplit(os.environ['HTTPS_PROXY']);opts['proxy']={'server':f'{u.scheme}://{u.hostname}:{u.port or 80}','bypass':'127.0.0.1,localhost'}
  if u.username:opts['proxy']['username']=urllib.parse.unquote(u.username)
  if u.password:opts['proxy']['password']=urllib.parse.unquote(u.password)
 b=p.chromium.launch(**opts);page=b.new_page(ignore_https_errors=True,viewport={'width':1440,'height':1000},reduced_motion='reduce')
 for route,ready in [('search/?q=青花','.jdm-search-result'),('museum/timeline/','.compare-node'),('museum/kiln-map/','.global-kiln-list-item'),('network/relations/','.network-list-item'),('entry/blue-and-white/','.wiki-entry-body')]:
  page.goto(BASE+route);page.locator(ready).first.wait_for(timeout=60000)
  if 'relations' in route:page.locator('#network-graph-toggle summary').click()
  for scheme in ['default','slate']:
   page.evaluate('(s)=>document.body.setAttribute("data-md-color-scheme",s)',scheme)
   target=page.locator('main button:visible, main input:visible, main a[href]:visible').first
   target.focus();page.keyboard.press('Shift+Tab');page.keyboard.press('Tab')
   focus=page.evaluate('''()=>{const e=document.activeElement,s=getComputedStyle(e);return e.matches(':focus-visible')&&((s.outlineStyle!=='none'&&parseFloat(s.outlineWidth)>=2)||s.boxShadow!=='none')}''')
   checks.append({'check':route+' '+scheme+' keyboard focus visible','passed':focus})
   styles=page.evaluate('''()=>[...document.querySelectorAll('main *')].filter(e=>e.getBoundingClientRect().width).every(e=>{const s=getComputedStyle(e);return s.animationName==='none'&&s.transitionDuration.split(',').every(x=>parseFloat(x)===0)})''')
   checks.append({'check':route+' '+scheme+' reduced motion','passed':styles})
   ratios=page.evaluate('''()=>{const body=getComputedStyle(document.body),color=name=>{const e=document.createElement('span');e.style.color=body.getPropertyValue(name);document.body.append(e);const c=getComputedStyle(e).color.match(/[\\d.]+/g).slice(0,3).map(Number);e.remove();return c},lum=c=>c.map(v=>v/255).map(v=>v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4)).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0),bg=lum(color('--visitor-paper'));return ['--visitor-ink','--visitor-muted','--visitor-blue'].map(name=>{const fg=lum(color(name));return {token:name,ratio:(Math.max(fg,bg)+.05)/(Math.min(fg,bg)+.05)}})}''')
   checks.append({'check':route+' '+scheme+' shared text contrast','passed':all(x['ratio']>=4.5 for x in ratios),'ratios':ratios})
 b.close()
Path('/tmp/ux2-focus-motion.json').write_text(json.dumps({'checks':checks},ensure_ascii=False,indent=2)+'\n')
for c in checks:print(c['check'],c['passed'])
if any(not c['passed'] for c in checks):raise SystemExit(1)
