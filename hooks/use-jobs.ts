"use client"

import * as React from "react"

import {
  ACTIVE_STATUSES,
  type Job,
  type JobStatus,
  type NewJobInput,
} from "@/types/job"
import { SEED_JOBS } from "@/lib/jobs-data"

// Mock client-side job store. Replace with TanStack Query against the
// FastAPI backend once it exists.
// TODO: replace with GET /api/v1/jobs + POST /api/v1/jobs

/** Advance a running job one tick through its mock lifecycle */
function tickJob(job: Job): Job {
  if (!ACTIVE_STATUSES.includes(job.status)) return job

  const progress = Math.min(job.progress + 7 + Math.floor(Math.random() * 7), 100)
  let status: JobStatus = job.status

  if (progress >= 95) {
    return {
      ...job,
      status: "completed",
      progress: 100,
      // Plausible result: 30–60% of prompts cited the brand
      citations: Math.round(job.promptCount * (0.3 + Math.random() * 0.3)),
    }
  }
  if (progress >= 85) status = "analyzing"
  else if (progress >= 10) status = "querying"
  else if (job.status === "pending") status = "generating_prompts"

  return { ...job, status, progress }
}

export function useJobs() {
  const [jobs, setJobs] = React.useState<Job[]>(SEED_JOBS)

  const hasActiveJobs = jobs.some((job) => ACTIVE_STATUSES.includes(job.status))

  React.useEffect(() => {
    if (!hasActiveJobs) return
    const interval = setInterval(() => {
      setJobs((prev) => prev.map(tickJob))
    }, 1200)
    return () => clearInterval(interval)
  }, [hasActiveJobs])

  const createJob = React.useCallback((input: NewJobInput) => {
    const job: Job = {
      id: `job_${crypto.randomUUID().slice(0, 8)}`,
      promptCount: input.promptCount,
      language: input.language,
      country: input.country,
      providers: input.providers,
      topic: input.topic,
      status: "pending",
      progress: 0,
      citations: null,
      createdAt: new Date().toISOString(),
    }
    setJobs((prev) => [job, ...prev])
  }, [])

  return { jobs, createJob }
}
