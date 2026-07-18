"use client"

import * as React from "react"
import Image from "next/image"
import { useUser } from "@clerk/nextjs"
import {
  ArrowLeft,
  ArrowRight,
  Ellipsis,
  Newspaper,
  Sparkles,
  UsersRound,
} from "lucide-react"

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

const COMPANY_TYPES = [
  "SaaS",
  "E-commerce",
  "Agency",
  "Media / Publisher",
  "Local business",
  "Other",
]

const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-1000", "1000+"]

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
    description: "We'll tailor the analysis to your business.",
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
  const [step, setStep] = React.useState(0)
  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState("")

  const [referralSource, setReferralSource] = React.useState("")
  const [companyName, setCompanyName] = React.useState("")
  const [companyWebsite, setCompanyWebsite] = React.useState("")
  const [companyType, setCompanyType] = React.useState("")
  const [companySize, setCompanySize] = React.useState("")
  const [role, setRole] = React.useState("")

  const stepValid = [
    referralSource !== "",
    companyName.trim() !== "" &&
      isValidDomain(normalizeDomain(companyWebsite)) &&
      companyType !== "" &&
      companySize !== "",
    role !== "",
    true,
  ][step]

  const isLast = step === STEPS.length - 1

  function next() {
    setError("")
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  function back() {
    setError("")
    setStep((s) => Math.max(s - 1, 0))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!isLast) {
      if (stepValid) next()
      return
    }

    setError("")
    setPending(true)

    const res = await completeOnboarding({
      referralSource,
      companyName,
      // The https:// prefix is fixed in the UI; store the full URL.
      companyWebsite: `https://${normalizeDomain(companyWebsite)}`,
      companyType,
      companySize,
      role,
    })

    if (res.error) {
      setError(res.error)
      setPending(false)
      return
    }

    // Refresh the session token and the client-side user object,
    // then do a full navigation so nothing stale is reused.
    await user?.reload()
    window.location.assign("/")
  }

  const summary = [
    { label: "Found us via", value: referralSource },
    { label: "Company", value: companyName },
    { label: "Website", value: `https://${normalizeDomain(companyWebsite)}` },
    { label: "Type", value: companyType },
    { label: "Size", value: companySize },
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
              key={step}
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

              {step === 1 && (
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="company-name">Company name</FieldLabel>
                    <Input
                      id="company-name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Acme Inc."
                      autoFocus
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="company-website">Website</FieldLabel>
                    <div className="flex w-full">
                      <span className="inline-flex h-8 shrink-0 items-center rounded-l-lg border border-r-0 border-input bg-muted px-2.5 text-sm text-muted-foreground select-none">
                        https://
                      </span>
                      <Input
                        id="company-website"
                        value={companyWebsite}
                        onChange={(e) =>
                          // Strip a pasted scheme/www — the prefix is fixed.
                          setCompanyWebsite(
                            e.target.value.replace(/^https?:\/\/(www\.)?/i, "")
                          )
                        }
                        placeholder="acme.com"
                        required
                        className="rounded-l-none"
                      />
                    </div>
                    <FieldDescription>
                      We&apos;ll use it to analyze your visibility.
                    </FieldDescription>
                  </Field>

                  <Field>
                    <FieldLabel>Company type</FieldLabel>
                    <Select value={companyType} onValueChange={setCompanyType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {COMPANY_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <FieldLabel>Company size</FieldLabel>
                    <ToggleGroup
                      type="single"
                      variant="outline"
                      value={companySize}
                      onValueChange={(value) => value && setCompanySize(value)}
                      className="grid w-full grid-cols-3 gap-2.5 sm:grid-cols-5"
                    >
                      {COMPANY_SIZES.map((size) => (
                        <ToggleGroupItem key={size} value={size}>
                          {size}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
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

            {error && (
              <FieldError className="mt-4">{error}</FieldError>
            )}
          </CardContent>

          <CardFooter className="justify-between px-(--card-spacing) py-5">
            <Button
              type="button"
              variant="ghost"
              onClick={back}
              className={step === 0 ? "invisible" : ""}
              disabled={pending}
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
              <Button type="submit" disabled={!stepValid}>
                Next
                <ArrowRight data-icon="inline-end" />
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
