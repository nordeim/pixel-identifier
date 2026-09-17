# Round-15 Audit Evidence — Dashboard shell & auth-card realignment

**Date:** 2026-09-17 · **Repo state at audit:** main @ 2a1d732 (PAD v1.13)
· **Plan:** `docs/plans/2026-09-17-round15-shell-realignment.md`

## What was audited

A full-surface live drift re-check after Round-14 (landing, sub-pages,
blog, legal, crawl documents, favicon, og assets, heads, dashboard
structure), plus a deep selector-agnostic DOM extraction of the dashboard
shell after discovering the live had shipped a new app build.

## Key discovery

The live's app bundle migrated its dashboard to the **shadcn Sidebar
primitive** (data-sidebar attrs, provider/gap/fixed-container DOM, PNG
logo, md breakpoints, icon-rail collapse, Radix mobile Sheet). The live
served TWO build variants during the audit window (rolling deploy): the
old build — which the clone matched exactly — on ~2/13 loads, and the new
primitive build on ~11/13 loads across all 7 dashboard pages. The clone
tracks the dominant variant (ruling D1).

## Directory map

- `live/` — live captures: `shell-full.json` (provider→sidebar outerHTML),
  `shell-header.json`, `shell-layout.json`, `shell-groups.json`
  (group→link mapping), `shell-collapsed.json`, `shell-mobile.json`,
  `shell-mobile-open.json` (Sheet), `login-card.html` (auth card outerHTML),
  `live-sidebar-dom.html`, `live-logo.png` (550×550 RGBA asset, md5
  90a372e1…), `landing-sections.json`, `landing-h2.json`, `about.txt`,
  `docs.txt`, `blog-slug-list.json`, `r15-live-dashboard.png`
- `local/` — the same captures from the clone (pre-remediation)
- `head/` — favicon (byte-identical), the live's NEW og-image URLs
  (gpt-engineer storage + R2) with the downloaded images — both
  byte-identical to the self-hosted copies (the live moved URLs, not
  content; ruling D1 of R14 stands)
- `crawl/` — robots.txt (origin-only diff), sitemap.xml (byte-equal after
  origin substitution), pixel.js captures (the live 404s its old collector
  paths; the snippet now points at a Supabase edge function — the
  environment-specific R11 residual)

## Findings summary

8 planned findings (R15-F1..F8, see the plan) + the verification-sweep
extras (pricing plan cards, in-page heading classes, Badge div root).
All remediated and pinned in `tests/sidebar-chrome.test.tsx`,
`tests/shell-parity.test.tsx`, `tests/app-theme.test.ts`,
`tests/ui-primitives.test.tsx`, `tests/badge-consumers.test.tsx` and
`tests/snippet.test.ts`.

## Verification artifacts

- `live/r15-live-dashboard.png` vs `local/r15-local-dashboard.png` —
  sidebar chrome region pixel-identical; remaining deltas are data-only
  (account initials, usage numbers, chart/table data)
- E2E flow on the standalone build: login → dashboard → visitors →
  export (200 with session) → domains → install — all green
