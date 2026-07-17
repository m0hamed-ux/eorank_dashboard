import Link from "next/link"
import { ArrowRight, Gauge, Play, Quote, Target, Trophy } from "lucide-react"

import {
  getDailyCitations,
  getProviderStats,
  getSummary,
  getTrend,
} from "@/lib/analytics"
import { PROMPT_RESULTS } from "@/lib/citations"
import { SEED_JOBS } from "@/lib/jobs-data"
import { OVERALL } from "@/lib/score"
import { citedCount } from "@/types/citation"
import { PROVIDERS } from "@/types/job"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { BarStrip } from "@/components/charts/bar-strip"
import { Sparkline } from "@/components/charts/sparkline"
import { VisibilityTrendChart } from "@/components/charts/visibility-trend-chart"
import { OutcomeChip } from "@/components/citation-result"
import { JobStatusBadge } from "@/components/job-status-badge"
import { ProviderBreakdown } from "@/components/provider-breakdown"
import { StatCard } from "@/components/stat-card"

// Dashboard overview — the landing view after login. All data is static
// mock imports rendered on the server.
// TODO: replace with GET /api/v1/dashboard/overview (aggregates), plus
// GET /api/v1/jobs?limit=4 and GET /api/v1/citations?limit=4 once the
// FastAPI backend exists.

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
})

export default function Home() {
  const summary = getSummary("30d")
  const trend = getTrend("30d")
  const daily = getDailyCitations("30d")
  const providerStats = getProviderStats("30d")

  const citationSpark = daily.map(
    (d) => d.chatgpt + d.gemini + d.claude + d.perplexity
  )

  const recentJobs = [...SEED_JOBS]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 4)

  const latestCitations = [...PROMPT_RESULTS]
    .sort((a, b) => b.runAt.localeCompare(a.runAt))
    .slice(0, 4)

  return (
    <>
      {/* Header row — the single primary action on this view */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Overview · last 30 days</p>
        <Button asChild>
          <Link href="/jobs">
            <Play />
            New Job
          </Link>
        </Button>
      </div>

      {/* KPI row */}
      <div className="grid auto-rows-min gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          value={String(OVERALL.score)}
          delta={OVERALL.delta}
          deltaLabel="Score"
          metricName="Visibility Score"
          metricIcon={Gauge}
        >
          <BarStrip value={OVERALL.score} />
        </StatCard>
        <StatCard
          value={`${summary.citationRate}%`}
          delta={summary.citationRateDelta}
          deltaLabel="Of prompts"
          metricName="Citation Rate"
          metricIcon={Target}
        />
        <StatCard
          value={summary.totalCitations.toLocaleString("en-US")}
          delta={summary.citationsDelta}
          deltaLabel="Citations"
          metricName="Total Citations"
          metricIcon={Quote}
        >
          <Sparkline data={citationSpark} />
        </StatCard>
        {/* TODO: compute rank from GET /api/v1/competitors — the seed
            competitor list currently lives inside hooks/use-competitors
            (client-only), so the rank is hardcoded here for now. */}
        <StatCard
          value="#2"
          deltaLabel="of 4 tracked brands"
          metricName="Competitor Rank"
          metricIcon={Trophy}
        />
      </div>

      {/* Main row: trend + recent jobs */}
      <div className="grid gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>Visibility trend</CardTitle>
            <CardDescription>
              Your score vs the average of tracked competitors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VisibilityTrendChart data={trend} />
            <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-0.5 w-4 rounded-full bg-primary" />
                You
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-0.5 w-4 rounded-full bg-chart-5" />
                Competitor avg
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Recent jobs</CardTitle>
            <CardDescription>Latest prompt batches and results</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-1">
            {recentJobs.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No jobs yet — run your first batch to see results here.
              </p>
            ) : (
              recentJobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {job.topic ?? job.id}
                    </p>
                    <p className="truncate font-mono text-xs text-muted-foreground tabular-nums">
                      {job.id} ·{" "}
                      {dateFormatter.format(new Date(job.createdAt))}
                    </p>
                  </div>
                  <JobStatusBadge status={job.status} />
                  <span className="w-8 text-right font-mono text-sm tabular-nums">
                    {job.citations ?? "—"}
                  </span>
                </Link>
              ))
            )}
          </CardContent>
          <CardFooter>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="ml-auto text-muted-foreground"
            >
              <Link href="/jobs">
                View all jobs
                <ArrowRight />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Bottom row: provider breakdown + latest citations */}
      <div className="grid gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Provider breakdown</CardTitle>
            <CardDescription>
              Share of prompts where your brand appears
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProviderBreakdown stats={providerStats} />
          </CardContent>
        </Card>

        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>Latest citations</CardTitle>
            <CardDescription>
              Most recent prompt runs across providers
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-1">
            {latestCitations.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No citations yet — results appear as soon as a job completes.
              </p>
            ) : (
              latestCitations.map((row) => (
                <Link
                  key={row.id}
                  href={`/citations/${row.id}`}
                  className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{row.prompt}</p>
                    <p className="font-mono text-xs text-muted-foreground tabular-nums">
                      {dateFormatter.format(new Date(row.runAt))}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {PROVIDERS.map((p) => (
                      <OutcomeChip
                        key={p.id}
                        result={row.results.find((r) => r.provider === p.id)}
                      />
                    ))}
                  </div>
                  <span className="w-9 text-right font-mono text-sm tabular-nums">
                    {citedCount(row)}/{row.results.length}
                  </span>
                </Link>
              ))
            )}
          </CardContent>
          <CardFooter>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="ml-auto text-muted-foreground"
            >
              <Link href="/citations">
                View all citations
                <ArrowRight />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  )
}
