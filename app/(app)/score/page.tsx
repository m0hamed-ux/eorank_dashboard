"use client"

import {
  Gauge,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
} from "lucide-react"

import { ApiError, type ScoreRead } from "@/lib/api"
import { PILLAR_META, type ScorePillar } from "@/lib/score"
import { useActiveCompany } from "@/components/active-company-context"
import { useRunAudit, useScore, useToggleTip } from "@/hooks/use-score"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
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

const PILLAR_ORDER = [
  "geo",
  "aeo",
  "authority",
  "structured",
  "content",
  "freshness",
]

function toPillarViews(score: ScoreRead): ScorePillar[] {
  return PILLAR_ORDER.flatMap((id) => {
    const row = score.pillars.find((p) => p.pillar === id)
    if (!row) return []
    const meta = PILLAR_META[id]
    return [
      {
        id,
        label: meta?.label ?? id,
        description: meta?.description ?? "",
        score: row.value,
        delta: row.delta ?? 0,
      },
    ]
  })
}

function ScoreSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 xl:grid-cols-5">
        <Skeleton className="h-72 rounded-xl xl:col-span-2" />
        <Skeleton className="h-72 rounded-xl xl:col-span-3" />
      </div>
      <Skeleton className="h-80 rounded-xl" />
    </div>
  )
}

export default function ScorePage() {
  const { active, companies, isLoading: companiesLoading } = useActiveCompany()
  const { data, isLoading, isError, error, noAudit, refetch } = useScore(
    active?.id ?? null
  )
  const audit = useRunAudit(active?.id ?? null)
  const toggleTip = useToggleTip()

  if (companiesLoading || (active && isLoading)) {
    return <ScoreSkeleton />
  }

  if (!active) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Gauge />
          </EmptyMedia>
          <EmptyTitle>No project yet</EmptyTitle>
          <EmptyDescription>
            {companies.length === 0
              ? "Add a project from the sidebar — its site is audited automatically."
              : "Select a project in the sidebar to see its score."}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  if (noAudit) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Gauge />
          </EmptyMedia>
          <EmptyTitle>No audit yet for {active.domain}</EmptyTitle>
          <EmptyDescription>
            New projects are audited automatically within a minute — this page
            refreshes on its own. You can also run it now.
          </EmptyDescription>
        </EmptyHeader>
        <div className="flex flex-col items-center gap-2">
          <Button onClick={() => audit.mutate()} disabled={audit.isPending}>
            {audit.isPending ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <RefreshCw data-icon="inline-start" />
            )}
            Run first audit
          </Button>
          {audit.isError && (
            <p className="text-xs text-destructive">
              {audit.error instanceof ApiError
                ? audit.error.message
                : "Audit failed. Try again."}
            </p>
          )}
        </div>
      </Empty>
    )
  }

  if (isError || !data) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <TriangleAlert />
          </EmptyMedia>
          <EmptyTitle>Couldn&apos;t load the score</EmptyTitle>
          <EmptyDescription>
            {error instanceof ApiError
              ? error.message
              : "The EORank API is unreachable."}
          </EmptyDescription>
        </EmptyHeader>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw data-icon="inline-start" />
          Retry
        </Button>
      </Empty>
    )
  }

  const delta = data.delta ?? 0
  const isUp = delta >= 0
  const DeltaIcon = isUp ? TrendingUp : TrendingDown
  const history = data.history.map((point) => ({
    date: point.audited_at,
    score: point.overall,
  }))

  return (
    <>
      <div className="grid gap-4 xl:grid-cols-5">
        {/* Overall score */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>AI Visibility Score</CardTitle>
            <CardDescription className="font-mono">
              {active.domain}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <ScoreRing score={data.overall}>
              <span className="font-mono text-5xl font-semibold tracking-tight tabular-nums">
                {data.overall}
              </span>
              <span className="text-xs text-muted-foreground">out of 100</span>
            </ScoreRing>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-mono font-semibold">{data.grade}</span>
              {data.delta !== null && (
                <span
                  className={`flex items-center gap-0.5 font-mono text-xs font-medium tabular-nums ${
                    isUp ? "text-success" : "text-destructive"
                  }`}
                >
                  <DeltaIcon className="size-3.5" />
                  {isUp ? "+" : ""}
                  {delta} vs last audit
                </span>
              )}
            </div>
            <div className="flex w-full items-center justify-between border-t pt-3 text-xs text-muted-foreground">
              <span>
                Last audit{" "}
                <span className="font-mono tabular-nums">
                  {auditFormatter.format(new Date(data.audited_at))}
                </span>
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={audit.isPending}
                onClick={() => audit.mutate()}
              >
                {audit.isPending ? (
                  <Spinner data-icon="inline-start" />
                ) : (
                  <RefreshCw data-icon="inline-start" />
                )}
                Re-audit
              </Button>
            </div>
            {audit.isError && (
              <p className="text-xs text-destructive">
                {audit.error instanceof ApiError
                  ? audit.error.message
                  : "Audit failed. Try again."}
              </p>
            )}
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
            <ScorePillars pillars={toPillarViews(data)} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-5">
        {/* Tips */}
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>Enhancement tips</CardTitle>
            <CardDescription>
              Generated from your site&apos;s last audit — ranked by estimated
              gain
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.tips.length === 0 ? (
              <Empty className="border-0">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <TrendingUp />
                  </EmptyMedia>
                  <EmptyTitle>Nothing to fix</EmptyTitle>
                  <EmptyDescription>
                    Your site passes every check we run. Keep content fresh to
                    hold the score.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <EnhancementTips
                tips={data.tips}
                onToggle={(id, done) => toggleTip.mutate({ tipId: id, done })}
              />
            )}
          </CardContent>
        </Card>

        {/* History */}
        <Card className="self-start xl:col-span-2">
          <CardHeader>
            <CardTitle>Score history</CardTitle>
            <CardDescription>
              {history.length > 1
                ? `Last ${history.length} audits`
                : "Builds over time — one point per audit"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {history.length > 1 ? (
              <ScoreHistoryChart data={history} />
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Re-audit after making changes to your site to start your trend
                line.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
