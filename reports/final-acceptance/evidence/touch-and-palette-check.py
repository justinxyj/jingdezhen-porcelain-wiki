import os,json,shutil,urllib.parse
from pathlib import Path
from playwright.sync_api import sync_playwright
base=os.getenv('UX_BASE_URL','http://127.0.0.1:8028/jingdezhen-porcelain-wiki/')
checks=[]
with sync_playwright() as p:
    opts={'headless':True,'executable_path':shutil.which('chromium')}
    if os.getenv('HTTPS_PROXY'):
        u=urllib.parse.urlsplit(os.environ['HTTPS_PROXY']);opts['proxy']={'server':f'{u.scheme}://{u.hostname}:{u.port or 80}','bypass':'127.0.0.1,localhost'}
    b=p.chromium.launch(**opts)
    for system in ['light','dark']:
        c=b.new_context(ignore_https_errors=True,color_scheme=system,viewport={'width':390,'height':900},reduced_motion='reduce');page=c.new_page()
        for route,ready,selector in [('contemporary/','.jdm-world-entry-card','.jdm-world-entry-card'),('craft/technology-tree/','.tech-entry-card','.tech-path-items a')]:
            page.goto(base+route);page.locator(ready).first.wait_for(timeout=60000)
            for scheme in ['default','slate']:
                if page.locator('body').get_attribute('data-md-color-scheme')!=scheme:page.locator('.md-header [data-md-component="palette"] label:visible').click()
                match=page.locator(selector).first.evaluate('(e)=>{const s=getComputedStyle(e),b=getComputedStyle(document.body);return {color:s.color,background:s.backgroundColor,palette:b.getPropertyValue("--visitor-blue").trim(),ink:b.getPropertyValue("--visitor-ink").trim()}}')
                color=match['color'];expected='rgb(23, 45, 71)' if route.startswith('contemporary') and scheme=='default' else 'rgb(237, 242, 250)' if route.startswith('contemporary') else 'rgb(22, 78, 155)' if scheme=='default' else 'rgb(155, 194, 255)'
                checks.append({'check':f'OS {system} / site {scheme} / {route}','passed':color==expected,'actual':match})
        c.close()
    c=b.new_context(ignore_https_errors=True,viewport={'width':390,'height':900},reduced_motion='reduce');page=c.new_page();page.goto(base+'network/relations/');page.locator('.network-list-item').first.wait_for(timeout=60000)
    checks.append({'check':'Graph not rendered until expanded','passed':page.locator('.network-node-svg').count()==0})
    toggle=page.locator('#network-graph-toggle summary');toggle.focus();page.keyboard.press('Enter');page.locator('.network-node-svg').first.wait_for()
    node=page.locator('.network-node-svg.entry-node').first;node.focus();page.keyboard.press('Enter');page.locator('.network-detail h3').wait_for();checks.append({'check':'Graph keyboard selects real entry','passed':node.get_attribute('aria-label') is not None and bool(page.locator('.network-detail h3').inner_text())})
    link=page.locator('.network-detail a[href*="/entry/"]').first;link.click();page.locator('.wiki-entry-body').wait_for();checks.append({'check':'Graph detail follows canonical entry','passed':page.locator('.wiki-entry-card').count()==1})
    mobile=b.new_context(ignore_https_errors=True,is_mobile=True,has_touch=True,user_agent=p.devices['Pixel 7']['user_agent'],viewport={'width':390,'height':844},reduced_motion='reduce');m=mobile.new_page()
    for term,slug in [('青花瓷','blue-and-white'),('湖田窑','hutian-kiln'),('唐英','tang-ying')]:
        m.goto(base);m.locator('#home-query').fill(term);m.locator('.visitor-home-search button').tap();result=m.locator('.jdm-search-result h2 a[href$="/entry/'+slug+'/"]').first;result.wait_for(timeout=60000);result.tap();m.locator('.wiki-entry-body').wait_for();checks.append({'check':'Mobile touch search → '+term,'passed':m.url.endswith('/entry/'+slug+'/') and m.locator('.wiki-entry-card').count()==1})
    m.locator('.md-header [for="__drawer"]').tap();checks.append({'check':'Mobile touch menu opens','passed':m.locator('#__drawer').is_checked()});m.locator('.md-overlay').tap(position={'x':380,'y':300},force=True)
    m.goto(base+'search/?q=青花');m.locator('.jdm-search-result').first.wait_for(timeout=60000);m.locator('#search-mobile-filters').tap();m.locator('dialog[open]').wait_for();m.locator('dialog select[name="hasImage"]').select_option('true');m.locator('dialog button').filter(has_text='应用筛选').tap();checks.append({'check':'Mobile touch bottom sheet applies filter','passed':'image=true' in m.url})
    m.goto(base+'museum/kiln-map/');m.locator('[data-slug="hutian-kiln"]').wait_for(timeout=60000);m.locator('[data-slug="hutian-kiln"]').tap();m.locator('dialog[open] a[href$="/entry/hutian-kiln/"]').first.tap();m.locator('.wiki-entry-body').wait_for();checks.append({'check':'Mobile touch map → Hutian encyclopedia','passed':m.url.endswith('/entry/hutian-kiln/')})
    mobile.close()
    b.close()
Path(os.getenv('EXTRA_OUTPUT','/tmp/final-extra-local.json')).write_text(json.dumps({'base':base,'checks':checks},ensure_ascii=False,indent=2)+'\n')
print(len(checks),'checks',sum(not x['passed'] for x in checks),'failed',flush=True)
if any(not x['passed'] for x in checks):raise SystemExit(1)
