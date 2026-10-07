"""Actual clicks along all four requested paths. Sources remain collapsed until opened."""
import json,os,shutil,urllib.parse
from pathlib import Path
from playwright.sync_api import sync_playwright
BASE=os.getenv('UX_BASE_URL','http://127.0.0.1:8013/jingdezhen-porcelain-wiki/')
checks=[]
def record(name,ok=True):checks.append({'check':name,'passed':bool(ok)});print(name,ok,flush=True)
with sync_playwright() as p:
 opts={'headless':True,'executable_path':shutil.which('chromium')}
 if os.getenv('HTTPS_PROXY'):
  u=urllib.parse.urlsplit(os.environ['HTTPS_PROXY']);opts['proxy']={'server':f'{u.scheme}://{u.hostname}:{u.port or 80}','bypass':'127.0.0.1,localhost'}
  if u.username:opts['proxy']['username']=urllib.parse.unquote(u.username)
  if u.password:opts['proxy']['password']=urllib.parse.unquote(u.password)
 b=p.chromium.launch(**opts);page=b.new_page(ignore_https_errors=True,viewport={'width':1440,'height':1000})
 def entry(slug):
  page.wait_for_url('**/entry/'+slug+'/');page.locator('.wiki-entry-body').wait_for(timeout=60000);record('Entry '+slug)
 def click_link(selector):
  link=page.locator(selector).first;link.wait_for(timeout=60000);link.click()
 page.goto(BASE);page.locator('#home-query').fill('青花');page.locator('.visitor-home-search button').click();click_link('.jdm-search-result a[href$="/entry/blue-and-white/"]');entry('blue-and-white')
 click_link('.visitor-reading-path a[href$="/entry/yuan-blue-white/"]');entry('yuan-blue-white');click_link('.visitor-reading-path a[href$="/entry/hutian-kiln/"]');entry('hutian-kiln');click_link('.visitor-reading-path a[href$="/entry/imperial-kiln/"]');entry('imperial-kiln');click_link('.wiki-entry-v2-relations a[href$="/entry/tang-ying/"]');entry('tang-ying');record('Path A complete')
 page.goto(BASE+'search/?q=唐英');click_link('.jdm-search-result a[href$="/entry/tang-ying/"]');entry('tang-ying');record('Path B importance',page.locator('h2').filter(has_text='为什么重要').count()==1);click_link('.wiki-entry-v2-relations a[href$="/entry/imperial-kiln/"]');entry('imperial-kiln');click_link('.visitor-entry-shortcuts a[href*="kiln-map"]');page.locator('dialog[open]').wait_for(timeout=60000);click_link('dialog .map-related a[href$="/entry/tang-ying-jun-vase/"]');entry('tang-ying-jun-vase');record('Path B complete')
 page.goto(BASE+'museum/kiln-map/');page.locator('[data-region="jdz"]').wait_for(timeout=60000);record('Path C Jingdezhen selected',page.locator('[data-region="jdz"]').get_attribute('aria-pressed')=='true');page.locator('[data-slug="hutian-kiln"]').click();click_link('dialog .visitor-primary');entry('hutian-kiln');click_link('.visitor-reading-path a[href$="/entry/qingbai-porcelain/"]');entry('qingbai-porcelain');record('Path C complete')
 page.goto(BASE+'network/global/?slug=blue-and-white');page.locator('.jdm-gn-identity').wait_for(timeout=60000);link=page.locator('.jdm-gn-relation[href$="/entry/chinoiserie/"]');link.wait_for(timeout=60000);record('Path D concrete sourced relation','欧洲中国风装饰的参照' in link.inner_text());link.click();entry('chinoiserie');click_link('a[href*="research/evidence/?slug=chinoiserie"]');page.locator('[data-evidence-chain] h2').first.wait_for(timeout=60000);record('Path D Evidence actual source',page.locator('[data-evidence-chain] a[href="https://whc.unesco.org/en/decisions/9170/"]').count()>0);record('Path D complete')
 b.close()
Path('/tmp/ux2-complete-journeys.json').write_text(json.dumps(checks,ensure_ascii=False,indent=2)+'\n')
if not all(x['passed'] for x in checks):raise SystemExit(1)
