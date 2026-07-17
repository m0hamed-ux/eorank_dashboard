// Score page domain types + mock data.
// TODO: replace with GET /api/v1/score once the FastAPI backend exists.
// Deterministic values only — no Math.random at render time.

export interface ScorePillar {
  id: string
  label: string
  description: string
  score: number // 0-100
  delta: number // pts vs last audit
}

export type TipImpact = "high" | "medium" | "low"
export type TipEffort = "easy" | "medium" | "hard"

export interface EnhancementTip {
  id: string
  title: string
  description: string
  pillar: string // ScorePillar id
  impact: TipImpact
  effort: TipEffort
  gain: number // estimated score points
  done: boolean
}

export interface ScoreHistoryPoint {
  date: string // ISO day
  score: number
}

export const OVERALL = {
  score: 62,
  delta: 4.2,
  grade: "B-",
  lastAudit: "2026-07-16T06:00:00Z",
  domain: "eorank.com",
}

export const PILLARS: ScorePillar[] = [
  {
    id: "geo",
    label: "GEO",
    description: "How well your content is written to be cited by LLMs",
    score: 58,
    delta: 6,
  },
  {
    id: "aeo",
    label: "AEO",
    description: "Answer readiness: direct answers, FAQs, featured-snippet style",
    score: 51,
    delta: 3,
  },
  {
    id: "authority",
    label: "Domain Rating",
    description: "Backlink profile and how often trusted sources mention you",
    score: 44,
    delta: 1,
  },
  {
    id: "structured",
    label: "Structured Data",
    description: "Schema.org markup LLMs and answer engines can parse",
    score: 72,
    delta: 0,
  },
  {
    id: "content",
    label: "Content Depth",
    description: "Coverage of the questions users actually ask AI in your niche",
    score: 66,
    delta: 8,
  },
  {
    id: "freshness",
    label: "Freshness",
    description: "How recently key pages were updated and re-crawled",
    score: 81,
    delta: -2,
  },
]

export const TIPS: EnhancementTip[] = [
  {
    id: "tip_faq",
    title: "Add an FAQ section to your top 5 landing pages",
    description:
      "LLMs lift direct question-answer pairs far more often than prose. Target the exact questions from your Top Citing Prompts report.",
    pillar: "aeo",
    impact: "high",
    effort: "easy",
    gain: 6,
    done: false,
  },
  {
    id: "tip_comparison",
    title: "Publish comparison pages against top competitors",
    description:
      '"X vs Y" and "best tools for Z" pages are the most-cited content type in AI answers about product categories.',
    pillar: "geo",
    impact: "high",
    effort: "medium",
    gain: 8,
    done: false,
  },
  {
    id: "tip_schema_product",
    title: "Add Product and Organization schema markup",
    description:
      "Structured data helps answer engines attribute facts (pricing, features) to your brand with confidence.",
    pillar: "structured",
    impact: "medium",
    effort: "easy",
    gain: 4,
    done: false,
  },
  {
    id: "tip_stats",
    title: "Publish original statistics or benchmark data",
    description:
      "Unique numbers get cited with attribution. A yearly industry report is the strongest citation magnet available.",
    pillar: "authority",
    impact: "high",
    effort: "hard",
    gain: 9,
    done: false,
  },
  {
    id: "tip_wikipedia",
    title: "Get listed in industry directories and review sites",
    description:
      "G2, Capterra and similar sources are heavily weighted in AI training data and search-grounded answers.",
    pillar: "authority",
    impact: "medium",
    effort: "medium",
    gain: 5,
    done: false,
  },
  {
    id: "tip_headings",
    title: "Rewrite headings as questions users ask AI",
    description:
      'Change "Our features" to "What does EORank do?" — question headings map directly onto prompt phrasing.',
    pillar: "aeo",
    impact: "medium",
    effort: "easy",
    gain: 3,
    done: true,
  },
  {
    id: "tip_update_dates",
    title: "Show visible last-updated dates on key pages",
    description:
      "Search-grounded engines (Perplexity, Gemini) prefer recently updated sources when choosing citations.",
    pillar: "freshness",
    impact: "low",
    effort: "easy",
    gain: 2,
    done: true,
  },
]

export const SCORE_HISTORY: ScoreHistoryPoint[] = [
  { date: "2026-05-21", score: 38 },
  { date: "2026-05-28", score: 40 },
  { date: "2026-06-04", score: 43 },
  { date: "2026-06-11", score: 42 },
  { date: "2026-06-18", score: 47 },
  { date: "2026-06-25", score: 52 },
  { date: "2026-07-02", score: 55 },
  { date: "2026-07-09", score: 58 },
  { date: "2026-07-16", score: 62 },
]

export function pillarLabel(id: string): string {
  return PILLARS.find((p) => p.id === id)?.label ?? id
}
