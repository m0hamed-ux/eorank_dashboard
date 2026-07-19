"use client"

import * as React from "react"
import Image from "next/image"
import { useOrganization, useOrganizationList, useUser } from "@clerk/nextjs"
import {
  ArrowLeft,
  ArrowRight,
  Ellipsis,
  Globe,
  Newspaper,
  PencilLine,
  Sparkles,
  UsersRound,
  X,
} from "lucide-react"

import { ApiError, type CompanyType } from "@/lib/api"
import { cn } from "@/lib/utils"
import { useApi } from "@/hooks/use-api"
import {
  GoogleLogo,
  LinkedInLogo,
  ProductHuntLogo,
  RedditLogo,
  XLogo,
} from "@/components/referral-logos"
import { isValidDomain, normalizeDomain } from "@/types/competitor"

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
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

import { completeOnboarding } from "./_actions"
import { fetchSiteMetadata } from "./_metadata"

// Brand sources use the real logo; generic sources keep a muted lucide icon.
const REFERRAL_SOURCES = [
  { value: "Google search", icon: GoogleLogo, brand: true },
  { value: "X / Twitter", icon: XLogo, brand: true },
  { value: "LinkedIn", icon: LinkedInLogo, brand: true },
  { value: "Reddit", icon: RedditLogo, brand: true },
  { value: "Product Hunt", icon: ProductHuntLogo, brand: true },
  { value: "Friend or colleague", icon: UsersRound, brand: false },
  { value: "Blog or article", icon: Newspaper, brand: false },
  { value: "Other", icon: Ellipsis, brand: false },
]

// Values mirror the backend CompanyType enum.
const COMPANY_TYPES: { value: CompanyType; label: string }[] = [
  { value: "saas", label: "SaaS" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "agency", label: "Agency" },
  { value: "media", label: "Media / Publisher" },
  { value: "local", label: "Local business" },
  { value: "other", label: "Other" },
]

const ROLES = [
  "Founder / CEO",
  "Marketing",
  "SEO specialist",
  "Content",
  "Product",
  "Engineering",
  "Other",
]

const STEPS = [
  {
    title: "How did you find us?",
    description: "Helps us know where to show up for people like you.",
  },
  {
    title: "About your company",
    description: "We'll fetch the details from your site — you confirm them.",
  },
  {
    title: "What's your role?",
    description: "So we can speak your language.",
  },
  {
    title: "You're all set",
    description: "Review your answers and jump right in.",
  },
]

export default function OnboardingPage() {
  const { user } = useUser()
  const { organization } = useOrganization()
  const { isLoaded: orgListLoaded, createOrganization, setActive } =
    useOrganizationList()
  const api = useApi()

  const [step, setStep] = React.useState(0)
  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState("")

  const [referralSource, setReferralSource] = React.useState("")

  // Company step has two phases: enter the URL, then confirm fetched details.
  const [companyPhase, setCompanyPhase] = React.useState<"url" | "details">(
    "url"
  )
  const [fetching, setFetching] = React.useState(false)
  const [fetchFailed, setFetchFailed] = React.useState(false)
  const [companyWebsite, setCompanyWebsite] = React.useState("")
  const [companyName, setCompanyName] = React.useState("")
  const [companyDescription, setCompanyDescription] = React.useState("")
  const [companyLogo, setCompanyLogo] = React.useState<string | null>(null)
  const [companyType, setCompanyType] = React.useState<CompanyType | "">("")
  const [companyAliases, setCompanyAliases] = React.useState<string[]>([])
  const [aliasDraft, setAliasDraft] = React.useState("")

  const [role, setRole] = React.useState("")

  const domainValid = isValidDomain(normalizeDomain(companyWebsite))

  const stepValid = [
    referralSource !== "",
    companyPhase === "url"
      ? domainValid
      : companyName.trim() !== "" && companyType !== "",
    role !== "",
    true,
  ][step]

  const isLast = step === STEPS.length - 1

  async function fetchDetails() {
    setError("")
    setFetching(true)
    const result = await fetchSiteMetadata(companyWebsite)
    setFetching(false)

    if (!result.ok) {
      setError(result.error)
      setFetchFailed(true)
      return
    }

    setFetchFailed(false)
    setCompanyName(result.title)
    setCompanyDescription(result.description)
    setCompanyLogo(result.image)
    setCompanyAliases(result.aliases)
    setCompanyPhase("details")
  }

  function enterDetailsManually() {
    setError("")
    setFetchFailed(false)
    setCompanyLogo(null)
    const label = normalizeDomain(companyWebsite).split(".")[0]
    setCompanyAliases(label && label.length >= 2 ? [label] : [])
    setCompanyPhase("details")
  }

  function addAlias() {
    const alias = aliasDraft.trim().slice(0, 50)
    if (!alias) return
    if (companyAliases.length >= 10) return
    if (companyAliases.some((a) => a.toLowerCase() === alias.toLowerCase())) {
      setAliasDraft("")
      return
    }
    setCompanyAliases((prev) => [...prev, alias])
    setAliasDraft("")
  }

  function removeAlias(alias: string) {
    setCompanyAliases((prev) => prev.filter((a) => a !== alias))
  }

  function next() {
    setError("")
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  function back() {
    setError("")
    if (step === 1 && companyPhase === "details") {
      setCompanyPhase("url")
      return
    }
    setStep((s) => Math.max(s - 1, 0))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!stepValid || pending || fetching) return

    if (step === 1 && companyPhase === "url") {
      await fetchDetails()
      return
    }

    if (!isLast) {
      next()
      return
    }

    setError("")
    setPending(true)

    const domain = normalizeDomain(companyWebsite)

    // 1. Persist the questionnaire to Clerk user metadata.
    const res = await completeOnboarding({
      referralSource,
      companyName,
      companyWebsite: `https://${domain}`,
      companyType,
      role,
    })
    if (res.error) {
      setError(res.error)
      setPending(false)
      return
    }

    try {
      // 2. The backend scopes everything to a Clerk org — make sure one is
      //    active (the user just signed up, so usually none exists yet).
      if (!organization && orgListLoaded) {
        const org = await createOrganization({ name: companyName.trim() })
        await setActive({ organization: org.id })
      }

      // 3. Save the company to the EORank backend (Postgres).
      await api.companies.create({
        name: companyName.trim(),
        domain,
        description: companyDescription.trim() || null,
        type: companyType || "other",
        aliases: companyAliases,
        logo_url: companyLogo,
      })
    } catch (err) {
      // Already tracked (409) → onboarding was retried; that's fine.
      if (!(err instanceof ApiError && err.status === 409)) {
        setError(
          err instanceof ApiError
            ? err.message
            : "Could not save your company. Please try again."
        )
        setPending(false)
        return
      }
    }

    // Refresh the session token and the client-side user object, then do a
    // full navigation so nothing stale is reused. The org is on the Free plan
    // already (backend get_or_create) — /choose-plan offers the paid tiers.
    await user?.reload()
    window.location.assign("/choose-plan")
  }

  const summary = [
    { label: "Found us via", value: referralSource },
    { label: "Company", value: companyName },
    { label: "Website", value: `https://${normalizeDomain(companyWebsite)}` },
    {
      label: "Type",
      value: COMPANY_TYPES.find((t) => t.value === companyType)?.label ?? "—",
    },
    { label: "Role", value: role },
  ]

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-8">
      <div className="flex items-center gap-2.5">
        <Image
          src="/logo_main.svg"
          alt="EORank"
          width={32}
          height={32}
          className="rounded-lg"
        />
        <span className="text-lg font-semibold tracking-tight">EORank</span>
      </div>

      <Card className="w-full [--card-spacing:--spacing(6)] sm:[--card-spacing:--spacing(8)]">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-(--card-spacing)"
        >
          <CardHeader className="gap-1.5">
            <div className="mb-5 flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Step {step + 1} of {STEPS.length}
                </span>
                <span>{Math.round(((step + 1) / STEPS.length) * 100)}%</span>
              </div>
              <Progress value={((step + 1) / STEPS.length) * 100} />
            </div>
            <CardTitle className="text-xl">
              {step === 0 && user?.firstName
                ? `Welcome, ${user.firstName} 👋 — ${STEPS[0].title}`
                : STEPS[step].title}
            </CardTitle>
            <CardDescription>{STEPS[step].description}</CardDescription>
          </CardHeader>

          <CardContent>
            <div
              key={`${step}-${companyPhase}`}
              className="animate-in fade-in-0 slide-in-from-right-4 duration-300"
            >
              {step === 0 && (
                <ToggleGroup
                  type="single"
                  variant="outline"
                  value={referralSource}
                  onValueChange={(value) => value && setReferralSource(value)}
                  className="grid w-full grid-cols-2 gap-3"
                >
                  {REFERRAL_SOURCES.map((source) => (
                    <ToggleGroupItem
                      key={source.value}
                      value={source.value}
                      className="h-auto justify-start gap-3 px-4 py-3.5"
                    >
                      <source.icon
                        className={source.brand ? "" : "text-muted-foreground"}
                      />
                      {source.value}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              )}

              {step === 1 && companyPhase === "url" && (
                <Field>
                  <FieldLabel htmlFor="company-website">Website</FieldLabel>
                  <div className="flex w-full">
                    <span className="inline-flex h-8 shrink-0 items-center rounded-l-lg border border-r-0 border-input bg-muted px-2.5 text-sm text-muted-foreground select-none">
                      https://
                    </span>
                    <Input
                      id="company-website"
                      value={companyWebsite}
                      onChange={(e) => {
                        setFetchFailed(false)
                        setCompanyWebsite(
                          e.target.value.replace(/^https?:\/\/(www\.)?/i, "")
                        )
                      }}
                      placeholder="acme.com"
                      required
                      autoFocus
                      className="rounded-l-none"
                    />
                  </div>
                  <FieldDescription>
                    We&apos;ll read your site&apos;s title, description, and
                    logo — you can adjust them next.
                  </FieldDescription>
                </Field>
              )}

              {step === 1 && companyPhase === "details" && (
                <FieldGroup>
                  <div className="flex items-center gap-3 rounded-lg border bg-muted/40 px-3 py-2.5">
                    {companyLogo ? (
                      // Arbitrary external hosts — next/image needs an allowlist,
                      // so the preview uses a plain img on purpose.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={companyLogo}
                        alt="Site preview"
                        className="size-10 shrink-0 rounded-md border object-cover"
                      />
                    ) : (
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-md border bg-background">
                        <Globe className="size-4 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-medium">
                        {normalizeDomain(companyWebsite)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {companyLogo
                          ? "Icon from your site — used as your brand logo."
                          : "No icon found on your site."}
                      </span>
                    </div>
                  </div>

                  <Field>
                    <FieldLabel htmlFor="company-name">Company name</FieldLabel>
                    <Input
                      id="company-name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Acme Inc."
                      maxLength={120}
                      autoFocus
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="company-description">
                      Description
                    </FieldLabel>
                    <textarea
                      id="company-description"
                      value={companyDescription}
                      onChange={(e) => setCompanyDescription(e.target.value)}
                      placeholder="What does your company do?"
                      maxLength={2000}
                      rows={3}
                      className={cn(
                        "w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-base transition-colors outline-none",
                        "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
                      )}
                    />
                    <FieldDescription>
                      Used to generate realistic prompts for your niche.
                    </FieldDescription>
                  </Field>

                  <Field>
                    <FieldLabel>Company type</FieldLabel>
                    <Select
                      value={companyType}
                      onValueChange={(value) =>
                        setCompanyType(value as CompanyType)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {COMPANY_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="company-alias">Brand aliases</FieldLabel>
                    {companyAliases.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {companyAliases.map((alias) => (
                          <span
                            key={alias}
                            className="inline-flex items-center gap-1 rounded-full border py-0.5 pr-1 pl-2.5 text-xs font-medium"
                          >
                            {alias}
                            <button
                              type="button"
                              aria-label={`Remove alias ${alias}`}
                              onClick={() => removeAlias(alias)}
                              className="relative flex size-4 items-center justify-center rounded-full text-muted-foreground transition-colors after:absolute after:-inset-2 hover:bg-muted hover:text-foreground"
                            >
                              <X className="size-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Input
                        id="company-alias"
                        value={aliasDraft}
                        onChange={(e) => setAliasDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            addAlias()
                          }
                        }}
                        placeholder="Other names for your brand"
                        maxLength={50}
                        className="max-w-xs"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addAlias}
                        disabled={!aliasDraft.trim() || companyAliases.length >= 10}
                      >
                        Add
                      </Button>
                    </div>
                    <FieldDescription>
                      We&apos;ll also count citations that use these names.
                    </FieldDescription>
                  </Field>
                </FieldGroup>
              )}

              {step === 2 && (
                <ToggleGroup
                  type="single"
                  variant="outline"
                  value={role}
                  onValueChange={(value) => value && setRole(value)}
                  className="grid w-full grid-cols-2 gap-3"
                >
                  {ROLES.map((r) => (
                    <ToggleGroupItem
                      key={r}
                      value={r}
                      className="h-auto justify-start px-4 py-3.5"
                    >
                      {r}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              )}

              {step === 3 && (
                <div className="flex flex-col gap-5">
                  <div className="divide-y rounded-lg border">
                    {summary.map((row) => (
                      <div
                        key={row.label}
                        className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
                      >
                        <span className="text-muted-foreground">
                          {row.label}
                        </span>
                        <span className="truncate font-medium">
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>
                  <FieldDescription>
                    Ready? Your first prompt test is one click away.
                  </FieldDescription>
                </div>
              )}
            </div>

            {error && <FieldError className="mt-4">{error}</FieldError>}
            {fetchFailed && step === 1 && companyPhase === "url" && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={enterDetailsManually}
              >
                <PencilLine data-icon="inline-start" />
                Fill in the details manually
              </Button>
            )}
          </CardContent>

          <CardFooter className="justify-between px-(--card-spacing) py-5">
            <Button
              type="button"
              variant="ghost"
              onClick={back}
              className={step === 0 ? "invisible" : ""}
              disabled={pending || fetching}
            >
              <ArrowLeft data-icon="inline-start" />
              Back
            </Button>

            {isLast ? (
              <Button type="submit" disabled={pending}>
                {pending ? (
                  <Spinner data-icon="inline-start" />
                ) : (
                  <Sparkles data-icon="inline-start" />
                )}
                Test your first prompts
              </Button>
            ) : (
              <Button type="submit" disabled={!stepValid || fetching}>
                {fetching && <Spinner data-icon="inline-start" />}
                Next
                {!fetching && <ArrowRight data-icon="inline-end" />}
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
