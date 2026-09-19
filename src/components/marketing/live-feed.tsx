'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, Globe, Mail, User } from 'lucide-react'

/**
 * R19-F2: the live's hero "Live Visitor Feed" widget — extracted verbatim
 * from the live's marketing bundle (index-C3AAh5Je.js, symbols PD/TD/ND):
 *
 *  - FIVE entries {id, label, email, delay} with staggered delays
 *    [0, 1.8, 3.6, 5.4, 7.2]s and the live's varied anonymous labels.
 *  - Per-row phase machine: enter → scan (delay·1000 + 600ms) →
 *    reveal (+1600) → done (+3200 → row unmounts).
 *  - The parent re-mounts ALL rows every 10s cycle (key `${id}-${cycle}`),
 *    restarting the stagger.
 *  - Row geometry: position absolute, top = index*56 + 12px.
 *  - The avatar animates backgroundColor muted → primary (0.4s, the
 *    .feed-avatar transition) when its row flips to reveal; the icon
 *    swaps User → Mail.
 *  - "Matching…" pulses (opacity .3→1→.3, 1s infinite) during scan; a
 *    ✓ badge pops during reveal.
 *
 * The live drives the phases with framer-motion (Y.div/zb); the clone
 * replicates the model with the same DOM structure, CSS keyframes
 * (feed-in ≈ the live's 0.5s opacity/x entry) and inline phase state —
 * the framer-motion style artifacts (opacity/transform: none inlines)
 * stay documented reveal-machinery residuals (D5-class).
 */

interface FeedEntry {
  id: number
  label: string
  email: string
  /** Stagger offset in seconds — the live's PD delays. */
  delay: number
}

const DEMO_ENTRIES: FeedEntry[] = [
  { id: 1, label: 'Anonymous Visitor', email: 'sarah.jones@gmail.com', delay: 0 },
  { id: 2, label: 'Unknown User', email: 'james.miller92@gmail.com', delay: 1.8 },
  { id: 3, label: 'Site Visitor', email: 'maria.garcia@gmail.com', delay: 3.6 },
  { id: 4, label: 'Anonymous Visitor', email: 'alex.thompson@gmail.com', delay: 5.4 },
  { id: 5, label: 'Unknown User', email: 'priya.patel@gmail.com', delay: 7.2 },
]

/** The live's phase clock (ms after the row's delay elapses). */
const SCAN_AT = 600
const REVEAL_AT = 1600
const DONE_AT = 3200
/** The live's parent cycle — every 10s the whole roster re-mounts. */
const CYCLE_MS = 10_000

type Phase = 'enter' | 'scan' | 'reveal' | 'done'

function FeedRow({ entry, index, cycle }: { entry: FeedEntry; index: number; cycle: number }) {
  const [phase, setPhase] = useState<Phase>('enter')

  useEffect(() => {
    const base = entry.delay * 1000
    const timers = [
      setTimeout(() => setPhase('scan'), base + SCAN_AT),
      setTimeout(() => setPhase('reveal'), base + REVEAL_AT),
      setTimeout(() => setPhase('done'), base + DONE_AT),
    ]
    return () => timers.forEach(clearTimeout)
    // cycle re-arms the machine — the live's key change re-mounts the row.
  }, [entry.delay, cycle])

  if (phase === 'done') return null
  const revealed = phase === 'reveal'

  return (
    <div
      className="feed-row flex items-center gap-3 px-4 py-3 rounded-lg bg-card/80 border border-border backdrop-blur-sm"
      style={{ position: 'absolute', top: index * 56 + 12, left: 0, right: 0 }}
    >
      {/* Avatar — inline phase color (the live's animated backgroundColor:
          muted until reveal, then primary; the .feed-avatar rule carries
          the 0.4s transition). R18-B5 note: the live emits
          hsl(var(--primary)) (v3 triplet convention); the clone's tokens
          are hex, so the inline references var() directly. */}
      <div
        className="feed-avatar w-8 h-8 rounded-full flex items-center justify-center shrink-0"
        style={{ backgroundColor: revealed ? 'var(--primary)' : 'var(--muted)' }}
      >
        {revealed ? (
          <Mail className="w-4 h-4 text-primary-foreground" aria-hidden="true" />
        ) : (
          <User className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        {revealed ? (
          <>
            <p className="text-sm font-semibold text-foreground">{entry.email}</p>
            <p className="text-xs text-primary font-medium">✓ Identified</p>
          </>
        ) : (
          <>
            <p className="text-sm font-medium text-muted-foreground">{entry.label}</p>
            <p className="text-xs text-muted-foreground/60">Browsing your site…</p>
          </>
        )}
      </div>
      {phase === 'scan' && (
        <div className="feed-matching text-xs text-primary font-medium">Matching…</div>
      )}
      {revealed && (
        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
          <span className="text-primary text-xs">✓</span>
        </div>
      )}
    </div>
  )
}

/**
 * "Live Visitor Feed" hero mockup (R6-H5): the live's stat strip
 * (847 Visitors Today → Pixelco → 169 Emails Found) over the phased
 * row roster, closed by a Match Rate progress footer. Purely decorative;
 * reduced-motion users see the phased rows without the entrance/keyframe
 * motion (the phase machine is state, not animation).
 */
export function LiveFeedMockup() {
  const [cycle, setCycle] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setCycle((v) => v + 1), CYCLE_MS)
    return () => clearInterval(timer)
  }, [])

  return (
    <div
      className="relative rounded-xl border border-border bg-card overflow-hidden shadow-elevated"
      aria-label="Sample of identified visitors"
    >
      {/* Header — globe icon + pulsing "Real-time" badge like the live.
          R18: the live's emission orders. */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-card">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary" aria-hidden="true" />
          <span className="text-sm font-semibold text-foreground">Live Visitor Feed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" aria-hidden="true" />
          <span className="text-xs text-muted-foreground">Real-time</span>
        </div>
      </div>

      {/* Stat strip — visitors → Pixelco → emails, arrow-separated. */}
      <div className="px-4 py-4 border-b border-border">
        <div className="flex items-center justify-between text-center">
          <div className="flex-1">
            <p className="text-2xl font-bold text-foreground">847</p>
            <p className="text-xs text-muted-foreground mt-0.5">Visitors Today</p>
          </div>
          <ArrowRight
            className="w-4 h-4 text-muted-foreground/40 shrink-0"
            aria-hidden="true"
          />
          <div className="flex-1">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-1">
              {/* R18: the live's stat glyph is an inline data-URI img
                  (amber #eab308 zap), not a lucide icon — replicated
                  verbatim. */}
              {/* eslint-disable-next-line @next/next/no-img-element -- inline data URI, byte-parity with the live */}
              <img
                src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23eab308' stroke-width='2'%3E%3Cpath d='M13 2L3 14h9l-1 8 10-12h-9l1-8z'/%3E%3C/svg%3E"
                alt=""
                className="w-4 h-4"
              />
            </div>
            <p className="text-xs text-muted-foreground">Pixelco</p>
          </div>
          <ArrowRight
            className="w-4 h-4 text-muted-foreground/40 shrink-0"
            aria-hidden="true"
          />
          <div className="flex-1">
            <p className="text-2xl font-bold text-primary">169</p>
            <p className="text-xs text-muted-foreground mt-0.5">Emails Found</p>
          </div>
        </div>
      </div>

      {/* Phased rows — the live's fixed 240px window and index*56+12 tops. */}
      <div className="relative px-3 py-2" style={{ height: 240 }}>
        {DEMO_ENTRIES.map((entry, index) => (
          <FeedRow key={`${entry.id}-${cycle}`} entry={entry} index={index} cycle={cycle} />
        ))}
      </div>

      {/* Match-rate footer with a thin amber progress bar. */}
      <div className="px-4 py-3 border-t border-border bg-card/50">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-muted-foreground">Match Rate</span>
          <span className="text-xs font-semibold text-primary">20%</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full bg-primary" style={{ width: '20%' }} />
        </div>
      </div>
    </div>
  )
}
