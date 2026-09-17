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
 */
export function TrendChart({ data }: { data: TrendPoint[] }) {
  return (
    <>
      <div className="h-72 w-full" role="img" aria-label="Line chart of daily pageviews and identified visitors over the last 14 days">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="fillVisitors" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(262 83% 58%)" stopOpacity={0.15} />
              <stop offset="100%" stopColor="hsl(262 83% 58%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="fillIdentified" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(172 66% 50%)" stopOpacity={0.2} />
              <stop offset="100%" stopColor="hsl(172 66% 50%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          {/* R11: grid/axis strokes use the live's cool border token
              (hsl(220 13% 91%) = #E5E7EB), not the pre-R11 warm #E7E5DF. */}
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: '#6B7280' }}
            tickLine={false}
            axisLine={{ stroke: '#E5E7EB' }}
            interval="preserveStartEnd"
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: '#6B7280' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: '0.75rem',
              border: '1px solid #E5E7EB',
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
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
            stroke="hsl(262 83% 58%)"
            strokeWidth={2}
            fill="url(#fillVisitors)"
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Area
            type="monotone"
            dataKey="identified"
            stroke="hsl(172 66% 50%)"
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
      <div className="mt-2 flex items-center justify-center gap-6">
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
