import { RefreshCw, TrendingUp } from "lucide-react"

import { OVERALL, PILLARS, SCORE_HISTORY, TIPS } from "@/lib/score"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ScoreHistoryChart } from "@/components/charts/score-history-chart"
import { ScoreRing } from "@/components/charts/score-ring"
import { EnhancementTips } from "@/components/enhancement-tips"
import { ScorePillars } from "@/components/score-pillars"

const auditFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

export default function ScorePage() {
  const isUp = OVERALL.delta >= 0

  return (
    <>
      <div className="grid gap-4 xl:grid-cols-5">
        {/* Overall score */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>AI Visibility Score</CardTitle>
            <CardDescription className="font-mono">
              {OVERALL.domain}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <ScoreRing score={OVERALL.score}>
              <span className="font-mono text-5xl font-semibold tracking-tight tabular-nums">
                {OVERALL.score}
              </span>
              <span className="text-xs text-muted-foreground">out of 100</span>
            </ScoreRing>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-mono font-semibold">{OVERALL.grade}</span>
              <span
                className={`flex items-center gap-0.5 font-mono text-xs font-medium tabular-nums ${
                  isUp ? "text-success" : "text-destructive"
                }`}
              >
                <TrendingUp className="size-3.5" />
                {isUp ? "+" : ""}
                {OVERALL.delta} this week
              </span>
            </div>
            <div className="flex w-full items-center justify-between border-t pt-3 text-xs text-muted-foreground">
              <span>
                Last audit{" "}
                <span className="font-mono tabular-nums">
                  {auditFormatter.format(new Date(OVERALL.lastAudit))}
                </span>
              </span>
              <Button variant="outline" size="sm">
                <RefreshCw data-icon="inline-start" />
                Re-audit
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Pillars */}
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>Score breakdown</CardTitle>
            <CardDescription>
              Hover a pillar to see what it measures
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScorePillars pillars={PILLARS} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-5">
        {/* Tips */}
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>Enhancement tips</CardTitle>
            <CardDescription>
              Ranked by estimated score gain — start at the top
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EnhancementTips tips={TIPS} />
          </CardContent>
        </Card>

        {/* History */}
        <Card className="self-start xl:col-span-2">
          <CardHeader>
            <CardTitle>Score history</CardTitle>
            <CardDescription>Weekly audits, last 9 weeks</CardDescription>
          </CardHeader>
          <CardContent>
            <ScoreHistoryChart data={SCORE_HISTORY} />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
