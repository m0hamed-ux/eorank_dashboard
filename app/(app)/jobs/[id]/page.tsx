import { Fragment } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  Bot,
  Check,
  Flag,
  MessageSquareText,
  Quote,
  RotateCcw,
  ScanSearch,
  Sparkles,
  Target,
  TriangleAlert,
  X,
  XCircle,
  type LucideIcon,
} from "lucide-react"

import { getCitationsForJob } from "@/lib/citations"
import { getJob } from "@/lib/jobs-data"
import { cn } from "@/lib/utils"
import {
  ACTIVE_STATUSES,
  countryLabel,
  languageLabel,
  PROVIDERS,
  type Job,
  type ProviderId,
} from "@/types/job"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { CitationsTable } from "@/components/citations-table"
import { JobStatusBadge } from "@/components/job-status-badge"
import { ProviderIcon } from "@/components/provider-icon"
import { StatCard } from "@/components/stat-card"

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

// ---------------------------------------------------------------------------
// Pipeline stepper (job states: pending → generating_prompts → querying →
// analyzing → completed | failed | partial)
// ---------------------------------------------------------------------------

type StageState = "done" | "active" | "failed" | "partial" | "upcoming"

const STAGES: { label: string; icon: LucideIcon }[] = [
  { label: "Generating prompts", icon: Sparkles },
  { label: "Querying", icon: MessageSquareText },
  { label: "Analyzing", icon: ScanSearch },
  { label: "Completed", icon: Flag },
]

function stageStates(job: Job): StageState[] {
  switch (job.status) {
    case "pending":
    case "generating_prompts":
      return ["active", "upcoming", "upcoming", "upcoming"]
    case "querying":
      return ["done", "active", "upcoming", "upcoming"]
    case "analyzing":
      return ["done", "done", "active", "upcoming"]
    case "completed":
      return ["done", "done", "done", "done"]
    case "partial":
      // Pipeline finished, but some prompt×provider queries errored.
      return ["done", "done", "done", "partial"]
    case "failed": {
      // Infer where progress stopped from the recorded percentage.
      const failedAt = job.progress < 20 ? 0 : job.progress < 90 ? 1 : 2
      return STAGES.map((_, i): StageState =>
        i < failedAt ? "done" : i === failedAt ? "failed" : "upcoming"
      )
    }
  }
}

function StageMarker({
  state,
  icon: StageIcon,
}: {
  state: StageState
  icon: LucideIcon
}) {
  return (
    <span
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-full",
        state === "done" && "bg-success/10 text-success",
        state === "active" && "bg-warning/10 text-warning",
        state === "partial" && "bg-warning/10 text-warning",
        state === "failed" && "bg-destructive/10 text-destructive",
        state === "upcoming" && "bg-muted text-muted-foreground/50"
      )}
    >
      {state === "done" && <Check className="size-3.5" />}
      {state === "active" && <Spinner className="size-3.5" />}
      {state === "partial" && <TriangleAlert className="size-3.5" />}
      {state === "failed" && <X className="size-3.5" />}
      {state === "upcoming" && <StageIcon className="size-3.5" />}
    </span>
  )
}

function PipelineStepper({ job }: { job: Job }) {
  const states = stageStates(job)
  const isActive = ACTIVE_STATUSES.includes(job.status)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start">
        {STAGES.map((stage, i) => (
          <Fragment key={stage.label}>
            {i > 0 && (
              <div
                aria-hidden
                className={cn(
                  "mt-3.5 h-px min-w-4 flex-1",
                  states[i - 1] === "done" ? "bg-success/40" : "bg-border"
                )}
              />
            )}
            <div className="flex flex-col items-center gap-2 px-2 text-center">
              <StageMarker state={states[i]} icon={stage.icon} />
              <span
                className={cn(
                  "text-xs",
                  states[i] === "active" && "font-medium text-foreground",
                  states[i] === "done" && "text-foreground",
                  states[i] === "partial" && "font-medium text-warning",
                  states[i] === "failed" && "font-medium text-destructive",
                  states[i] === "upcoming" && "text-muted-foreground"
                )}
              >
                {stage.label}
              </span>
            </div>
          </Fragment>
        ))}
      </div>

      {isActive && (
        <div className="flex items-center gap-3 border-t pt-4">
          <Progress value={job.progress} className="h-1.5 flex-1" />
          <span className="font-mono text-xs text-muted-foreground tabular-nums">
            {job.progress}%
          </span>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Cost breakdown — provider keys are the platform's own; cost is tracked per
// job (see root CLAUDE.md).
// TODO: replace with GET /api/v1/jobs/{id}/cost from the FastAPI backend.
// ---------------------------------------------------------------------------

const COST_PER_PROMPT: Record<ProviderId, number> = {
  chatgpt: 0.0021,
  gemini: 0.0016,
  claude: 0.0028,
  perplexity: 0.0019,
}

const usd = (n: number, digits: number) =>
  `$${n.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // TODO: replace with GET /api/v1/jobs/{id} — backend returns 404 for jobs
  // belonging to other orgs, which lands in not-found.tsx too.
  const job = getJob(id)
  if (!job) notFound()

  const isActive = ACTIVE_STATUSES.includes(job.status)
  const results = getCitationsForJob(job.id)

  const citationRate =
    job.citations === null
      ? null
      : Math.round((job.citations / job.promptCount) * 100)

  const providers = PROVIDERS.filter((p) => job.providers.includes(p.id))
  const costs = providers.map((p) => ({
    ...p,
    cost: job.promptCount * COST_PER_PROMPT[p.id],
  }))
  const totalCost = costs.reduce((sum, c) => sum + c.cost, 0)

  return (
    <>
      {/* Header */}
      <div className="flex flex-col gap-2">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="-ml-2 w-fit text-muted-foreground"
        >
          <Link href="/jobs">
            <ArrowLeft data-icon="inline-start" />
            Jobs
          </Link>
        </Button>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-base font-semibold">{job.topic ?? job.id}</h1>
          <JobStatusBadge status={job.status} />
        </div>
        <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
          <span className="font-mono">{job.id}</span>
          <span aria-hidden>·</span>
          <span>
            Created{" "}
            <span className="font-mono tabular-nums">
              {dateFormatter.format(new Date(job.createdAt))}
            </span>
          </span>
          <span aria-hidden>·</span>
          <span>
            {languageLabel(job.language)} · {countryLabel(job.country)}
          </span>
        </p>
      </div>

      {/* Pipeline */}
      <Card>
        <CardHeader>
          <CardTitle>Pipeline</CardTitle>
          <CardDescription>
            {isActive
              ? "This job is running — results stream in as prompts complete."
              : job.status === "failed"
                ? "The pipeline stopped before completing."
                : job.status === "partial"
                  ? "The pipeline finished, but some provider queries failed."
                  : "All stages completed."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PipelineStepper job={job} />
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid auto-rows-min gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          value={String(job.promptCount)}
          deltaLabel="In this batch"
          metricName="Prompts"
          metricIcon={MessageSquareText}
        />
        <StatCard
          value={String(job.providers.length)}
          deltaLabel="Queried per prompt"
          metricName="Providers"
          metricIcon={Bot}
        />
        <StatCard
          value={job.citations === null ? "—" : String(job.citations)}
          deltaLabel={
            job.citations === null ? "Pending analysis" : "Across providers"
          }
          metricName="Citations Found"
          metricIcon={Quote}
        />
        <StatCard
          value={citationRate === null ? "—" : `${citationRate}%`}
          deltaLabel="Citations ÷ prompts"
          metricName="Citation Rate"
          metricIcon={Target}
        />
      </div>

      {/* Providers + cost */}
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Providers</CardTitle>
            <CardDescription>
              Every prompt was sent to{" "}
              <span className="font-mono tabular-nums">
                {providers.length}
              </span>{" "}
              model{providers.length === 1 ? "" : "s"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {providers.map((p) => (
                <span
                  key={p.id}
                  className="flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-foreground"
                >
                  <ProviderIcon
                    provider={p.id}
                    className="size-3.5 text-muted-foreground"
                  />
                  {p.label}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cost</CardTitle>
            <CardDescription>Platform LLM spend for this job</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {costs.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="flex items-center gap-2 text-muted-foreground">
                  <ProviderIcon provider={c.id} className="size-3.5" />
                  {c.label}
                </span>
                <span className="font-mono text-xs tabular-nums">
                  {usd(c.cost, 3)}
                </span>
              </div>
            ))}
          </CardContent>
          <CardFooter className="justify-between text-sm">
            <span className="font-medium">Total</span>
            <span className="font-mono font-medium tabular-nums">
              {usd(totalCost, 2)}
            </span>
          </CardFooter>
        </Card>
      </div>

      {/* Prompt results */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium">Prompt results</h2>
        {results.length > 0 && (
          <span className="font-mono text-xs text-muted-foreground tabular-nums">
            {results.length}/{job.promptCount} prompts
          </span>
        )}
      </div>

      {results.length > 0 ? (
        <>
          <CitationsTable rows={results} />
          {isActive && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Spinner className="size-3.5" />
              Results appear as prompts complete.
            </div>
          )}
        </>
      ) : isActive ? (
        <div className="flex items-center gap-3 rounded-xl border bg-card p-5 shadow-xs">
          <Spinner className="text-muted-foreground" />
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">No results yet</span>
            <span className="text-xs text-muted-foreground">
              Results appear as prompts complete.
            </span>
          </div>
        </div>
      ) : job.status === "failed" ? (
        <div className="flex flex-col gap-3 rounded-xl border bg-card p-5 shadow-xs">
          <div className="flex items-center gap-2">
            <XCircle className="size-4 text-destructive" />
            <span className="text-sm font-medium">Job failed</span>
          </div>
          <p className="text-sm text-muted-foreground">
            The pipeline stopped before any prompt results were recorded. Your
            prompt quota was not consumed for unfinished queries — retry the
            job to run the same batch again.
          </p>
          <Separator />
          <div>
            {/* TODO: wire to POST /api/v1/jobs/{id}/retry */}
            <Button variant="outline">
              <RotateCcw data-icon="inline-start" />
              Retry job
            </Button>
          </div>
        </div>
      ) : (
        <Empty className="rounded-xl border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Quote />
            </EmptyMedia>
            <EmptyTitle>No prompt results recorded</EmptyTitle>
            <EmptyDescription>
              This job finished without any stored prompt results.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </>
  )
}
