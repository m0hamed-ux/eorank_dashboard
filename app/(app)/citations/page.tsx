"use client"

import * as React from "react"
import { Link2, Quote, Search, Target } from "lucide-react"

import { PROMPT_RESULTS } from "@/lib/citations"
import { type CitationOutcome } from "@/types/citation"
import { PROVIDERS, type ProviderId } from "@/types/job"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CitationsTable } from "@/components/citations-table"
import { StatCard } from "@/components/stat-card"

type OutcomeFilter = "all" | "cited" | "not_cited"
type ProviderFilter = ProviderId | "all"

export default function CitationsPage() {
  const [query, setQuery] = React.useState("")
  const [provider, setProvider] = React.useState<ProviderFilter>("all")
  const [outcome, setOutcome] = React.useState<OutcomeFilter>("all")

  // Aggregate KPIs over the full dataset (ignoring failed queries).
  const totals = React.useMemo(() => {
    let cited = 0
    let queries = 0
    let linked = 0
    for (const row of PROMPT_RESULTS) {
      for (const r of row.results) {
        if (r.outcome === "error") continue
        queries += 1
        if (r.outcome === "cited") {
          cited += 1
          if (r.linked) linked += 1
        }
      }
    }
    return {
      prompts: PROMPT_RESULTS.length,
      citations: cited,
      rate: queries ? Math.round((cited / queries) * 100) : 0,
      linked,
    }
  }, [])

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()

    const outcomeMatch = (o: CitationOutcome) =>
      outcome === "all" ? o !== "error" : o === outcome

    return PROMPT_RESULTS.filter((row) => {
      if (q && !row.prompt.toLowerCase().includes(q)) return false

      // Scope the outcome test to a single provider when one is selected,
      // otherwise any provider satisfying the outcome keeps the row.
      const scope =
        provider === "all"
          ? row.results
          : row.results.filter((r) => r.provider === provider)

      if (scope.length === 0) return false
      if (outcome === "all" && provider === "all") return true
      return scope.some((r) => outcomeMatch(r.outcome))
    })
  }, [query, provider, outcome])

  if (PROMPT_RESULTS.length === 0) {
    return (
      <Empty className="flex-1 rounded-xl border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Quote />
          </EmptyMedia>
          <EmptyTitle>No citations yet</EmptyTitle>
          <EmptyDescription>
            Run your first job to start tracking where your brand gets cited.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <>
      <div className="grid auto-rows-min gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          value={totals.prompts.toLocaleString("en-US")}
          deltaLabel="Tested"
          metricName="Prompts"
          metricIcon={Quote}
        />
        <StatCard
          value={totals.citations.toLocaleString("en-US")}
          deltaLabel="Across providers"
          metricName="Citations"
          metricIcon={Quote}
        />
        <StatCard
          value={`${totals.rate}%`}
          deltaLabel="Of all queries"
          metricName="Citation Rate"
          metricIcon={Target}
        />
        <StatCard
          value={totals.linked.toLocaleString("en-US")}
          deltaLabel="As a linked source"
          metricName="Linked Citations"
          metricIcon={Link2}
        />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search prompts..."
            className="pl-9"
          />
        </div>
        <Select
          value={provider}
          onValueChange={(v) => setProvider(v as ProviderFilter)}
        >
          <SelectTrigger className="sm:w-40">
            <SelectValue placeholder="Provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All providers</SelectItem>
              {PROVIDERS.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select
          value={outcome}
          onValueChange={(v) => setOutcome(v as OutcomeFilter)}
        >
          <SelectTrigger className="sm:w-36">
            <SelectValue placeholder="Outcome" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All outcomes</SelectItem>
              <SelectItem value="cited">Cited</SelectItem>
              <SelectItem value="not_cited">Not cited</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {filtered.length > 0 ? (
        <CitationsTable rows={filtered} />
      ) : (
        <Empty className="flex-1 rounded-xl border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Search />
            </EmptyMedia>
            <EmptyTitle>No matching prompts</EmptyTitle>
            <EmptyDescription>
              Try a different search term or clear your filters.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </>
  )
}
