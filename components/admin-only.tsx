"use client"

import Link from "next/link"
import { ShieldAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useOrgRole } from "@/hooks/use-org-role"

/**
 * Client-side gate for admin-only pages (Billing, admin settings tabs).
 * UI-level only — the backend re-verifies the role from the Clerk JWT; this
 * just keeps non-admins from seeing screens they can't act on.
 */
export function AdminOnly({ children }: { children: React.ReactNode }) {
  const { isLoaded, isAdmin } = useOrgRole()

  if (!isLoaded) {
    return (
      <div className="flex max-w-3xl flex-col gap-4">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <Card className="max-w-lg">
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
            <ShieldAlert className="size-4" />
          </div>
          <div className="flex max-w-sm flex-col gap-1">
            <span className="text-base font-semibold">Admins only</span>
            <span className="text-sm text-muted-foreground text-balance">
              This area is managed by workspace admins. Ask an admin for
              access if you need something changed.
            </span>
          </div>
          <Button variant="outline" asChild>
            <Link href="/team">View team</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return <>{children}</>
}
