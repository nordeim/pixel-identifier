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
 * pageviews (no fill), teal line for identified visitors (light gradient
 * fill), dashed grid in both directions, no legend.
 */
export function TrendChart({ data }: { data: TrendPoint[] }) {
  return (
    <div className="h-72 w-full" role="img" aria-label="Line chart of daily pageviews and identified visitors over the last 14 days">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="identifiedFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2DD4BF" stopOpacity={0.12} />
              <stop offset="100%" stopColor="#2DD4BF" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E7E5DF" vertical />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: '#6B7280' }}
            tickLine={false}
            axisLine={{ stroke: '#E7E5DF' }}
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
              border: '1px solid #E7E5DF',
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
              fontSize: '12px',
            }}
          />
          <Area
            type="monotone"
            dataKey="pageviews"
            stroke="#9333EA"
            strokeWidth={2}
            fill="none"
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Area
            type="monotone"
            dataKey="identified"
            stroke="#2DD4BF"
            strokeWidth={2}
            fill="url(#identifiedFill)"
            dot={false}
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
