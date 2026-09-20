import os
from urllib.parse import urljoin
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
    ("知识条目","entry/blue-and-white/", "#wiki-entry-root"),
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

    # SEO/indexability smoke for a canonical static Entry page.
    page.goto(base+"entry/blue-and-white/",wait_until="domcontentloaded",timeout=30000)
    page.locator("#wiki-entry-root h1").first.wait_for(state="visible",timeout=10000)
    if page.locator("head link[rel=canonical]").get_attribute("href") != base+"entry/blue-and-white/":
        raise RuntimeError("Entry canonical URL mismatch")
    if not page.locator("head meta[name=description]").get_attribute("content"):
        raise RuntimeError("Entry meta description missing")
    if not page.locator("head script[type='application/ld+json']").count():
        raise RuntimeError("Entry JSON-LD missing")
    if page.locator("#wiki-entry-root.wiki-entry-card.wiki-entry-v2").count()<1:
        raise RuntimeError("知识条目未使用统一 Entry Detail 2.0 外壳")
    if page.locator("#wiki-entry-root .wiki-entry-v2-grid").count()<1:
        raise RuntimeError("知识条目缺少统一双栏探索布局")
    if page.locator("#wiki-entry-root .wiki-entry-v2-rail").count()<1:
        raise RuntimeError("知识条目缺少统一知识节点侧栏")
    if "Entry Detail" in page.locator("body").inner_text() or "KNOWLEDGE RELATIONS" in page.locator("body").inner_text():
        raise RuntimeError("知识条目仍暴露旧英文产品 UI")
    if page.locator("#wiki-entry-root .wiki-entry-body").count()<1:
        raise RuntimeError("知识条目初始正文缺失")
    print("PASS Entry SEO/indexability shell")

    # Cross-type canonical Entry sampling: kiln, object, person, research, and an image-backed Entry.
    for sample_name, sample_slug, needs_image in [
        ("窑址 Entry", "hutian-kiln", False),
        ("器物 Entry", "tang-ying-jun-vase", False),
        ("人物 Entry", "wang-bu", False),
        ("文献 Entry", "r01", False),
        ("图片 Entry", "arita-kiln", True),
    ]:
        page.goto(base+f"entry/{sample_slug}/",wait_until="domcontentloaded",timeout=30000)
        page.locator("#wiki-entry-root h1").first.wait_for(state="visible",timeout=10000)
        if page.locator("head link[rel=canonical]").get_attribute("href") != base+f"entry/{sample_slug}/":
            raise RuntimeError(f"{sample_name} canonical URL mismatch")
        if not page.locator("head meta[name=description]").get_attribute("content"):
            raise RuntimeError(f"{sample_name} meta description missing")
        if not page.locator("head script[type='application/ld+json']").count():
            raise RuntimeError(f"{sample_name} JSON-LD missing")
        if page.locator("#wiki-entry-root.wiki-entry-card.wiki-entry-v2").count()<1:
            raise RuntimeError(f"{sample_name} 未使用统一 Entry Detail 2.0 外壳")
        if page.locator("#wiki-entry-root .wiki-entry-v2-grid").count()<1:
            raise RuntimeError(f"{sample_name} 缺少统一双栏探索布局")
        if page.locator("#wiki-entry-root .wiki-entry-body").count()<1:
            raise RuntimeError(f"{sample_name} 初始正文缺失")
        if needs_image and page.locator("#wiki-entry-root img").count()<1:
            raise RuntimeError(f"{sample_name} image missing")
        print("PASS",sample_name,sample_slug)

    # Entry sitemap must expose all currently published Entries.
    page.goto(base+"sitemap-entries.xml",wait_until="domcontentloaded",timeout=30000)
    sitemap_text=page.locator("body").inner_text()
    if sitemap_text.count("/entry/") < 149:
        raise RuntimeError("Entry sitemap does not contain all 149 published Entry URLs")
    print("PASS Entry sitemap >=149 URLs")


    for name,path in [("历史世界","history/"),("工艺世界","craft/"),("器物世界","objects/"),("空间世界","kilns/"),("人物世界","people/"),("文献世界","research/"),("现代世界","contemporary/")]:
        page.goto(base+path,wait_until="networkidle",timeout=30000)
        browser_cards=page.locator("[data-world-browser] .jdm-world-entry-card")
        browser_cards.first.wait_for(state="visible",timeout=20000)
        if browser_cards.count()<1:
            raise RuntimeError(f"{name} has no world entries")
        explore=page.locator("[data-world-browser] .jdm-world-explore-link")
        if explore.count()<2:
            raise RuntimeError(f"{name} has no unified exploration exits")
        world_hrefs=[href for href in browser_cards.evaluate_all("(cards)=>cards.slice(0,12).map(card=>card.getAttribute('href')).filter(Boolean)")]
        found_continuation=False
        for href in world_hrefs:
            entry_target=urljoin(page.url,href)
            page.goto(entry_target,wait_until="domcontentloaded",timeout=30000)
            page.locator("#wiki-entry-root .wiki-entry-card").first.wait_for(state="visible",timeout=20000)
            exits=page.locator(".wiki-recommendation-card, .wiki-entry-v2-relations a, .wiki-entry-explore-card")
            exit_hrefs=exits.evaluate_all("(links)=>links.map(link=>link.getAttribute('href')).filter(Boolean)")
            for second_href in exit_hrefs:
                second_target=urljoin(page.url,second_href)
                if "/entry/" not in second_target:
                    continue
                page.goto(second_target,wait_until="domcontentloaded",timeout=30000)
                page.locator("#wiki-entry-root .wiki-entry-card").first.wait_for(state="visible",timeout=20000)
                found_continuation=True
                break
            if found_continuation:
                break
        if not found_continuation:
            raise RuntimeError(f"{name} has no Entry-to-Entry continuation among first 12 world Entries")
        print("PASS",name,"entries",browser_cards.count(),"entry-to-entry")

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
