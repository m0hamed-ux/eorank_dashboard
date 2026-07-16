import { Settings } from "lucide-react"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export default function SettingsPage() {
  return (
    <Empty className="flex-1 rounded-xl border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Settings />
        </EmptyMedia>
        <EmptyTitle>Settings</EmptyTitle>
        <EmptyDescription>
          Workspace and account settings are coming soon.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
