#!/usr/bin/env python3
"""Refresh cached documentation URLs in references/official-docs.md.

Usage:
    python fetch_docs.py <URL>          # refresh single URL
    python fetch_docs.py --all-stale    # refresh all URLs older than 7 days
    python fetch_docs.py --list-stale   # print stale URLs, do not fetch
"""

from __future__ import annotations

import argparse
import re
import sys
import urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path

SKILL_DIR = Path(__file__).resolve().parent.parent
DOCS_INDEX = SKILL_DIR / "references" / "official-docs.md"
CACHE_DIR = SKILL_DIR / "references" / "_cache"
STALE_DAYS = 7
USER_AGENT = "skill-doctor/1.0 (+local doc cache)"

ROW_RE = re.compile(r"^\|\s+(?P<topic>[^|]+?)\s+\|\s+<?(?P<url>https?://[^ |>]+)>?\s+\|\s+(?P<ts>[^|]+?)\s+\|\s*$")


def read_index() -> str:
    return DOCS_INDEX.read_text(encoding="utf-8")


def write_index(text: str) -> None:
    DOCS_INDEX.write_text(text, encoding="utf-8")


def parse_rows(text: str):
    rows = []
    for line in text.splitlines():
        m = ROW_RE.match(line)
        if m:
            rows.append({
                "topic": m.group("topic").strip(),
                "url": m.group("url").strip(),
                "ts": m.group("ts").strip(),
                "line": line,
            })
    return rows


def is_stale(ts: str) -> bool:
    if ts.lower() == "never":
        return True
    try:
        dt = datetime.fromisoformat(ts)
    except ValueError:
        return True
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return datetime.now(timezone.utc) - dt > timedelta(days=STALE_DAYS)


def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read().decode("utf-8", errors="replace")


def cache_path(url: str) -> Path:
    safe = re.sub(r"[^A-Za-z0-9._-]", "_", url)
    return CACHE_DIR / f"{safe}.html"


def refresh_one(url: str) -> tuple[bool, str]:
    try:
        body = fetch(url)
    except Exception as e:
        return False, f"fetch failed: {e}"
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    cache_path(url).write_text(body, encoding="utf-8")
    return True, f"cached {len(body)} bytes"


def update_timestamp(text: str, url: str, ts: str) -> str:
    new_lines = []
    for line in text.splitlines():
        m = ROW_RE.match(line)
        if m and m.group("url").strip() == url:
            topic = m.group("topic").strip()
            new_lines.append(f"| {topic} | <{url}> | {ts} |")
        else:
            new_lines.append(line)
    return "\n".join(new_lines) + ("\n" if text.endswith("\n") else "")


def cmd_refresh(urls: list[str]) -> int:
    text = read_index()
    rows = {r["url"]: r for r in parse_rows(text)}
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    failures = 0
    for url in urls:
        if url not in rows:
            print(f"[skip] {url} not in index", file=sys.stderr)
            failures += 1
            continue
        ok, msg = refresh_one(url)
        if ok:
            text = update_timestamp(text, url, now)
            print(f"[ok]   {url} — {msg}")
        else:
            print(f"[fail] {url} — {msg}", file=sys.stderr)
            failures += 1
    write_index(text)
    return failures


def list_stale() -> list[str]:
    rows = parse_rows(read_index())
    return [r["url"] for r in rows if is_stale(r["ts"])]


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("url", nargs="?", help="Single URL to refresh")
    p.add_argument("--all-stale", action="store_true", help="Refresh all stale URLs")
    p.add_argument("--list-stale", action="store_true", help="List stale URLs without fetching")
    args = p.parse_args()

    if args.list_stale:
        for u in list_stale():
            print(u)
        return 0

    if args.all_stale:
        urls = list_stale()
        if not urls:
            print("no stale URLs")
            return 0
        return cmd_refresh(urls)

    if args.url:
        return cmd_refresh([args.url])

    p.print_help()
    return 1


if __name__ == "__main__":
    sys.exit(main())
