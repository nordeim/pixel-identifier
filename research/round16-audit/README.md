# Round-16 Audit Evidence

**Date:** 2026-09-18 · **Repo state at audit:** main @ e948a61 (PAD v1.14, 432/50)
**Method:** agent-browser DOM extraction (base64-encoded `outerHTML`/`innerHTML`
probes to avoid terminal escape-eating artifacts), same-page live-vs-local
comparison, stability verification across repeated loads (3x overview, 2x
activity/domains — all stable; the current build is dominant).

## Directory layout

- `live/` — pixelco.io / app.pixelco.io captures (logged in as the operator
  account)
  - `main-dashboard*.html` — full `<main>` innerHTML per page (7 pages)
  - `shell-header.html`, `shell-sidebar.html` — topbar + sidebar outerHTML
  - `kpi-cards.json`, `activity-rows.json`, `domains-rows.json`,
    `visitors-table.json`, `visitors-avatars.json`, `install-tabs.json`,
    `pricing-switch.json`, `pricing-probe.json`, `settings-buttons.json`,
    `login-buttons.json` — targeted component probes
- `local/` — same surfaces captured from the standalone production build
  (`npm run build:standalone`, port 3000, seeded demo DB)

## Audit verdict

- **Marketing bundle: STABLE.** Landing section heights
  [762,403,174,526,708,610,650,814,756,500] byte-identical to R15 pins;
  H2 count 7; banner landing-only; all 7 sub-page H1/H2/word counts equal;
  blog slugs identical (10/10); robots.txt format equal (origin-sub);
  favicon.ico byte-identical (md5 04348f…); og images byte-identical to the
  self-hosted copies (the live moved URLs to gpt-engineer/R2 storage again —
  content md5s match).
- **Auth surfaces: STABLE.** Login card, h3, OAuth buttons, submit button,
  password input all byte-identical to the R15 rebuild (login-buttons.json,
  445/445/459-char strings match exactly).
- **App shell: STABLE.** The shadcn Sidebar primitive variant remains
  dominant; provider/gap/fixed DOM, data-sidebar tree, PNG logo, topbar
  chrome all match R15.
- **App CONTENT layer: DRIFTED.** The live shipped a new build of the
  dashboard content components — the drift inventory is in
  `docs/plans/2026-09-18-round16-content-realignment.md`.

## Key mechanics discovered

1. The live's odd button strings (no `rounded-md`/`font-medium`/
   `transition-colors` in the base) are fully explained by cva + twMerge
   displacement: size `sm` = `h-9 rounded-md px-3` dedupes the base's
   `rounded-md` to the tail; `font-semibold` displaces `font-medium`;
   `transition-all` displaces `transition-colors`. ONE Button primitive with
   different variant/size usage — no primitive change needed.
2. The live's content badges (visitors tab counts, domains status, activity
   type badges) are the LEGACY Badge generation (base WITH `border`,
   secondary WITH `text-secondary-foreground`) — while the sidebar's FREE
   badge stays the new-gen (R15) string. Two generations ship side by side.
3. The live's group-label ships a genuinely broken class
   `transition-[margin,opa]` (missing "city") — verified by hex inspection
   of the captured DOM (hex 5b6d617267696e2c6f70615d = "[margin,opa]").
   The clone ships the correct `transition-[margin,opacity]`.
