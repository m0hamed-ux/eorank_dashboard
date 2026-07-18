"use client"

import * as React from "react"
import { useOrganization, useOrganizationList } from "@clerk/nextjs"
import { Building2, Check, ChevronsUpDown, Plus } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { Spinner } from "@/components/ui/spinner"

// Real Clerk organizations: the active org IS the tenant (org_id) the backend
// will scope every query by. Switching orgs switches the whole workspace.
export function WorkspaceSwitcher() {
  const { organization: activeOrg } = useOrganization()
  const { isLoaded, userMemberships, setActive, createOrganization } =
    useOrganizationList({ userMemberships: { infinite: true } })

  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [newName, setNewName] = React.useState("")
  const [creating, setCreating] = React.useState(false)

  const memberships = userMemberships?.data ?? []

  async function switchTo(orgId: string) {
    if (!isLoaded) return
    await setActive({ organization: orgId })
  }

  async function addWorkspace(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const name = newName.trim()
    if (!isLoaded || !name) return
    setCreating(true)
    try {
      const org = await createOrganization({ name })
      await setActive({ organization: org.id })
      await userMemberships?.revalidate?.()
      setNewName("")
      setDialogOpen(false)
    } finally {
      setCreating(false)
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
              {activeOrg ? (
                <Avatar className="size-8 rounded-lg">
                  <AvatarImage src={activeOrg.imageUrl} alt={activeOrg.name} />
                  <AvatarFallback className="rounded-lg">
                    {activeOrg.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg border bg-sidebar-accent">
                  <Building2 className="size-4" />
                </div>
              )}
              <div className="flex flex-col gap-0.5 leading-none text-left">
                <span className="truncate font-medium">
                  {activeOrg?.name ?? "No workspace"}
                </span>
                <span className="text-xs text-muted-foreground">Workspace</span>
              </div>
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
              Workspaces
            </DropdownMenuLabel>
            <DropdownMenuGroup>
              {memberships.map((membership) => {
                const org = membership.organization
                return (
                  <DropdownMenuItem
                    key={org.id}
                    onClick={() => switchTo(org.id)}
                  >
                    <Avatar className="size-6 rounded-md">
                      <AvatarImage src={org.imageUrl} alt={org.name} />
                      <AvatarFallback className="rounded-md text-[10px]">
                        {org.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate">{org.name}</span>
                    {org.id === activeOrg?.id && <Check className="ml-auto" />}
                  </DropdownMenuItem>
                )
              })}
              {isLoaded && memberships.length === 0 && (
                <DropdownMenuItem disabled>
                  <span className="text-muted-foreground">
                    No workspaces yet
                  </span>
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setDialogOpen(true)}>
              <div className="flex size-6 items-center justify-center rounded-md border border-dashed">
                <Plus className="size-3.5" />
              </div>
              Add workspace
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-sm">
            <form onSubmit={addWorkspace} className="flex flex-col gap-6">
              <DialogHeader>
                <DialogTitle>Add workspace</DialogTitle>
                <DialogDescription>
                  Create a new workspace to track another brand or site.
                  You&apos;ll be its admin.
                </DialogDescription>
              </DialogHeader>
              <Field>
                <FieldLabel htmlFor="workspace-name">Name</FieldLabel>
                <Input
                  id="workspace-name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Acme Inc."
                  autoFocus
                />
              </Field>
              <DialogFooter>
                <Button type="submit" disabled={creating || !newName.trim()}>
                  {creating ? (
                    <Spinner data-icon="inline-start" />
                  ) : (
                    <Plus data-icon="inline-start" />
                  )}
                  Create workspace
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
