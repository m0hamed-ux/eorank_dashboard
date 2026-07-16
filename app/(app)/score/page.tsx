import { Gauge } from "lucide-react"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export default function ScorePage() {
  return (
    <Empty className="flex-1 rounded-xl border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Gauge />
        </EmptyMedia>
        <EmptyTitle>No score yet</EmptyTitle>
        <EmptyDescription>
          Run prompt tests to compute your AI visibility score.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
