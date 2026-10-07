"""Targeted live acceptance for the requirements beyond responsive smoke tests."""
import json, os, shutil, urllib.parse
from pathlib import Path
from playwright.sync_api import sync_playwright
BASE=os.getenv('UX_BASE_URL','https://justinxyj.github.io/jingdezhen-porcelain-wiki/')
OUT=Path(os.getenv('UX_FINAL_OUTPUT','/tmp/ux2-production-final.json'))
checks=[]
def record(name,passed,detail=''):
 checks.append({'check':name,'passed':bool(passed),'detail':detail});print(name,bool(passed),detail,flush=True)
with sync_playwright() as p:
 opts={'headless':True,'executable_path':shutil.which('chromium')}
 if os.getenv('HTTPS_PROXY'):
  u=urllib.parse.urlsplit(os.environ['HTTPS_PROXY']);opts['proxy']={'server':f'{u.scheme}://{u.hostname}:{u.port or 80}','bypass':'127.0.0.1,localhost'}
  if u.username:opts['proxy']['username']=urllib.parse.unquote(u.username)
  if u.password:opts['proxy']['password']=urllib.parse.unquote(u.password)
 b=p.chromium.launch(**opts);page=b.new_page(ignore_https_errors=True,viewport={'width':1440,'height':1000},reduced_motion='reduce')
 page.goto(BASE+'search/?q=青花');page.locator('.jdm-search-result').first.wait_for(timeout=60000)
 data=page.evaluate('''async()=>{const s=window.JDM_KNOWLEDGE;return {database:(await s.searchEntries('青花',{limit:100})).some(e=>e.slug==='blue-and-white'),markdown:(await s.searchEntries('青花',{limit:100})).filter(e=>e.source_type==='markdown').map(e=>({url:s.url(e),title:e.zh.title})),aliases:await Promise.all([['qinghua','青花'],['qinghuaci','青花瓷'],['yuyao','御窑'],['hutian','湖田'],['tangying','唐英'],['gaoling','高岭'],['jingdezhen','景德镇'],['fen cai','粉彩'],['fencai','粉彩'],['qingbai','青白瓷'],['御窯廠','御窑厂'],['景德鎮','景德镇'],['雞缸杯','鸡缸杯'],['玲瓏瓷','玲珑瓷'],['琺瑯彩','珐琅彩']].map(async([a,c])=>{const x=(await s.searchEntries(a,{limit:100})).map(e=>e.slug).sort(),y=(await s.searchEntries(c,{limit:100})).map(e=>e.slug).sort();return {alias:a,target:c,count:x.length,passed:x.length>0&&JSON.stringify(x)===JSON.stringify(y)}}))}}''')
 record('Unified search database',data['database']);record('Unified search Markdown',bool(data['markdown']),data['markdown'])
 for row in data['aliases']:record('Alias/pinyin/traditional '+row['alias'],row['passed'],row['count'])
 topic=next(x for x in data['markdown'] if '/craft/qinghua/' in x['url']);page.goto(urllib.parse.urljoin(BASE,topic['url']));record('Markdown actual page',page.locator('h1').count()==1 and page.locator('main').inner_text().find('青花')>=0,page.url)
 page.goto(BASE+'search/?q=青花&image=true');page.locator('.jdm-search-result').first.wait_for(timeout=60000);record('Image filter actual visible results',page.locator('.jdm-search-result').count()==page.locator('.jdm-search-result img').count())
 page.goto(BASE+'search/?q=青花&literature=true');page.locator('.jdm-search-result').first.wait_for(timeout=60000);record('Literature filter actual academic topic',page.locator('.jdm-search-result a[href*="/craft/qinghua/"]').count()>0)
 page.goto(BASE+'search/?q=xxxxxxxx');page.locator('.jdm-search-empty').wait_for(timeout=60000);empty=page.locator('.jdm-search-empty').inner_text();record('Empty state exact query/category/popular/reset',all(x in empty for x in ['xxxxxxxx','相关类别','热门内容','清除筛选']) and '你可能想找' not in empty)
 page.goto(BASE+'entry/tang-ying/');page.locator('.visitor-references').first.wait_for(timeout=60000);record('Evidence default collapsed',not page.locator('.visitor-references').first.evaluate('(e)=>e.open'));page.locator('.visitor-references summary').first.click();record('Ordinary URLs not labelled verified','已核验' not in page.locator('.visitor-references').first.inner_text());page.locator('a[href*="research/evidence/?slug=tang-ying"]').first.click();page.locator('[data-evidence-chain] h2').filter(has_text='已记录的关系').wait_for(timeout=60000);record('Evidence complete chain sources and relationships',page.locator('[data-evidence-chain] a[href]').count()>0 and '关系' in page.locator('[data-evidence-chain]').inner_text())
 # Existing actual image entrances; text-only related cards remain article links.
 for name,route,selector in [('Entry','entry/blue-and-white/','.wiki-entry-cover img'),('Catalog','museum/catalog/','.catalog-card img'),('People','museum/people/','.person-card img'),('Gallery','museum/gallery/','.official-gallery-card img'),('Search','search/?q=青花&image=true','.visitor-result-image'),('Map','museum/kiln-map/?slug=arita-kiln','dialog img[data-zoom-image]')]:
  page.goto(BASE+route);ready='.person-card' if name=='People' else selector;page.locator(ready).first.wait_for(timeout=60000)
  image=page.locator(selector).first
  if image.count()==0:
   record(name+' viewer entrance',True,'NOT APPLICABLE: no image records in this live surface');continue
  image.wait_for(timeout=60000);page.wait_for_timeout(100)
  parent=image.locator('xpath=ancestor::a[1]')
  if parent.count():parent.locator('xpath=following-sibling::button[contains(@class,"visitor-image-open")][1]').click()
  else:image.click()
  viewer=page.locator('dialog.visitor-image-viewer');viewer.wait_for(timeout=30000)
  record(name+' shared viewer',viewer.locator('img').count()==1 and viewer.get_attribute('aria-modal')=='true')
  if image.get_attribute('data-source'):record(name+' image source label retained',image.get_attribute('data-source') in viewer.inner_text())
  if image.get_attribute('data-era'):record(name+' image era retained',image.get_attribute('data-era') in viewer.inner_text())
  if image.get_attribute('data-source-url'):record(name+' image source retained',viewer.locator('a[href]').count()>0)
  for label in ['放大','缩小','适应窗口']:viewer.locator('button').filter(has_text=label).click()
  page.keyboard.press('Escape');viewer.wait_for(state='detached',timeout=10000);record(name+' viewer ESC',page.locator('dialog.visitor-image-viewer').count()==0)
 page.goto(BASE+'museum/timeline/');node=page.locator('.compare-node[data-entry-slug="hutian-kiln"]').first;node.wait_for(timeout=60000);node.click();page.locator('dialog img[data-zoom-image]').wait_for(timeout=30000);page.locator('dialog img[data-zoom-image]').click();page.locator('dialog.visitor-image-viewer').wait_for();record('Timeline shared viewer',True);record('Timeline existing institution and source', '来源机构：景德镇市科学技术协会' in page.locator('dialog.visitor-image-viewer').inner_text() and '馆藏机构：景德镇市科学技术协会' not in page.locator('dialog.visitor-image-viewer').inner_text() and page.locator('dialog.visitor-image-viewer a[href]').count()>0);page.keyboard.press('Escape');page.locator('dialog.visitor-image-viewer').wait_for(state='detached');page.keyboard.press('Escape')
 page.goto(BASE+'entry/kiln-firing/');page.locator('.wiki-entry-body').wait_for(timeout=60000);record('Production craft Entry',page.locator('h1').inner_text()=='装烧与烧成')
 for route in ['', 'entry/tang-ying/', 'craft/qinghua/', 'museum/catalog/', 'museum/people/']:
  page.goto(BASE+route);record('Single footer '+route,page.get_by_role('contentinfo').count()==1)
  if route:record('Breadcrumb current '+route,page.locator('nav[aria-label="面包屑"] [aria-current="page"]').count()==1)
 b.close()
OUT.write_text(json.dumps({'base':BASE,'checks':checks},ensure_ascii=False,indent=2)+'\n')
if not all(x['passed'] for x in checks):raise SystemExit(1)
