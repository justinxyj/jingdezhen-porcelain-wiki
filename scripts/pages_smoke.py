import os
from playwright.sync_api import sync_playwright

base=(os.environ.get("SITE_URL") or "https://justinxyj.github.io/jingdezhen-porcelain-wiki/").rstrip("/")+"/"
errors=[]
server_errors=[]

ROUTES=[
    ("首页","", "body"),
    ("历史","history/","body"),
    ("工艺","craft/","body"),
    ("器物","objects/","body"),
    ("窑址","kilns/","body"),
    ("人物","people/","body"),
    ("文献","research/","body"),
    ("现代","contemporary/","body"),
    ("时间轴","museum/timeline/", "#timeline"),
    ("窑址地图","museum/kiln-map/", "#kiln-map"),
    ("器物图谱","museum/catalog/", "#catalog-list"),
    ("人物数据库","museum/people/","body"),
    ("72工序","craft/technology-tree/", "#porcelain-tech-tree"),
    ("图片馆","museum/gallery/","body"),
    ("知识条目","entry/?slug=blue-and-white", "#wiki-entry-root"),
    ("知识网络","network/","body"),
    ("关系探索","network/relations/","body"),
    ("全球陶瓷网络","network/global/","body"),
]

def check_viewport(browser, width, height, label):
    page=browser.new_page(viewport={"width":width,"height":height})
    page.on("pageerror", lambda e: errors.append(f"{label} pageerror: {e}"))
    page.on("response", lambda r: server_errors.append(f"{label} {r.status} {r.url}") if r.url.startswith(base) and r.status>=400 else None)
    page.goto(base,wait_until="domcontentloaded",timeout=30000)
    page.locator("body").wait_for(state="visible",timeout=10000)
    overflow=page.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth")
    if overflow:
        raise RuntimeError(f"{label} homepage has horizontal overflow")
    page.close()

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)

    for width,height,label in [(1440,1000,"desktop"),(390,844,"mobile-390"),(430,932,"mobile-430")]:
        check_viewport(browser,width,height,label)
        print("PASS",label,"homepage")

    page=browser.new_page(viewport={"width":1440,"height":1000})
    page.on("pageerror", lambda e: errors.append("desktop pageerror: "+str(e)))
    page.on("response", lambda r: server_errors.append(f"desktop {r.status} {r.url}") if r.url.startswith(base) and r.status>=400 else None)

    page.goto(base,wait_until="domcontentloaded",timeout=30000)
    page.locator("body").wait_for(state="visible",timeout=10000)

    # Verify every Wiki 2.0 top-level navigation target actually loads.
    print("PASS homepage navigation shell")

    for name,path,selector in ROUTES:
        page.goto(base+path,wait_until="domcontentloaded",timeout=30000)
        page.locator(selector).first.wait_for(state="visible",timeout=20000)
        overflow=page.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth")
        if overflow:
            raise RuntimeError(f"{name} has horizontal overflow")
        print("PASS",name)

    for name,path in [("历史世界","history/"),("工艺世界","craft/"),("器物世界","objects/"),("空间世界","kilns/"),("人物世界","people/"),("文献世界","research/"),("现代世界","contemporary/")]:
        page.goto(base+path,wait_until="networkidle",timeout=30000)
        browser_cards=page.locator("[data-world-browser] .jdm-world-entry-card")
        browser_cards.first.wait_for(state="visible",timeout=20000)
        if browser_cards.count()<1:
            raise RuntimeError(f"{name} has no world entries")
        explore=page.locator("[data-world-browser] .jdm-world-explore-link")
        if explore.count()<2:
            raise RuntimeError(f"{name} has no unified exploration exits")
        first_href=browser_cards.first.get_attribute("href")
        if not first_href:
            raise RuntimeError(f"{name} first entry has no canonical href")
        page.goto(base+first_href.lstrip("/"),wait_until="networkidle",timeout=30000)
        page.locator("#wiki-entry-root").first.wait_for(state="visible",timeout=20000)
        exits=page.locator(".wiki-entry-v2-card a, .wiki-recommendation-card, .wiki-entry-source-links a")
        if exits.count()<1:
            raise RuntimeError(f"{name} entry has no continuation exit")
        print("PASS",name,"entries",browser_cards.count(),"entry-path")

    page.goto(base+"museum/timeline/",wait_until="domcontentloaded",timeout=30000)
    titles=page.locator(".timeline-item h3").all_text_contents()
    expected=["东晋—唐：新平镇与昌南镇","五代—宋：湖田窑与青白瓷"]
    if len(titles)>=2 and titles[:2] != expected:
        raise RuntimeError("历史时间轴顺序异常: "+repr(titles[:4]))
    print("PASS timeline order")
    browser.close()

if server_errors:
    raise RuntimeError("HTTP 4xx/5xx on same-origin resources:\n" + "\n".join(server_errors))
if errors:
    raise RuntimeError("Browser errors:\n" + "\n".join(errors))
print("PASS pages smoke")
