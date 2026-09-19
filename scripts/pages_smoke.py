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
    nav_targets=page.locator(".md-header a[href], .jdm-nav a[href]").evaluate_all(
        """els => els.map(a => a.href).filter(h => h.startsWith(location.origin))"""
    )
    expected_paths=[
        "/jingdezhen-porcelain-wiki/",
        "/jingdezhen-porcelain-wiki/history/",
        "/jingdezhen-porcelain-wiki/craft/",
        "/jingdezhen-porcelain-wiki/objects/",
        "/jingdezhen-porcelain-wiki/kilns/",
        "/jingdezhen-porcelain-wiki/people/",
        "/jingdezhen-porcelain-wiki/research/",
        "/jingdezhen-porcelain-wiki/contemporary/",
        "/jingdezhen-porcelain-wiki/museum/timeline/",
        "/jingdezhen-porcelain-wiki/museum/kiln-map/",
        "/jingdezhen-porcelain-wiki/museum/catalog/",
        "/jingdezhen-porcelain-wiki/museum/people/",
        "/jingdezhen-porcelain-wiki/craft/technology-tree/",
        "/jingdezhen-porcelain-wiki/museum/gallery/",
        "/jingdezhen-porcelain-wiki/entry/",
        "/jingdezhen-porcelain-wiki/network/",
        "/jingdezhen-porcelain-wiki/network/relations/",
        "/jingdezhen-porcelain-wiki/network/global/",
    ]
    missing=[path for path in expected_paths if not any(path in href for href in nav_targets)]
    if missing:
        raise RuntimeError("Missing navigation targets: "+", ".join(missing))
    print("PASS Wiki 2.0 navigation targets")

    for name,path,selector in ROUTES:
        page.goto(base+path,wait_until="domcontentloaded",timeout=30000)
        page.locator(selector).first.wait_for(state="visible",timeout=20000)
        overflow=page.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth")
        if overflow:
            raise RuntimeError(f"{name} has horizontal overflow")
        print("PASS",name)

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
