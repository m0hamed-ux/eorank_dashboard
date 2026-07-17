"use client"

// Shared Recharts tooltip styled as a popover card per Design.md.

interface TooltipEntry {
  name?: string
  value?: number | string
  color?: string
}

export function ChartTooltip({
  active,
  label,
  payload,
  formatter,
  labelFormatter,
}: {
  active?: boolean
  label?: string | number
  payload?: TooltipEntry[]
  formatter?: (value: number | string) => string
  labelFormatter?: (label: string) => string
}) {
  if (!active || !payload?.length) return null

  const shownLabel =
    label !== undefined && labelFormatter
      ? labelFormatter(String(label))
      : label

  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-popover-foreground shadow-md">
      {shownLabel !== undefined && (
        <p className="mb-1 font-mono text-xs text-muted-foreground tabular-nums">
          {shownLabel}
        </p>
      )}
      <div className="flex flex-col gap-1">
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span
              aria-hidden
              className="size-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}</span>
            <span className="ml-auto pl-3 font-mono font-medium tabular-nums">
              {formatter && entry.value !== undefined
                ? formatter(entry.value)
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
