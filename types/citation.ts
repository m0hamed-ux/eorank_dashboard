import type { ProviderId } from "@/types/job"

// Citation domain types. One PromptResult per prompt per job; each carries
// per-provider outcomes. Mirrors the future FastAPI Pydantic schemas.

export type CitationOutcome = "cited" | "not_cited" | "error"

export interface ProviderResult {
  provider: ProviderId
  outcome: CitationOutcome
  /** 1-based position of the brand mention in the answer, null if not cited */
  position: number | null
  /** answer excerpt around the mention (or the answer opening if not cited) */
  snippet: string
  /** true when the brand appeared as a linked source (search-grounded) */
  linked: boolean
}

export interface PromptResult {
  id: string
  jobId: string
  prompt: string
  language: string
  country: string
  runAt: string // ISO
  results: ProviderResult[]
}

export function citedCount(row: PromptResult): number {
  return row.results.filter((r) => r.outcome === "cited").length
}
