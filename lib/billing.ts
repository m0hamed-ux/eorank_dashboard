// The static plan CATALOG (prices, taglines, feature lists, gates) —
// display copy that mirrors backend app/core/plans.py. Live subscription
// state comes from GET /api/v1/billing via hooks/use-billing.ts.

export type PlanId = "free" | "starter" | "growth" | "scale"

export interface Plan {
  id: PlanId
  name: string
  priceMonthly: number | null // null = contact sales
  priceYearly: number | null // billed once per year (2 months free); null = contact sales
  tagline: string
  promptsPerMonth: number
  trackedCompanies: number
  concurrentJobs: number
  providers: number
  features: string[]
  popular?: boolean
  // Feature gates (docs/plans.md feature matrix).
  hasEnhancementTips: boolean
  hasWeeklyAudit: boolean
  hasScheduledJobs: boolean
  hasApiAccess: boolean
  hasRawResponses: boolean
}

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    priceMonthly: 0,
    priceYearly: 0,
    tagline: "Try AI visibility tracking",
    promptsPerMonth: 20,
    trackedCompanies: 1,
    concurrentJobs: 2,
    providers: 2,
    features: [
      "20 prompts / month",
      "1 tracked company",
      "2 AI providers",
      "7-day history",
    ],
    hasEnhancementTips: false,
    hasWeeklyAudit: false,
    hasScheduledJobs: false,
    hasApiAccess: false,
    hasRawResponses: false,
  },
  {
    id: "starter",
    name: "Starter",
    priceMonthly: 49,
    priceYearly: 490, // 2 months free
    tagline: "For solo founders & small sites",
    promptsPerMonth: 1000,
    trackedCompanies: 3,
    concurrentJobs: 2,
    providers: 4,
    features: [
      "1,000 prompts / month",
      "3 tracked companies",
      "All 4 AI providers",
      "30-day history",
      "Competitor tracking",
      "Enhancement tips",
      "Weekly score audit",
    ],
    hasEnhancementTips: true,
    hasWeeklyAudit: true,
    hasScheduledJobs: false,
    hasApiAccess: false,
    hasRawResponses: false,
  },
  {
    id: "growth",
    name: "Growth",
    priceMonthly: 149,
    priceYearly: 1490, // 2 months free
    tagline: "For growing marketing teams",
    promptsPerMonth: 5000,
    trackedCompanies: 10,
    concurrentJobs: 5,
    providers: 4,
    popular: true,
    features: [
      "5,000 prompts / month",
      "10 tracked companies",
      "All 4 AI providers",
      "1-year history",
      "Competitor tracking",
      "Scheduled jobs",
      "Raw response storage",
    ],
    hasEnhancementTips: true,
    hasWeeklyAudit: true,
    hasScheduledJobs: true,
    hasApiAccess: false,
    hasRawResponses: true,
  },
  {
    id: "scale",
    name: "Scale",
    priceMonthly: null, // Contact sales
    priceYearly: null,
    tagline: "For agencies & large brands",
    promptsPerMonth: 25000,
    trackedCompanies: 50,
    concurrentJobs: 20,
    providers: 4,
    features: [
      "25,000+ prompts / month",
      "50+ tracked companies",
      "All 4 AI providers",
      "Unlimited history",
      "API access",
      "Scheduled jobs",
      "SSO & audit logs",
      "Priority support + onboarding",
    ],
    hasEnhancementTips: true,
    hasWeeklyAudit: true,
    hasScheduledJobs: true,
    hasApiAccess: true,
    hasRawResponses: true,
  },
]

export function getPlan(id: PlanId): Plan {
  return PLANS.find((p) => p.id === id) ?? PLANS[0]
}

/** Mirrors backend QuotaService.get_effective_plan: past_due/canceled orgs
 * run on Free limits until payment recovers. UI gating only — the backend
 * re-verifies on every request. */
export function effectivePlanId(subscription: {
  plan_id: PlanId
  status: string
}): PlanId {
  return subscription.status === "active" || subscription.status === "trialing"
    ? subscription.plan_id
    : "free"
}
