"""Real-browser, read-only regression for authoritative static Entry DOM and lazy enhancement."""
import asyncio, json, os, shutil, sys, urllib.parse, functools, http.server, tempfile, threading
from pathlib import Path
from playwright.async_api import async_playwright
BASE=os.getenv('ENTRY_BASE_URL')
SITE=Path(os.getenv('ENTRY_SITE_DIR','site'))
OUT=Path(os.getenv('ENTRY_OUTPUT','/tmp/entry-render-stability'));OUT.mkdir(parents=True,exist_ok=True)
server=None;workspace=None
if not BASE:
 workspace=tempfile.TemporaryDirectory(prefix='entry-stability-');root=Path(workspace.name)
 (root/'jingdezhen-porcelain-wiki').symlink_to(SITE.resolve(),target_is_directory=True)
 class QuietHandler(http.server.SimpleHTTPRequestHandler):
  def log_message(self,*args):pass
 server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(QuietHandler,directory=str(root)))
 threading.Thread(target=server.serve_forever,daemon=True).start()
 BASE=f'http://127.0.0.1:{server.server_port}/jingdezhen-porcelain-wiki/'
BASE=BASE.rstrip('/')+'/'
rows=[]
SNAP='''()=>{const root=document.getElementById('wiki-entry-root');const nodes=[root,root.querySelector('h1'),root.querySelector('.wiki-entry-body'),root.querySelector('.wiki-entry-cover img')];return {identity:!window.__entryNodes||window.__entryNodes.every((e,i)=>e===nodes[i]),cards:document.querySelectorAll('.wiki-entry-card').length,nested:document.querySelectorAll('.wiki-entry-card .wiki-entry-card').length,title:root.querySelector('h1').outerHTML,body:root.querySelector('.wiki-entry-body').outerHTML,image:Array.from(root.querySelectorAll('.wiki-entry-cover img')).map(e=>({src:e.dataset.originalSrc||e.getAttribute('src'),alt:e.getAttribute('alt'),caption:e.closest('figure').querySelector('figcaption')?.textContent})),rects:nodes.map(e=>{if(!e)return null;const r=e.getBoundingClientRect();return [r.x,r.y+scrollY,r.width,r.height].map(n=>Math.round(n*10)/10)}),scroll:scrollY,selection:getSelection().toString(),state:root.dataset.enhancementState||'html'};}'''
def stable(a,b,frame=True):
 return a['identity'] and b['identity'] and a['cards']==b['cards']==1 and a['nested']==b['nested']==0 and all(a[k]==b[k] for k in ['title','body','image']) and (a['rects']==b['rects'] if frame else a['rects'][1:]==b['rects'][1:])
async def relay_read(route):
 from urllib.request import Request, urlopen
 from urllib.error import HTTPError
 method=route.request.method
 path=urllib.parse.urlsplit(route.request.url).path
 assert method=='GET' or (method=='POST' and path in ['/rest/v1/rpc/entry_timeline_peers','/rest/v1/rpc/entry_space_peers']), 'only GET and existing SQL STABLE peer lookups permitted'
 def read():
  headers={k:v for k,v in route.request.headers.items() if k in ['apikey','authorization','accept']}
  headers['User-Agent']='Jingdezhen-Entry-Stability/1.0'
  if method=='POST':headers['Content-Type']='application/json'
  try:
   with urlopen(Request(route.request.url,headers=headers,data=route.request.post_data.encode() if method=='POST' else None,method=method),timeout=60) as response:
    return response.status,response.read(),response.headers.get('Content-Type','application/json')
  except HTTPError as error:return error.code,error.read(),'application/json'
 status,body,kind=await asyncio.to_thread(read)
 await route.fulfill(status=status,body=body,content_type=kind,headers={'access-control-allow-origin':'*'})

async def main():
 async with async_playwright() as p:
  opts={'headless':True}
  if shutil.which('chromium'):opts['executable_path']=shutil.which('chromium')
  if os.getenv('HTTPS_PROXY'):
   u=urllib.parse.urlsplit(os.environ['HTTPS_PROXY']);opts['proxy']={'server':f'{u.scheme}://{u.hostname}:{u.port or 80}','bypass':'localhost,127.0.0.1'}
   if u.username:opts['proxy']['username']=urllib.parse.unquote(u.username)
   if u.password:opts['proxy']['password']=urllib.parse.unquote(u.password)
  browser=await p.chromium.launch(**opts)
  sem=asyncio.Semaphore(6)
  async def case(slug,width=1440,theme='default',mode='normal',shots=False):
   async with sem:
    context=await browser.new_context(viewport={'width':width,'height':900},ignore_https_errors=True,reduced_motion='reduce',java_script_enabled=mode!='no-js',color_scheme='dark' if theme=='slate' else 'light')
    page=await context.new_page();requests=[];gate=asyncio.Event();script_gate=asyncio.Event()
    async def script(route):
     await script_gate.wait();await route.continue_()
    if mode!='no-js':await page.route('**/wiki-enhancements.js',script)
    async def db(route):
     requests.append(route.request.method)
     if mode=='offline':await route.abort('internetdisconnected');return
     if mode=='database-error':await route.fulfill(status=503,content_type='application/json',body='{"message":"acceptance simulated database outage"}');return
     await gate.wait()
     if os.getenv('HTTPS_PROXY'):
      # The execution proxy rejects browser/APIRequest tunnels; relay the identical real GET via urllib.
      await relay_read(route)
     else:await route.continue_()
    await page.route('**/jscttuocrulgpwvsfxou.supabase.co/**',db)
    key=f'{slug}-{width}-{theme}-{mode}'
    try:
     await page.goto(BASE+'entry/'+slug+'/',wait_until='commit',timeout=90000)
     await page.locator('.wiki-entry-body').wait_for(timeout=30000)
     # Wait for actual fonts and initial image decoding before measuring; these are natural resource loads.
     await page.evaluate('Promise.race([document.fonts.ready,new Promise(r=>setTimeout(r,10000))])')
     await page.evaluate('async()=>{const i=document.querySelector(".wiki-entry-cover img");if(i)await Promise.race([i.decode().catch(()=>{}),new Promise(r=>setTimeout(r,10000))]);}');await page.wait_for_timeout(100)
     await page.evaluate('window.__entryNodes=[document.getElementById("wiki-entry-root"),document.querySelector("#wiki-entry-root h1"),document.querySelector(".wiki-entry-body"),document.querySelector(".wiki-entry-cover img")]')
     before=await page.evaluate(SNAP)
     if shots:await page.screenshot(path=str(OUT/(key+'-01-html.png')))
     script_gate.set()
     if mode!='no-js':await page.wait_for_load_state('domcontentloaded');await page.wait_for_function('document.getElementById("wiki-entry-root").dataset.enhancementState==="idle"')
     dom=await page.evaluate(SNAP)
     assert stable(before,dom),'HTML → DOMContentLoaded changed article'
     assert not requests,'static startup must not fetch database or rerender'
     if mode=='no-js':
      rows.append({'case':key,'passed':True,'stages':{'html':before,'dom':dom},'database_requests':0});return
     # User intentionally opens research, then scrolls and selects existing body during delayed requests.
     await page.locator('details.visitor-research summary').click()
     await page.wait_for_function('document.getElementById("wiki-entry-root").dataset.enhancementState!=="idle"')
     await page.locator('.wiki-entry-body').scroll_into_view_if_needed()
     await page.evaluate('''()=>{const b=document.querySelector('.wiki-entry-body');const walk=document.createTreeWalker(b,NodeFilter.SHOW_TEXT);let n;while(n=walk.nextNode()){if(n.textContent.trim().length>8){const r=document.createRange();r.setStart(n,0);r.setEnd(n,Math.min(8,n.textContent.length));const s=getSelection();s.removeAllRanges();s.addRange(r);break;}}}''')
     loading=await page.evaluate(SNAP)
     assert stable(dom,loading,False),'opening research replaced body'
     if shots:
      await page.screenshot(path=str(OUT/(key+'-02-reading.png')))
      await page.evaluate('scrollTo(0,0)');await page.screenshot(path=str(OUT/(key+'-02-loading.png')))
      await page.evaluate('(y)=>scrollTo(0,y)',loading['scroll'])
     await page.wait_for_timeout(500 if mode=='slow' else 80)
     assert stable(loading,await page.evaluate(SNAP)),'pending network changed layout'
     gate.set()
     await page.wait_for_function('['+'"ready","error"'+'].includes(document.getElementById("wiki-entry-root").dataset.enhancementState)',timeout=90000)
     await page.wait_for_timeout(200)
     after=await page.evaluate(SNAP)
     assert stable(loading,after),'enhancement changed authoritative article/layout'
     assert after['scroll']==loading['scroll'] and after['selection']==loading['selection'],'scroll or selection lost'
     assert after['state']==('error' if mode in ['offline','database-error'] else 'ready'),'unexpected data loading result'
     assert all(x=='GET' for x in requests),'only read-only HTTP GET permitted'
     if shots:
      await page.screenshot(path=str(OUT/(key+'-03-reading.png')))
      await page.evaluate('scrollTo(0,0)');await page.screenshot(path=str(OUT/(key+'-03-complete.png')))
      await page.evaluate('(y)=>scrollTo(0,y)',after['scroll'])
     rows.append({'case':key,'passed':True,'stages':{'html':before,'dom':dom,'loading':loading,'complete':after},'database_requests':len(requests)})
     if len(rows)%25==0:
      print('Completed',len(rows),'browser cases',flush=True)
      (OUT/'checkpoint.json').write_text(json.dumps({'cases':rows},ensure_ascii=False)+'\n')
    except Exception as error:
     rows.append({'case':key,'passed':False,'error':str(error),'html':locals().get('before'),'dom':locals().get('dom'),'loading':locals().get('loading'),'after':locals().get('after')});print('FAIL',key,str(error),flush=True)
    finally:
     gate.set();script_gate.set();await context.close()
  slugs=sorted(p.parent.name for p in (SITE/'entry').glob('*/index.html'))
  if not slugs and os.getenv('ENTRY_BASE_URL'):
   from urllib.request import urlopen
   import xml.etree.ElementTree as ET
   with urlopen(BASE+'sitemap-entries.xml',timeout=60) as response:xml=ET.fromstring(response.read())
   slugs=sorted(x.text.rstrip('/').split('/')[-1] for x in xml.findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}loc'))
  assert len(slugs)==250,f'expected 250 generated sources, got {len(slugs)}'
  await asyncio.gather(*(case(slug) for slug in slugs))
  for width in [320,390,768,1440]:
   for theme in ['default','slate']:
    await case('blue-and-white',width,theme,'slow',True)
    await case('tang-ying',width,theme,'offline')
    await case('hutian-kiln',width,theme,'database-error')
    await case('blue-and-white',width,theme,'no-js')
  # The legacy query entry still renders exactly one article with live production data.
  context=await browser.new_context(ignore_https_errors=True);page=await context.new_page()
  if os.getenv('HTTPS_PROXY'):
   await page.route('**/jscttuocrulgpwvsfxou.supabase.co/**',relay_read)
  for slug in ['blue-and-white','tang-ying','hutian-kiln']:
   try:
    await page.goto(BASE+'entry/?slug='+slug);await page.locator('.wiki-entry-body').wait_for(timeout=90000)
    assert await page.locator('.wiki-entry-card').count()==1 and await page.locator('.wiki-entry-card .wiki-entry-card').count()==0
    rows.append({'case':'dynamic-'+slug,'passed':True})
   except Exception as e:rows.append({'case':'dynamic-'+slug,'passed':False,'error':str(e)})
  await context.close();await browser.close()
 result={'base':BASE,'static_count':250,'passed':sum(r['passed'] for r in rows),'failed':sum(not r['passed'] for r in rows),'cases':rows}
 (OUT/'results.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
 print(f"{result['passed']} passed; {result['failed']} failed; {OUT}")
 assert not result['failed']
try:asyncio.run(main())
finally:
 if server:server.shutdown();workspace.cleanup()
