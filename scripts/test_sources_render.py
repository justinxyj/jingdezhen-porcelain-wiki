#!/usr/bin/env python3
"""Synthetic-entry checks for the Entry "sources" + inline-citation render layer (no network, no database).

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
    m = re.search(r'<h2>来源与外部资料</h2>(.*?)</section>', page, re.S)
    assert m, "sources section not found"
    return m.group(1)


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
MANY12 = [{"url": f"https://example.org/m{i}", "label": f"来源{i}"} for i in range(1, 12)] + [{"url": "https://example.org/m12", "label": "待核十二", "status": "pending"}]

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
    # --- inline [n] citations -> superscript anchors ---
    "refs-multi": entry("refs-multi", [A, B], "<p>甲[1]，再甲[1]，乙[2][1]。</p>"),
    "refs-dup2": entry("refs-dup2", [A, DUP, B], "<p>[1][2][3]</p>"),
    "refs-oob": entry("refs-oob", [A], "<p>x[1]y[9]z[注]w[1-3]v[0]u[01]t[1,2]</p>"),
    "refs-year": entry("refs-year", [A], "<p>见[2019]年报告[1]，并参[2004]及[12]。</p>"),
    "refs-year-only": entry("refs-year-only", [A, B], "<p>见[2019]年报告，[12]页。</p>"),
    "refs-12": entry("refs-12", MANY12, "<p>引[1]、[12]、[13]、[2019]。</p>"),
    "refs-skip": entry("refs-skip", [A, B], '<p>见<a href="https://example.org/x">文[1]</a>。</p><h2>标题[2]</h2><h3>小节[1]</h3><p>正文[2]</p>'),
    "refs-nosrc": entry("refs-nosrc", [], "<p>x[1]</p>"),
    "refs-plain": entry("refs-plain", [A], "第一行\n第二行[1]"),
    "plain-legacy": entry("plain-legacy", [LEGACY], "第一行\n\n第二行"),
    "block-legacy": entry("block-legacy", [LEGACY], "<h2>小标题</h2><p>段一</p><ul><li>项</li></ul>"),
    "refs-hash": {**entry("refs-hash", [A, B], "<p>甲[1]，乙[2]。</p>"), "_test_hash": "#wiki-src-2"},
    "refs-hash-cite": {**entry("refs-hash-cite", [A, B], "<p>甲[1]，乙[2]。</p>"), "_test_hash": "#wiki-cite-2-1"},
    "refs-hash-other": {**entry("refs-hash-other", [A, B], "<p>甲[1]，乙[2]。</p>"), "_test_hash": "#section-x"},
}

CITE_RE = re.compile(r'<a class="wiki-cite-link" id="([^"]+)" href="([^"]+)" aria-label="([^"]*)">\[(\d+)\]</a>')
BACK_RE = re.compile(r'<a class="wiki-source-back" href="([^"]+)" aria-label="([^"]*)">([^<]*)</a>')
LI_ID_RE = re.compile(r'<li id="(wiki-src-\d+)"')


def static_body(e: dict) -> str:
    page = g.entry_html(e, {}, {}, {})
    m = re.search(r'<section class="wiki-entry-body"><h2>详细介绍</h2>(.*?)</section>', page, re.S)
    assert m, "body section not found"
    return m.group(1)


def dyn_body(section_html: str) -> str:
    m = re.search(r"<h2>详细介绍</h2>(.*)$", section_html or "", re.S)
    return m.group(1) if m else ""


def body_text(h: str) -> str:
    return re.sub(r"\s+", "", html.unescape(re.sub(r"<[^>]*>", "", h)))


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
    check("static/bare-strings: not rendered (empty state)", "尚无已公开来源" in out["bare-strings"])
    run_static_citations(out)
    return out


def run_static_citations(src: dict[str, str]) -> None:
    body = {k: static_body(v) for k, v in CASES.items()}
    # --- [n] -> superscript link, anchors on the source <li> ---
    c = CITE_RE.findall(body["refs"])
    check("cite/refs: two superscript links", len(c) == 2 and body["refs"].count('<sup class="wiki-cite">') == 2, str(c))
    check("cite/refs: href -> #wiki-src-n, id wiki-cite-n-1", [(i, h, t) for i, h, _, t in c] == [("wiki-cite-1-1", "#wiki-src-1", "1"), ("wiki-cite-2-1", "#wiki-src-2", "2")])
    check("cite/refs: li ids match anchors", LI_ID_RE.findall(src["refs"]) == ["wiki-src-1", "wiki-src-2"])
    check("cite/refs: every cite target exists", all(h[1:] in LI_ID_RE.findall(src["refs"]) for _, h, _, _ in c))
    check("cite/refs: back links point to the cite ids", [b[0] for b in BACK_RE.findall(src["refs"])] == ["#wiki-cite-1-1", "#wiki-cite-2-1"])
    check("cite/refs: single back link shows arrow", [b[2] for b in BACK_RE.findall(src["refs"])] == ["↑", "↑"])
    check("cite/refs: no bare [n] text left in body", not re.search(r"\[\d+\](?!</a>)", body["refs"]))
    check("cite/refs: external source link still first-attribute href", links_of(src["refs"]) == [("https://example.org/a", "来源甲"), ("https://example.org/b", "来源乙")])
    # --- pending / duplicate url / out of range: no marker, no renumber, no dead link ---
    check("cite/pending: [2] dropped, [1][3] linked", [(i, t) for i, _, _, t in CITE_RE.findall(body["refs-pending"])] == [("wiki-cite-1-1", "1"), ("wiki-cite-3-1", "3")], body["refs-pending"])
    check("cite/pending: no link to missing wiki-src-2", "wiki-src-2" not in body["refs-pending"] and "wiki-src-2" not in src["refs-pending"])
    check("cite/pending: li ids keep array positions", LI_ID_RE.findall(src["refs-pending"]) == ["wiki-src-1", "wiki-src-3"])
    check("cite/dup: duplicate-url [2] dropped, no renumber", [t for *_, t in CITE_RE.findall(body["refs-dup2"])] == ["1", "3"] and LI_ID_RE.findall(src["refs-dup2"]) == ["wiki-src-1", "wiki-src-3"])
    check("cite/oob: [9] beyond the array is plain text, kept as-is", [t for *_, t in CITE_RE.findall(body["refs-oob"])] == ["1"] and "y[9]z" in body["refs-oob"], body["refs-oob"])
    check("cite/year: [2019]/[2004]/[12] kept verbatim, only [1] linked", [t for *_, t in CITE_RE.findall(body["refs-year"])] == ["1"] and all(x in body["refs-year"] for x in ("[2019]", "[2004]", "[12]")), body["refs-year"])
    check("cite/year: whole sentence intact", body_text(body["refs-year"]) == body_text("<p>见[2019]年报告[1]，并参[2004]及[12]。</p>"), body["refs-year"])
    check("cite/year-only: body unchanged (wrapper only), no sup", body["refs-year-only"] == '<div class="wiki-entry-text"><p>见[2019]年报告，[12]页。</p></div>', body["refs-year-only"])
    check("cite/12: pending position [12] dropped, [13] and [2019] kept, [1] linked", [t for *_, t in CITE_RE.findall(body["refs-12"])] == ["1"] and "[12]" not in body["refs-12"] and "[13]" in body["refs-12"] and "[2019]" in body["refs-12"], body["refs-12"])
    check("cite/12: no dead link to wiki-src-12", "wiki-src-12" not in body["refs-12"] and "wiki-src-12" not in src["refs-12"])
    check("cite/oob: non-citation brackets untouched", all(x in body["refs-oob"] for x in ("[注]", "[1-3]", "[0]", "[01]", "[1,2]")))
    check("cite/every link target exists (all cases)", all(h[1:] in LI_ID_RE.findall(src[k]) for k in CASES for _, h, _, _ in CITE_RE.findall(body[k])))
    # --- skip a / headings ---
    check("cite/skip: <a> and h2/h3 text not replaced", "文[1]</a>" in body["refs-skip"] and "<h2>标题[2]</h2>" in body["refs-skip"] and "<h3>小节[1]</h3>" in body["refs-skip"])
    check("cite/skip: no nested <a> inside <a>", not re.search(r"<a[^>]*>(?:(?!</a>).)*<a ", body["refs-skip"]))
    check("cite/skip: paragraph [2] linked", [(t) for *_, t in CITE_RE.findall(body["refs-skip"])] == ["2"])
    # --- repeated citations: ^ a b c ---
    check("cite/multi: ids numbered per source", [i for i, *_ in CITE_RE.findall(body["refs-multi"])] == ["wiki-cite-1-1", "wiki-cite-1-2", "wiki-cite-2-1", "wiki-cite-1-3"])
    back = BACK_RE.findall(src["refs-multi"])
    check("cite/multi: ^ a b c back links", [b[2] for b in back] == ["a", "b", "c", "↑"] and [b[0] for b in back] == ["#wiki-cite-1-1", "#wiki-cite-1-2", "#wiki-cite-1-3", "#wiki-cite-2-1"], str(back))
    check("cite/multi: adjacent [2][1] are separate sups", "</sup><sup class=\"wiki-cite\">" in body["refs-multi"])
    # --- no body change when there is nothing to link ---
    check("cite/legacy: no sup, no ids, ul", "<sup" not in body["legacy"] and "wiki-src-" not in src["legacy"] and src["legacy"].startswith("<ul"))
    check("cite/legacy: body untouched (only wrapper)", body["legacy"] == '<div class="wiki-entry-text"><p>没有引用标记。</p></div>', body["legacy"])
    check("cite/no sources: [1] stays plain text", "<sup" not in body["refs-nosrc"] and "[1]" in body["refs-nosrc"])
    check("cite/empty-state: still shows empty notice", "尚无已公开来源" in src["refs-nosrc"])
    # --- plain-text legacy entries keep their line breaks ---
    check("plain/static: text-only body gets --plain", 'class="wiki-entry-text wiki-entry-text--plain"' in body["plain-legacy"] and "第一行\n\n第二行" in body["plain-legacy"])
    check("plain/static: html body has no --plain", "--plain" not in body["block-legacy"] and "--plain" not in body["refs"])
    check("plain/static: citation works in plain body", [t for *_, t in CITE_RE.findall(body["refs-plain"])] == ["1"] and "--plain" in body["refs-plain"])
    # --- link_citations unit: code/pre/sup are skipped ---
    items = g.visible_sources([A, B])
    out_html, counts, dropped = g.link_citations("<p>a[1]<code>[1]</code><pre>[2]</pre>b[3]c[4]</p>", items, 3)
    check("cite/unit: code/pre skipped, in-range invisible [3] dropped, [4] beyond array kept", out_html.count("<sup") == 1 and "<code>[1]</code>" in out_html and "<pre>[2]</pre>" in out_html and dropped == [3] and counts == {1: 1} and "c[4]" in out_html, out_html)


def run_css_checks() -> None:
    css = (ROOT / "docs" / "stylesheets" / "museum-apple.css").read_text(encoding="utf-8")
    flat = re.sub(r"\s+", "", css)
    check("css: heading weight 700 variable", "--jdm-heading-weight:700" in flat)
    uses = [m.group(1) for m in re.finditer(r"([^{}]+)\{[^{}]*font-weight:var\(--jdm-heading-weight\)", css)]
    check("css: bold headings only inside .wiki-entry-card .wiki-entry-body", bool(uses) and all(all(sel.strip().startswith(".wiki-entry-card .wiki-entry-body") for sel in u.split(",")) for u in uses), str(uses))
    check("css: h2/h3/h4 all covered by the bold rule", bool(uses) and all(f"h{n}" in uses[0] for n in (2, 3, 4)))
    check("css: .wiki-entry-text no longer pre-wrap", "white-space:pre-wrap" not in flat and ".wiki-entry-text{color:#27384f;white-space:normal}" in flat)
    check("css: --plain uses pre-line", ".wiki-entry-text--plain{white-space:pre-line}" in flat)
    check("css: paragraph margin 0 0 .85em via variable", "--jdm-p-gap:.85em" in flat and "p{margin:00var(--jdm-p-gap)}" in flat)
    check("css: body 17px / mobile 16px / line-height 1.85", "--jdm-body-size:17px" in flat and "--jdm-body-lh:1.85" in flat and "--jdm-body-size:16px" in flat)
    check("css: h2 margin 1.7em 0 .5em", "--jdm-h2-top:1.7em" in flat and "--jdm-h2-bottom:.5em" in flat)
    check("css: cite lifted with relative+top (not vertical-align:super)", "position:relative;top:calc(-1*var(--jdm-cite-lift))" in flat and "--jdm-cite-size:.72em" in flat and "--jdm-cite-lift:.5em" in flat and "vertical-align:super" not in flat)
    check("css: cite hit area pseudo-element, coarse pointer larger", "a.wiki-cite-link::after{content:\"\";position:absolute;inset:-12px-4px}" in flat and "@media(pointer:coarse)" in flat)
    check("css: :target highlight 2.4s + reduced-motion off", "--jdm-cite-flash:2.4s" in flat and "li:target{" in flat and "@media(prefers-reduced-motion:reduce)" in flat)
    check("css: back link selector out-ranks the legacy li>a rule", ".wiki-entry-source-links.wiki-entry-source-refs>lia.wiki-source-back{" in flat and "min-width:32px" in flat.split(".wiki-entry-source-links.wiki-entry-source-refs>lia.wiki-source-back{", 1)[1].split("}", 1)[0])
    check("css: slate focus ring for back link is #9ec3ff", '[data-md-color-scheme="slate"].wiki-entry-source-links.wiki-entry-source-refs>lia.wiki-source-back:focus-visible{outline-color:#9ec3ff}' in flat)
    check("css: touch hit area narrow horizontally (-3px), later adjacent cite gives up left side", "@media(pointer:coarse){.wiki-entry-card.wiki-cite" in flat and "inset:-22px-3px" in flat and ".wiki-cite+.wiki-cite" in flat and "::after{left:0}" in flat)
    check("css: scroll-margin-top 96px (80px mobile)", "--jdm-cite-scroll-margin:96px" in flat and "--jdm-cite-scroll-margin:80px" in flat)
    block = re.sub(r"/\*.*?\*/", "", css[css.index("==== Entry body"):], flags=re.S)
    block = block[block.index(".wiki-entry-card{"):]
    sels = []
    for part in re.findall(r"(?:^|})\s*([^{}@]+)\{", block):
        depth, cur = 0, ""
        for ch in part:
            depth += (ch == "(") - (ch == ")")
            if ch == "," and depth == 0:
                sels.append(cur.strip()); cur = ""
            else:
                cur += ch
        sels.append(cur.strip())
    loose = [x for x in sels if x and not x.startswith(("[data-md-color-scheme", ".wiki-entry-card", ".wiki-entry-source-", ".wiki-entry-source-refs", "from", "to"))]
    check("css: new rules are scoped to the entry card / source list", not loose, str(loose))


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
    res = json.loads(proc.stdout)
    dyn = {k: (v or {}).get("sources") for k, v in res.items()}
    dbody = {k: (v or {}).get("body") for k, v in res.items()}
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
        # citations: superscript anchors, source ids, back links, body text and wrapper class identical on both sides
        sb, db = static_body(CASES[k]), dyn_body(dbody.get(k))
        check(f"consistent/{k}: same citation anchors static vs dynamic", CITE_RE.findall(sb) == CITE_RE.findall(db), f"{CITE_RE.findall(sb)} vs {CITE_RE.findall(db)}")
        check(f"consistent/{k}: same source li ids static vs dynamic", LI_ID_RE.findall(static[k]) == LI_ID_RE.findall(d))
        check(f"consistent/{k}: same back links static vs dynamic", BACK_RE.findall(static[k]) == BACK_RE.findall(d), f"{BACK_RE.findall(static[k])} vs {BACK_RE.findall(d)}")
        check(f"consistent/{k}: same body text static vs dynamic", body_text(sb) == body_text(db), f"{body_text(sb)!r} vs {body_text(db)!r}")
        check(f"consistent/{k}: same wrapper class static vs dynamic", re.match(r'<div class="([^"]*)"', sb).group(1) == (re.match(r'<div class="([^"]*)"', db) or [None, None])[1])
        check(f"dynamic/{k}: every cite target exists", all(h[1:] in LI_ID_RE.findall(d) for _, h, _, _ in CITE_RE.findall(db)))
    check("dynamic/empty: empty state", "暂无外部来源" in (dyn.get("empty") or ""))
    check("dynamic/empty-only-pending: empty state", "暂无外部来源" in (dyn.get("empty-only-pending") or ""))
    check("dynamic/evil: label escaped", "<img" not in (dyn.get("evil") or "") and "&lt;img" in (dyn.get("evil") or ""))
    check("dynamic/evil: javascript: dropped", "javascript:" not in (dyn.get("evil") or ""))
    check("dynamic/title-only: title used", "仅有标题" in (dyn.get("title-only") or ""))
    check("dynamic/legacy: no ol, no numbers", "<ol" not in (dyn.get("legacy") or "") and "[1]" not in (dyn.get("legacy") or ""))
    check("dynamic/refs: ol with [1][2]", "<ol" in (dyn.get("refs") or "") and "[1]" in dyn["refs"] and "[2]" in dyn["refs"])
    check("dynamic/refs: superscript links built", dyn_body(dbody["refs"]).count('<sup class="wiki-cite">') == 2)
    check("dynamic/pending: [2] dropped, no dead link", "wiki-src-2" not in dbody["refs-pending"] and "[2]" not in re.sub(r"<[^>]*>", "", dyn_body(dbody["refs-pending"])))
    check("dynamic/oob: non-citation brackets untouched, [9] beyond array kept", all(x in dbody["refs-oob"] for x in ("[注]", "[1-3]", "[0]", "[01]", "[1,2]", "y[9]z")))
    check("dynamic/year: years kept verbatim, only [1] linked", [t for *_, t in CITE_RE.findall(dbody["refs-year"])] == ["1"] and all(x in dbody["refs-year"] for x in ("[2019]", "[2004]", "[12]")), dbody["refs-year"])
    check("dynamic/year-only: body unchanged (wrapper only)", dyn_body(dbody["refs-year-only"]) == '<div class="wiki-entry-text"><p>见[2019]年报告，[12]页。</p></div>', dyn_body(dbody["refs-year-only"]))
    check("dynamic/12: pending [12] dropped, [13] and [2019] kept", [t for *_, t in CITE_RE.findall(dbody["refs-12"])] == ["1"] and "[12]" not in dbody["refs-12"] and "[13]" in dbody["refs-12"] and "[2019]" in dbody["refs-12"] and "wiki-src-12" not in dbody["refs-12"], dbody["refs-12"])
    check("dynamic/skip: <a>/h2/h3 untouched, no nested a", "文[1]</a>" in dbody["refs-skip"] and "<h2>标题[2]</h2>" in dbody["refs-skip"] and "<h3>小节[1]</h3>" in dbody["refs-skip"] and not re.search(r"<a[^>]*>(?:(?!</a>).)*<a ", dbody["refs-skip"]))
    check("dynamic/legacy: body untouched (only wrapper)", dyn_body(dbody["legacy"]) == '<div class="wiki-entry-text"><p>没有引用标记。</p></div>', dyn_body(dbody["legacy"]))
    check("dynamic/plain: --plain class only for text-only bodies", "--plain" in dbody["plain-legacy"] and "--plain" not in dbody["block-legacy"])
    check("dynamic/nosrc: [1] stays plain text", "<sup" not in dbody["refs-nosrc"] and "[1]" in dbody["refs-nosrc"])
    # hash re-scroll after the async render
    check("dynamic/hash: #wiki-src-n scrolled into view once", res["refs-hash"]["scrolled"] == "wiki-src-2", str(res["refs-hash"]["scrolled"]))
    check("dynamic/hash: #wiki-cite-n-k scrolled into view", res["refs-hash-cite"]["scrolled"] == "wiki-cite-2-1", str(res["refs-hash-cite"]["scrolled"]))
    check("dynamic/hash: unrelated hash not touched", res["refs-hash-other"]["scrolled"] is None and res["refs"]["scrolled"] is None)


def main() -> int:
    static = run_static()
    run_css_checks()
    run_dynamic(static)
    for name in PASS:
        print("PASS", name)
    for name in FAIL:
        print("FAIL", name)
    print(f"{len(PASS)} passed, {len(FAIL)} failed")
    return 1 if FAIL else 0


if __name__ == "__main__":
    sys.exit(main())
