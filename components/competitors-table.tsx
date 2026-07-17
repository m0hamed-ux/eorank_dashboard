"use client"

import * as React from "react"
import { Trash2, TrendingDown, TrendingUp } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { Competitor } from "@/types/competitor"

function ScoreCell({ score, isYou }: { score: number | null; isYou?: boolean }) {
  if (score === null) {
    return <span className="text-muted-foreground">—</span>
  }
  return (
    <div className="flex items-center justify-end gap-2">
      <span className="font-mono font-medium tabular-nums">{score}</span>
      <span className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
        <span
          className={cn(
            "block h-full rounded-full",
            isYou ? "bg-primary" : "bg-chart-5"
          )}
          style={{ width: `${score}%` }}
        />
      </span>
    </div>
  )
}

function DeltaCell({ delta }: { delta: number | null }) {
  if (delta === null) {
    return <span className="text-muted-foreground">—</span>
  }
  const isUp = delta >= 0
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 font-mono text-xs font-medium tabular-nums",
        isUp ? "text-success" : "text-destructive"
      )}
    >
      {isUp ? (
        <TrendingUp className="size-3.5" />
      ) : (
        <TrendingDown className="size-3.5" />
      )}
      {isUp ? "+" : ""}
      {delta}
    </span>
  )
}

export function CompetitorsTable({
  competitors,
  onRemove,
}: {
  competitors: Competitor[]
  onRemove: (id: string) => void
}) {
  const [toRemove, setToRemove] = React.useState<Competitor | null>(null)

  // Ranked by score; "you" is highlighted, not pinned — seeing your real
  // rank among competitors is the point of the page.
  const ranked = [...competitors].sort(
    (a, b) => (b.score ?? -1) - (a.score ?? -1)
  )

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-10 text-right">#</TableHead>
            <TableHead>Brand</TableHead>
            <TableHead className="text-right">Visibility Score</TableHead>
            <TableHead className="text-right">Citations</TableHead>
            <TableHead className="text-right">Share of Voice</TableHead>
            <TableHead className="text-right">7d</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {ranked.map((competitor, index) => (
            <TableRow
              key={competitor.id}
              className={cn(competitor.isYou && "bg-primary/[0.04]")}
            >
              <TableCell className="text-right font-mono text-xs text-muted-foreground tabular-nums">
                {index + 1}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="flex flex-col gap-0.5">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      {competitor.name}
                      {competitor.isYou && <Badge>You</Badge>}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {competitor.domain}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <ScoreCell score={competitor.score} isYou={competitor.isYou} />
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                {competitor.citations}
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                {competitor.score === null ? (
                  <span className="text-muted-foreground">—</span>
                ) : (
                  `${competitor.shareOfVoice}%`
                )}
              </TableCell>
              <TableCell className="text-right">
                <DeltaCell delta={competitor.delta} />
              </TableCell>
              <TableCell>
                {!competitor.isYou && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Remove ${competitor.name}`}
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => setToRemove(competitor)}
                      >
                        <Trash2 />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Remove</TooltipContent>
                  </Tooltip>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog
        open={toRemove !== null}
        onOpenChange={(open) => !open && setToRemove(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove {toRemove?.name}?</DialogTitle>
            <DialogDescription>
              {toRemove?.domain} will no longer be tracked in future jobs.
              Past citation data is kept.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => {
                if (toRemove) onRemove(toRemove.id)
                setToRemove(null)
              }}
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
