"use client"

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import type { ScoreHistoryPoint } from "@/lib/score"
import { ChartTooltip } from "@/components/charts/chart-tooltip"

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
})

function formatDay(iso: string) {
  // Accepts both day strings ("2026-05-21") and full ISO timestamps (the
  // API sends audit timestamps). Never throw on bad input — an unparseable
  // tick label must not crash the whole page.
  const date = new Date(iso.includes("T") ? iso : `${iso}T00:00:00Z`)
  return Number.isNaN(date.getTime()) ? "" : dateFormatter.format(date)
}

export function ScoreHistoryChart({ data }: { data: ScoreHistoryPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
        <defs>
          <linearGradient id="fill-score" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.1} />
            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          vertical={false}
          strokeDasharray="4 4"
          stroke="var(--border)"
        />
        <XAxis
          dataKey="date"
          tickFormatter={formatDay}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          minTickGap={32}
        />
        <YAxis
          domain={[0, 100]}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          width={40}
        />
        <Tooltip
          cursor={{ stroke: "var(--border)" }}
          content={<ChartTooltip labelFormatter={formatDay} />}
        />
        <Area
          type="monotone"
          dataKey="score"
          name="Score"
          stroke="var(--chart-1)"
          strokeWidth={2}
          fill="url(#fill-score)"
          dot={false}
          activeDot={{ r: 3 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
