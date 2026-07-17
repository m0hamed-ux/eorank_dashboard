import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import {
  ACTIVE_STATUSES,
  JOB_STATUS_LABELS,
  type JobStatus,
} from "@/types/job"

const STATUS_VARIANTS: Record<
  JobStatus,
  "success" | "warning" | "destructive"
> = {
  pending: "warning",
  generating_prompts: "warning",
  querying: "warning",
  analyzing: "warning",
  completed: "success",
  partial: "warning",
  failed: "destructive",
}

function JobStatusBadge({ status }: { status: JobStatus }) {
  const isActive = ACTIVE_STATUSES.includes(status)

  return (
    <Badge variant={STATUS_VARIANTS[status]}>
      {isActive && <Spinner className="size-3" />}
      {JOB_STATUS_LABELS[status]}
    </Badge>
  )
}

export { JobStatusBadge }
 