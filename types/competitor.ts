// Competitor domain types. Shapes mirror the future FastAPI Pydantic schemas.

export interface Competitor {
  id: string
  name: string
  domain: string
  /** 0-100 visibility score across providers, null until first analysis */
  score: number | null
  /** citations found in the latest completed job window */
  citations: number
  /** week-over-week score change in points, null when no history */
  delta: number | null
  /** share of all brand citations captured, 0-100 */
  shareOfVoice: number
  isYou?: boolean
  addedAt: string // ISO
}

export interface NewCompetitorInput {
  name: string
  domain: string
}

/** Normalize user input like "https://www.acme.com/path" to "acme.com" */
export function normalizeDomain(input: string): string {
  let value = input.trim().toLowerCase()
  value = value.replace(/^https?:\/\//, "").replace(/^www\./, "")
  value = value.split(/[/?#]/)[0]
  return value
}

const DOMAIN_RE = /^(?!-)[a-z0-9-]{1,63}(?<!-)(\.(?!-)[a-z0-9-]{1,63}(?<!-))+$/

export function isValidDomain(domain: string): boolean {
  return DOMAIN_RE.test(domain)
}
