import { TrendingDown, TrendingUp } from "lucide-react"

import { cn } from "@/lib/utils"
import { PROVIDERS } from "@/types/job"
import type { ProviderStat } from "@/lib/analytics"
import { ProviderIcon } from "@/components/provider-icon"

// Per-provider citation rate list: icon, name, horizontal meter, rate, delta.

export function ProviderBreakdown({ stats }: { stats: ProviderStat[] }) {
  return (
    <div className="flex flex-col gap-4">
      {stats.map((stat) => {
        const label =
          PROVIDERS.find((p) => p.id === stat.provider)?.label ?? stat.provider
        const isUp = stat.delta >= 0
        return (
          <div key={stat.provider} className="flex items-center gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <ProviderIcon provider={stat.provider} className="size-4" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-medium">{label}</span>
                <span className="flex items-baseline gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-0.5 font-mono text-xs font-medium tabular-nums",
                      isUp ? "text-success" : "text-destructive"
                    )}
                  >
                    {isUp ? (
                      <TrendingUp className="size-3" />
                    ) : (
                      <TrendingDown className="size-3" />
                    )}
                    {isUp ? "+" : ""}
                    {stat.delta}
                  </span>
                  <span className="font-mono text-sm font-semibold tabular-nums">
                    {stat.citationRate}%
                  </span>
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${stat.citationRate}%` }}
                />
              </div>
              <span className="font-mono text-xs text-muted-foreground tabular-nums">
                {stat.citations} citations
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
