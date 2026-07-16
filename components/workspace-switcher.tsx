"use client"

import * as React from "react"
import { useUser } from "@clerk/nextjs"
import { Building2, Check, ChevronsUpDown, Plus } from "lucide-react"

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

export function WorkspaceSwitcher() {
  const { user } = useUser()

  const defaultName =
    (user?.publicMetadata?.companyName as string | undefined) || "My workspace"

  const [workspaces, setWorkspaces] = React.useState<string[]>([])
  const [active, setActive] = React.useState(defaultName)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [newName, setNewName] = React.useState("")

  // Seed from the onboarding company name once the user loads.
  React.useEffect(() => {
    setWorkspaces((prev) => (prev.length === 0 ? [defaultName] : prev))
    setActive((prev) => (prev === "My workspace" ? defaultName : prev))
  }, [defaultName])

  function addWorkspace(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const name = newName.trim()
    if (!name) return
    setWorkspaces((prev) => (prev.includes(name) ? prev : [...prev, name]))
    setActive(name)
    setNewName("")
    setDialogOpen(false)
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
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg border bg-sidebar-accent">
                <Building2 className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none text-left">
                <span className="truncate font-medium">{active}</span>
                <span className="text-xs text-muted-foreground">
                  Workspace
                </span>
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
              {workspaces.map((workspace) => (
                <DropdownMenuItem
                  key={workspace}
                  onClick={() => setActive(workspace)}
                >
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    <Building2 className="size-3.5" />
                  </div>
                  <span className="truncate">{workspace}</span>
                  {workspace === active && <Check className="ml-auto" />}
                </DropdownMenuItem>
              ))}
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
                <Button type="submit" disabled={!newName.trim()}>
                  <Plus data-icon="inline-start" />
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
