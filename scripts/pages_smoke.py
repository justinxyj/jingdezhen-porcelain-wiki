import os
from playwright.sync_api import sync_playwright

base=(os.environ.get("SITE_URL") or "https://justinxyj.github.io/jingdezhen-porcelain-wiki/").rstrip("/")+"/"
errors=[]
server_errors=[]

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    page=browser.new_page(viewport={"width":1440,"height":1000})
    page.on("pageerror", lambda e: errors.append("pageerror: "+str(e)))
    page.on("console", lambda m: errors.append("console: "+m.text) if m.type=="error" else None)
    page.on("response", lambda r: server_errors.append(f"{r.status} {r.url}") if r.status>=500 else None)

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
        print("PASS",name)

    browser.close()

if server_errors:
    raise RuntimeError("HTTP 5xx: "+"; ".join(server_errors))
if errors:
    raise RuntimeError("Browser errors:\n" + "\n".join(errors))
print("PASS pages smoke")
