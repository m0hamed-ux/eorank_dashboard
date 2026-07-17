"use client"

import * as React from "react"

import {
  normalizeDomain,
  type Competitor,
  type NewCompetitorInput,
} from "@/types/competitor"

// Mock client-side competitor store. Replace with TanStack Query against
// the FastAPI backend once it exists.
// TODO: replace with GET /api/v1/competitors + POST/DELETE /api/v1/competitors

const SEED_COMPETITORS: Competitor[] = [
  {
    id: "you",
    name: "Your brand",
    domain: "eorank.com",
    score: 62,
    citations: 47,
    delta: 4.2,
    shareOfVoice: 28,
    isYou: true,
    addedAt: "2026-07-10T09:00:00Z",
  },
  {
    id: "cmp_4d1f",
    name: "Semrush",
    domain: "semrush.com",
    score: 84,
    citations: 112,
    delta: 1.1,
    shareOfVoice: 39,
    addedAt: "2026-07-10T09:05:00Z",
  },
  {
    id: "cmp_a8e2",
    name: "Ahrefs",
    domain: "ahrefs.com",
    score: 71,
    citations: 68,
    delta: -2.4,
    shareOfVoice: 21,
    addedAt: "2026-07-10T09:06:00Z",
  },
  {
    id: "cmp_c37b",
    name: "Moz",
    domain: "moz.com",
    score: 43,
    citations: 19,
    delta: -0.8,
    shareOfVoice: 12,
    addedAt: "2026-07-12T15:20:00Z",
  },
]

export function useCompetitors() {
  const [competitors, setCompetitors] =
    React.useState<Competitor[]>(SEED_COMPETITORS)

  const addCompetitor = React.useCallback(
    (input: NewCompetitorInput): { ok: true } | { ok: false; error: string } => {
      const domain = normalizeDomain(input.domain)
      let duplicate = false

      setCompetitors((prev) => {
        if (prev.some((c) => c.domain === domain)) {
          duplicate = true
          return prev
        }
        return [
          ...prev,
          {
            id: `cmp_${crypto.randomUUID().slice(0, 4)}`,
            name: input.name.trim(),
            domain,
            score: null, // no data until the next job runs
            citations: 0,
            delta: null,
            shareOfVoice: 0,
            addedAt: new Date().toISOString(),
          },
        ]
      })

      return duplicate
        ? { ok: false, error: "This domain is already tracked." }
        : { ok: true }
    },
    []
  )

  const removeCompetitor = React.useCallback((id: string) => {
    setCompetitors((prev) => prev.filter((c) => c.id !== id || c.isYou))
  }, [])

  return { competitors, addCompetitor, removeCompetitor }
}
