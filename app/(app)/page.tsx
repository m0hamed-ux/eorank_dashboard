import { BarChart3, Gauge, Play, Quote, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { StatCard } from "@/components/stat-card"

export default function Home() {
  return (
    <>
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <StatCard
          value="—"
          deltaLabel="No runs yet"
          metricName="Visibility Score"
          metricIcon={Gauge}
        />
        <StatCard
          value="0"
          deltaLabel="Across all providers"
          metricName="Citations"
          metricIcon={Quote}
        />
        <StatCard
          value="0"
          deltaLabel="Prompts tested"
          metricName="Prompt Runs"
          metricIcon={BarChart3}
        />
      </div>
      <Empty className="min-h-[60vh] flex-1 rounded-xl border border-dashed md:min-h-min">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Sparkles />
          </EmptyMedia>
          <EmptyTitle>Track your AI visibility</EmptyTitle>
          <EmptyDescription>
            Run your first job to see how ChatGPT, Gemini, Claude, and
            Perplexity cite your brand.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button>
            <Play />
            Run first job
          </Button>
        </EmptyContent>
      </Empty>
    </>
  )
}
