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
    b.close()
Path(os.getenv('EXTRA_OUTPUT','/tmp/final-extra-local.json')).write_text(json.dumps({'base':base,'checks':checks},ensure_ascii=False,indent=2)+'\n')
print(len(checks),'checks',sum(not x['passed'] for x in checks),'failed',flush=True)
if any(not x['passed'] for x in checks):raise SystemExit(1)
