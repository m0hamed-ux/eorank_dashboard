"use client"

import * as React from "react"
import { useOrganization, useUser } from "@clerk/nextjs"
import { UserMinus, Users } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { RoleBadge } from "@/components/team/role-badge"
import { ORG_ROLES, useOrgRole } from "@/hooks/use-org-role"

const DATE_FMT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
})

/** Everyone sees the member list; only admins can change roles or remove. */
export function MembersCard() {
  const { isAdmin } = useOrgRole()
  const { user } = useUser()
  const { organization, memberships } = useOrganization({
    memberships: { infinite: true },
  })
  const [busyId, setBusyId] = React.useState<string | null>(null)

  if (!organization) return null

  const rows = memberships?.data ?? []
  const loading = memberships?.isLoading ?? true

  async function changeRole(userId: string, role: string) {
    if (!organization) return
    setBusyId(userId)
    try {
      // TODO(api): backend will re-derive roles from the Clerk JWT — no
      // backend call needed here.
      await organization.updateMember({ userId, role })
      await memberships?.revalidate?.()
    } finally {
      setBusyId(null)
    }
  }

  async function removeMember(userId: string) {
    if (!organization) return
    setBusyId(userId)
    try {
      await organization.removeMember(userId)
      await memberships?.revalidate?.()
    } finally {
      setBusyId(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Members</CardTitle>
        <CardDescription>
          People with access to this workspace and its citation data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col gap-3">
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
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed p-6 text-center">
            <Users className="size-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              No members yet.
            </span>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                {isAdmin && <TableHead className="w-10" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((m) => {
                const data = m.publicUserData
                const isSelf = data?.userId === user?.id
                const name =
                  [data?.firstName, data?.lastName].filter(Boolean).join(" ") ||
                  data?.identifier ||
                  "Member"
                return (
                  <TableRow key={m.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarImage src={data?.imageUrl} alt={name} />
                          <AvatarFallback>
                            {name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex min-w-0 flex-col">
                          <span className="truncate text-sm font-medium">
                            {name}
                            {isSelf && (
                              <span className="text-muted-foreground"> (you)</span>
                            )}
                          </span>
                          <span className="truncate text-xs text-muted-foreground">
                            {data?.identifier}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {isAdmin && !isSelf && data?.userId ? (
                        <Select
                          value={m.role}
                          onValueChange={(role) => changeRole(data.userId!, role)}
                          disabled={busyId === data.userId}
                        >
                          <SelectTrigger
                            size="sm"
                            className="w-28"
                            aria-label={`Change role for ${name}`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ORG_ROLES.map((r) => (
                              <SelectItem key={r.value} value={r.value}>
                                {r.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <RoleBadge role={m.role} />
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {DATE_FMT.format(m.createdAt)}
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        {!isSelf && data?.userId && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Remove ${name}`}
                                disabled={busyId === data.userId}
                                onClick={() => removeMember(data.userId!)}
                              >
                                <UserMinus />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Remove from workspace</TooltipContent>
                          </Tooltip>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
        {memberships?.hasNextPage && (
          <div className="mt-3 flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => memberships.fetchNext?.()}
              disabled={memberships.isFetching}
            >
              Load more
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
