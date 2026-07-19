import * as React from "react"
import Link from "next/link"
import { Lock } from "lucide-react"

import { getPlan, SUBSCRIPTION, type PlanId } from "@/lib/billing"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface PlanGateProps {
  feature:
    | "enhancementTips"
    | "weeklyAudit"
    | "scheduledJobs"
    | "apiAccess"
    | "rawResponses"
  children: React.ReactNode
  fallback?: React.ReactNode
}

const FEATURE_CONFIG = {
  enhancementTips: {
    title: "Enhancement Tips",
    description: "Get AI-powered recommendations to improve your visibility score.",
    requiredPlan: "starter" as PlanId,
    hasFeature: (plan: ReturnType<typeof getPlan>) => plan.hasEnhancementTips,
  },
  weeklyAudit: {
    title: "Weekly Score Audit",
    description: "Receive automated weekly score reports and trend analysis.",
    requiredPlan: "starter" as PlanId,
    hasFeature: (plan: ReturnType<typeof getPlan>) => plan.hasWeeklyAudit,
  },
  scheduledJobs: {
    title: "Scheduled Jobs",
    description:
      "Set up recurring citation tracking jobs on autopilot.",
    requiredPlan: "growth" as PlanId,
    hasFeature: (plan: ReturnType<typeof getPlan>) => plan.hasScheduledJobs,
  },
  apiAccess: {
    title: "API Access",
    description:
      "Integrate EORank data into your own tools and dashboards via our REST API.",
    requiredPlan: "scale" as PlanId,
    hasFeature: (plan: ReturnType<typeof getPlan>) => plan.hasApiAccess,
  },
  rawResponses: {
    title: "Raw Response Storage",
    description:
      "Access full LLM responses for deep analysis and retroactive re-detection.",
    requiredPlan: "growth" as PlanId,
    hasFeature: (plan: ReturnType<typeof getPlan>) => plan.hasRawResponses,
  },
} as const

export function PlanGate({ feature, children, fallback }: PlanGateProps) {
  const currentPlan = getPlan(SUBSCRIPTION.planId)
  const config = FEATURE_CONFIG[feature]
  const hasAccess = config.hasFeature(currentPlan)

  if (hasAccess) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  const requiredPlan = getPlan(config.requiredPlan)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <Lock className="size-4 text-muted-foreground" />
          {config.title}
        </CardTitle>
        <CardDescription>{config.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground">
          Available on the <span className="font-medium">{requiredPlan.name}</span> plan
          and above.
        </p>
        <Button asChild>
          <Link href="/billing">Upgrade plan</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
