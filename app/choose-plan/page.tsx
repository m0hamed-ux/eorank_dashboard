"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Check, ShieldCheck, Sparkles } from "lucide-react"

import { ApiError, type SelfServePlanId } from "@/lib/api"
import { PLANS, type Plan } from "@/lib/billing"
import { cn } from "@/lib/utils"
import { useAnimatedNumber } from "@/hooks/use-animated-number"
import { useCheckout } from "@/hooks/use-billing"
import { Spinner } from "@/components/ui/spinner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type Period = "yearly" | "monthly"

// Displayed price for a period: yearly shows the per-month equivalent
// (billed once), which is the number people compare.
function monthlyFor(plan: Plan, period: Period): number | null {
  if (plan.priceMonthly === null || plan.priceYearly === null) return null
  return period === "yearly" ? Math.round(plan.priceYearly / 12) : plan.priceMonthly
}

function AnimatedPrice({ value }: { value: number }) {
  const display = useAnimatedNumber(value)
  return (
    <span className="font-mono text-5xl font-semibold tracking-tight tabular-nums">
      ${display}
    </span>
  )
}

function BillingToggle({
  period,
  onChange,
}: {
  period: Period
  onChange: (period: Period) => void
}) {
  return (
    <div
      role="group"
      aria-label="Billing period"
      className="flex rounded-full border bg-muted p-1"
    >
      <button
        type="button"
        aria-pressed={period === "monthly"}
        onClick={() => onChange("monthly")}
        className={cn(
          "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
          period === "monthly"
            ? "bg-background text-foreground shadow-xs"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Monthly
      </button>
      <button
        type="button"
        aria-pressed={period === "yearly"}
        onClick={() => onChange("yearly")}
        className={cn(
          "flex items-center gap-1.5 rounded-full py-1.5 pr-1.5 pl-4 text-sm font-medium transition-colors",
          period === "yearly"
            ? "bg-background text-foreground shadow-xs"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Yearly
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap transition-colors",
            period === "yearly"
              ? "bg-success/10 text-success"
              : "bg-muted-foreground/10 text-muted-foreground"
          )}
        >
          2 months free
        </span>
      </button>
    </div>
  )
}

function PlanCard({
  plan,
  period,
  checkingOut,
  onCheckout,
}: {
  plan: Plan
  period: Period
  checkingOut: string | null
  onCheckout: (planId: SelfServePlanId) => void
}) {
  const price = monthlyFor(plan, period)
  const isCustom = price === null

  return (
    <Card
      className={cn(
        // overflow-visible: the Card primitive clips overflow by default,
        // which would hide the floating "Most popular" badge.
        "relative overflow-visible transition-transform duration-300",
        plan.popular &&
          "shadow-lg ring-2 ring-primary/50 md:scale-105"
      )}
    >
      {plan.popular && (
        <div className="absolute inset-x-0 -top-3.5 z-10 flex justify-center">
          <Badge className="border border-primary/20 bg-primary text-primary-foreground shadow-md p-1 px-2">
            Most popular
          </Badge>
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-sm font-medium">{plan.name}</CardTitle>
        <CardDescription className="text-xs">{plan.tagline}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="flex min-h-16 flex-col gap-0.5">
          {isCustom ? (
            <>
              <span className="text-2xl font-semibold tracking-tight">
                Custom
              </span>
              <span className="text-xs text-muted-foreground">
                Tailored quota, invoicing & onboarding
              </span>
            </>
          ) : (
            <>
              <div className="flex items-baseline gap-1">
                <AnimatedPrice value={price} />
                <span className="text-sm text-muted-foreground">/mo</span>
              </div>
              <span
                // Remount on period change for a soft crossfade under the counter.
                key={period}
                className="text-xs text-muted-foreground animate-in fade-in-0 duration-500"
              >
                {period === "yearly"
                  ? `Billed $${plan.priceYearly}/year — save $${
                      (plan.priceMonthly ?? 0) * 12 - (plan.priceYearly ?? 0)
                    }`
                  : "Billed monthly"}
              </span>
            </>
          )}
        </div>

        <ul className="flex flex-col gap-2">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm">
              <Check
                className={cn(
                  "mt-0.5 size-3.5 shrink-0",
                  plan.popular ? "text-primary" : "text-muted-foreground"
                )}
              />
              {feature}
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-2">
          {isCustom ? (
            <Button
              variant="outline"
              className="group w-full transition-all hover:border-primary/50 hover:text-primary active:scale-[0.98]"
              asChild
            >
              <a href="mailto:sales@eorank.com?subject=EORank%20Scale%20plan">
                Contact sales
                <ArrowRight
                  data-icon="inline-end"
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </a>
            </Button>
          ) : (
            <Button
              variant={plan.popular ? "default" : "outline"}
              className={cn(
                "group w-full transition-all active:scale-[0.98]",
                plan.popular
                  ? "shadow-md shadow-primary/30 hover:shadow-lg hover:shadow-primary/40 hover:brightness-110"
                  : "hover:border-primary/50 hover:text-primary"
              )}
              disabled={checkingOut !== null}
              onClick={() => onCheckout(plan.id as SelfServePlanId)}
            >
              {checkingOut === plan.id ? (
                <Spinner data-icon="inline-start" />
              ) : null}
              Start with {plan.name}
              {checkingOut !== plan.id && (
                <ArrowRight
                  data-icon="inline-end"
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                />
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Post-onboarding plan selection. The org is ALREADY on the Free plan at this
// point (the backend provisions free/active on first quota-checked request —
// SubscriptionRepository.get_or_create), so skipping this page loses nothing.
export default function ChoosePlanPage() {
  const [period, setPeriod] = React.useState<Period>("yearly")
  const [checkingOut, setCheckingOut] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const checkout = useCheckout()
  const paidPlans = PLANS.filter((plan) => plan.id !== "free")

  async function startCheckout(planId: SelfServePlanId) {
    setError(null)
    setCheckingOut(planId)
    try {
      // Redirects to Dodo's hosted checkout on success.
      await checkout.mutateAsync({ plan_id: planId, period })
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not start checkout. Please try again."
      )
      setCheckingOut(null)
    }
  }

  return (
    <div className="flex w-full max-w-4xl flex-col items-center gap-8">
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

      <div className="flex flex-col items-center gap-1.5 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          See your brand the way AI sees it
        </h1>
        <p className="max-w-md text-sm text-muted-foreground text-balance">
          Your workspace is ready. Pick how much visibility you want to track —
          switch or cancel anytime.
        </p>
      </div>

      <BillingToggle period={period} onChange={setPeriod} />

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid w-full gap-4 pt-2 md:grid-cols-3">
        {paidPlans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            period={period}
            checkingOut={checkingOut}
            onCheckout={startCheckout}
          />
        ))}
      </div>

      <div className="flex flex-col items-center gap-3 text-center">
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="size-3.5" />
          Cancel anytime · Secure checkout · Taxes handled for you
        </p>
        <p className="text-sm text-muted-foreground">
          Not ready yet?{" "}
          <Link
            href="/"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Continue with the Free plan
            <ArrowRight className="ml-1 inline size-3.5" />
          </Link>
        </p>
      </div>
    </div>
  )
}
