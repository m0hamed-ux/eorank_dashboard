import Link from "next/link"
import { ArrowLeft, SearchX } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export default function CitationNotFound() {
  return (
    <Empty className="flex-1 rounded-xl border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchX />
        </EmptyMedia>
        <EmptyTitle>Prompt not found</EmptyTitle>
        <EmptyDescription>
          This prompt result doesn&apos;t exist or may have been removed.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild variant="outline">
          <Link href="/citations">
            <ArrowLeft data-icon="inline-start" />
            Back to citations
          </Link>
        </Button>
      </EmptyContent>
    </Empty>
  )
}
