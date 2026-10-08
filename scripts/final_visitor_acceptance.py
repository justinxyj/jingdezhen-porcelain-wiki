import os,json,shutil,urllib.parse,datetime
from pathlib import Path
from playwright.sync_api import sync_playwright
BASE=os.getenv('UX_BASE_URL','https://justinxyj.github.io/jingdezhen-porcelain-wiki/').rstrip('/')+'/'
OUT=Path(os.getenv('VISITOR_OUTPUT','/tmp/final-visitor-before'));OUT.mkdir(parents=True,exist_ok=True)
checks=[];layouts=[];errors=[];requests=[]
def check(name,ok,detail=None):
    checks.append({'check':name,'passed':bool(ok),'detail':detail})
    if not ok:print('FAIL',name,detail,flush=True)
ROUTES=[('home','', '.visitor-hero'),('search','search/?q=青花瓷','.jdm-search-result'),('entry','entry/blue-and-white/','.wiki-entry-body'),('catalog','museum/catalog/','.catalog-card'),('people','museum/people/','.person-card'),('map','museum/kiln-map/','.global-kiln-list-item'),('timeline','museum/timeline/','.compare-node'),('craft','craft/technology-tree/','.tech-entry-card'),('evidence','research/evidence/?slug=tang-ying','[data-evidence-chain] h2'),('global','network/global/?slug=blue-and-white','.jdm-gn-identity'),('research','research/','.jdm-world-entry-card'),('contemporary','contemporary/','.jdm-world-entry-card')]
with sync_playwright() as p:
    opts={'headless':True,'executable_path':shutil.which('chromium')}
    if os.getenv('HTTPS_PROXY'):
        u=urllib.parse.urlsplit(os.environ['HTTPS_PROXY']);opts['proxy']={'server':f'{u.scheme}://{u.hostname}:{u.port or 80}','bypass':'127.0.0.1,localhost'}
    b=p.chromium.launch(**opts)
    context=b.new_context(ignore_https_errors=True,viewport={'width':390,'height':844},reduced_motion='reduce')
    page=context.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('request',lambda r:requests.append({'method':r.method,'path':urllib.parse.urlsplit(r.url).path}) if '.supabase.co/' in r.url else None)
    def go(route,ready):
        response=page.goto(BASE+route,wait_until='domcontentloaded',timeout=60000)
        assert response.status==200
        page.locator(ready).first.wait_for(timeout=60000)
        page.evaluate('document.fonts.ready')
    try:
        for width in [320,390,768,1440]:
            page.set_viewport_size({'width':width,'height':900})
            for name,route,ready in ROUTES:
                go(route,ready)
                for scheme in ['default','slate']:
                    if page.locator('body').get_attribute('data-md-color-scheme')!=scheme:
                        page.locator('.md-header [data-md-component="palette"] label:visible').click()
                    page.wait_for_timeout(100)
                    state=page.evaluate('''()=>({overflow:document.documentElement.scrollWidth-innerWidth,headers:document.querySelectorAll('.md-header').length,navs:document.querySelectorAll('.visitor-primary-nav').length,footers:document.querySelectorAll('footer.visitor-footer').length,cards:document.querySelectorAll('.wiki-entry-card').length,nested:document.querySelectorAll('.wiki-entry-card .wiki-entry-card').length,h1:document.querySelectorAll('main h1').length,altMissing:[...document.querySelectorAll('main img')].filter(e=>!e.hasAttribute('alt')).length})''')
                    layouts.append({'page':name,'width':width,'scheme':scheme,**state})
                    check(f'{name} {width} {scheme} layout/navigation',state['overflow']<=1 and state['headers']==state['navs']==state['footers']==1 and state['h1']==1 and state['altMissing']==0,state)
                    if name=='entry':check(f'entry {width} {scheme} one shell',state['cards']==1 and state['nested']==0)
                    if width in [390,1440] and name in ['home','entry','contemporary','craft']:
                        if name=='contemporary':page.locator('.jdm-world-featured-grid').scroll_into_view_if_needed()
                        if name=='craft':page.locator('.tech-entry-grid').scroll_into_view_if_needed()
                        page.screenshot(path=str(OUT/f'{name}-{width}-{scheme}.png'))
                if name=='home':
                    text=page.locator('.visitor-hero').inner_text();check(f'first visit understands museum {width}','景德镇陶瓷数字博物馆' in text and '瓷器' in text and page.locator('.visitor-home-search').count()==1,text)
                    page.locator('.visitor-primary-nav a').filter(has_text='百科').click();check(f'encyclopedia navigation {width}',page.locator('main').inner_text().find('景德镇')>=0,page.url)
        for width in [390,1440]:
            page.set_viewport_size({'width':width,'height':900})
            for term,slug,title in [('青花瓷','blue-and-white','青花'),('湖田窑','hutian-kiln','湖田窑'),('唐英','tang-ying','唐英')]:
                go('','.visitor-hero');page.locator('#home-query').fill(term);page.locator('.visitor-home-search button').click();page.locator('.jdm-search-result').first.wait_for(timeout=60000)
                result=page.locator('.jdm-search-result h2 a[href$="/entry/'+slug+'/"]').first
                check(f'search exact {term} {width}',result.count()==1)
                result.click();page.locator('.wiki-entry-body').wait_for();check(f'search actual destination {term} {width}',page.url.endswith('/entry/'+slug+'/') and title in page.locator('h1').inner_text())
                text=page.locator('.wiki-entry-body').inner_text();page.wait_for_timeout(800);check(f'body never replaced {term} {width}',text==page.locator('.wiki-entry-body').inner_text() and page.locator('.wiki-entry-card').count()==1)
                check(f'entry trustworthy sources affordance {term} {width}',page.locator('.visitor-references').count()>0)
                page.locator('.visitor-references summary').first.click();check(f'sources discoverable {term} {width}',page.locator('.visitor-references a[href]').count()>0)
                research=page.locator('details.visitor-research');research.locator('summary').click();page.wait_for_function('document.getElementById("wiki-entry-root").dataset.enhancementState==="ready"',timeout=60000)
                links=page.locator('.wiki-entry-v2-relations a[href*="/entry/"],.visitor-reading-path a[href*="/entry/"],details.visitor-research a[href*="/entry/"]');check(f'related reading available {term} {width}',links.count()>0)
                if links.count():
                    links.first.click();page.locator('.wiki-entry-body').wait_for();page.go_back();page.locator('.wiki-entry-body').wait_for();check(f'browser Back returns {term} {width}',page.url.endswith('/entry/'+slug+'/'))
            go('museum/catalog/','.catalog-card')
            page.locator('.catalog-card a[href*="/entry/"]').first.click();page.locator('.wiki-entry-body').wait_for();check(f'object detail navigation {width}',page.locator('.wiki-entry-card').count()==1)
            go('museum/kiln-map/','.global-kiln-list-item')
            page.locator('[data-slug="hutian-kiln"]').click();dialog=page.locator('dialog[open]');dialog.wait_for();dialog.locator('a[href$="/entry/hutian-kiln/"]').first.click();page.locator('.wiki-entry-body').wait_for();check(f'map hutian to encyclopedia {width}','湖田窑' in page.locator('h1').inner_text())
            go('museum/timeline/','.compare-node');page.locator('.compare-node[data-entry-slug="hutian-kiln"]').first.click();dialog=page.locator('dialog[open]');dialog.wait_for();check(f'timeline context understandable {width}',bool(dialog.inner_text().strip()) and dialog.locator('a[href*="/entry/"]').count()>0);page.keyboard.press('Escape')
            go('network/global/?slug=blue-and-white','.jdm-gn-identity');check(f'global Jingdezhen relation {width}','景德镇' in page.locator('main').inner_text());page.locator('.jdm-gn-relation').first.click();page.locator('.wiki-entry-body').wait_for();check(f'global relation to real entry {width}',True)
            go('research/evidence/?slug=tang-ying','[data-evidence-chain] h2');txt=page.locator('[data-evidence-chain]').inner_text();check(f'evidence explains verification limits {width}',any(t in txt for t in ['不代表已核验','未经','不等于','参考资料']) and page.locator('[data-evidence-chain] a[href]').count()>0,txt[:800])
        # Copyright/source labels are observed, not interpreted as a blanket reuse license.
        go('museum/gallery/','.official-gallery-card');check('gallery attribution visible',page.locator('.official-gallery-card figcaption a[href]').count()>0 and '版权' in page.locator('main').inner_text())
        # Force a genuine transport error on an existing image without changing its record.
        failure=b.new_context(ignore_https_errors=True,viewport={'width':390,'height':900});f=failure.new_page();f.route('https://img.dpm.org.cn/**',lambda r:r.abort());f.goto(BASE);image=f.locator('.visitor-object-grid img').first;image.scroll_into_view_if_needed();f.wait_for_timeout(1500)
        check('failed gallery image safe fallback',image.get_attribute('data-image-fallback')=='1' and image.evaluate('(e)=>e.complete&&e.naturalWidth>0'),f.locator('.visitor-object-grid figure').first.inner_text());failure.close()
        check('no unexpected runtime exceptions',not errors,errors)
        check('no database writes',all(r['method'] in ['GET','OPTIONS'] or (r['method']=='POST' and r['path'] in ['/rest/v1/rpc/entry_timeline_peers','/rest/v1/rpc/entry_space_peers']) for r in requests))
    except Exception as e:check('visitor execution complete',False,str(e))
    finally:
        (OUT/'results.json').write_text(json.dumps({'base':BASE,'at_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'checks':checks,'layouts':layouts,'errors':errors,'database_request_methods':sorted({(r['method'],r['path']) for r in requests}),'limitations':'Real headless Chromium at the specified viewports; not physical-device testing or human screen-reader certification.'},ensure_ascii=False,indent=2)+'\n');b.close()
print(len(checks),'checks;',sum(not x['passed'] for x in checks),'failed',flush=True)
if any(not x['passed'] for x in checks):raise SystemExit(1)
