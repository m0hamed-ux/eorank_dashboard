import { Swords } from "lucide-react"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export default function CompetitorsPage() {
  return (
    <Empty className="flex-1 rounded-xl border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Swords />
        </EmptyMedia>
        <EmptyTitle>No competitors tracked</EmptyTitle>
        <EmptyDescription>
          Add competitors to compare your AI visibility against theirs.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
