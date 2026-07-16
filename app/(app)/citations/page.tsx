import { Quote } from "lucide-react"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export default function CitationsPage() {
  return (
    <Empty className="flex-1 rounded-xl border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Quote />
        </EmptyMedia>
        <EmptyTitle>No citations yet</EmptyTitle>
        <EmptyDescription>
          Run your first prompt test to start tracking where your brand gets
          cited.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
