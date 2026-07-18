"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { CreateOrgCard } from "@/components/team/create-org-card"
import { InvitationsCard } from "@/components/team/invitations-card"
import { MembersCard } from "@/components/team/members-card"
import { OrgOverviewCard } from "@/components/team/org-overview-card"
import { useOrgRole } from "@/hooks/use-org-role"

// Team & workspace membership — powered entirely by Clerk Organizations.
// TODO(api): the backend later mirrors org membership via POST /webhooks/clerk
// (organization.created / organizationMembership.*) to provision tenants;
// nothing on this page calls our API.
export default function TeamPage() {
  const { isLoaded, organization, isAdmin } = useOrgRole()

  if (!isLoaded) {
    return (
      <div className="flex flex-col gap-4">
        <Card>
          <CardContent className="flex items-center gap-4">
            <Skeleton className="size-10 rounded-lg" />
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
            <Skeleton className="ml-auto h-5 w-20 rounded-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="size-8 rounded-full" />
                <div className="flex flex-col gap-1.5">
                  <Skeleton className="h-3.5 w-36" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="ml-auto h-5 w-16 rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!organization) {
    return <CreateOrgCard />
  }

  return (
    <div className="flex max-w-3xl flex-col gap-4">
      <OrgOverviewCard />
      <MembersCard />
      {isAdmin && <InvitationsCard />}
    </div>
  )
}
