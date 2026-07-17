"use client"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ProviderIcon } from "@/components/provider-icon"
import type { ProviderResult } from "@/types/citation"
import { PROVIDERS } from "@/types/job"

// Shared building blocks for citation views (list table + detail page).

// Per-provider outcome chip: green = cited, muted = not cited, red = error.
// Providers not queried in a run render as an empty slot to keep the grid.
export function OutcomeChip({ result }: { result: ProviderResult | undefined }) {
  const provider = result?.provider
  if (!result || !provider) {
    return <span aria-hidden className="size-6 rounded-md" />
  }

  const label = PROVIDERS.find((p) => p.id === provider)?.label ?? provider
  const outcomeLabel =
    result.outcome === "cited"
      ? `Cited${result.position ? ` at position ${result.position}` : ""}`
      : result.outcome === "error"
        ? "Query failed"
        : "Not cited"

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            "flex size-6 items-center justify-center rounded-md",
            result.outcome === "cited" && "bg-success/10 text-success",
            result.outcome === "not_cited" && "bg-muted text-muted-foreground/40",
            result.outcome === "error" && "bg-destructive/10 text-destructive"
          )}
        >
          <ProviderIcon provider={provider} className="size-3.5" />
        </span>
      </TooltipTrigger>
      <TooltipContent>
        {label}: {outcomeLabel}
      </TooltipContent>
    </Tooltip>
  )
}

// Full per-provider result card: outcome badges + answer excerpt.
export function ResultDetail({ result }: { result: ProviderResult }) {
  const label =
    PROVIDERS.find((p) => p.id === result.provider)?.label ?? result.provider

  return (
    <div className="flex flex-col gap-2 rounded-lg border p-4">
      <div className="flex items-center gap-2">
        <span className="flex size-6 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <ProviderIcon provider={result.provider} className="size-3.5" />
        </span>
        <span className="text-sm font-medium">{label}</span>
        <span className="ml-auto flex items-center gap-1.5">
          {result.linked && <Badge variant="outline">Linked source</Badge>}
          {result.outcome === "cited" && result.position !== null && (
            <Badge variant="secondary" className="font-mono tabular-nums">
              #{result.position}
            </Badge>
          )}
          {result.outcome === "cited" && <Badge variant="success">Cited</Badge>}
          {result.outcome === "not_cited" && (
            <Badge variant="secondary">Not cited</Badge>
          )}
          {result.outcome === "error" && (
            <Badge variant="destructive">Error</Badge>
          )}
        </span>
      </div>
      {result.snippet ? (
        <p className="border-l-2 pl-3 text-sm text-muted-foreground">
          {result.snippet}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground italic">
          No response recorded — the provider query failed for this prompt.
        </p>
      )}
    </div>
  )
}
