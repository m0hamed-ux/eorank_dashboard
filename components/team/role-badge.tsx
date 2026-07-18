"use client"

import { Badge } from "@/components/ui/badge"
import { roleLabel } from "@/hooks/use-org-role"

// Role is emphasis, not status: Admin gets the accent tint, everyone else
// stays muted. Semantic colors (green/red/amber) are reserved for citation
// outcomes and job states — never roles.
export function RoleBadge({ role }: { role: string | undefined | null }) {
  return (
    <Badge variant={role === "org:admin" ? "default" : "secondary"}>
      {roleLabel(role)}
    </Badge>
  )
}
