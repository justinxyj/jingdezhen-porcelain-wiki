#!/usr/bin/env python3
"""Static gate: flag unsafe href/src / unescaped DB-ish fields inside innerHTML templates.

Scans docs/javascripts/**/*.js by default. Fail on:
  - href/src attribute values that use esc(...) (text escape ≠ URL allowlist)
  - href/src values that interpolate raw URL builders (.path/.url/entryUrl/ROOT/http…)
    without safeHref(...)/hrefFor(...)
  - DB-ish fields in HTML sinks without esc/safeHref

Allow:
  - safeHref(...)/hrefFor(...) wrappers
  - simple local identifiers (assumed assigned via safeHref earlier)
  - end-of-line or previous-line comment containing `xss-safe:`

Usage:
  python scripts/xss_innerhtml_gate.py
  python scripts/xss_innerhtml_gate.py --fixtures   # expect fixtures to FAIL
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_GLOB = "docs/javascripts/**/*.js"
FIXTURE_GLOB = "scripts/fixtures/xss-gate/**/*.js"

ATTR_TMPL = re.compile(
    r"""(?P<attr>href|src)\s*=\s*(?P<q>["'])\$\{(?P<expr>[^}]+)\}(?P=q)""",
    re.IGNORECASE,
)
# Matches: href="'+expr+'"  OR  href="' + expr + '"
ATTR_CONCAT = re.compile(
    r"""(?P<attr>href|src)\s*=\s*(?:(?P<q>["'])\s*\+\s*(?P<expr>[^+]+?)\s*\+\s*(?P=q)|["']["']\s*\+\s*(?P<expr2>[^+]+?)\s*\+\s*["'])""",
    re.IGNORECASE,
)
INNER_ASSIGN = re.compile(r"""(?:\.innerHTML|\.insertAdjacentHTML)\s*=""")
DB_FIELD = re.compile(
    r"""\$\{(?![^}]*\b(?:esc|safeHref|hrefFor|encodeURIComponent|String|Number|JSON|domainBadge|statusText|mediaState)\b)(?P<field>[^}]*\b(?:\.(?:path|url)|zh\?\.title|zh\.title|e\.sources|m\.path)\b[^}]*)\}"""
)
XSS_SAFE_MARK = re.compile(r"xss-safe\s*:")
RAW_URLISH = re.compile(
    r"""(?:\bentryUrl\b|\bworldUrl\b|\burl\s*\(|\bROOT\b|\.path\b|\.url\b|https?:|javascript:)"""
)
SAFE_WRAP = re.compile(r"""\b(?:safeHref|hrefFor)\s*\(""")
SIMPLE_ID = re.compile(r"""^[A-Za-z_$][\w$]*$""")
ESC_CALL = re.compile(r"""(?:^|\W)esc\s*\(""")


def rel(path: Path) -> str:
    abs_path = path if path.is_absolute() else (ROOT / path)
    try:
        return str(abs_path.resolve().relative_to(ROOT))
    except Exception:
        return str(path)


def is_safe_href_expr(expr: str) -> bool:
    e = expr.strip()
    if SAFE_WRAP.search(e):
        return True
    # safeHref(...)||'' / ||'#'
    if re.search(r"\bsafeHref\s*\([^)]*\)\s*\|\|", e) or re.search(r"\bhrefFor\s*\([^)]*\)\s*\|\|", e):
        return True
    return False


def is_esc_only_url(expr: str) -> bool:
    e = expr.strip()
    return bool(re.match(r"^esc\s*\(", e)) or bool(ESC_CALL.search(e) and not SAFE_WRAP.search(e) and e.startswith("esc"))


def needs_safe_href(expr: str) -> bool:
    """True when expr looks like a raw URL builder / field and is not wrapped."""
    e = expr.strip()
    if is_safe_href_expr(e):
        return False
    if is_esc_only_url(e):
        return True
    if SIMPLE_ID.match(e):
        # Pre-sanitized local (caller should have used safeHref when assigning).
        return False
    if RAW_URLISH.search(e):
        return True
    # Function call that isn't a known safe wrapper
    if re.search(r"\w+\s*\(", e) and not is_safe_href_expr(e):
        return True
    return False


def line_allowlisted(lines: list[str], idx: int) -> bool:
    cur = lines[idx]
    if XSS_SAFE_MARK.search(cur):
        return True
    if idx > 0 and XSS_SAFE_MARK.search(lines[idx - 1]):
        return True
    return False


def check_attr_expr(path: Path, lineno: int, attr: str, expr: str, findings: list[str]) -> None:
    e = expr.strip()
    if is_esc_only_url(e):
        findings.append(f"{rel(path)}:{lineno}: {attr} uses esc(...) — use safeHref(...) for URLs")
        return
    if needs_safe_href(e):
        findings.append(f"{rel(path)}:{lineno}: {attr} value `{e}` missing safeHref(...)")


def scan_file(path: Path) -> list[str]:
    text = path.read_text(encoding="utf-8")
    lines = text.splitlines()
    findings: list[str] = []
    in_html_sink = False
    for i, line in enumerate(lines):
        if INNER_ASSIGN.search(line) or "innerHTML=" in line.replace(" ", "") or "insertAdjacentHTML(" in line:
            in_html_sink = True
        clear_after = in_html_sink and line.rstrip().endswith(";") and line.count("`") % 2 == 0

        if line_allowlisted(lines, i):
            if clear_after:
                in_html_sink = False
            continue

        for m in ATTR_TMPL.finditer(line):
            check_attr_expr(path, i + 1, m.group("attr"), m.group("expr"), findings)

        for m in ATTR_CONCAT.finditer(line):
            expr = (m.groupdict().get("expr") or m.groupdict().get("expr2") or "").strip()
            if expr:
                check_attr_expr(path, i + 1, m.group("attr"), expr, findings)

        if in_html_sink:
            for m in DB_FIELD.finditer(line):
                field = m.group("field").strip()
                if re.search(r"""(?:href|src)\s*=\s*["']\$\{""", line):
                    continue
                findings.append(
                    f"{rel(path)}:{i+1}: DB-ish field `${{{field}}}` in HTML sink without esc/safeHref"
                )

        if clear_after:
            in_html_sink = False

    return findings


def collect(paths: list[Path]) -> list[str]:
    out: list[str] = []
    for path in sorted(paths):
        if path.name.endswith(".min.js"):
            continue
        out.extend(scan_file(path))
    return out


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--fixtures", action="store_true", help="Scan fixtures and expect findings (self-test)")
    ap.add_argument("paths", nargs="*", help="Optional explicit files/dirs")
    args = ap.parse_args()

    if args.fixtures:
        files = sorted(ROOT.glob(FIXTURE_GLOB))
        # Only scan intentionally bad fixtures
        files = [f for f in files if "bad-" in f.name]
        findings = collect(files)
        if not findings:
            print("XSS_INNERHTML_GATE_FIXTURE_FAIL: expected bad fixtures to be caught, got none")
            return 1
        print("XSS_INNERHTML_GATE_FIXTURE_PASS")
        for f in findings:
            print("-", f)
        return 0

    if args.paths:
        files: list[Path] = []
        for raw in args.paths:
            p = Path(raw)
            if not p.is_absolute():
                p = ROOT / p
            if p.is_dir():
                files.extend(sorted(p.rglob("*.js")))
            else:
                files.append(p)
    else:
        files = sorted(ROOT.glob(DEFAULT_GLOB))

    findings = collect(files)
    if findings:
        print("XSS_INNERHTML_GATE_FAIL")
        for f in findings:
            print("-", f)
        return 1
    print("XSS_INNERHTML_GATE_PASS")
    print(f"scanned {len(files)} files")
    return 0


if __name__ == "__main__":
    sys.exit(main())
