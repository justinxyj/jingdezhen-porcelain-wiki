"""Shared Header visual/interaction regression, local CI or deployed Pages. No DB writes."""
import functools
import hashlib
import http.server
import io
from PIL import Image, ImageChops
import json
import os
from pathlib import Path
import shutil
import tempfile
import threading
import urllib.parse
from playwright.sync_api import sync_playwright

ROUTES = [('home', ''), ('blue-and-white', 'entry/blue-and-white/'),
          ('hutian', 'entry/hutian-kiln/'), ('person', 'entry/tang-ying/'),
          ('catalog', 'museum/catalog/'), ('timeline', 'museum/timeline/')]
WIDTHS = [320, 390, 768, 1440]
OUT = Path(os.getenv('HEADER_OUTPUT', '/tmp/shared-header-browser'))
OUT.mkdir(parents=True, exist_ok=True)
checks = []
metrics = []
def check(name, passed, detail=None):
    checks.append({'check': name, 'passed': bool(passed), 'detail': detail})
    if not passed:
        print('FAIL', name, detail, flush=True)

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

server = None
workspace = None
base = os.getenv('HEADER_BASE_URL')
if not base:
    workspace = tempfile.TemporaryDirectory(prefix='shared-header-')
    root = Path(workspace.name)
    (root / 'jingdezhen-porcelain-wiki').symlink_to(Path(os.getenv('HEADER_SITE_DIR', 'site')).resolve(), target_is_directory=True)
    server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(QuietHandler, directory=str(root)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    base = f'http://127.0.0.1:{server.server_port}/jingdezhen-porcelain-wiki/'
base = base.rstrip('/') + '/'
with sync_playwright() as p:
    options = {'headless': True}
    if shutil.which('chromium'):
        options['executable_path'] = shutil.which('chromium')
    if os.getenv('HTTPS_PROXY'):
        u = urllib.parse.urlsplit(os.environ['HTTPS_PROXY'])
        options['proxy'] = {'server': f'{u.scheme}://{u.hostname}:{u.port or 80}', 'bypass': '127.0.0.1,localhost'}
    browser = p.chromium.launch(**options)
    for width in WIDTHS:
        for scheme in ['default', 'slate']:
            context = browser.new_context(viewport={'width': width, 'height': 900}, ignore_https_errors=True, reduced_motion='reduce')
            page = context.new_page()
            reference = None
            reference_image = None
            for name, route in ROUTES:
                response = page.goto(base + route, wait_until='domcontentloaded', timeout=90000)
                check(f'{name} HTTP {width} {scheme}', response.status == 200)
                page.locator('.md-header .visitor-search-trigger').wait_for(timeout=30000)
                if page.locator('body').get_attribute('data-md-color-scheme') != scheme:
                    page.locator('.md-header [data-md-component="palette"] label:visible').click()
                    page.wait_for_timeout(150)
                page.evaluate('document.fonts.ready')
                page.wait_for_timeout(300)
                page.evaluate('scrollTo(0,0)')
                page.mouse.move(width-1,899)
                measurement = page.evaluate('''()=>{
                  const selectors=['.md-header','.md-header__inner','.md-header__button.md-logo','.md-header__title','.md-header [for="__drawer"]','.md-header [data-md-component="palette"]','.md-header .visitor-search-trigger','.visitor-primary-nav',...Array.from({length:6},(_,i)=>'.visitor-primary-nav a:nth-child('+(i+1)+')')];
                  return selectors.map(selector=>{const e=document.querySelector(selector),r=e.getBoundingClientRect(),s=getComputedStyle(e);return {selector,x:Math.round(r.x*10)/10,y:Math.round(r.y*10)/10,width:Math.round(r.width*10)/10,height:Math.round(r.height*10)/10,color:s.color,background:s.backgroundColor,font:s.font,fontSize:s.fontSize,gap:s.gap,padding:s.padding,display:s.display};});
                }''')
                if reference is None:
                    reference = measurement
                check(f'{name} Header geometry/styles {width} {scheme}', measurement == reference, None if measurement == reference else measurement)
                check(f'{name} one Header/navigation/search {width} {scheme}', page.locator('.md-header').count() == 1 and page.locator('.visitor-primary-nav').count() == 1 and page.locator('.visitor-search-trigger').count() == 1 and page.locator('.visitor-static-nav').count() == 0)
                check(f'{name} no overflow {width} {scheme}', page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
                header_bottom = page.locator('.visitor-primary-nav').bounding_box()['y'] + page.locator('.visitor-primary-nav').bounding_box()['height']
                image = page.screenshot(path=str(OUT / f'{name}-{width}-{scheme}-header.png'), clip={'x':0,'y':0,'width':width,'height':header_bottom}, animations='disabled')
                pixels = Image.open(io.BytesIO(image)).convert('RGB')
                if reference_image is None:
                    reference_image = pixels
                changed = None
                if pixels.size == reference_image.size:
                    diff = ImageChops.difference(reference_image, pixels)
                    channels = diff.tobytes()
                    changed = sum(max(channels[i:i+3])>16 for i in range(0,len(channels),3))/(pixels.width*pixels.height)
                check(f'{name} Header pixel comparison {width} {scheme}', changed is not None and changed <= 0.005, {'changed_pixel_ratio':changed,'threshold':0.005})
                page.screenshot(path=str(OUT / f'{name}-{width}-{scheme}.png'), animations='disabled')
                metrics.append({'page':name,'width':width,'theme':scheme,'header':measurement,'header_png_sha256':hashlib.sha256(image).hexdigest()})
                # Native theme control must work and restore the requested theme.
                palette = page.locator('.md-header [data-md-component="palette"] label:visible')
                palette.click()
                page.wait_for_timeout(100)
                check(f'{name} theme toggle {width} {scheme}', page.locator('body').get_attribute('data-md-color-scheme') != scheme)
                page.locator('.md-header [data-md-component="palette"] label:visible').click()
                # Search opens by keyboard; trap, ESC, and return focus are tested from the Header button.
                trigger = page.locator('.md-header .visitor-search-trigger')
                trigger.focus();page.keyboard.press('Enter')
                dialog = page.locator('dialog[open]');dialog.wait_for()
                check(f'{name} search dialog semantics {width} {scheme}', dialog.get_attribute('aria-modal') == 'true' and bool(dialog.get_attribute('aria-label') or dialog.get_attribute('aria-labelledby')))
                check(f'{name} search focus {width} {scheme}', dialog.evaluate('(e)=>e.contains(document.activeElement)'))
                for _ in range(7):
                    page.keyboard.press('Tab')
                    check(f'{name} search focus trap {width} {scheme}', dialog.evaluate('(e)=>e.contains(document.activeElement)'))
                if name == 'home' and width == 390 and scheme == 'default':
                    dialog.locator('input[name="q"]').fill('tangying')
                    dialog.locator('.visitor-suggestions a').first.wait_for(timeout=60000)
                    check('Header search returns real canonical Entry links', '/entry/tang-ying/' in dialog.locator('.visitor-suggestions a').first.get_attribute('href'))
                page.keyboard.press('Escape');page.wait_for_function('!document.querySelector("dialog.visitor-dialog")')
                check(f'{name} search ESC/focus return {width} {scheme}', page.locator('dialog[open]').count() == 0 and trigger.evaluate('(e)=>e===document.activeElement'))
                page.keyboard.press('Control+k');shortcut_dialog=page.locator('dialog[open]');shortcut_dialog.wait_for();page.keyboard.press('Escape');page.wait_for_function('!document.querySelector("dialog.visitor-dialog")')
                check(f'{name} Ctrl+K {width} {scheme}', page.locator('dialog[open]').count() == 0)
                if width <= 768:
                    menu = page.locator('.md-header [for="__drawer"]')
                    menu.focus();page.keyboard.press('Enter');page.wait_for_timeout(150)
                    check(f'{name} mobile menu keyboard {width} {scheme}', menu.get_attribute('aria-expanded') == 'true' and page.locator('#__drawer').is_checked() and page.locator('.md-sidebar--primary').evaluate('(e)=>e.contains(document.activeElement)'), page.evaluate('({drawer:document.getElementById("__drawer").checked,active:document.activeElement.outerHTML})'))
                    page.keyboard.press('Escape');page.wait_for_timeout(150)
                    check(f'{name} mobile menu ESC/focus {width} {scheme}', menu.get_attribute('aria-expanded') == 'false' and menu.evaluate('(e)=>e===document.activeElement'))
                print('Checked', name, width, scheme, flush=True)
            context.close()
    context = browser.new_context(viewport={'width':390,'height':900},ignore_https_errors=True,reduced_motion='reduce')
    page = context.new_page();page.goto(base+'entry/blue-and-white/',wait_until='domcontentloaded')
    page.locator('.md-header .visitor-search-trigger').wait_for()
    page.locator('.visitor-feedback a').click();page.locator('dialog[open]').wait_for()
    # Reproduce the asynchronous Entry renderer replacing an opener, without changing data.
    page.locator('.visitor-feedback a').evaluate('(e)=>e.replaceWith(e.cloneNode(true))')
    page.keyboard.press('Escape');page.wait_for_function('!document.querySelector("dialog.visitor-dialog")')
    check('Entry enrichment preserves dialog focus return',page.locator('.visitor-feedback a').evaluate('(e)=>e===document.activeElement'))
    context.close()
    # No JavaScript: all 250 rendered bodies were checked structurally; representative Header navigation is actually followed.
    for width in WIDTHS:
        context = browser.new_context(viewport={'width':width,'height':900}, java_script_enabled=False, ignore_https_errors=True, reduced_motion='reduce')
        page = context.new_page()
        for name, route in ROUTES[:4]:
            page.goto(base+route,wait_until='domcontentloaded')
            check(f'{name} no-JS Header {width}', page.locator('.md-header').is_visible() and page.locator('.visitor-primary-nav').is_visible())
            if route:
                check(f'{name} no-JS article {width}', page.locator('.wiki-entry-body').is_visible() and bool(page.locator('.wiki-entry-body').inner_text().strip()))
            if width <=768:
                page.locator('.md-header label[for="__drawer"]').click()
                check(f'{name} no-JS mobile menu {width}', page.locator('#__drawer').is_checked() and page.locator('.md-sidebar--primary').is_visible() and page.locator('.md-sidebar--primary').bounding_box()['x'] >= -1)
                page.locator('.md-overlay').click(force=True,position={'x':width-10,'y':300})
        page.goto(base+'entry/blue-and-white/',wait_until='domcontentloaded')
        for label in ['首页','百科','博物馆','地图与时间','研究','搜索']:
            page.locator('.visitor-primary-nav').get_by_role('link',name=label,exact=True).click()
            check(f'no-JS real navigation {label} {width}', page.locator('.md-header').count()==1 and page.locator('.visitor-primary-nav').count()==1)
        context.close()
    browser.close()
if server:
    server.shutdown()
    workspace.cleanup()
summary={'base_url':base,'checks':checks,'passed':sum(c['passed'] for c in checks),'failed':sum(not c['passed'] for c in checks),'metrics':metrics}
(OUT/'results.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n')
print(f"{summary['passed']} passed, {summary['failed']} failed; screenshots: {OUT}")
raise SystemExit(bool(summary['failed']))
