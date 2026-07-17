import type { Job } from "@/types/job"

// Shared static job dataset. The list page layers a live-ticking simulation
// on top (see hooks/use-jobs.ts); detail pages read straight from here.
// TODO: replace with GET /api/v1/jobs + GET /api/v1/jobs/{id}.

export const SEED_JOBS: Job[] = [
  {
    id: "job_8f3a2c1d",
    promptCount: 50,
    language: "en",
    country: "US",
    providers: ["chatgpt", "gemini", "claude", "perplexity"],
    topic: "project management software",
    status: "querying",
    progress: 55,
    citations: null,
    createdAt: "2026-07-16T08:12:00Z",
  },
  {
    id: "job_b71e94f0",
    promptCount: 100,
    language: "en",
    country: "GB",
    providers: ["chatgpt", "gemini"],
    topic: "CRM tools for startups",
    status: "completed",
    progress: 100,
    citations: 47,
    createdAt: "2026-07-15T14:38:00Z",
  },
  {
    id: "job_c2d05e8a",
    promptCount: 20,
    language: "fr",
    country: "FR",
    providers: ["chatgpt", "perplexity"],
    topic: "logiciels de comptabilité",
    status: "partial",
    progress: 100,
    citations: 6,
    createdAt: "2026-07-14T10:05:00Z",
  },
  {
    id: "job_e94d7b26",
    promptCount: 10,
    language: "de",
    country: "DE",
    providers: ["claude"],
    status: "failed",
    progress: 100,
    citations: null,
    createdAt: "2026-07-13T16:47:00Z",
  },
  {
    id: "job_a10c6f3b",
    promptCount: 50,
    language: "es",
    country: "ES",
    providers: ["chatgpt", "gemini", "perplexity"],
    topic: "plataformas de ecommerce",
    status: "completed",
    progress: 100,
    citations: 22,
    createdAt: "2026-07-12T09:24:00Z",
  },
]

export function getJob(id: string): Job | undefined {
  return SEED_JOBS.find((job) => job.id === id)
}
