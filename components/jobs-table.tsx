"use client"

import { useRouter } from "next/navigation"

import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { JobStatusBadge } from "@/components/job-status-badge"
import { ProviderIcon } from "@/components/provider-icon"
import {
  ACTIVE_STATUSES,
  countryLabel,
  languageLabel,
  PROVIDERS,
  type Job,
} from "@/types/job"

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

export function JobsTable({ jobs }: { jobs: Job[] }) {
  const router = useRouter()

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Job</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Prompts</TableHead>
            <TableHead>Language</TableHead>
            <TableHead>Country</TableHead>
            <TableHead>Providers</TableHead>
            <TableHead className="text-right">Citations</TableHead>
            <TableHead className="text-right">Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => {
            const isActive = ACTIVE_STATUSES.includes(job.status)
            return (
              <TableRow
                key={job.id}
                className="cursor-pointer"
                onClick={() => router.push(`/jobs/${job.id}`)}
              >
                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-mono text-xs text-muted-foreground">
                      {job.id}
                    </span>
                    {job.topic && (
                      <span className="max-w-48 truncate text-sm">
                        {job.topic}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1.5">
                    <JobStatusBadge status={job.status} />
                    {isActive && (
                      <Progress value={job.progress} className="h-1 w-24" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {job.promptCount}
                </TableCell>
                <TableCell>{languageLabel(job.language)}</TableCell>
                <TableCell>{countryLabel(job.country)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {PROVIDERS.filter((p) => job.providers.includes(p.id)).map(
                      (p) => (
                        <Tooltip key={p.id}>
                          <TooltipTrigger asChild>
                            <span className="flex size-6 items-center justify-center rounded-md bg-muted text-muted-foreground">
                              <ProviderIcon
                                provider={p.id}
                                className="size-3.5"
                              />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>{p.label}</TooltipContent>
                        </Tooltip>
                      )
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {job.citations === null ? (
                    <span className="text-muted-foreground">—</span>
                  ) : (
                    job.citations
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="font-mono text-xs text-muted-foreground tabular-nums">
                        {dateFormatter.format(new Date(job.createdAt))}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      {new Date(job.createdAt).toLocaleString()}
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
