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

import type { TrendPoint } from "@/lib/analytics"
import { ChartTooltip } from "@/components/charts/chart-tooltip"

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
})

function formatDay(iso: string) {
  // Robust to day strings AND full ISO timestamps; never throws on bad input.
  const date = new Date(iso.includes("T") ? iso : `${iso}T00:00:00Z`)
  return Number.isNaN(date.getTime()) ? "" : dateFormatter.format(date)
}

export function VisibilityTrendChart({ data }: { data: TrendPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
        <defs>
          <linearGradient id="fill-you" x1="0" y1="0" x2="0" y2="1">
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
          dataKey="competitors"
          name="Competitor avg"
          stroke="var(--chart-5)"
          strokeWidth={2}
          strokeDasharray="5 4"
          fill="none"
          dot={false}
          activeDot={{ r: 3 }}
        />
        <Area
          type="monotone"
          dataKey="you"
          name="You"
          stroke="var(--chart-1)"
          strokeWidth={2}
          fill="url(#fill-you)"
          dot={false}
          activeDot={{ r: 3 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
