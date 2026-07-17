"use client"

import { Briefcase, CheckCircle2, Loader, Quote } from "lucide-react"

import { ACTIVE_STATUSES } from "@/types/job"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { JobsTable } from "@/components/jobs-table"
import { NewJobDialog } from "@/components/new-job-dialog"
import { StatCard } from "@/components/stat-card"
import { useJobs } from "@/hooks/use-jobs"

export default function JobsPage() {
  const { jobs, createJob } = useJobs()

  const running = jobs.filter((j) => ACTIVE_STATUSES.includes(j.status)).length
  const completed = jobs.filter(
    (j) => j.status === "completed" || j.status === "partial"
  ).length
  const citations = jobs.reduce((sum, j) => sum + (j.citations ?? 0), 0)

  if (jobs.length === 0) {
    return (
      <Empty className="flex-1 rounded-xl border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Briefcase />
          </EmptyMedia>
          <EmptyTitle>No jobs yet</EmptyTitle>
          <EmptyDescription>
            Run a batch of prompts against ChatGPT, Gemini, Claude, and
            Perplexity to see where your brand gets cited.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <NewJobDialog onCreate={createJob} />
        </EmptyContent>
      </Empty>
    )
  }

  return (
    <>
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <StatCard
          value={String(running)}
          deltaLabel="In progress right now"
          metricName="Running Jobs"
          metricIcon={Loader}
        />
        <StatCard
          value={String(completed)}
          deltaLabel="All time"
          metricName="Completed Jobs"
          metricIcon={CheckCircle2}
        />
        <StatCard
          value={String(citations)}
          deltaLabel="Across completed jobs"
          metricName="Citations Found"
          metricIcon={Quote}
        />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {jobs.length} job{jobs.length === 1 ? "" : "s"}
        </p>
        <NewJobDialog onCreate={createJob} />
      </div>

      <JobsTable jobs={jobs} />
    </>
  )
}
