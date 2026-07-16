import { Briefcase } from "lucide-react"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export default function JobsPage() {
  return (
    <Empty className="flex-1 rounded-xl border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Briefcase />
        </EmptyMedia>
        <EmptyTitle>No jobs yet</EmptyTitle>
        <EmptyDescription>
          Scheduled and running prompt-test jobs will appear here.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
