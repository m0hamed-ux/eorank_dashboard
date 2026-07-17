import { TrendingDown, TrendingUp } from "lucide-react"

import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { ScorePillar } from "@/lib/score"

// Sub-score grid: one meter per pillar (GEO, AEO, Domain Rating, ...).
// Meters are violet (brand metric), not semantic — a low score is a fact,
// not an error state.

function PillarRow({ pillar }: { pillar: ScorePillar }) {
  const isUp = pillar.delta >= 0
  const flat = pillar.delta === 0

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-sm font-medium">{pillar.label}</span>
            <span className="flex items-baseline gap-2">
              {!flat && (
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
                  {pillar.delta}
                </span>
              )}
              <span className="font-mono text-sm font-semibold tabular-nums">
                {pillar.score}
              </span>
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${pillar.score}%` }}
            />
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent className="max-w-56">{pillar.description}</TooltipContent>
    </Tooltip>
  )
}

export function ScorePillars({ pillars }: { pillars: ScorePillar[] }) {
  return (
    <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
      {pillars.map((pillar) => (
        <PillarRow key={pillar.id} pillar={pillar} />
      ))}
    </div>
  )
}
