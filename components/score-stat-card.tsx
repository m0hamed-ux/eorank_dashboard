"use client"

import { Gauge } from "lucide-react"

import { useActiveCompany } from "@/components/active-company-context"
import { useScore } from "@/hooks/use-score"
import { BarStrip } from "@/components/charts/bar-strip"
import { StatCard } from "@/components/stat-card"
import { Skeleton } from "@/components/ui/skeleton"

/** Live Visibility Score KPI for the dashboard home (active project). */
export function ScoreStatCard() {
  const { active, isLoading: companiesLoading } = useActiveCompany()
  const { data, isLoading, noAudit } = useScore(active?.id ?? null)

  if (companiesLoading || (active && isLoading && !noAudit)) {
    return <Skeleton className="h-32 rounded-xl" />
  }

  if (!active || noAudit || !data) {
    return (
      <StatCard
        value="—"
        delta={0}
        deltaLabel={noAudit ? "Audit pending" : "No project"}
        metricName="Visibility Score"
        metricIcon={Gauge}
      >
        <BarStrip value={0} />
      </StatCard>
    )
  }

  return (
    <StatCard
      value={String(data.overall)}
      delta={data.delta ?? 0}
      deltaLabel="Score"
      metricName="Visibility Score"
      metricIcon={Gauge}
    >
      <BarStrip value={data.overall} />
    </StatCard>
  )
}
