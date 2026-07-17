"use client"

import * as React from "react"
import { Check, Plus, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

// TODO(api): load from GET /api/v1/settings/workspace
const INITIAL_PROFILE = {
  name: "EORank",
  domain: "eorank.com",
  description: "AI citation tracking for SaaS, products, and agencies.",
  type: "saas",
}

const COMPANY_TYPES = [
  { value: "saas", label: "SaaS" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "agency", label: "Agency" },
  { value: "media", label: "Media" },
  { value: "local", label: "Local business" },
  { value: "other", label: "Other" },
]

// TODO(api): load from GET /api/v1/settings/workspace
const INITIAL_ALIASES = ["EORank", "EO Rank"]

export function WorkspaceTab() {
  const [profile, setProfile] = React.useState(INITIAL_PROFILE)
  const [saved, setSaved] = React.useState(false)
  const savedTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    return () => {
      if (savedTimer.current) clearTimeout(savedTimer.current)
    }
  }, [])

  function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    // TODO(api): PATCH /api/v1/settings/workspace with `profile`
    setSaved(true)
    if (savedTimer.current) clearTimeout(savedTimer.current)
    savedTimer.current = setTimeout(() => setSaved(false), 2000)
  }

  return (
    <>
      <Card>
        <form
          onSubmit={handleSave}
          className="flex flex-col gap-(--card-spacing)"
        >
          <CardHeader>
            <CardTitle>Company profile</CardTitle>
            <CardDescription>
              Context the agent uses to generate realistic prompts for your
              niche.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="company-name">Company name</FieldLabel>
                  <Input
                    id="company-name"
                    value={profile.name}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, name: e.target.value }))
                    }
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="company-domain">
                    Website domain
                  </FieldLabel>
                  <Input
                    id="company-domain"
                    className="font-mono"
                    value={profile.domain}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, domain: e.target.value }))
                    }
                    placeholder="example.com"
                  />
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="company-description">
                  Business description
                </FieldLabel>
                <textarea
                  id="company-description"
                  rows={3}
                  value={profile.description}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, description: e.target.value }))
                  }
                  className={cn(
                    "field-sizing-content min-h-16 w-full min-w-0 resize-none rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30"
                  )}
                  placeholder="One line describing what your business does."
                />
                <FieldDescription>
                  Kept short — one clear sentence produces the best prompts.
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="company-type">Company type</FieldLabel>
                <Select
                  value={profile.type}
                  onValueChange={(value) =>
                    setProfile((p) => ({ ...p, type: value }))
                  }
                >
                  <SelectTrigger id="company-type" className="w-full sm:w-64">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {COMPANY_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>
          </CardContent>
          <CardFooter className="gap-3">
            <Button type="submit">Save changes</Button>
            {saved && (
              <span className="flex items-center gap-1 text-xs font-medium text-success">
                <Check className="size-3.5" />
                Saved
              </span>
            )}
          </CardFooter>
        </form>
      </Card>

      <BrandAliasesCard />
    </>
  )
}

function BrandAliasesCard() {
  const [aliases, setAliases] = React.useState<string[]>(INITIAL_ALIASES)
  const [draft, setDraft] = React.useState("")

  function addAlias() {
    const value = draft.trim()
    if (value === "") return
    if (aliases.some((a) => a.toLowerCase() === value.toLowerCase())) {
      setDraft("")
      return
    }
    // TODO(api): PATCH /api/v1/settings/workspace aliases
    setAliases((prev) => [...prev, value])
    setDraft("")
  }

  function removeAlias(alias: string) {
    // TODO(api): PATCH /api/v1/settings/workspace aliases
    setAliases((prev) => prev.filter((a) => a !== alias))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Brand aliases</CardTitle>
        <CardDescription>
          Citation detection also matches these names, not just your exact
          brand — add spellings and variations LLMs might use.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {aliases.length === 0 ? (
          <p className="text-sm text-muted-foreground">No aliases yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {aliases.map((alias) => (
              <span
                key={alias}
                className="inline-flex items-center gap-1.5 rounded-full border py-0.5 pr-1 pl-2.5 text-xs font-medium"
              >
                <span className="font-mono">{alias}</span>
                <button
                  type="button"
                  aria-label={`Remove ${alias}`}
                  onClick={() => removeAlias(alias)}
                  className="relative flex size-4 items-center justify-center rounded-full text-muted-foreground transition-colors duration-150 after:absolute after:-inset-2 hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addAlias()
              }
            }}
            placeholder="Add an alias"
            className="max-w-xs"
            aria-label="New brand alias"
          />
          <Button
            type="button"
            variant="outline"
            onClick={addAlias}
            disabled={draft.trim() === ""}
          >
            <Plus data-icon="inline-start" />
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
