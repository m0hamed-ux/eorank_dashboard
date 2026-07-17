// Job domain types + option lists for the jobs feature.
// Shapes mirror the future FastAPI Pydantic schemas (see root CLAUDE.md).

export type JobStatus =
  | "pending"
  | "generating_prompts"
  | "querying"
  | "analyzing"
  | "completed"
  | "partial"
  | "failed"

export type ProviderId = "chatgpt" | "gemini" | "claude" | "perplexity"

export interface Job {
  id: string
  promptCount: number
  language: string
  country: string
  providers: ProviderId[]
  topic?: string
  status: JobStatus
  progress: number // 0-100
  citations: number | null // null until analysis completes
  createdAt: string // ISO
}

export interface NewJobInput {
  promptCount: number
  language: string
  country: string
  providers: ProviderId[]
  topic?: string
}

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  pending: "Pending",
  generating_prompts: "Generating prompts",
  querying: "Querying",
  analyzing: "Analyzing",
  completed: "Completed",
  partial: "Partial",
  failed: "Failed",
}

export const ACTIVE_STATUSES: JobStatus[] = [
  "pending",
  "generating_prompts",
  "querying",
  "analyzing",
]

export const PROVIDERS: { id: ProviderId; label: string }[] = [
  { id: "chatgpt", label: "ChatGPT" },
  { id: "gemini", label: "Gemini" },
  { id: "claude", label: "Claude" },
  { id: "perplexity", label: "Perplexity" },
]

export const PROMPT_COUNTS = [10, 20, 50, 100]

export const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "fr", label: "French" },
  { value: "es", label: "Spanish" },
  { value: "de", label: "German" },
  { value: "pt", label: "Portuguese" },
  { value: "it", label: "Italian" },
  { value: "nl", label: "Dutch" },
  { value: "ar", label: "Arabic" },
]

export const COUNTRIES = [
  { value: "US", label: "United States" },
  { value: "GB", label: "United Kingdom" },
  { value: "CA", label: "Canada" },
  { value: "AU", label: "Australia" },
  { value: "FR", label: "France" },
  { value: "DE", label: "Germany" },
  { value: "ES", label: "Spain" },
  { value: "IT", label: "Italy" },
  { value: "NL", label: "Netherlands" },
  { value: "MA", label: "Morocco" },
  { value: "AE", label: "United Arab Emirates" },
]

export function languageLabel(value: string) {
  return LANGUAGES.find((l) => l.value === value)?.label ?? value
}

export function countryLabel(value: string) {
  return COUNTRIES.find((c) => c.value === value)?.label ?? value
}
