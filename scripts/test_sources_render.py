#!/usr/bin/env python3
"""Synthetic-entry checks for the Entry "sources" render layer (no network, no database).

Static side : scripts/generate_entry_pages.py (imported, entry_html()).
Dynamic side: docs/javascripts/wiki-enhancements.js rendered in jsdom through
              scripts/sources_render_dynamic_harness.js. Needs node plus the optional
              `jsdom` package (NODE_PATH); without it the dynamic checks are SKIPPED and reported.

Usage: python scripts/test_sources_render.py [--require-dynamic]
"""
from __future__ import annotations

import html
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
import generate_entry_pages as g  # noqa: E402

FAIL: list[str] = []
PASS: list[str] = []


def check(name: str, cond: bool, detail: str = "") -> None:
    (PASS if cond else FAIL).append(name if cond else f"{name} {detail}".strip())


def entry(slug: str, sources, content: str = "<p>正文。</p>") -> dict:
    return {"id": "00000000-0000-4000-8000-000000000000", "slug": slug, "category": "测试",
            "zh": {"title": "合成词条 " + slug, "summary": "合成摘要", "content": content, "meta": {}},
            "sources": sources, "status": "published"}


def static_sources_section(e: dict) -> str:
    page = g.entry_html(e, {}, {}, {})
    m = re.search(r'<h2>参考资料</h2><details[^>]*><summary>[^<]*</summary>(.*?)</details>', page, re.S)
    assert m, "sources section not found"
    panel=m.group(1)
    listing=re.search(r'<(?:ul|ol) class="wiki-entry-source-links[^"]*">.*?</(?:ul|ol)>',panel,re.S)
    assert listing, "source list missing from progressive disclosure"
    return listing.group(0)


def links_of(section: str) -> list[tuple[str, str]]:
    return [(html.unescape(u), html.unescape(t)) for u, t in re.findall(r'<a href="([^"]*)"[^>]*>(.*?)</a>', section)]


A = {"url": "https://example.org/a", "label": "来源甲", "title": "来源甲", "tier": 1, "grade": "A"}
B = {"url": "https://example.org/b", "label": "来源乙", "title": "来源乙", "tier": 2, "grade": "B"}
PEND = {"url": "https://example.org/pending", "label": "待核来源", "title": "待核来源", "status": "pending", "tier": "C", "grade": "C"}
DUP = {"url": "https://example.org/a", "label": "同链接另一名称"}
TITLE_ONLY = {"url": "https://example.org/t", "title": "仅有标题"}
EVIL = {"url": "https://example.org/e", "label": '<img src=x onerror=alert(1)>"\'&'}
JSURL = {"url": "javascript:alert(1)", "label": "恶意链接"}
LEGACY = {"url": "https://example.org/l", "label": "旧式来源"}

CASES = {
    "pending": entry("pending", [A, PEND, B]),
    "dup": entry("dup", [A, B, DUP]),
    "empty": entry("empty", []),
    "empty-only-pending": entry("empty-only-pending", [PEND]),
    "title-only": entry("title-only", [TITLE_ONLY]),
    "evil": entry("evil", [EVIL, JSURL, LEGACY]),
    "refs": entry("refs", [A, B], "<p>甲说[1]，乙说[2]。</p>"),
    "refs-pending": entry("refs-pending", [A, PEND, B], "<p>甲[1]，待核[2]，乙[3]。</p>"),
    "refs-dup": entry("refs-dup", [A, DUP, B], "<p>甲[1]，乙[3]。</p>"),
    "legacy": entry("legacy", [LEGACY], "<p>没有引用标记。</p>"),
    "status-published": entry("status-published", [{**A, "status": "published"}]),
    "bare-strings": entry("bare-strings", ["R08", "R16"]),
    "unknown-strings": entry("unknown-strings", ["R99"]),
}


def run_static() -> dict[str, str]:
    out = {k: static_sources_section(v) for k, v in CASES.items()}
    for k, s in out.items():
        check(f"static/{k}: no wikipedia search link", "wikipedia.org" not in s and "维基百科" not in s)

    check("static/pending: hidden", "待核来源" not in out["pending"] and "/pending" not in out["pending"])
    check("static/pending: others kept", [t for _, t in links_of(out["pending"])] == ["来源甲", "来源乙"])
    check("static/pending: tier/grade not shown", "tier" not in out["pending"].lower() and "grade" not in out["pending"].lower())
    check("static/dup: url listed once", [u for u, _ in links_of(out["dup"])] == ["https://example.org/a", "https://example.org/b"])
    check("static/empty: empty state", "尚无已公开来源" in out["empty"] and "<a " not in out["empty"])
    check("static/empty-only-pending: empty state", "尚无已公开来源" in out["empty-only-pending"] and "<a " not in out["empty-only-pending"])
    check("static/title-only: title used", links_of(out["title-only"]) == [("https://example.org/t", "仅有标题")])
    check("static/evil: label escaped", "<img" not in out["evil"] and "&lt;img src=x onerror=alert(1)&gt;" in out["evil"])
    check("static/evil: javascript: url dropped", "javascript:" not in out["evil"] and "恶意链接" not in out["evil"])
    check("static/evil: safe link kept", ("https://example.org/l", "旧式来源") in links_of(out["evil"]))
    check("static/legacy: plain ul, no numbers", out["legacy"].startswith('<ul class="wiki-entry-source-links">') and "[" not in out["legacy"])
    check("static/refs: ol with [1][2]", out["refs"].startswith("<ol ") and "[1]" in out["refs"] and "[2]" in out["refs"])
    check("static/refs-pending: numbers keep array positions", re.findall(r"\[(\d+)\]</span>", out["refs-pending"]) == ["1", "3"])
    check("static/refs-dup: numbers keep array positions", re.findall(r"\[(\d+)\]</span>", out["refs-dup"]) == ["1", "3"])
    check("static/status-published: shown", len(links_of(out["status-published"])) == 1)
    check("static/bare-strings: known bibliography resolved", len(links_of(out["bare-strings"])) == 2)
    check("static/unknown-strings: not invented", "尚无已公开来源" in out["unknown-strings"])
    check("static/no sup in body", "<sup" not in g.entry_html(CASES["refs"], {}, {}, {}))
    return out


def run_dynamic(static: dict[str, str]) -> None:
    node = shutil.which("node")
    if not node:
        print("SKIP dynamic: node not found")
        return
    proc = subprocess.run([node, str(ROOT / "scripts" / "sources_render_dynamic_harness.js")],
                          input=json.dumps(list(CASES.values())), capture_output=True, text=True)
    if proc.returncode == 3:
        print("SKIP dynamic: jsdom not installed (set NODE_PATH to a jsdom install)")
        if "--require-dynamic" in sys.argv:
            FAIL.append("dynamic checks required but jsdom unavailable")
        return
    if proc.returncode != 0:
        FAIL.append(f"dynamic harness failed: {proc.stderr[-400:]}")
        return
    dyn = json.loads(proc.stdout)
    for k in CASES:
        d = dyn.get(k) or ""
        check(f"dynamic/{k}: rendered", bool(d))
        check(f"dynamic/{k}: no wikipedia search link", "wikipedia.org" not in d and "维基百科" not in d)
        dl = [(u, re.sub(r" ↗$", "", t)) for u, t in re.findall(r'<a href="([^"]*)"[^>]*>(.*?)</a>', d)]
        dl = [(html.unescape(u), html.unescape(t)) for u, t in dl]
        sl = links_of(static[k])
        check(f"consistent/{k}: same source set static vs dynamic", dl == sl, f"static={sl} dynamic={dl}")
        s_nums = re.findall(r"\[(\d+)\]</span>", static[k])
        d_nums = re.findall(r"\[(\d+)\]</span>", d)
        check(f"consistent/{k}: same numbering static vs dynamic", s_nums == d_nums, f"{s_nums} vs {d_nums}")
    check("dynamic/empty: empty state", "暂无外部来源" in (dyn.get("empty") or ""))
    check("dynamic/empty-only-pending: empty state", "暂无外部来源" in (dyn.get("empty-only-pending") or ""))
    check("dynamic/evil: label escaped", "<img" not in (dyn.get("evil") or "") and "&lt;img" in (dyn.get("evil") or ""))
    check("dynamic/evil: javascript: dropped", "javascript:" not in (dyn.get("evil") or ""))
    check("dynamic/title-only: title used", "仅有标题" in (dyn.get("title-only") or ""))
    check("dynamic/legacy: no ol, no numbers", "<ol" not in (dyn.get("legacy") or "") and "[1]" not in (dyn.get("legacy") or ""))
    check("dynamic/refs: ol with [1][2]", "<ol" in (dyn.get("refs") or "") and "[1]" in dyn["refs"] and "[2]" in dyn["refs"])


def main() -> int:
    static = run_static()
    run_dynamic(static)
    for name in PASS:
        print("PASS", name)
    for name in FAIL:
        print("FAIL", name)
    print(f"{len(PASS)} passed, {len(FAIL)} failed")
    return 1 if FAIL else 0


if __name__ == "__main__":
    sys.exit(main())
