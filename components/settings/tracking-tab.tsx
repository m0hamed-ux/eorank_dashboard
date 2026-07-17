"use client"

import * as React from "react"

import {
  COUNTRIES,
  LANGUAGES,
  PROMPT_COUNTS,
  PROVIDERS,
  type ProviderId,
} from "@/types/job"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { ProviderIcon } from "@/components/provider-icon"
import { SettingRow } from "@/components/settings/setting-row"

// TODO(api): load defaults from GET /api/v1/settings/tracking
const DEFAULT_PROMPT_COUNT = 20
const DEFAULT_LANGUAGE = "en"
const DEFAULT_COUNTRY = "US"

const FREQUENCIES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
]

export function TrackingTab() {
  const [promptCount, setPromptCount] = React.useState(DEFAULT_PROMPT_COUNT)
  const [language, setLanguage] = React.useState(DEFAULT_LANGUAGE)
  const [country, setCountry] = React.useState(DEFAULT_COUNTRY)
  const [providers, setProviders] = React.useState<Record<ProviderId, boolean>>(
    () =>
      PROVIDERS.reduce(
        (acc, p) => ({ ...acc, [p.id]: true }),
        {} as Record<ProviderId, boolean>
      )
  )

  const [autoRun, setAutoRun] = React.useState(false)
  const [frequency, setFrequency] = React.useState("weekly")

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Default job settings</CardTitle>
          <CardDescription>
            Used to prefill every new tracking job — you can still change them
            per job.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <Field>
            <FieldLabel>Number of prompts</FieldLabel>
            <ToggleGroup
              type="single"
              variant="outline"
              value={String(promptCount)}
              onValueChange={(value) => {
                // TODO(api): PATCH /api/v1/settings/tracking
                if (value) setPromptCount(Number(value))
              }}
              className="grid w-full max-w-md grid-cols-4 gap-2.5"
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

          <div className="grid gap-5 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="default-language">Language</FieldLabel>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="default-language" className="w-full">
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
              <FieldLabel htmlFor="default-country">Country</FieldLabel>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger id="default-country" className="w-full">
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

          <Field>
            <FieldLabel>Default providers</FieldLabel>
            <div className="flex flex-col divide-y rounded-lg border px-3">
              {PROVIDERS.map((provider) => (
                <div
                  key={provider.id}
                  className="flex items-center gap-3 py-3"
                >
                  <ProviderIcon
                    provider={provider.id}
                    className="text-muted-foreground"
                  />
                  <span className="text-sm font-medium">{provider.label}</span>
                  <Switch
                    checked={providers[provider.id]}
                    onCheckedChange={(checked) =>
                      // TODO(api): PATCH /api/v1/settings/tracking
                      setProviders((prev) => ({
                        ...prev,
                        [provider.id]: checked,
                      }))
                    }
                    aria-label={`Enable ${provider.label} by default`}
                    className="ml-auto"
                  />
                </div>
              ))}
            </div>
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scheduling</CardTitle>
          <CardDescription>
            Automatically re-run tracking so your visibility trend stays fresh.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <SettingRow
            title="Run tracking job automatically"
            description="Scheduled jobs count toward your monthly prompt quota."
          >
            <Switch
              checked={autoRun}
              onCheckedChange={(checked) => {
                // TODO(api): PATCH /api/v1/settings/tracking
                setAutoRun(checked)
              }}
              aria-label="Run tracking job automatically"
            />
          </SettingRow>

          <Field>
            <FieldLabel htmlFor="schedule-frequency">Frequency</FieldLabel>
            <Select
              value={frequency}
              onValueChange={setFrequency}
              disabled={!autoRun}
            >
              <SelectTrigger
                id="schedule-frequency"
                className="w-full sm:w-64"
                disabled={!autoRun}
              >
                <SelectValue placeholder="Select a frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {FREQUENCIES.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        </CardContent>
      </Card>
    </>
  )
}
