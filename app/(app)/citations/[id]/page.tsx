import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Hash, Info, Link2, Quote } from "lucide-react"

import { getPromptResult } from "@/lib/citations"
import { countryLabel, languageLabel } from "@/types/job"
import { cn } from "@/lib/utils"
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
import { ResultDetail } from "@/components/citation-result"
import { StatCard } from "@/components/stat-card"

// TODO: replace with GET /api/v1/citations/{id} once the FastAPI backend lands.

const runFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

export default async function CitationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const row = getPromptResult(id)
  if (!row) notFound()

  const total = row.results.length
  const cited = row.results.filter((r) => r.outcome === "cited").length
  const answered = row.results.filter((r) => r.outcome !== "error").length
  const linked = row.results.filter((r) => r.linked).length

  const positions = row.results
    .map((r) => r.position)
    .filter((p): p is number => p !== null)
  const bestPosition = positions.length > 0 ? Math.min(...positions) : null

  // Mock detection breakdown derived from the seed snippets.
  // TODO: the real breakdown comes from the backend's citation analyzer
  // (exact domain / fuzzy brand / linked-source checks per raw response).
  const domainMatches = row.results.filter((r) =>
    r.snippet.toLowerCase().includes("eorank.com")
  ).length
  const detectionRows = [
    {
      label: "Exact domain match",
      hits: domainMatches,
      description: "eorank.com appears verbatim in the answer",
    },
    {
      label: "Brand-name match (fuzzy)",
      hits: cited,
      description: "brand mention detected with fuzzy matching",
    },
    {
      label: "Linked source",
      hits: linked,
      description: "cited as a source link in search-grounded answers",
    },
  ]

  return (
    <>
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="-ml-2 text-muted-foreground hover:text-foreground"
          >
            <Link href="/citations">
              <ArrowLeft data-icon="inline-start" />
              Citations
            </Link>
          </Button>
        </div>
        <h1 className="text-base leading-snug font-semibold text-balance">
          &ldquo;{row.prompt}&rdquo;
        </h1>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <Link
            href={`/jobs/${row.jobId}`}
            className="font-mono underline-offset-4 hover:text-foreground hover:underline"
          >
            {row.jobId}
          </Link>
          <span aria-hidden>·</span>
          <span>
            {languageLabel(row.language)} · {countryLabel(row.country)}
          </span>
          <span aria-hidden>·</span>
          <span>
            Run{" "}
            <span className="font-mono tabular-nums">
              {runFormatter.format(new Date(row.runAt))}
            </span>
          </span>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <StatCard
          value={`${cited}/${total}`}
          deltaLabel="providers cited this prompt"
          metricName="Cited"
          metricIcon={Quote}
        />
        <StatCard
          value={bestPosition !== null ? `#${bestPosition}` : "—"}
          deltaLabel="Lowest mention rank across answers"
          metricName="Best Position"
          metricIcon={Hash}
        />
        <StatCard
          value={String(linked)}
          deltaLabel="Appeared as a cited source link"
          metricName="Linked Sources"
          metricIcon={Link2}
        />
      </div>

      {/* Per-provider results */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Provider results</h2>
          {total > 0 && (
            <span className="font-mono text-xs text-muted-foreground tabular-nums">
              {cited}/{total} cited
            </span>
          )}
        </div>
        {total > 0 ? (
          row.results.map((result) => (
            <ResultDetail key={result.provider} result={result} />
          ))
        ) : (
          <Empty className="rounded-xl border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Quote />
              </EmptyMedia>
              <EmptyTitle>No provider results</EmptyTitle>
              <EmptyDescription>
                No provider answers were recorded for this prompt run.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>

      {/* Detection breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Detection details</CardTitle>
          <CardDescription>
            How citations were detected for this prompt. Raw responses are
            stored, so detection can be re-run as the logic evolves.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {detectionRows.map((d) => (
              <li
                key={d.label}
                className="flex flex-wrap items-center gap-x-2.5 gap-y-1 py-2.5 first:pt-0 last:pb-0"
              >
                <span
                  aria-hidden
                  className={cn(
                    "size-2 shrink-0 rounded-full",
                    d.hits > 0 ? "bg-success" : "bg-muted-foreground/30"
                  )}
                />
                <span className="text-sm">{d.label}</span>
                <span className="hidden text-xs text-muted-foreground sm:inline">
                  {d.description}
                </span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {d.hits > 0 ? (
                    <>
                      Found in{" "}
                      <span className="font-mono font-medium text-foreground tabular-nums">
                        {d.hits} of {answered}
                      </span>{" "}
                      answers
                    </>
                  ) : (
                    "Not detected"
                  )}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Sampling footnote */}
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Info className="size-3.5 shrink-0" />
        AI answers vary between runs — treat citation results as samples, not
        ground truth.
      </p>
    </>
  )
}
