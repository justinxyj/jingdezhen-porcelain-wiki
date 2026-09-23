#!/usr/bin/env python3
"""H-3 readonly catalog probe: live JSON snapshot + optional golden assert.

Connect via env H3_DB_URL (preferred) or DATABASE_URL.
No DDL/DML. Without a connection URL: SKIP (exit 0).
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
GOLDEN_PATH = ROOT / "supabase" / "security" / "expected_catalog_snapshot.json"
ASSERTIONS_SQL = ROOT / "supabase" / "security" / "h3_catalog_assertions.sql"

TABLES = (
    "entries",
    "media",
    "entry_relations",
    "edits",
    "entry_revisions",
    "profiles",
    "favorites",
)
SENSITIVE = ("edits", "entry_revisions", "profiles", "favorites")
WRITE_PRIVS = ("INSERT", "UPDATE", "DELETE", "TRUNCATE")
FAIL_IDS = ("A1", "A2", "A3", "B1", "B2", "B3", "B4", "C1", "D1")


def _connect(url: str):
    try:
        import psycopg2  # type: ignore

        conn = psycopg2.connect(url)
        conn.set_session(readonly=True, autocommit=True)
        return conn, "psycopg2"
    except ImportError:
        pass
    try:
        import psycopg  # type: ignore

        conn = psycopg.connect(url, autocommit=True)
        try:
            conn.read_only = True  # type: ignore[attr-defined]
        except Exception:
            pass
        return conn, "psycopg"
    except ImportError as exc:
        raise RuntimeError(
            "Neither psycopg2 nor psycopg is installed. "
            "Install with: pip install psycopg2-binary"
        ) from exc


def _fetchone(cur, sql: str, params=None):
    cur.execute(sql, params or ())
    return cur.fetchone()


def _fetchall(cur, sql: str, params=None):
    cur.execute(sql, params or ())
    return cur.fetchall()


def probe(conn) -> dict[str, Any]:
    cur = conn.cursor()
    checks: dict[str, Any] = {}

    # --- A1 / A2 / A3 ---
    rows = _fetchall(
        cur,
        """
        SELECT n.nspname, p.prosecdef, p.proconfig,
               has_function_privilege('anon', p.oid, 'EXECUTE') AS anon_exec,
               has_function_privilege('authenticated', p.oid, 'EXECUTE') AS auth_exec,
               has_function_privilege('service_role', p.oid, 'EXECUTE') AS service_exec
        FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE p.proname = 'is_staff'
          AND pg_get_function_identity_arguments(p.oid) = ''
        """,
    )
    private = next((r for r in rows if r[0] == "private"), None)
    public_exists = any(r[0] == "public" for r in rows)

    if private is None:
        checks["A1"] = {"ok": False, "prosecdef": False, "search_path": None}
        checks["A3"] = {
            "ok": False,
            "anon_execute": None,
            "authenticated_execute": None,
            "service_role_execute": None,
        }
    else:
        _, prosecdef, proconfig, anon_exec, auth_exec, service_exec = private
        search_path = None
        for cfg in proconfig or []:
            if isinstance(cfg, str) and cfg.startswith("search_path="):
                search_path = cfg.split("=", 1)[1]
                break
        a1_ok = bool(prosecdef) and search_path == "public"
        checks["A1"] = {
            "ok": a1_ok,
            "prosecdef": bool(prosecdef),
            "search_path": search_path,
        }
        a3_ok = (not anon_exec) and bool(auth_exec) and bool(service_exec)
        checks["A3"] = {
            "ok": a3_ok,
            "anon_execute": bool(anon_exec),
            "authenticated_execute": bool(auth_exec),
            "service_role_execute": bool(service_exec),
        }

    checks["A2"] = {
        "ok": not public_exists,
        "public_is_staff_exists": public_exists,
    }

    # --- B1 RLS ---
    rls_rows = _fetchall(
        cur,
        """
        SELECT c.relname, c.relrowsecurity
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relname = ANY(%s)
        """,
        (list(TABLES),),
    )
    rls = {name: False for name in TABLES}
    for name, enabled in rls_rows:
        rls[name] = bool(enabled)
    checks["B1"] = {"ok": all(rls.values()), "rls": rls}

    # --- policies for B2/B3/B4 ---
    policies = _fetchall(
        cur,
        """
        SELECT tablename, policyname, roles::text, cmd, qual, with_check
        FROM pg_policies
        WHERE schemaname = 'public' AND tablename = ANY(%s)
        """,
        (list(TABLES),),
    )

    def roles_has(roles_text: str, needle: str) -> bool:
        return needle.lower() in (roles_text or "").lower()

    # B2
    public_select_has_is_staff = False
    for tablename, _pn, roles, cmd, qual, with_check in policies:
        if tablename not in ("entries", "entry_relations", "media"):
            continue
        if (cmd or "").upper() != "SELECT":
            continue
        if not (roles_has(roles, "anon") or roles_has(roles, "public")):
            continue
        blob = f"{qual or ''} {with_check or ''}"
        if re.search(r"is_staff", blob, re.I):
            public_select_has_is_staff = True
            break

    media_verified = False
    for tablename, _pn, roles, cmd, qual, _wc in policies:
        if tablename != "media" or (cmd or "").upper() != "SELECT":
            continue
        if not (roles_has(roles, "anon") or roles_has(roles, "public")):
            continue
        q = qual or ""
        if (
            re.search(r"approved", q, re.I)
            and re.search(r"verified", q, re.I)
        ) or (
            re.search(r"status", q, re.I)
            and re.search(r"review_state", q, re.I)
        ):
            media_verified = True
            break

    checks["B2"] = {
        "ok": (not public_select_has_is_staff) and media_verified,
        "public_select_qual_has_is_staff": public_select_has_is_staff,
        "media_public_read_requires_verified": media_verified,
    }

    # B3 staff policies
    staff_anon = False
    staff_bad_fn = False
    staff_seen = False
    for _tn, _pn, roles, _cmd, qual, with_check in policies:
        blob = f"{qual or ''} {with_check or ''}"
        if not re.search(r"is_staff", blob, re.I):
            continue
        staff_seen = True
        if roles_has(roles, "anon"):
            staff_anon = True
        if not re.search(r"private\.is_staff", blob, re.I):
            staff_bad_fn = True

    checks["B3"] = {
        "ok": staff_seen and (not staff_anon) and (not staff_bad_fn),
        "staff_policies_authenticated_only": not staff_anon,
        "staff_uses_private_is_staff": staff_seen and not staff_bad_fn,
    }

    # B4 anon write policies
    anon_write = []
    for tablename, policyname, roles, cmd, _q, _w in policies:
        if (cmd or "").upper() not in ("INSERT", "UPDATE", "DELETE", "ALL"):
            continue
        if roles_has(roles, "anon"):
            anon_write.append(f"{tablename}:{policyname}:{cmd}")
    anon_write.sort()
    checks["B4"] = {"ok": len(anon_write) == 0, "anon_write_policies": anon_write}

    # --- C1 media × anon table SELECT ---
    media_anon_select = bool(
        _fetchone(cur, "SELECT has_table_privilege('anon', 'public.media', 'SELECT')")[0]
    )
    checks["C1"] = {
        "ok": not media_anon_select,
        "media_anon_table_select": media_anon_select,
    }

    # --- C2 media_public ---
    view_row = _fetchone(
        cur,
        """
        SELECT c.oid, c.reloptions
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relname = 'media_public'
          AND c.relkind IN ('v', 'm')
        """,
    )
    media_public_exists = view_row is not None
    anon_select = False
    anon_write_grants: list[str] = []
    if media_public_exists:
        anon_select = bool(
            _fetchone(
                cur,
                "SELECT has_table_privilege('anon', 'public.media_public', 'SELECT')",
            )[0]
        )
        grant_rows = _fetchall(
            cur,
            """
            SELECT privilege_type
            FROM information_schema.role_table_grants
            WHERE table_schema = 'public'
              AND table_name = 'media_public'
              AND grantee = 'anon'
              AND privilege_type = ANY(%s)
            ORDER BY privilege_type
            """,
            (list(WRITE_PRIVS),),
        )
        anon_write_grants = [r[0] for r in grant_rows]

    c2_ok = media_public_exists and anon_select and len(anon_write_grants) == 0
    checks["C2"] = {
        "ok": c2_ok,
        "media_public_exists": media_public_exists,
        "anon_select": anon_select,
        "anon_write_grants": anon_write_grants,
    }

    # --- C3 security_invoker ---
    security_invoker = False
    if view_row is not None:
        reloptions = view_row[1] or []
        security_invoker = any(
            isinstance(o, str) and o == "security_invoker=true" for o in reloptions
        )
    checks["C3"] = {"ok": security_invoker, "security_invoker": security_invoker}

    # --- D1 sensitive anon SELECT ---
    anon_sel: dict[str, bool] = {}
    for tbl in SENSITIVE:
        anon_sel[tbl] = bool(
            _fetchone(
                cur,
                "SELECT has_table_privilege('anon', %s, 'SELECT')",
                (f"public.{tbl}",),
            )[0]
        )
    checks["D1"] = {
        "ok": not any(anon_sel.values()),
        "anon_select": anon_sel,
    }

    # Optional fingerprint (not a fail condition)
    fingerprint = sorted(
        f"{tn}|{pn}|{cmd}|{roles}"
        for tn, pn, roles, cmd, _q, _w in policies
    )

    return {
        "schema_version": 1,
        "checks": checks,
        "known_debt": ["C2", "C3"],
        "notes": "live catalog probe; no row data; no connection string",
        "policies_fingerprint": fingerprint,
    }


def load_golden() -> dict[str, Any]:
    return json.loads(GOLDEN_PATH.read_text(encoding="utf-8"))


def assert_against_golden(live: dict[str, Any]) -> int:
    golden = load_golden()
    known_debt = set(golden.get("known_debt") or live.get("known_debt") or [])
    warnings: list[str] = []
    failures: list[str] = []

    g_checks = golden.get("checks") or {}
    l_checks = live.get("checks") or {}

    for cid, g_item in g_checks.items():
        l_item = l_checks.get(cid)
        if l_item is None:
            msg = f"{cid}: missing from live probe"
            (warnings if cid in known_debt else failures).append(msg)
            continue

        # Prefer live ok flag; also compare booleans that golden pins
        live_ok = bool(l_item.get("ok"))
        if not live_ok:
            msg = f"{cid}: ok=false live={json.dumps(l_item, ensure_ascii=False)}"
            if cid in known_debt:
                warnings.append(msg)
            else:
                failures.append(msg)
            continue

        # When live ok, optionally verify key boolean fields match golden
        for key, g_val in g_item.items():
            if key == "ok":
                continue
            if key not in l_item:
                continue
            if isinstance(g_val, bool) and l_item[key] != g_val:
                msg = f"{cid}.{key}: expected {g_val!r} got {l_item[key]!r}"
                if cid in known_debt:
                    warnings.append(msg)
                else:
                    failures.append(msg)
            elif isinstance(g_val, dict):
                for sk, sv in g_val.items():
                    if sk in l_item.get(key, {}) and l_item[key][sk] != sv:
                        msg = f"{cid}.{key}.{sk}: expected {sv!r} got {l_item[key][sk]!r}"
                        if cid in known_debt:
                            warnings.append(msg)
                        else:
                            failures.append(msg)
            elif isinstance(g_val, list) and key in l_item and l_item[key] != g_val:
                # empty lists etc.
                if cid in known_debt:
                    warnings.append(f"{cid}.{key}: expected {g_val!r} got {l_item[key]!r}")
                else:
                    failures.append(f"{cid}.{key}: expected {g_val!r} got {l_item[key]!r}")

    live["warnings"] = warnings
    live["failures"] = failures

    if warnings:
        print("H3_WARNINGS")
        for w in warnings:
            print("-", w)
    if failures:
        print("H3_ASSERT_FAIL")
        for f in failures:
            print("-", f)
        return 1

    print("H3_ASSERT_PASS")
    if warnings:
        print("(known_debt warnings present; exit 0)")
    return 0


def resolve_url() -> str | None:
    for key in ("H3_DB_URL", "DATABASE_URL"):
        val = os.environ.get(key, "").strip()
        if val:
            return val
    return None


def main() -> int:
    parser = argparse.ArgumentParser(description="H-3 readonly catalog probe")
    parser.add_argument(
        "--assert",
        dest="do_assert",
        action="store_true",
        help="Diff live snapshot against golden; non-known_debt failures → exit 1",
    )
    parser.add_argument(
        "--output",
        "-o",
        type=Path,
        default=None,
        help="Write live JSON to this path (default: stdout only)",
    )
    parser.add_argument(
        "--run-sql-assertions",
        action="store_true",
        help="Also execute supabase/security/h3_catalog_assertions.sql (readonly DO)",
    )
    args = parser.parse_args()

    url = resolve_url()
    if not url:
        print(
            "SKIP: H3 catalog probe — no H3_DB_URL/DATABASE_URL set "
            "(cannot connect; not a green false-pass of catalog checks)"
        )
        return 0

    try:
        conn, driver = _connect(url)
    except Exception as exc:
        print(f"H3_PROBE_ERROR: failed to connect ({exc})", file=sys.stderr)
        return 2

    print(f"H3_PROBE_DRIVER={driver}", file=sys.stderr)

    try:
        live = probe(conn)
        if args.run_sql_assertions and ASSERTIONS_SQL.exists():
            cur = conn.cursor()
            cur.execute(ASSERTIONS_SQL.read_text(encoding="utf-8"))
    finally:
        conn.close()

    exit_code = 0
    if args.do_assert:
        exit_code = assert_against_golden(live)

    text = json.dumps(live, ensure_ascii=False, indent=2) + "\n"
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(text, encoding="utf-8")
        print(f"Wrote {args.output}", file=sys.stderr)
    elif not args.do_assert:
        sys.stdout.write(text)
    else:
        # --assert without -o: emit summary already printed; also dump JSON to stdout
        sys.stdout.write(text)

    return exit_code


if __name__ == "__main__":
    sys.exit(main())
