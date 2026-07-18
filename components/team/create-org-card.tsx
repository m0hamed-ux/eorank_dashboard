"use client"

import * as React from "react"
import { useOrganizationList } from "@clerk/nextjs"
import { Building2, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"

/**
 * Shown when the user has no active organization. A workspace (Clerk org) is
 * the tenant everything hangs off — the backend rejects requests without an
 * org_id claim, so nothing works until one exists.
 */
export function CreateOrgCard() {
  const { isLoaded, createOrganization, setActive } = useOrganizationList()
  const [name, setName] = React.useState("")
  const [creating, setCreating] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!isLoaded || !name.trim()) return
    setCreating(true)
    setError(null)
    try {
      const org = await createOrganization({ name: name.trim() })
      // Make it the active org so the whole app (and later the backend
      // org_id claim) picks it up immediately. You become its admin.
      await setActive({ organization: org.id })
    } catch {
      setError("Could not create the workspace. Try again.")
      setCreating(false)
    }
  }

  return (
    <Card className="max-w-lg">
      <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
        <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
          <Building2 className="size-4" />
        </div>
        <div className="flex max-w-sm flex-col gap-1">
          <span className="text-base font-semibold">Create your workspace</span>
          <span className="text-sm text-muted-foreground text-balance">
            A workspace holds your tracked brands, jobs, and team. You&apos;ll
            be its admin and can invite members after.
          </span>
        </div>
        <form
          onSubmit={create}
          className="flex w-full max-w-sm flex-col gap-3 text-left"
        >
          <Field>
            <FieldLabel htmlFor="new-org-name">Workspace name</FieldLabel>
            <Input
              id="new-org-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Acme Inc."
              autoFocus
            />
          </Field>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <Button type="submit" disabled={!isLoaded || creating || !name.trim()}>
            {creating ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <Plus data-icon="inline-start" />
            )}
            Create workspace
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
