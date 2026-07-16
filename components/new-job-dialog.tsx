"use client"

import * as React from "react"
import { Plus } from "lucide-react"

import {
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

const DEFAULT_PROMPT_COUNT = 20
const DEFAULT_LANGUAGE = "en"
const DEFAULT_PROVIDERS: ProviderId[] = PROVIDERS.map((p) => p.id)

export function NewJobDialog({
  onCreate,
}: {
  onCreate: (input: NewJobInput) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [promptCount, setPromptCount] = React.useState(DEFAULT_PROMPT_COUNT)
  const [language, setLanguage] = React.useState(DEFAULT_LANGUAGE)
  const [providers, setProviders] =
    React.useState<ProviderId[]>(DEFAULT_PROVIDERS)
  const [topic, setTopic] = React.useState("")

  const noProviders = providers.length === 0

  function reset() {
    setPromptCount(DEFAULT_PROMPT_COUNT)
    setLanguage(DEFAULT_LANGUAGE)
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

            <Field data-invalid={noProviders || undefined}>
              <FieldLabel>Providers</FieldLabel>
              <ToggleGroup
                type="multiple"
                variant="outline"
                value={providers}
                onValueChange={(value) => setProviders(value as ProviderId[])}
                className="grid w-full grid-cols-2 gap-2.5"
              >
                {PROVIDERS.map((provider) => (
                  <ToggleGroupItem key={provider.id} value={provider.id}>
                    {provider.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
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
