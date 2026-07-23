"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Globe, Plus } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"

import { ApiError, type CompanyRead } from "@/lib/api"
import { useApi } from "@/hooks/use-api"
import { useActiveCompany } from "@/components/active-company-context"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"

// Company logo with graceful fallback: broken/missing logo_url → globe icon.
// Plain <img>, not next/image — logos live on arbitrary customer domains.
function BrandLogo({
  company,
  className,
}: {
  company: CompanyRead
  className?: string
}) {
  const [failed, setFailed] = React.useState(false)

  if (!company.logo_url || failed) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg border bg-sidebar-accent ${className}`}
      >
        <Globe className="size-4 text-muted-foreground" />
      </div>
    )
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={company.logo_url}
      alt={company.name}
      onError={() => setFailed(true)}
      className={`shrink-0 rounded-lg border object-cover ${className}`}
    />
  )
}

// The sidebar's primary context switcher: which tracked company/brand the
// dashboard is scoped to — real rows from GET /api/v1/companies, scoped by
// the backend to the authenticated org.
export function BrandSwitcher() {
  const api = useApi()
  const queryClient = useQueryClient()
  // Shared app-wide selection — Score (and later Jobs/Citations) follow it.
  const { companies, active, setActiveId, isLoading, isError } =
    useActiveCompany()

  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [domain, setDomain] = React.useState("")
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!name.trim() || !domain.trim() || saving) return
    setSaving(true)
    setError(null)
    try {
      const created = await api.companies.create({
        name: name.trim(),
        domain: domain.trim(),
        type: "other",
      })
      await queryClient.invalidateQueries({ queryKey: ["companies"] })
      setActiveId(created.id)
      setName("")
      setDomain("")
      setDialogOpen(false)
    } catch (err) {
      // Quota (402), duplicate (409), invalid domain (422) — the backend's
      // message is already user-readable.
      setError(
        err instanceof ApiError ? err.message : "Could not add the project."
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {isLoading ? (
                <>
                  <Skeleton className="size-8 rounded-lg" />
                  <div className="flex flex-col gap-1">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </>
              ) : active ? (
                <>
                  <BrandLogo company={active} className="size-8" />
                  <div className="flex flex-col gap-0.5 leading-none text-left">
                    <span className="truncate font-medium">{active.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {active.domain}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg border bg-sidebar-accent">
                    <Globe className="size-4 text-muted-foreground" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none text-left">
                    <span className="truncate font-medium">
                      {isError ? "Can't load projects" : "No projects yet"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Project
                    </span>
                  </div>
                </>
              )}
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side="bottom"
            align="start"
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Projects
            </DropdownMenuLabel>
            <DropdownMenuGroup>
              {companies.map((company) => (
                <DropdownMenuItem
                  key={company.id}
                  onClick={() => setActiveId(company.id)}
                >
                  <BrandLogo company={company} className="size-6" />
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate">{company.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {company.domain}
                    </span>
                  </div>
                  {company.id === active?.id && <Check className="ml-auto" />}
                </DropdownMenuItem>
              ))}
              {!isLoading && companies.length === 0 && (
                <DropdownMenuItem disabled>
                  <span className="text-muted-foreground">
                    {isError
                      ? "Backend unreachable"
                      : "No projects in this workspace"}
                  </span>
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setDialogOpen(true)}>
              <div className="flex size-6 items-center justify-center rounded-md border border-dashed">
                <Plus className="size-3.5" />
              </div>
              Add project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-sm">
            <form onSubmit={submit} className="flex flex-col gap-6">
              <DialogHeader>
                <DialogTitle>Add project</DialogTitle>
                <DialogDescription>
                  Track another brand&apos;s AI visibility. Counts toward your
                  plan&apos;s tracked-companies quota.
                </DialogDescription>
              </DialogHeader>
              <Field>
                <FieldLabel htmlFor="project-name">Name</FieldLabel>
                <Input
                  id="project-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Acme"
                  maxLength={120}
                  autoFocus
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="project-domain">Domain</FieldLabel>
                <Input
                  id="project-domain"
                  value={domain}
                  onChange={(e) =>
                    setDomain(
                      e.target.value.replace(/^https?:\/\/(www\.)?/i, "")
                    )
                  }
                  placeholder="acme.com"
                />
              </Field>
              {error && <p className="text-xs text-destructive">{error}</p>}
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={saving || !name.trim() || !domain.trim()}
                >
                  {saving ? (
                    <Spinner data-icon="inline-start" />
                  ) : (
                    <Plus data-icon="inline-start" />
                  )}
                  Add project
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
