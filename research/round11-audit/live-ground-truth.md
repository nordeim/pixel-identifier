# Round-11 Live Ground Truth (captured 2026-09-17)

Fresh audit of https://pixelco.io + https://app.pixelco.io (logged in as
sepnetflix2023@outlook.com). Every value below was extracted from the live
DOM via computed styles / class strings (agent-browser eval). PNG evidence
in `live/`.

## 1. Live APP bundle `:root` tokens (full dump)

```
--background: 220 20% 97%        (= #F6F7F9, cool — was white in R10)
--foreground: 230 25% 10%        (navy — was #111827)
--card: 0 0% 100%
--card-foreground: 230 25% 10%
--popover: 0 0% 100%
--popover-foreground: 230 25% 10%
--primary: 45 100% 51%           (= #FFC105, unchanged)
--primary-foreground: 230 25% 10%
--secondary: 220 14% 96%         (cool — was warm cream #F5F0E6)
--secondary-foreground: 230 25% 10%
--muted: 220 14% 96%
--muted-foreground: 220 9% 46%   (= #6B7280)
--accent: 172 66% 50%            (TEAL — was cream #FEF9C3)
--accent-foreground: 230 25% 10%
--destructive: 0 84% 60%
--destructive-foreground: 0 0% 100%
--border: 220 13% 91%            (cool — was warm #E7E5DF)
--input: 220 13% 91%
--ring: 45 100% 51%              (was #EAB308)
--radius: .75rem
--gradient-primary: linear-gradient(135deg, hsl(45,100%,51%), hsl(42,100%,50%))
--gradient-accent: linear-gradient(135deg, hsl(172,66%,50%), hsl(199,89%,48%))
--gradient-hero: linear-gradient(135deg, hsl(230,25%,8%), hsl(40,40%,12%))
--gradient-card: linear-gradient(135deg, hsl(0,0%,100%), hsl(40,30%,97%))
--glow-primary: 0 0 40px hsl(45,100%,51%,.3)
--glow-accent: 0 0 40px hsl(172,66%,50%,.3)
--hot-pink: 330 81% 60%
--electric-blue: 199 89% 48%     (NEW token)
--neon-green: 172 66% 50%
--sidebar-background: 0 0% 100%
--sidebar-foreground: 230 25% 10%
--sidebar-primary: 45 100% 51%
--sidebar-primary-foreground: 0 0% 100%
--sidebar-accent: 45 30% 96%     (= #F8F6F2 warm — the active pill tint)
--sidebar-accent-foreground: 45 100% 40%  (= #CC9900 golden)
--sidebar-border: 220 13% 91%
--sidebar-ring: 45 100% 51%
--font-display: "Space Grotesk", sans-serif
--font-body: "Inter", sans-serif
```

## 2. Live MARKETING bundle `:root` (unchanged vs R10 scope — aligned)

White bg, foreground 230 25% 12%, card 40 30% 98%, border 230 15% 90%,
primary 45 100% 50%, radius .625rem, `--font-mono: "JetBrains Mono", monospace`
(**no JetBrains Mono webfont is loaded** — falls back to system mono; the
clone ships a Geist Mono webfont = drift).

## 3. Legacy shadcn primitives (the live ships the LEGACY generation)

- **Button base**: `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0`
  - default `bg-primary text-primary-foreground hover:bg-primary/90`; sizes: default `h-10 px-4 py-2`, sm `h-9 rounded-md px-3`
- **Badge base**: `inline-flex items-center rounded-full border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2`
  - default `border-transparent bg-primary text-primary-foreground hover:bg-primary/80`; secondary `border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80`; outline `text-foreground`
- **Card**: `rounded-lg border bg-card text-card-foreground shadow-sm` (no data-slot, no py-6 gap-6). CardHeader `flex flex-col space-y-1.5 p-6`; CardContent `p-6 pt-0`; CardTitle renders **h3** `font-semibold tracking-tight font-display` + per-use size (text-base/text-lg); KPI cards carry a single raw `p-6 pt-5 pb-4 px-5` child; the recent-identifications header is a RAW div `space-y-1.5 p-6 flex flex-row items-center justify-between pb-2` (not CardHeader).
- **Tabs**: TabsList `inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground`; TabsTrigger `inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm` (+ per-use `gap-1.5`; install tablist adds `w-full justify-start mb-4`).
- **Select**: trigger `flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1` (+ `w-44` on filters); content `relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 ... data-[side=bottom]:translate-y-1 ...`; item `relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50` (**indicator LEFT**, pl-8 pr-2).
- **Input**: `flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm` (bg-**background**, not transparent).
- **Checkbox**: `peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`.

## 4. Sidebar (live = shadcn Sidebar suite, effective chrome)

- Wrapper 48px when collapsed (rail); footer HIDDEN when collapsed; logo visible in rail.
- Header: `flex flex-col gap-2 p-4` → `flex items-center gap-2` → img `h-8 w-8 shrink-0` + `font-display text-lg font-bold` "Pixelco".
- Content: `flex min-h-0 flex-1 flex-col gap-2 overflow-auto` (gap-2 = 8px between groups; the clone ships space-y-6 = 24px).
- Group: `relative flex w-full min-w-0 flex-col p-2`; label `flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70`.
- Menu: `flex w-full min-w-0 flex-col gap-1`; button (size default) = base + `h-8 text-sm hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0`; active adds `bg-sidebar-accent text-sidebar-accent-foreground font-medium`.
- Footer: `flex flex-col gap-2 p-4 space-y-3` (NO border-t) → plan card `rounded-lg border border-primary/20 bg-primary/5 p-3` → badge row `flex items-center gap-2 mb-1` → Badge secondary + `text-[10px] px-1.5 py-0 gradient-primary text-primary-foreground border-0` rendering literal "FREE" → usage `text-xs text-muted-foreground leading-snug` → progress `h-1.5 w-full rounded-full bg-muted mt-2 overflow-hidden` + `h-full rounded-full gradient-primary` → sign-out `flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full px-1` + LogOut `h-3.5 w-3.5`.

## 5. Dashboard page-level details

- Trend chart: pageviews stroke `hsl(262, 83%, 58%)` (purple), identified `hsl(172, 66%, 50%)` (teal); grid stroke `hsl(220, 13%, 91%)` (cool — clone #E7E5DF warm); legend dots stay amber `bg-primary` + `bg-neon-green`.
- "View all" link: `text-xs text-primary hover:underline flex items-center gap-1` + ArrowUpRight `h-3 w-3`.
- Visitors badges: px-**2** (not px-1.5); segment Company = secondary + `text-[10px] px-2 py-0 bg-amber-500/10 text-amber-600 border-amber-500/20` (hover stays `hover:bg-secondary/80` from the variant); source Direct = secondary + `bg-neon-green/10 text-neon-green border-neon-green/20`; status inactive = secondary + `text-[10px] px-2 py-0`.
- Activity badges: px-1.5; Pageview = outline (`text-foreground`); Identified = default + `gradient-primary text-primary-foreground`.
- Domains badges: px-1.5; Pending = secondary; Verified = **default variant** + `gradient-primary text-primary-foreground border-0`.
- Install: tablist `bg-muted p-1 w-full justify-start mb-4`; waiting banner `mt-4 p-3 bg-neon-green/5 border-neon-green/20 border rounded-lg`; verified banner `bg-neon-green/10 border-neon-green/30` (clone ships /20); icon `lucide-circle-check h-4 w-4 shrink-0 mt-0.5 text-muted-foreground`.
- Domains Add-Domain button: default variant + `gradient-primary text-primary-foreground shadow-lg glow-primary hover:opacity-90 transition-all duration-300 font-semibold h-10 px-4 py-2`.
- Topbar: toggle = ghost + `h-7 w-7` with a size-less PanelLeft svg (16px via `[&_svg]:size-4`); bell = ghost + `h-10 w-10 relative`.
- Dashboard pricing: plan cards `rounded-lg border bg-card text-card-foreground shadow-sm relative overflow-hidden transition-all hover:shadow-lg flex flex-col h-full hover:border-primary/20`; grid `gap-5`; banner/FAQ cards use the legacy Card + raw `p-6 pt-5 pb-4` children; FAQ card `... shadow-sm hover:border-primary/10 transition-colors`.
- 404 (root, serves both app + marketing misses): `flex min-h-screen items-center justify-center bg-muted` → `text-center` → h1 `mb-4 text-4xl font-bold` "404" → p `mb-4 text-xl text-muted-foreground` "Oops! Page not found" → a `/` `text-primary underline hover:text-primary/90` "Return to Home".

## 6. Marketing deltas

- All kickers are inline `<span class="text-xs font-semibold text-primary uppercase tracking-widest">` (clone: `<p>` — the recurring -8px/section line-box strut).
- Header margins: audience + how-it-works + pricing wraps `text-center mb-14`; compare + FAQ wraps `text-center mb-12` (clone pricing/FAQ wraps lack the mb).
- `#benefits` anchor is on the "Everything you need" (Features) section; audience section has NO id (clone puts id="benefits" on Audience).
- Hero "See Live Demo" → `https://app.pixelco.io` (clone: `#live-demo`, a clone invention; the live app root serves login when logged out → clone target = `/login`).
- Header CTAs both size sm: Log In = ghost + `text-muted-foreground font-medium`; Start Identifying = default + `gradient-cta text-primary-foreground border-0 hover:opacity-90 font-semibold`.
- Footer: brand wordmark wrapped in `<a class="flex items-center gap-2 mb-4" href="/">`; Careers is a real `<a href="#">` (clone renders a disabled span).
- Compare card CTA: `<a class="block"><button default h-10 px-4 py-2 w-full mt-6 gradient-cta text-primary-foreground border-0 hover:opacity-90 font-semibold>Start Free <ArrowRight class="ml-1 w-4 h-4">`.
- Social proof section has NO h2 (clone's is sr-only — invisible, keeping for a11y).
- Live scroll-reveal inline styles (`opacity:0; translateY(16px)`) — R10-F14, still deferred per CSS-only motion convention.
