"use client"

import * as React from "react"
import { Gauge, MessageSquareText, Quote, Target } from "lucide-react"

import {
  getDailyCitations,
  getProviderStats,
  getSummary,
  getTrend,
  TIME_RANGES,
  TOP_PROMPTS,
  type TimeRange,
} from "@/lib/analytics"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { BarStrip } from "@/components/charts/bar-strip"
import { CitationsByProviderChart } from "@/components/charts/citations-by-provider-chart"
import { Sparkline } from "@/components/charts/sparkline"
import { VisibilityTrendChart } from "@/components/charts/visibility-trend-chart"
import { ProviderBreakdown } from "@/components/provider-breakdown"
import { ProviderIcon } from "@/components/provider-icon"
import { StatCard } from "@/components/stat-card"
import { PROVIDERS } from "@/types/job"

export default function AnalyticsPage() {
  const [range, setRange] = React.useState<TimeRange>("30d")

  const summary = getSummary(range)
  const trend = getTrend(range)
  const daily = getDailyCitations(range)
  const providerStats = getProviderStats(range)

  const citationSpark = daily.map(
    (d) => d.chatgpt + d.gemini + d.claude + d.perplexity
  )

  return (
    <>
      {/* Range switcher */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          How AI models cite your brand over time.
        </p>
        <ToggleGroup
          type="single"
          variant="outline"
          value={range}
          onValueChange={(v) => v && setRange(v as TimeRange)}
        >
          {TIME_RANGES.map((r) => (
            <ToggleGroupItem key={r.value} value={r.value} className="px-3">
              {r.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {/* KPI row */}
      <div className="grid auto-rows-min gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          value={String(summary.visibilityScore)}
          delta={summary.visibilityDelta}
          deltaLabel="Score"
          metricName="Visibility Score"
          metricIcon={Gauge}
        >
          <BarStrip value={summary.visibilityScore} />
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
        <StatCard
          value={summary.promptsRun.toLocaleString("en-US")}
          delta={summary.promptsDelta}
          deltaLabel="Prompts"
          metricName="Prompts Run"
          metricIcon={MessageSquareText}
        />
      </div>

      {/* Main charts */}
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
            <CardTitle>Citation rate by provider</CardTitle>
            <CardDescription>
              Share of prompts where your brand appears
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProviderBreakdown stats={providerStats} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Citations per day</CardTitle>
            <CardDescription>Stacked by provider</CardDescription>
          </CardHeader>
          <CardContent>
            <CitationsByProviderChart data={daily} />
          </CardContent>
        </Card>

        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>Top citing prompts</CardTitle>
            <CardDescription>
              Prompts where your brand gets mentioned most
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-4">Prompt</TableHead>
                  <TableHead>Cited by</TableHead>
                  <TableHead className="text-right">Avg position</TableHead>
                  <TableHead className="pr-4 text-right">Runs</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {TOP_PROMPTS.map((row) => (
                  <TableRow key={row.prompt}>
                    <TableCell className="max-w-64 truncate pl-4 font-medium">
                      {row.prompt}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {PROVIDERS.filter((p) =>
                          row.providersCited.includes(p.id)
                        ).map((p) => (
                          <Tooltip key={p.id}>
                            <TooltipTrigger asChild>
                              <span className="flex size-6 items-center justify-center rounded-md bg-muted text-muted-foreground">
                                <ProviderIcon
                                  provider={p.id}
                                  className="size-3.5"
                                />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>{p.label}</TooltipContent>
                          </Tooltip>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {row.position.toFixed(1)}
                    </TableCell>
                    <TableCell className="pr-4 text-right font-mono tabular-nums">
                      {row.runs}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
