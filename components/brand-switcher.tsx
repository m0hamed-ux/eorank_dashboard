"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Globe, Plus } from "lucide-react"

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
import { useBrands } from "@/hooks/use-brands"

// The sidebar's primary context switcher: which tracked BRAND (domain) the
// dashboard is scoped to. The workspace/org (team, billing) lives on /team —
// deliberately not here.
export function BrandSwitcher() {
  const { brands, active, setActive, addBrand } = useBrands()

  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [domain, setDomain] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const brand = addBrand(name, domain)
    if (!brand) {
      setError("Enter a brand name and a valid, not-yet-tracked domain.")
      return
    }
    setName("")
    setDomain("")
    setError(null)
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
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg border bg-sidebar-accent text-xs font-semibold uppercase">
                {active.name.slice(0, 2)}
              </div>
              <div className="flex flex-col gap-0.5 leading-none text-left">
                <span className="truncate font-medium">{active.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {active.domain}
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
              Brands
            </DropdownMenuLabel>
            <DropdownMenuGroup>
              {brands.map((brand) => (
                <DropdownMenuItem
                  key={brand.id}
                  onClick={() => setActive(brand.id)}
                >
                  <div className="flex size-6 items-center justify-center rounded-md border text-[10px] font-semibold uppercase">
                    {brand.name.slice(0, 2)}
                  </div>
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate">{brand.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {brand.domain}
                    </span>
                  </div>
                  {brand.id === active.id && <Check className="ml-auto" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setDialogOpen(true)}>
              <div className="flex size-6 items-center justify-center rounded-md border border-dashed">
                <Plus className="size-3.5" />
              </div>
              Add brand
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-sm">
            <form onSubmit={submit} className="flex flex-col gap-6">
              <DialogHeader>
                <DialogTitle>Add brand</DialogTitle>
                <DialogDescription>
                  Track another brand&apos;s AI visibility. Counts toward your
                  plan&apos;s tracked-companies quota.
                </DialogDescription>
              </DialogHeader>
              <Field>
                <FieldLabel htmlFor="brand-name">Brand name</FieldLabel>
                <Input
                  id="brand-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Acme"
                  autoFocus
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="brand-domain">Domain</FieldLabel>
                <Input
                  id="brand-domain"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="acme.com"
                />
              </Field>
              {error && <p className="text-xs text-destructive">{error}</p>}
              <DialogFooter>
                <Button type="submit" disabled={!name.trim() || !domain.trim()}>
                  <Globe data-icon="inline-start" />
                  Add brand
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
