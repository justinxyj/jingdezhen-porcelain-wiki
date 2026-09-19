import os
from playwright.sync_api import sync_playwright

base=(os.environ.get("SITE_URL") or "https://justinxyj.github.io/jingdezhen-porcelain-wiki/").rstrip("/")+"/"
errors=[]
unhandled=[]
server_errors=[]

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    page=browser.new_page(viewport={"width":1440,"height":1000})
    page.on("pageerror", lambda e: errors.append("pageerror: "+str(e)))
    page.on("console", lambda m: print("WARN console:",m.text) if m.type=="error" else None)
    page.on("dialog", lambda d: d.dismiss())
    page.add_init_script("window.addEventListener('unhandledrejection', e => { window.__jdmUnhandled = window.__jdmUnhandled || []; window.__jdmUnhandled.push(String(e.reason && e.reason.message || e.reason)); });")
    page.on("response", lambda r: server_errors.append(f"{r.status} {r.url}") if r.url.startswith(base) and r.status>=400 else None)

    checks=[
        ("首页","", "body"),
        ("器物图谱","museum/catalog/", "#catalog-list"),
        ("时间轴","museum/timeline/", "#timeline"),
        ("72工序","craft/technology-tree/", "#porcelain-tech-tree"),
        ("知识条目","entry/?slug=blue-and-white", "#wiki-entry-root"),
    ]
    for name,path,selector in checks:
        page.goto(base+path,wait_until="domcontentloaded",timeout=30000)
        page.locator(selector).first.wait_for(state="visible",timeout=20000)
        unhandled.extend(page.evaluate("window.__jdmUnhandled || []"))
        if name=="时间轴":
            titles=page.locator(".timeline-item h3").all_text_contents()
            expected=["东晋—唐：新平镇与昌南镇","五代—宋：湖田窑与青白瓷"]
            if len(titles)>=2 and titles[:2] != expected: raise RuntimeError("历史时间轴顺序异常: "+repr(titles[:4]))
        print("PASS",name)

    browser.close()

if server_errors:
    raise RuntimeError("HTTP 5xx: "+"; ".join(server_errors))
if errors:
    raise RuntimeError("Browser errors:\n" + "\n".join(errors))
if unhandled:
    raise RuntimeError("Unhandled promise rejections:\n" + "\n".join(unhandled))
print("PASS pages smoke")
