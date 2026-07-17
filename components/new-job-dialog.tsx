"use client"

import * as React from "react"
import { Check, Plus } from "lucide-react"

import {
  COUNTRIES,
  LANGUAGES,
  PROMPT_COUNTS,
  PROVIDERS,
  type NewJobInput,
  type ProviderId,
} from "@/types/job"
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { ProviderIcon } from "@/components/provider-icon"
import { cn } from "@/lib/utils"

const DEFAULT_PROMPT_COUNT = 20
const DEFAULT_LANGUAGE = "en"
const DEFAULT_COUNTRY = "US"
const DEFAULT_PROVIDERS: ProviderId[] = PROVIDERS.map((p) => p.id)

export function NewJobDialog({
  onCreate,
}: {
  onCreate: (input: NewJobInput) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [promptCount, setPromptCount] = React.useState(DEFAULT_PROMPT_COUNT)
  const [language, setLanguage] = React.useState(DEFAULT_LANGUAGE)
  const [country, setCountry] = React.useState(DEFAULT_COUNTRY)
  const [providers, setProviders] =
    React.useState<ProviderId[]>(DEFAULT_PROVIDERS)
  const [topic, setTopic] = React.useState("")

  const noProviders = providers.length === 0

  function reset() {
    setPromptCount(DEFAULT_PROMPT_COUNT)
    setLanguage(DEFAULT_LANGUAGE)
    setCountry(DEFAULT_COUNTRY)
    setProviders(DEFAULT_PROVIDERS)
    setTopic("")
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (noProviders) return

    const trimmedTopic = topic.trim()
    onCreate({
      promptCount,
      language,
      country,
      providers,
      topic: trimmedTopic === "" ? undefined : trimmedTopic,
    })
    reset()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus data-icon="inline-start" />
          New Job
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>New job</DialogTitle>
            <DialogDescription>
              Run a batch of prompts and see where your brand gets cited.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <Field>
              <FieldLabel>Number of prompts</FieldLabel>
              <ToggleGroup
                type="single"
                variant="outline"
                value={String(promptCount)}
                onValueChange={(value) => value && setPromptCount(Number(value))}
                className="grid w-full grid-cols-4 gap-2.5"
              >
                {PROMPT_COUNTS.map((count) => (
                  <ToggleGroupItem
                    key={count}
                    value={String(count)}
                    className="font-mono tabular-nums"
                  >
                    {count}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </Field>

            <div className="grid grid-cols-2 gap-2.5">
              <Field>
                <FieldLabel>Language</FieldLabel>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel>Country</FieldLabel>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field data-invalid={noProviders || undefined}>
              <FieldLabel>Providers</FieldLabel>
              <div
                role="group"
                aria-label="Providers"
                className="grid w-full grid-cols-2 gap-2.5"
              >
                {PROVIDERS.map((provider) => {
                  const selected = providers.includes(provider.id)
                  return (
                    <button
                      key={provider.id}
                      type="button"
                      role="checkbox"
                      aria-checked={selected}
                      onClick={() =>
                        setProviders((prev) =>
                          selected
                            ? prev.filter((id) => id !== provider.id)
                            : [...prev, provider.id]
                        )
                      }
                      className={cn(
                        "relative flex items-center gap-2.5 rounded-lg border p-3 text-sm font-medium transition-colors duration-150",
                        "focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
                        selected
                          ? "border-primary bg-primary/5 text-foreground"
                          : "border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      )}
                    >
                      <ProviderIcon provider={provider.id} />
                      {provider.label}
                      <span
                        aria-hidden
                        className={cn(
                          "ml-auto flex size-4 items-center justify-center rounded-full border transition-colors duration-150",
                          selected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-transparent"
                        )}
                      >
                        {selected && <Check className="size-3" />}
                      </span>
                    </button>
                  )
                })}
              </div>
              <FieldDescription>
                {noProviders
                  ? "Select at least one provider."
                  : "Prompts run against every selected provider."}
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="job-topic">
                Topic focus{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </FieldLabel>
              <Input
                id="job-topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. best rank-tracking tools"
              />
              <FieldDescription>
                Generated prompts will focus on this topic.
              </FieldDescription>
            </Field>
          </FieldGroup>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={noProviders}>
              Start job
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
