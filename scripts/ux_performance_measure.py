"""Measure cold browser requests and byte coverage; figures are observations, not scores."""
import json, os, shutil, urllib.parse
from pathlib import Path
from playwright.sync_api import sync_playwright
BASE=os.getenv('UX_BASE_URL','http://127.0.0.1:8013/jingdezhen-porcelain-wiki/')
OUT=Path(os.getenv('UX_PERFORMANCE_OUTPUT','/tmp/ux2-performance.json'))
ROUTES=[('', '.visitor-hero'),('entry/blue-and-white/', '.wiki-entry-body'),('search/?q=青花','.jdm-search-result'),('museum/kiln-map/','.global-kiln-list-item'),('museum/timeline/','.compare-node'),('network/relations/','.network-list-item')]
def union_length(ranges):
 total=0;end=0
 for a,b in sorted(ranges):
  if b>end:total+=b-max(a,end);end=b
 return total
results=[]
with sync_playwright() as p:
 opts={'headless':True,'executable_path':shutil.which('chromium')}
 proxy=os.getenv('HTTPS_PROXY')
 if proxy:
  u=urllib.parse.urlsplit(proxy);opts['proxy']={'server':f'{u.scheme}://{u.hostname}:{u.port or 80}','bypass':'127.0.0.1,localhost'}
  if u.username:opts['proxy']['username']=urllib.parse.unquote(u.username)
  if u.password:opts['proxy']['password']=urllib.parse.unquote(u.password)
 browser=p.chromium.launch(**opts)
 for route,selector in ROUTES:
  context=browser.new_context(ignore_https_errors=True,viewport={'width':1440,'height':1000})
  page=context.new_page();cdp=context.new_cdp_session(page);requests={};failures=[]
  page.add_init_script("window.__acceptanceCLS=0;new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)window.__acceptanceCLS+=e.value}).observe({type:'layout-shift',buffered:true});")
  cdp.send('Network.enable');cdp.send('Network.setCacheDisabled',{'cacheDisabled':True})
  cdp.send('Debugger.enable');cdp.send('Profiler.enable');cdp.send('Profiler.startPreciseCoverage',{'callCount':False,'detailed':True})
  cdp.send('DOM.enable');cdp.send('CSS.enable');cdp.send('CSS.startRuleUsageTracking')
  sheets={};cdp.on('CSS.styleSheetAdded',lambda e:sheets.update({e['header']['styleSheetId']:e['header']}))
  cdp.on('Network.responseReceived',lambda e:requests.update({e['requestId']:{'url':e['response']['url'],'type':e['type'],'status':e['response']['status'],'bytes':0}}))
  def finished(e):
   if e['requestId'] in requests:requests[e['requestId']]['bytes']=e['encodedDataLength']
  cdp.on('Network.loadingFinished',finished)
  cdp.on('Network.loadingFailed',lambda e:failures.append({'reason':e['errorText'],'type':e['type']}))
  page.goto(BASE+route,wait_until='domcontentloaded');page.locator(selector).first.wait_for(timeout=60000)
  # Static Entries are complete at first output; research enhancement is opt-in.
  # Measuring an idle visit must not wait for the removed hydration-only shortcuts.
  if route.startswith('entry/'):
   page.locator('#wiki-entry-root[data-static-rendered="true"]').wait_for(timeout=60000)
  page.wait_for_timeout(2000)
  js=[]
  for item in cdp.send('Profiler.takePreciseCoverage')['result']:
   if not item['url'].startswith(('http://','https://')):continue
   try:source=cdp.send('Debugger.getScriptSource',{'scriptId':item['scriptId']})['scriptSource']
   except Exception:continue
   # V8 reports UTF-16 offsets. Parent ranges contain executed and unexecuted child ranges.
   unused=union_length([(r['startOffset'],r['endOffset']) for f in item['functions'] for r in f['ranges'] if not r['count']])
   length=len(source.encode('utf-16-le'))//2
   js.append({'url':item['url'],'source_utf16_units':length,'unused_utf16_units':unused})
  rules=cdp.send('CSS.stopRuleUsageTracking')['ruleUsage'];css=[]
  for sid,header in sheets.items():
   try:text=cdp.send('CSS.getStyleSheetText',{'styleSheetId':sid})['text']
   except Exception:continue
   length=len(text.encode('utf-16-le'))//2
   used=union_length([(r['startOffset'],r['endOffset']) for r in rules if r['styleSheetId']==sid and r['used']])
   css.append({'url':header.get('sourceURL','inline'),'source_utf16_units':length,'unused_utf16_units':max(0,length-used)})
  rows=list(requests.values())
  dom=page.evaluate('''()=>({height:document.documentElement.scrollHeight,sections:document.querySelectorAll('main section').length,layout_shift:window.__acceptanceCLS,images:[...document.images].map(i=>({loading:i.loading,complete:i.complete,width:i.naturalWidth})),timing:performance.getEntriesByType('navigation')[0].toJSON()})''')
  result={'url':BASE+route,'request_count':len(rows),'transferred_bytes':sum(r['bytes'] for r in rows),'js_transferred_bytes':sum(r['bytes'] for r in rows if r['type']=='Script'),'css_transferred_bytes':sum(r['bytes'] for r in rows if r['type']=='Stylesheet'),'supabase_requests':sum('supabase.co/' in r['url'] for r in rows),'supabase_data_requests':sum('supabase.co/' in r['url'] and r['type']!='Preflight' for r in rows),'supabase_preflight_requests':sum('supabase.co/' in r['url'] and r['type']=='Preflight' for r in rows),'external_requests':sum(not r['url'].startswith(BASE) for r in rows),'requests':rows,'failures':failures,'javascript_coverage':js,'css_coverage':css,'dom':dom}
  results.append(result);print(json.dumps({k:result[k] for k in ['url','request_count','transferred_bytes','js_transferred_bytes','css_transferred_bytes','supabase_requests']},ensure_ascii=False),flush=True)
  context.close()
 browser.close()
OUT.write_text(json.dumps({'measurement':'cold Chromium, 1440×1000, 2s after content ready; no interactions; coverage is UTF-16 source offsets, not transfer bytes; CORS preflights counted separately from database reads','pages':results},ensure_ascii=False,indent=2)+'\n')
