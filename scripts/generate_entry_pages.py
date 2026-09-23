#!/usr/bin/env python3
"""Build-time static Entry pages for SEO/indexability.

Uses only public Supabase data allowed by RLS. No secret/service-role key is used.
The generated HTML is copied by MkDocs because it lives under docs/entry/<slug>/index.html.
"""
from __future__ import annotations

import html
import json
import os
import re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import quote, urlencode
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
ENTRY_ROOT = DOCS / "entry"
SITE_URL = "https://justinxyj.github.io/jingdezhen-porcelain-wiki/"
RUNTIME_CONFIG = DOCS / "javascripts" / "runtime-config.js"


class SafeHTML(HTMLParser):
    """Small allow-list sanitizer for trusted production content before static emission."""
    ALLOWED = {
        "p", "br", "strong", "b", "em", "i", "h2", "h3", "h4",
        "ul", "ol", "li", "blockquote", "a"
    }

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.parts: list[str] = []

    def handle_starttag(self, tag: str, attrs) -> None:
        if tag not in self.ALLOWED:
            return
        if tag == "a":
            href = ""
            for key, value in attrs:
                if key == "href" and value:
                    href = value
            if href.startswith(("https://", "http://")):
                self.parts.append(f'<a href="{html.escape(href, quote=True)}" rel="noopener noreferrer">')
            else:
                self.parts.append("<a>")
            return
        self.parts.append(f"<{tag}>")

    def handle_startendtag(self, tag: str, attrs) -> None:
        if tag == "br":
            self.parts.append("<br>")

    def handle_endtag(self, tag: str) -> None:
        if tag in self.ALLOWED:
            self.parts.append(f"</{tag}>")

    def handle_data(self, data: str) -> None:
        self.parts.append(html.escape(data))


def sanitize(value: str) -> str:
    parser = SafeHTML()
    parser.feed(value or "")
    parser.close()
    return "".join(parser.parts)


def plain(value: str) -> str:
    text = re.sub(r"<[^>]+>", " ", value or "")
    text = html.unescape(text)
    return re.sub(r"\\s+", " ", text).strip()


def runtime_config() -> tuple[str, str]:
    env_url = os.getenv("SUPABASE_URL")
    env_key = os.getenv("SUPABASE_PUBLISHABLE_KEY")
    if env_url and env_key:
        return env_url.rstrip("/"), env_key

    text = RUNTIME_CONFIG.read_text(encoding="utf-8")
    url = re.search(r"supabaseUrl:\s*['\"]([^'\"]+)", text)
    key = re.search(r"supabaseAnonKey:\s*['\"]([^'\"]+)", text)
    if not url or not key:
        raise RuntimeError("Unable to read public Supabase runtime configuration")
    # The modern sb_publishable key is the browser runtime key. The legacy anon JWT remains
    # public by design and is retained only as a build-time REST fallback for older PostgREST
    # deployments that reject the newer key on selected public resources.
    legacy_anon = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzY3R0dW9jcnVsZ3B3dnNmeG91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1NTAwMDgsImV4cCI6MjEwNTEyNjAwOH0.U3tILBbM8bpT-c99EyC1VJqOmFYnyxthdK_RuSQrX1w"
    return url.group(1).rstrip("/"), legacy_anon


def fetch_rows(base: str, key: str, table: str, select: str, extra: str = "") -> list[dict]:
    url = f"{base}/rest/v1/{table}?{urlencode({'select': select})}"
    if extra:
        url += "&" + extra
    req = Request(url, headers={"apikey": key, "Authorization": f"Bearer {key}", "Accept": "application/json"})
    with urlopen(req, timeout=30) as response:
        if response.status >= 400:
            raise RuntimeError(f"Supabase REST returned HTTP {response.status} for {table}")
        data = json.loads(response.read().decode("utf-8"))
    if not isinstance(data, list):
        raise RuntimeError(f"Unexpected response for {table}")
    return data


def first_media(media_by_entry: dict[str, list[dict]], entry_id: str) -> dict | None:
    rows = media_by_entry.get(entry_id, [])
    if not rows:
        return None
    rows = sorted(
        rows,
        key=lambda x: (
            not bool(x.get("is_primary")),
            int(x.get("source_tier") or 99),
            x.get("created_at") or "",
        ),
    )
    return rows[0]


def description_for(entry: dict) -> str:
    zh = entry.get("zh") or {}
    meta = zh.get("meta") or {}
    existing = plain(str(meta.get("description") or ""))
    if existing:
        return existing[:155]
    summary = plain(str(zh.get("summary") or ""))
    content = plain(str(zh.get("content") or ""))
    candidate = summary or content
    if not candidate:
        facts = [
            meta.get("era") or meta.get("period"),
            meta.get("role"),
            meta.get("location") or meta.get("region"),
            meta.get("craft"),
        ]
        candidate = "、".join(str(x) for x in facts if x)
    if not candidate:
        candidate = f"{zh.get('title') or entry.get('slug')}：景德镇陶瓷数字博物馆公开知识条目。"
    return candidate[:155]


def clean_body_html(content: str, summary: str) -> str:
    """Keep meaningful HTML structure while removing repeated UI boilerplate."""
    body = sanitize(content) if content.strip() else ""
    summary_text = plain(summary)
    if not body:
        return f"<p>{html.escape(summary_text)}</p>" if summary_text else ""
    generic = [
        "本 Entry 的核心信息以页面列出的来源为证据入口。涉及年代、人物身份、器物归属、窑址范围或技术判断时，应优先回到原始馆藏、考古报告、官方遗产文件或原始文献核对，而不应仅依据二手概括。",
        "本 Entry 以 UNESCO、博物馆或研究机构资料作为证据入口；涉及具体年代、窑口、器物归属和传播路径时，应回到原始记录核对。",
        "本条目只陈述当前资料能够支持的范围。单一来源不能自动证明更大的历史结论；对于存在学术争议、断代差异或来源不足的内容，应保留不确定性，并避免把推测写成确定事实。",
        "不把风格相似自动等同为技术传播，不把馆藏器物自动归属于具体制作者，也不把单一来源概括扩展为更大的历史结论。",
        "可从本 Entry 当前所属的 Knowledge World、关联 Entry、人物、器物、窑址、工艺或文献继续追踪证据链。研究型引用应同时核对具体来源页面与原始材料。",
        "可沿当前 Knowledge World、相关器物、窑址、人物和文献继续追踪证据链。"
    ]
    for text in generic:
        body = re.sub(r"<p>\s*" + re.escape(text) + r"\s*</p>", "", body, flags=re.I)
    first = re.match(r"^\s*<p>([\s\S]*?)</p>\s*", body, flags=re.I)
    if first and summary_text and plain(first.group(1)) == summary_text:
        body = body[first.end():]
    core = re.match(r"^\s*<h2>\s*核心信息\s*</h2>\s*<p>([\s\S]*?)</p>\s*", body, flags=re.I)
    if core and summary_text and plain(core.group(1)) == summary_text:
        body = body[core.end():]
    body = re.sub(r"<h2>\s*(证据与来源|研究边界|继续研究)\s*</h2>\s*(?=<h2>|$)", "", body, flags=re.I)
    return body.strip() or f"<p>{html.escape(summary_text)}</p>"


def intro_for(entry: dict) -> str:
    zh = entry.get("zh") or {}
    meta = zh.get("meta") or {}
    summary = plain(str(zh.get("summary") or ""))
    content = plain(str(zh.get("content") or ""))
    if summary:
        return summary
    if content:
        return content[:500]
    facts = [
        meta.get("era") or meta.get("period"),
        meta.get("role"),
        meta.get("location") or meta.get("region"),
        meta.get("craft"),
    ]
    fact_text = "、".join(str(x) for x in facts if x)
    return fact_text or "该知识条目正在持续补充经过来源核验的知识内容。"


def source_links(sources: list) -> str:
    links = []
    for source in sources or []:
        if not isinstance(source, dict):
            continue
        url = str(source.get("url") or "")
        if not url.startswith(("https://", "http://")):
            continue
        label = html.escape(str(source.get("label") or "来源"))
        links.append(
            f'<li><a href="{html.escape(url, quote=True)}" rel="noopener noreferrer">{label}</a></li>'
        )
    return "".join(links) or "<li>当前知识条目尚无已公开来源链接。</li>"


def entry_html(entry: dict, world_by_entry: dict[str, list[dict]],
               media_by_entry: dict[str, list[dict]],
               relations_by_entry: dict[str, list[dict]]) -> str:
    zh = entry.get("zh") or {}
    title = str(zh.get("title") or entry.get("slug"))
    slug = str(entry["slug"])
    url = f"{SITE_URL}entry/{quote(slug)}/"
    description = description_for(entry)
    intro = intro_for(entry)
    content = str(zh.get("content") or "")
    body_html = clean_body_html(content, intro) if content.strip() else f"<p>{html.escape(intro)}</p>"
    media = first_media(media_by_entry, entry["id"])
    worlds = world_by_entry.get(entry["id"], [])
    relations = relations_by_entry.get(entry["id"], [])[:12]
    meta = zh.get("meta") or {}
    tags = [str(x) for x in [meta.get("period"), meta.get("era"), meta.get("role"), meta.get("location"), meta.get("region"), meta.get("craft")] if x]
    tags = list(dict.fromkeys(tags))[:6]

    image_html = ""
    image_url = ""
    if media and str(media.get("path") or "").startswith(("https://", "http://")):
        image_url = str(media["path"])
        image_html = (
            f'<figure class="wiki-entry-cover">'
            f'<img src="{html.escape(image_url, quote=True)}" '
            f'alt="{html.escape(str(media.get("title") or title), quote=True)}" '
            f'referrerpolicy="no-referrer" loading="eager">'
            f'<figcaption>{html.escape(str(media.get("title") or ""))}</figcaption>'
            f'</figure>'
        )

    world_html = "".join(
        f'<a class="wiki-entry-world-link" href="{SITE_URL}{html.escape(str(w.get("path") or "entry/"))}">'
        f'{html.escape(str(w.get("title") or w.get("world_slug") or "Knowledge World"))} →</a>'
        for w in worlds
    )
    relation_html = "".join(
        f'<li><a href="{SITE_URL}entry/?slug={quote(str(r.get("target_slug") or ""))}">'
        f'<b>{html.escape(str(r.get("target_title") or ""))}</b>'
        f'<span>{html.escape(str(r.get("relation_type") or "关联"))}</span></a></li>'
        for r in relations if r.get("target_slug")
    )


    schema = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": url,
        "url": url,
        "name": title,
        "headline": title,
        "description": description,
        "inLanguage": "zh-CN",
        "isAccessibleForFree": True,
        "mainEntity": {
            "@type": "Thing",
            "@id": f"{url}#entity",
            "name": title,
            "description": description,
            "mainEntityOfPage": url,
        },
        "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
                {"@type": "ListItem", "position": 1, "name": "首页", "item": SITE_URL},
                {"@type": "ListItem", "position": 2, "name": "知识条目", "item": f"{SITE_URL}entry/"},
                {"@type": "ListItem", "position": 3, "name": title, "item": url},
            ],
        },
    }
    if image_url:
        schema["image"] = image_url
        schema["mainEntity"]["image"] = image_url

    schema_json = json.dumps(schema, ensure_ascii=False).replace("</script>", "<\\/script>")
    return f"""<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{html.escape(title)} | 景德镇陶瓷数字博物馆</title>
<meta name="description" content="{html.escape(description, quote=True)}">
<meta name="robots" content="index,follow,max-image-preview:large">
<link rel="canonical" href="{html.escape(url, quote=True)}">
<meta property="og:type" content="article">
<meta property="og:title" content="{html.escape(title, quote=True)}">
<meta property="og:description" content="{html.escape(description, quote=True)}">
<meta property="og:url" content="{html.escape(url, quote=True)}">
<meta property="og:site_name" content="景德镇陶瓷数字博物馆">
<meta property="og:locale" content="zh_CN">
{f'<meta property="og:image" content="{html.escape(image_url, quote=True)}">' if image_url else ""}
<script type="application/ld+json">{schema_json}</script>
<link rel="stylesheet" href="{SITE_URL}stylesheets/wiki.css">
<link rel="stylesheet" href="{SITE_URL}stylesheets/museum-apple.css">
<style>
/* Standalone SEO shell only — entry surfaces come from museum-apple + wiki.css */
html,body{{margin:0;padding:0}}
body{{font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","SF Pro Text","Helvetica Neue","Noto Sans SC",Arial,sans-serif;background:var(--jdm-paper,#f5f8fc);color:var(--jdm-ink,#071a35);line-height:1.8}}
main{{max-width:1240px;margin:0 auto;padding:24px 24px 72px}}
.wiki-breadcrumb a{{color:#6d7d8d;text-decoration:none}}
.wiki-entry-card[data-static-rendered="true"] .wiki-entry-footer{{display:block!important;margin-top:30px;padding-top:15px;border-top:1px solid var(--jdm-line,rgba(7,26,53,.11));color:#8291a0;font-size:12px}}
.wiki-entry-v2-relations{{list-style:none;padding:0;margin:1rem 0 0}}
.wiki-entry-v2-relations li{{list-style:none;padding:0;margin:0;border:0;background:transparent}}
.wiki-entry-source-links{{list-style:none;padding:0;margin:0}}
.wiki-entry-source-links li{{list-style:none}}
</style>
</head>
<body>
<main>
<nav class="wiki-chrome"><div class="wiki-breadcrumb"><a href="{SITE_URL}">首页</a><span>/</span><a href="{SITE_URL}entry/">知识条目</a><span>/</span><b>{html.escape(title)}</b></div></nav>
<article id="wiki-entry-root" class="wiki-entry-card wiki-entry-v2" data-entry-slug="{html.escape(slug, quote=True)}" data-static-rendered="true">
<header class="wiki-entry-header">
<div><div class="wiki-entry-kicker">知识条目 · {html.escape(str(entry.get("category") or "知识"))}</div>
<h1>{html.escape(title)}</h1>
<p class="entry-static-summary">{html.escape(intro)}</p></div>
{image_html}
</header>
{f'<div class="wiki-entry-v2-tags">{"".join("<span>"+html.escape(x)+"</span>" for x in tags)}</div>' if tags else ""}
{f'<div class="wiki-entry-world-path"><span>所属知识世界</span><div>{world_html}</div></div>' if world_html else ""}
<div class="wiki-entry-v2-grid"><aside class="wiki-entry-v2-rail"><div class="wiki-entry-v2-card"><strong>知识节点</strong><span>{html.escape(str(entry.get("category") or "知识"))}</span><span>{html.escape(str(((zh.get("meta") or {}).get("period") or (zh.get("meta") or {}).get("era") or "时代信息待核")))}</span><span>{html.escape(str(((zh.get("meta") or {}).get("location") or (zh.get("meta") or {}).get("region") or "空间信息待核")))}</span></div><div class="wiki-entry-v2-card"><strong>继续探索</strong><a href="{SITE_URL}search/">⌕ 搜索知识 →</a><a href="{SITE_URL}network/relations/">关系网络 →</a><a href="{SITE_URL}network/global/">全球陶瓷网络 →</a></div></aside><div class="wiki-entry-v2-main"><section class="wiki-entry-body"><h2>详细介绍</h2>{body_html}</section>
{f'<section class="wiki-entry-v2-section"><div class="wiki-entry-section-kicker">知识关系</div><h2>它与哪些知识相连</h2><ul class="wiki-entry-v2-relations">{relation_html}</ul></section>' if relations else ""}
<section class="wiki-entry-v2-section"><div class="wiki-entry-section-kicker">来源</div><h2>来源与外部资料</h2><ul class="wiki-entry-source-links">{source_links(zh.get("sources") or entry.get("sources") or [])}<li><a href="https://zh.wikipedia.org/w/index.php?search={quote(title)}" rel="noopener noreferrer">维基百科 ↗</a></li></ul></section>
</div></div><footer class="wiki-entry-footer">本页面为公开正式知识条目；页面正文、来源与媒体由项目知识库维护。</footer>
</article>
</main>
<script>
window.JDM_STATIC_ENTRY_SLUG={json.dumps(slug,ensure_ascii=False)};
</script>
<script src="{SITE_URL}javascripts/runtime-config.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="{SITE_URL}javascripts/auth-manager.js"></script>
<script src="{SITE_URL}javascripts/media-policy.js"></script>
<script src="{SITE_URL}javascripts/data-contract.js"></script>
<script src="{SITE_URL}javascripts/knowledge-store.js"></script>
<script src="{SITE_URL}javascripts/wiki-enhancements.js"></script>
</body>
</html>
"""


def main() -> None:
    base, key = runtime_config()
    entries = fetch_rows(
        base, key, "entries",
        "id,slug,category,zh,en,ja,sources,status,updated_at",
        "status=eq.published&order=slug.asc&limit=1000",
    )
    if len(entries) != 149:
        print(f"WARNING: expected 149 published entries, received {len(entries)}")

    worlds = fetch_rows(
        base, key, "knowledge_worlds",
        "slug,title,short_title",
        "order=display_order.asc&limit=100",
    )
    world_map = {w["slug"]: w for w in worlds}
    world_links = fetch_rows(
        base, key, "entry_worlds",
        "entry_id,world_slug,role,display_order",
        "order=entry_id.asc&limit=1000",
    )

    world_by_entry: dict[str, list[dict]] = {}
    world_paths = {
        "history": "history/",
        "craft": "craft/",
        "objects": "objects/",
        "space": "kilns/",
        "people": "people/",
        "research": "research/",
        "contemporary": "contemporary/",
    }
    for link in world_links:
        if link.get("role") != "primary":
            continue
        w = world_map.get(link.get("world_slug"), {})
        world_by_entry.setdefault(link["entry_id"], []).append({
            **link,
            "title": w.get("short_title") or w.get("title") or link.get("world_slug"),
            "path": world_paths.get(link.get("world_slug"), "entry/"),
        })

    media_rows = fetch_rows(
        base, key, "media_public",
        "id,entry_id,path,title,source,license,creator,source_tier,is_primary,created_at",
        "limit=1000",
    )
    media_by_entry: dict[str, list[dict]] = {}
    for media in media_rows:
        media_by_entry.setdefault(media["entry_id"], []).append(media)

    entry_by_id = {e["id"]: e for e in entries}
    relation_rows = fetch_rows(
        base, key, "entry_relations",
        "entry_id,related_entry_id,relation_type,note",
        "limit=1000",
    )
    relations_by_entry: dict[str, list[dict]] = {}
    for row in relation_rows:
        a, b = entry_by_id.get(row["entry_id"]), entry_by_id.get(row["related_entry_id"])
        if not a or not b:
            continue
        relations_by_entry.setdefault(a["id"], []).append({
            "target_slug": b["slug"], "target_title": (b.get("zh") or {}).get("title") or b["slug"],
            "relation_type": row.get("relation_type") or "关联",
        })
        relations_by_entry.setdefault(b["id"], []).append({
            "target_slug": a["slug"], "target_title": (a.get("zh") or {}).get("title") or a["slug"],
            "relation_type": row.get("relation_type") or "关联",
        })

    ENTRY_ROOT.mkdir(parents=True, exist_ok=True)
    expected = set()
    for entry in entries:
        slug = str(entry["slug"])
        expected.add(slug)
        target = ENTRY_ROOT / slug / "index.html"
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(
            entry_html(entry, world_by_entry, media_by_entry, relations_by_entry),
            encoding="utf-8",
        )

    # Remove generated pages that no longer correspond to a published Entry.
    for child in ENTRY_ROOT.iterdir():
        if not child.is_dir() or child.name in {"assets"}:
            continue
        if child.name not in expected:
            for path in child.rglob("*"):
                if path.is_file():
                    path.unlink()
            for path in sorted(child.rglob("*"), reverse=True):
                if path.is_dir():
                    path.rmdir()
            child.rmdir()

    # Generate a canonical Entry sitemap that is included in the final Pages artifact.
    sitemap = ['<?xml version="1.0" encoding="UTF-8"?>',
               '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for entry in entries:
        slug = str(entry["slug"])
        lastmod = str(entry.get("updated_at") or "")[:10]
        sitemap.append(
            f"<url><loc>{SITE_URL}entry/{quote(slug)}/</loc>"
            f"{f'<lastmod>{html.escape(lastmod)}</lastmod>' if lastmod else ''}</url>"
        )
    sitemap.append("</urlset>")
    (DOCS / "sitemap-entries.xml").write_text("\n".join(sitemap) + "\n", encoding="utf-8")
    (DOCS / "robots.txt").write_text(
        "User-agent: *\\nAllow: /\\nSitemap: " + SITE_URL + "sitemap.xml\\nSitemap: " + SITE_URL + "sitemap-entries.xml\\n",
        encoding="utf-8",
    )

    print(f"Generated {len(entries)} static Entry pages.")
    print("Generated docs/sitemap-entries.xml.")


if __name__ == "__main__":
    main()
