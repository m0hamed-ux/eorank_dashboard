"use client"

import { useRouter } from "next/navigation"

import { cn } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { OutcomeChip } from "@/components/citation-result"
import { citedCount, type PromptResult } from "@/types/citation"
import { countryLabel, languageLabel, PROVIDERS } from "@/types/job"

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

export function CitationsTable({ rows }: { rows: PromptResult[] }) {
  const router = useRouter()

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Prompt</TableHead>
            <TableHead>Results</TableHead>
            <TableHead className="text-right">Cited</TableHead>
            <TableHead>Locale</TableHead>
            <TableHead className="text-right">Run</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const cited = citedCount(row)
            return (
              <TableRow
                key={row.id}
                className="cursor-pointer"
                onClick={() => router.push(`/citations/${row.id}`)}
              >
                <TableCell className="max-w-80">
                  <span className="block truncate text-sm font-medium">
                    {row.prompt}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {row.jobId}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {PROVIDERS.map((p) => (
                      <OutcomeChip
                        key={p.id}
                        result={row.results.find((r) => r.provider === p.id)}
                      />
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  <span
                    className={cn(
                      cited > 0 ? "text-success" : "text-muted-foreground"
                    )}
                  >
                    {cited}/{row.results.length}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {languageLabel(row.language)} · {countryLabel(row.country)}
                </TableCell>
                <TableCell className="text-right font-mono text-xs text-muted-foreground tabular-nums">
                  {dateFormatter.format(new Date(row.runAt))}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
