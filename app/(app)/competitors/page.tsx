"use client"

import { Megaphone, Swords, Trophy } from "lucide-react"

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { AddCompetitorDialog } from "@/components/add-competitor-dialog"
import { CompetitorsTable } from "@/components/competitors-table"
import { StatCard } from "@/components/stat-card"
import { useCompetitors } from "@/hooks/use-competitors"

export default function CompetitorsPage() {
  const { competitors, addCompetitor, removeCompetitor } = useCompetitors()

  const you = competitors.find((c) => c.isYou)
  const rivals = competitors.filter((c) => !c.isYou)

  if (rivals.length === 0) {
    return (
      <Empty className="flex-1 rounded-xl border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Swords />
          </EmptyMedia>
          <EmptyTitle>No competitors tracked</EmptyTitle>
          <EmptyDescription>
            Add competitors to see how your AI visibility ranks against
            theirs in every job you run.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <AddCompetitorDialog onAdd={addCompetitor} />
        </EmptyContent>
      </Empty>
    )
  }

  const scored = competitors.filter((c) => c.score !== null)
  const rank =
    you && you.score !== null
      ? [...scored].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
          .findIndex((c) => c.isYou) + 1
      : null

  return (
    <>
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <StatCard
          value={rank ? `#${rank}` : "—"}
          deltaLabel={rank ? `of ${scored.length} brands tracked` : "No data yet"}
          metricName="Your Rank"
          metricIcon={Trophy}
        />
        <StatCard
          value={you?.score !== null && you ? String(you.score) : "—"}
          delta={you?.delta ?? undefined}
          deltaLabel="vs last week"
          metricName="Your Visibility Score"
          metricIcon={Swords}
        />
        <StatCard
          value={you ? `${you.shareOfVoice}%` : "—"}
          deltaLabel="Of all citations in your niche"
          metricName="Share of Voice"
          metricIcon={Megaphone}
        />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {rivals.length} competitor{rivals.length === 1 ? "" : "s"} tracked
        </p>
        <AddCompetitorDialog onAdd={addCompetitor} />
      </div>

      <CompetitorsTable
        competitors={competitors}
        onRemove={removeCompetitor}
      />
    </>
  )
}
