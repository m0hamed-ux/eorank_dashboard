"use client"

import * as React from "react"
import { Check, ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  pillarLabel,
  type EnhancementTip,
  type TipEffort,
  type TipImpact,
} from "@/lib/score"

// Prioritized action list. Impact uses semantic colors (it's a judgment),
// effort stays neutral (it's a fact). Sorted: open tips by estimated gain,
// done tips last.

const IMPACT_VARIANT: Record<TipImpact, "success" | "warning" | "secondary"> = {
  high: "success",
  medium: "warning",
  low: "secondary",
}

const EFFORT_LABEL: Record<TipEffort, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
}

function TipRow({
  tip,
  onToggle,
}: {
  tip: EnhancementTip
  onToggle: (id: string) => void
}) {
  const [expanded, setExpanded] = React.useState(false)

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-lg border p-4 transition-colors duration-150",
        tip.done && "opacity-60"
      )}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          role="checkbox"
          aria-checked={tip.done}
          aria-label={tip.done ? "Mark as not done" : "Mark as done"}
          onClick={() => onToggle(tip.id)}
          className={cn(
            "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors duration-150",
            "focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
            tip.done
              ? "border-success bg-success text-white"
              : "border-border hover:border-muted-foreground"
          )}
        >
          {tip.done && <Check className="size-3" />}
        </button>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            aria-expanded={expanded}
            className="flex items-center justify-between gap-2 text-left"
          >
            <span
              className={cn(
                "text-sm font-medium",
                tip.done && "line-through decoration-muted-foreground"
              )}
            >
              {tip.title}
            </span>
            <ChevronDown
              className={cn(
                "size-4 shrink-0 text-muted-foreground transition-transform duration-150",
                expanded && "rotate-180"
              )}
            />
          </button>

          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant={IMPACT_VARIANT[tip.impact]}>
              {tip.impact} impact
            </Badge>
            <Badge variant="outline">{EFFORT_LABEL[tip.effort]}</Badge>
            <Badge variant="secondary">{pillarLabel(tip.pillar)}</Badge>
            <span className="ml-auto font-mono text-xs font-medium text-muted-foreground tabular-nums">
              +{tip.gain} pts
            </span>
          </div>

          {expanded && (
            <p className="mt-1 text-sm text-muted-foreground">
              {tip.description}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export function EnhancementTips({ tips: initialTips }: { tips: EnhancementTip[] }) {
  // Local toggle state; persistence comes with the backend.
  // TODO: PATCH /api/v1/score/tips/{id} once the API exists.
  const [tips, setTips] = React.useState(initialTips)
  const [showDone, setShowDone] = React.useState(false)

  const toggle = (id: string) =>
    setTips((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    )

  const open = [...tips.filter((t) => !t.done)].sort((a, b) => b.gain - a.gain)
  const done = tips.filter((t) => t.done)
  const potential = open.reduce((sum, t) => sum + t.gain, 0)

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        Completing all {open.length} open tips could gain you{" "}
        <span className="font-mono font-medium text-foreground tabular-nums">
          +{potential} pts
        </span>
        .
      </p>

      <div className="flex flex-col gap-2">
        {open.map((tip) => (
          <TipRow key={tip.id} tip={tip} onToggle={toggle} />
        ))}
      </div>

      {done.length > 0 && (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="self-start text-muted-foreground"
            onClick={() => setShowDone((s) => !s)}
          >
            <ChevronDown
              className={cn(
                "transition-transform duration-150",
                showDone && "rotate-180"
              )}
            />
            {done.length} completed
          </Button>
          {showDone && (
            <div className="flex flex-col gap-2">
              {done.map((tip) => (
                <TipRow key={tip.id} tip={tip} onToggle={toggle} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
