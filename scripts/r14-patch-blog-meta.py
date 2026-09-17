#!/usr/bin/env python3
"""Round-14: patch blog-posts.ts with the live meta descriptions.

Reads the extracted live metadata (research/round14-audit/content/
live-meta-all.jsonl), maps each post slug to its live description, and
inserts a `metaDescription` field into every post object + the interface.
"""
import json
import re
import sys

REPO = "/home/z/my-project/pixel-identifier"
DATA = f"{REPO}/src/data/blog-posts.ts"
JSONL = f"{REPO}/research/round14-audit/content/live-meta-all.jsonl"

# load live meta: path -> desc
live = {}
with open(JSONL) as f:
    for line in f:
        line = line.strip()
        if not line:
            continue
        # agent-browser wraps output in quotes; strip outer quotes + unescape
        if line.startswith('"') and line.endswith('"'):
            line = json.loads(line)
        rec = json.loads(line)
        live[rec["path"]] = rec["desc"]

src = open(DATA).read()

# 1) interface gains the field (after excerpt)
if "metaDescription" not in src:
    src = src.replace(
        "  excerpt: string\n",
        "  excerpt: string\n"
        "  /** The live's meta description (R14-F3) — distinct from the card excerpt. */\n"
        "  metaDescription: string\n",
    )

# 2) per-post insertion: find each slug block and insert after the excerpt line
posts = re.findall(r"slug: '([^']+)'", src)
inserted = 0
for slug in posts:
    desc = live.get(f"/blog/{slug}")
    if desc is None:
        print(f"MISSING live desc for {slug}", file=sys.stderr)
        continue
    # find the post block: slug line -> excerpt line (single or double quoted,
    # possibly wrapped over two lines)
    slug_pos = src.index(f"slug: '{slug}'")
    exc_m = re.compile(r"\n    excerpt: ('(?:[^'\\]|\\.)*'|\"(?:[^\"\\]|\\.)*\"),", re.S)
    m = exc_m.search(src, slug_pos)
    if not m:
        print(f"NO excerpt anchor for {slug}", file=sys.stderr)
        continue
    if "metaDescription" in src[slug_pos : m.end() + 400]:
        print(f"already patched: {slug}")
        continue
    # escape for a single-quoted TS string
    desc_ts = desc.replace("\\", "\\\\").replace("'", "\\'")
    insert_at = m.end()  # right after the excerpt line's comma
    src = (
        src[:insert_at]
        + f"\n    metaDescription: '{desc_ts}',"
        + src[insert_at:]
    )
    inserted += 1

open(DATA, "w").write(src)
print(f"patched {inserted} posts")
