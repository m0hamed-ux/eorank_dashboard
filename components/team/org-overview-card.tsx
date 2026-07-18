"use client"

import { useOrganization } from "@clerk/nextjs"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { RoleBadge } from "@/components/team/role-badge"
import { useOrgRole } from "@/hooks/use-org-role"

const DATE_FMT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
})

/** Workspace identity + the viewer's own membership, side by side. */
export function OrgOverviewCard() {
  const { organization, membership, role } = useOrgRole()
  const { memberships } = useOrganization({
    memberships: { infinite: true },
  })

  if (!organization) return null

  const memberCount =
    memberships?.count ?? organization.membersCount ?? undefined

  return (
    <Card>
      <CardContent className="flex flex-wrap items-center gap-4">
        <Avatar className="size-10 rounded-lg">
          <AvatarImage src={organization.imageUrl} alt={organization.name} />
          <AvatarFallback className="rounded-lg">
            {organization.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate text-base font-semibold">
            {organization.name}
          </span>
          <span className="text-xs text-muted-foreground">
            Created {DATE_FMT.format(organization.createdAt)}
            {memberCount !== undefined && (
              <>
                {" · "}
                <span className="font-mono tabular-nums">{memberCount}</span>
                {memberCount === 1 ? " member" : " members"}
              </>
            )}
          </span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Your role</span>
          <RoleBadge role={role} />
          {membership?.createdAt && (
            <span className="hidden text-xs text-muted-foreground sm:inline">
              since {DATE_FMT.format(membership.createdAt)}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
