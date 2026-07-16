import { TrendingDown, TrendingUp, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

interface StatCardProps {
  value: string
  delta?: number
  deltaLabel?: string
  metricName: string
  metricIcon: LucideIcon
  children?: React.ReactNode
  className?: string
}

export function StatCard({
  value,
  delta,
  deltaLabel,
  metricName,
  metricIcon: MetricIcon,
  children,
  className,
}: StatCardProps) {
  const hasDelta = delta !== undefined
  const isUp = (delta ?? 0) >= 0

  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-xl border bg-card p-5 text-card-foreground shadow-xs",
        className
      )}
    >
      <div className="flex flex-1 flex-col gap-2">
        <span className="font-mono text-4xl font-semibold tracking-tight tabular-nums">
          {value}
        </span>
        {(hasDelta || deltaLabel) && (
          <span className="flex items-center gap-1.5 text-xs">
            {hasDelta && (
              <span
                className={cn(
                  "flex items-center gap-0.5 font-medium",
                  isUp ? "text-success" : "text-destructive"
                )}
              >
                {isUp ? (
                  <TrendingUp className="size-3.5" />
                ) : (
                  <TrendingDown className="size-3.5" />
                )}
                {isUp ? "+" : ""}
                {delta}%
              </span>
            )}
            {deltaLabel && (
              <span className="text-muted-foreground">{deltaLabel}</span>
            )}
          </span>
        )}
        {children}
      </div>
      <div className="flex items-center gap-2 border-t pt-3 text-xs text-muted-foreground">
        <MetricIcon className="size-3.5" />
        {metricName}
      </div>
    </div>
  )
}
