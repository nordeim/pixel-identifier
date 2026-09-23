'use client'

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { TrendPoint } from '@/lib/analytics'

/**
 * Visitor identification trend, styled after the live app: purple line for
 * pageviews (gradient fill 0.15→0, live #fillVisitors), teal line for
 * identified visitors (gradient fill 0.2→0), dashed grid in both
 * directions, and the live's hand-built centered legend below the chart
 * (R8-F2/R8-F3 — the legend is plain flex markup, not a Recharts legend;
 * round 7's loss of B1/B2 is what round 8 restores).
 *
 * R28-F1: the axis chrome decoded from the live's runtime SVG — the live
 * renders the recharts DEFAULT tick lines (tickSize 6) + axis lines on
 * BOTH axes in the axis-level stroke hsl(220, 9%, 46%) (their Tailwind v3
 * gray-500 literal; it also becomes the tick text's INHERITED fill), the
 * explicit margin {5,5,5,5} (plot origin x=65 at the 595px card),
 * comma-form HSL color literals (the live's v3 source strings), and a
 * tooltip at 8px radius with NO shadow. The pre-R28 config suppressed the
 * tick lines + Y axis line and hacked the margin left:-18 — a 23px plot
 * shift that also flipped which date labels recharts thins.
 */
export function TrendChart({ data }: { data: TrendPoint[] }) {
  return (
    <>
      {/* R16: the live's current build pins the chart at 280px — an 8px
          height drift measured off the live DOM (was 288px). */}
      <div className="h-[280px]" role="img" aria-label="Line chart of daily pageviews and identified visitors over the last 14 days">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <defs>
            <linearGradient id="fillVisitors" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0.15} />
              <stop offset="100%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="fillIdentified" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(172, 66%, 50%)" stopOpacity={0.2} />
              <stop offset="100%" stopColor="hsl(172, 66%, 50%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          {/* R28-F1: the grid rides the live's HSL literal — the same cool
              border color as #E5E7EB (R11), in the live's attr form. */}
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" vertical />
          {/* R28-F1: no tickLine/axisLine overrides — the recharts defaults
              render the 6px tick lines + the axis line, all in the
              axis-level live stroke (the tick text fill INHERITS it). */}
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11 }}
            stroke="hsl(220, 9%, 46%)"
            interval="preserveStartEnd"
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11 }}
            stroke="hsl(220, 9%, 46%)"
          />
          <Tooltip
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              fontSize: '12px',
            }}
            formatter={(value: number | string, name: string) => [
              value,
              name === 'pageviews' ? 'Pageviews' : 'Identified',
            ]}
          />
          <Area
            type="monotone"
            dataKey="pageviews"
            stroke="hsl(262, 83%, 58%)"
            strokeWidth={2}
            fill="url(#fillVisitors)"
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Area
            type="monotone"
            dataKey="identified"
            stroke="hsl(172, 66%, 50%)"
            strokeWidth={2}
            fill="url(#fillIdentified)"
            dot={false}
            activeDot={{ r: 4 }}
          />
        </AreaChart>
        </ResponsiveContainer>
      </div>
      {/* Live legend markup, verbatim (R8-F2): centered under the chart,
          amber dot = Pageviews, neon-green dot = Identified. */}
      <div className="flex items-center gap-6 mt-2 justify-center">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
          Pageviews
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="h-2 w-2 rounded-full bg-neon-green" aria-hidden="true" />
          Identified
        </div>
      </div>
    </>
  )
}
