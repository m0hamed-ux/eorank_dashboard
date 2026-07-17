import type { ProviderId } from "@/types/job"

// Mock analytics data. Replace with TanStack Query against
// GET /api/v1/analytics once the FastAPI backend exists.
// Data is generated deterministically (seeded) so server and client
// render identical markup — no Math.random at render time.

export type TimeRange = "7d" | "30d" | "90d"

export interface TrendPoint {
  date: string // ISO day
  you: number // visibility score 0-100
  competitors: number // competitor average
}

export interface DailyCitations {
  date: string
  chatgpt: number
  gemini: number
  claude: number
  perplexity: number
}

export interface ProviderStat {
  provider: ProviderId
  citationRate: number // % of prompts where brand was cited
  citations: number
  delta: number // pts vs previous period
}

export interface TopPrompt {
  prompt: string
  providersCited: ProviderId[]
  position: number // avg mention position in the answer, 1 = first
  runs: number
}

export interface AnalyticsSummary {
  visibilityScore: number
  visibilityDelta: number
  citationRate: number
  citationRateDelta: number
  totalCitations: number
  citationsDelta: number
  promptsRun: number
  promptsDelta: number
}

// --- deterministic pseudo-random -------------------------------------------

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const RANGE_DAYS: Record<TimeRange, number> = { "7d": 7, "30d": 30, "90d": 90 }

// Anchor to a fixed "today" so mock output is stable. The backend will
// obviously use real dates.
const TODAY = new Date("2026-07-16T00:00:00Z")

function dayISO(offsetBack: number): string {
  const d = new Date(TODAY)
  d.setUTCDate(d.getUTCDate() - offsetBack)
  return d.toISOString().slice(0, 10)
}

// --- generators --------------------------------------------------------------

export function getTrend(range: TimeRange): TrendPoint[] {
  const days = RANGE_DAYS[range]
  const rand = mulberry32(42)
  const points: TrendPoint[] = []
  // Upward drift for "you", flat for competitor average.
  let you = 38
  let competitors = 52
  const drift = 24 / days

  for (let i = days - 1; i >= 0; i--) {
    you = Math.min(95, Math.max(5, you + drift + (rand() - 0.48) * 6))
    competitors = Math.min(95, Math.max(5, competitors + (rand() - 0.5) * 3))
    points.push({
      date: dayISO(i),
      you: Math.round(you),
      competitors: Math.round(competitors),
    })
  }
  return points
}

export function getDailyCitations(range: TimeRange): DailyCitations[] {
  const days = RANGE_DAYS[range]
  const rand = mulberry32(7)
  const points: DailyCitations[] = []

  for (let i = days - 1; i >= 0; i--) {
    // Growth factor: later days (small i) get more citations.
    const growth = 1 + ((days - i) / days) * 1.6
    points.push({
      date: dayISO(i),
      chatgpt: Math.round((2 + rand() * 6) * growth),
      gemini: Math.round((1 + rand() * 4) * growth),
      claude: Math.round((1 + rand() * 3) * growth),
      perplexity: Math.round((2 + rand() * 5) * growth),
    })
  }
  return points
}

export function getProviderStats(range: TimeRange): ProviderStat[] {
  const daily = getDailyCitations(range)
  const totals: Record<ProviderId, number> = {
    chatgpt: 0,
    gemini: 0,
    claude: 0,
    perplexity: 0,
  }
  for (const day of daily) {
    totals.chatgpt += day.chatgpt
    totals.gemini += day.gemini
    totals.claude += day.claude
    totals.perplexity += day.perplexity
  }
  // Rates/deltas are hand-picked plausible values per provider.
  return [
    { provider: "perplexity", citationRate: 46, citations: totals.perplexity, delta: 5.1 },
    { provider: "chatgpt", citationRate: 34, citations: totals.chatgpt, delta: 2.3 },
    { provider: "gemini", citationRate: 22, citations: totals.gemini, delta: -1.8 },
    { provider: "claude", citationRate: 19, citations: totals.claude, delta: 0.6 },
  ]
}

export function getSummary(range: TimeRange): AnalyticsSummary {
  const trend = getTrend(range)
  const daily = getDailyCitations(range)
  const totalCitations = daily.reduce(
    (sum, d) => sum + d.chatgpt + d.gemini + d.claude + d.perplexity,
    0
  )
  const last = trend[trend.length - 1]
  const first = trend[0]

  return {
    visibilityScore: last.you,
    visibilityDelta:
      Math.round(((last.you - first.you) / Math.max(first.you, 1)) * 1000) / 10,
    citationRate: 31,
    citationRateDelta: 4.2,
    totalCitations,
    citationsDelta: 12.8,
    promptsRun: RANGE_DAYS[range] * 18,
    promptsDelta: 6.5,
  }
}

export const TOP_PROMPTS: TopPrompt[] = [
  {
    prompt: "best AI visibility tracking tools",
    providersCited: ["chatgpt", "gemini", "perplexity"],
    position: 1.4,
    runs: 24,
  },
  {
    prompt: "how to check if ChatGPT recommends my brand",
    providersCited: ["chatgpt", "perplexity"],
    position: 2.1,
    runs: 18,
  },
  {
    prompt: "generative engine optimization software",
    providersCited: ["perplexity", "claude"],
    position: 2.8,
    runs: 16,
  },
  {
    prompt: "alternatives to traditional SEO rank trackers",
    providersCited: ["chatgpt"],
    position: 3.5,
    runs: 12,
  },
  {
    prompt: "track brand mentions in AI answers",
    providersCited: ["gemini", "perplexity"],
    position: 1.9,
    runs: 11,
  },
]

export const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
]
