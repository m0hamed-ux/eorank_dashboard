"use client"

import * as React from "react"
import { useOrganization } from "@clerk/nextjs"
import { MailPlus, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { RoleBadge } from "@/components/team/role-badge"
import { ORG_ROLES } from "@/hooks/use-org-role"

const DATE_FMT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
})

function errorMessage(err: unknown): string {
  const clerkError = err as { errors?: { message?: string }[] }
  return clerkError?.errors?.[0]?.message ?? "Could not send the invitation."
}

/** Admin-only: invite by email + manage pending invitations. */
export function InvitationsCard() {
  const { organization, invitations } = useOrganization({
    invitations: { infinite: true },
  })
  const [email, setEmail] = React.useState("")
  const [role, setRole] = React.useState<string>("org:member")
  const [sending, setSending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [revokingId, setRevokingId] = React.useState<string | null>(null)

  if (!organization) return null

  const pending = (invitations?.data ?? []).filter(
    (inv) => inv.status === "pending"
  )

  async function invite(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!organization || !email.trim()) return
    setSending(true)
    setError(null)
    try {
      await organization.inviteMember({
        emailAddress: email.trim(),
        role,
      })
      setEmail("")
      await invitations?.revalidate?.()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSending(false)
    }
  }

  async function revoke(invitationId: string) {
    const invitation = invitations?.data?.find((i) => i.id === invitationId)
    if (!invitation) return
    setRevokingId(invitationId)
    try {
      await invitation.revoke()
      await invitations?.revalidate?.()
    } finally {
      setRevokingId(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite members</CardTitle>
        <CardDescription>
          Invitees get an email and join with the role you pick.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <form onSubmit={invite} className="flex flex-col gap-2 sm:flex-row">
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="teammate@company.com"
            aria-label="Email address to invite"
            className="sm:max-w-xs"
          />
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="w-full sm:w-32" aria-label="Role for the invitee">
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
          <Button type="submit" disabled={sending || !email.trim()}>
            {sending ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <MailPlus data-icon="inline-start" />
            )}
            Send invite
          </Button>
        </form>
        {error && <p className="text-xs text-destructive">{error}</p>}

        {pending.length > 0 && (
          <div className="flex flex-col divide-y rounded-lg border px-3">
            {pending.map((inv) => (
              <div key={inv.id} className="flex items-center gap-3 py-2.5">
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium">
                    {inv.emailAddress}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Invited {DATE_FMT.format(inv.createdAt)}
                  </span>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <RoleBadge role={inv.role} />
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Revoke invitation for ${inv.emailAddress}`}
                    disabled={revokingId === inv.id}
                    onClick={() => revoke(inv.id)}
                  >
                    <X />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
