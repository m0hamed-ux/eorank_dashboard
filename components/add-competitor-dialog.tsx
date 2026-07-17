"use client"

import * as React from "react"
import { Plus } from "lucide-react"

import {
  isValidDomain,
  normalizeDomain,
  type NewCompetitorInput,
} from "@/types/competitor"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function AddCompetitorDialog({
  onAdd,
}: {
  onAdd: (input: NewCompetitorInput) => { ok: true } | { ok: false; error: string }
}) {
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [domain, setDomain] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)

  function reset() {
    setName("")
    setDomain("")
    setError(null)
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const normalized = normalizeDomain(domain)
    if (!isValidDomain(normalized)) {
      setError("Enter a valid domain, e.g. competitor.com")
      return
    }

    const result = onAdd({ name: name.trim() || normalized, domain: normalized })
    if (!result.ok) {
      setError(result.error)
      return
    }

    reset()
    setOpen(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) reset()
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus data-icon="inline-start" />
          Add Competitor
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Add competitor</DialogTitle>
            <DialogDescription>
              Track how often AI models cite this brand next to yours.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <Field data-invalid={!!error || undefined}>
              <FieldLabel htmlFor="competitor-domain">Domain</FieldLabel>
              <Input
                id="competitor-domain"
                value={domain}
                onChange={(e) => {
                  setDomain(e.target.value)
                  setError(null)
                }}
                placeholder="competitor.com"
                autoFocus
                required
              />
              {error ? (
                <FieldError>{error}</FieldError>
              ) : (
                <FieldDescription>
                  Citations are matched against this domain.
                </FieldDescription>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="competitor-name">
                Name{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </FieldLabel>
              <Input
                id="competitor-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Acme"
              />
              <FieldDescription>
                Also matched as a brand name in AI answers.
              </FieldDescription>
            </Field>
          </FieldGroup>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Add competitor</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
