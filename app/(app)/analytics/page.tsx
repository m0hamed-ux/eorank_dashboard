import { BarChart3 } from "lucide-react"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export default function AnalyticsPage() {
  return (
    <Empty className="flex-1 rounded-xl border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <BarChart3 />
        </EmptyMedia>
        <EmptyTitle>No analytics yet</EmptyTitle>
        <EmptyDescription>
          Once you run prompt tests, your visibility trends will show up here.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
