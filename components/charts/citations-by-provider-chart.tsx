"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import type { DailyCitations } from "@/lib/analytics"
import { ChartTooltip } from "@/components/charts/chart-tooltip"

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
})

function formatDay(iso: string) {
  return dateFormatter.format(new Date(`${iso}T00:00:00Z`))
}

// Provider series use the neutral chart ramp: this chart is about volume
// composition, not good/bad — semantic colors would mislead.
const SERIES = [
  { key: "chatgpt", name: "ChatGPT", color: "var(--chart-1)" },
  { key: "perplexity", name: "Perplexity", color: "var(--chart-2)" },
  { key: "gemini", name: "Gemini", color: "var(--chart-4)" },
  { key: "claude", name: "Claude", color: "var(--chart-5)" },
] as const

export function CitationsByProviderChart({ data }: { data: DailyCitations[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        data={data}
        margin={{ top: 8, right: 8, bottom: 0, left: -16 }}
        barCategoryGap="25%"
      >
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
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          width={40}
        />
        <Tooltip
          cursor={{ fill: "var(--muted)", opacity: 0.5 }}
          content={<ChartTooltip labelFormatter={formatDay} />}
        />
        {SERIES.map((s, i) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.name}
            stackId="citations"
            fill={s.color}
            // Round only the top of the stack
            radius={i === SERIES.length - 1 ? [3, 3, 0, 0] : 0}
            maxBarSize={28}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
