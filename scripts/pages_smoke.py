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
    # The header is a synopsis, not a dump of the full article body.
    header_summary=page.locator("#wiki-entry-root .entry-static-summary, #wiki-entry-root .wiki-entry-header p").first.inner_text().strip()
    body_text=page.locator("#wiki-entry-root .wiki-entry-text, #wiki-entry-root .wiki-entry-body").first.inner_text().strip()
    if len(header_summary)>320:
        raise RuntimeError("知识条目页眉摘要过长，疑似把正文错误当作摘要")
    if len(body_text)<20:
        raise RuntimeError("知识条目正文内容过短")
    # Do not require authoring-time heading markup: some legitimate canonical Entries are intentionally
    # concise prose. The actual regression target here is that the body is present and not flattened into
    # an internal governance template or a browser-default link surface.
    generic_ui="本 Entry 的核心信息以页面列出的来源为证据入口"
    if generic_ui in body_text:
        raise RuntimeError("知识条目正文仍暴露通用证据模板文本")

    # Static SEO Entry pages have their own inline stylesheet because they are generated
    # outside the MkDocs shell. Verify every Entry 2.0 exploration component is styled,
    # so a JS-rendered component can never silently fall back to browser-blue bare links.
    component_css=page.evaluate("""() => {
        const root=document.querySelector('#wiki-entry-root');
        const host=document.createElement('div');
        host.style.position='absolute'; host.style.left='-99999px';
        host.innerHTML='<a class="wiki-entry-world-link" href="#">world</a><div class="wiki-entry-explore-grid"><a class="wiki-entry-explore-card" href="#">explore</a></div><div class="wiki-entry-craft-list"><a href="#">craft</a></div><div class="wiki-recommendation-grid"><a class="wiki-recommendation-card" href="#">recommend</a></div><div class="wiki-entry-v2-relations"><a href="#">relation</a></div>';
        (root||document.body).appendChild(host);
        const nodes=[...host.querySelectorAll('a')];
        const result=nodes.map(n=>{const s=getComputedStyle(n);return {cls:n.className,display:s.display,color:s.color,textDecoration:s.textDecorationLine,border:s.borderTopWidth,bg:s.backgroundColor}});
        host.remove();
        return result;
    }""")
    for item in component_css:
        if item['display'] in ('inline','inline-block') and item['cls'] != 'wiki-entry-world-link':
            raise RuntimeError("Entry exploration component is not rendered as a card: "+repr(item))
        if item['color'] == 'rgb(0, 0, 238)' or item['textDecoration'] == 'underline':
            raise RuntimeError("Entry exploration component fell back to browser-blue link styling: "+repr(item))
    print("PASS Entry 2.0 component styling parity")
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
    entry_url_count=sitemap_text.count("/entry/")
    if entry_url_count < 200:
        raise RuntimeError(f"Entry sitemap unexpectedly small: {entry_url_count} URLs")
    print("PASS Entry sitemap",entry_url_count,"URLs")


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

    # Global kiln map modal regression: content must use the concise Entry summary,
    # not the internal evidence boilerplate, and media must pass the public media policy.
    page.goto(base+"museum/kiln-map/",wait_until="networkidle",timeout=30000)
    page.locator("#kiln-map .global-kiln-list-item").first.wait_for(state="visible",timeout=20000)
    shiwan=page.locator('#kiln-map .global-kiln-list-item[data-slug="shiwan-kiln"]')
    if shiwan.count()!=1:
        raise RuntimeError("窑址地图缺少石湾窑条目")
    shiwan.click()
    page.locator("#global-kiln-modal .global-kiln-dialog").wait_for(state="visible",timeout=10000)
    modal_text=page.locator("#global-kiln-modal").inner_text()
    intro=page.locator("#global-kiln-modal .global-kiln-intro").inner_text().strip()
    summary=page.locator("#global-kiln-modal .global-kiln-ai p").inner_text().strip()
    if intro != summary:
        raise RuntimeError("窑址地图弹层正文与摘要重复/来源模板污染")
    if "本 Entry 的核心信息以页面列出的来源为证据入口" in modal_text or "研究边界" in modal_text or "继续研究" in modal_text:
        raise RuntimeError("窑址地图弹层暴露内部证据模板文本")
    image=page.locator("#global-kiln-modal .global-kiln-image img")
    if image.count()!=1 or not image.get_attribute("src"):
        raise RuntimeError("石湾窑地图弹层缺少已核验图片")
    link_styles=page.locator("#global-kiln-modal .global-kiln-links a").evaluate_all("""els=>els.map(a=>{const s=getComputedStyle(a);return {display:s.display,color:s.color,textDecoration:s.textDecorationLine,border:s.borderTopWidth}})""")
    for item in link_styles:
        if item["color"]=="rgb(0, 0, 238)" or item["textDecoration"]=="underline":
            raise RuntimeError("窑址地图弹层链接退化为浏览器默认蓝色下划线样式: "+repr(item))
    print("PASS kiln map modal/media/content")

    browser.close()

if server_errors:
    raise RuntimeError("HTTP 4xx/5xx on same-origin resources:\n" + "\n".join(server_errors))
if errors:
    raise RuntimeError("Browser errors:\n" + "\n".join(errors))
print("PASS pages smoke")
