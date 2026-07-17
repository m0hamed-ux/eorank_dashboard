"use client"

import { Area, AreaChart, ResponsiveContainer } from "recharts"

// Minimal in-card sparkline (as in the design reference's latency card).
// No axes, no grid, no tooltip — it's a shape, not a chart.

export function Sparkline({
  data,
  color = "var(--chart-1)",
  height = 36,
}: {
  data: number[]
  color?: string
  height?: number
}) {
  const points = data.map((value, i) => ({ i, value }))

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={points} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          fill="none"
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
