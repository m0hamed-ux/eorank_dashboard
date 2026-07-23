// Score page display config — pillar labels/descriptions are UI copy for the
// pillar ids the backend returns (GET /api/v1/score). Live data comes from
// hooks/use-score.ts; the component-facing types below are the view shapes
// the score components render.

export interface ScorePillar {
  id: string
  label: string
  description: string
  score: number // 0-100
  delta: number // pts vs last audit (0 when first audit)
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

// Static display copy per backend pillar id.
export const PILLAR_META: Record<string, { label: string; description: string }> = {
  geo: {
    label: "GEO",
    description: "How well your content is written to be cited by LLMs",
  },
  aeo: {
    label: "AEO",
    description: "Answer readiness: direct answers, FAQs, featured-snippet style",
  },
  authority: {
    label: "Domain Rating",
    description: "Trust signals and how often trusted sources mention you",
  },
  structured: {
    label: "Structured Data",
    description: "Schema.org markup LLMs and answer engines can parse",
  },
  content: {
    label: "Content Depth",
    description: "Coverage of the questions users actually ask AI in your niche",
  },
  freshness: {
    label: "Freshness",
    description: "How recently key pages were updated and re-crawled",
  },
}

export function pillarLabel(id: string): string {
  return PILLAR_META[id]?.label ?? id
}
