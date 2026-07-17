// Billing / plan domain data.
// TODO: replace with GET /api/v1/billing + Stripe once the backend exists.

export type PlanId = "free" | "starter" | "growth" | "scale"

export interface Plan {
  id: PlanId
  name: string
  priceMonthly: number
  tagline: string
  promptsPerMonth: number
  trackedCompanies: number
  concurrentJobs: number
  providers: number
  features: string[]
  popular?: boolean
}

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    priceMonthly: 0,
    tagline: "Try AI visibility tracking",
    promptsPerMonth: 50,
    trackedCompanies: 1,
    concurrentJobs: 1,
    providers: 2,
    features: [
      "50 prompts / month",
      "1 tracked company",
      "2 AI providers",
      "7-day history",
    ],
  },
  {
    id: "starter",
    name: "Starter",
    priceMonthly: 49,
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
    ],
  },
  {
    id: "growth",
    name: "Growth",
    priceMonthly: 149,
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
      "API access",
    ],
  },
  {
    id: "scale",
    name: "Scale",
    priceMonthly: 449,
    tagline: "For agencies & large brands",
    promptsPerMonth: 25000,
    trackedCompanies: 50,
    concurrentJobs: 20,
    providers: 4,
    features: [
      "25,000 prompts / month",
      "50 tracked companies",
      "All 4 AI providers",
      "Unlimited history",
      "Competitor tracking",
      "Scheduled jobs",
      "Priority support",
      "SSO & audit logs",
    ],
  },
]

export interface Subscription {
  planId: PlanId
  status: "active" | "trialing" | "past_due" | "canceled"
  renewsAt: string // ISO
  usage: {
    promptsUsed: number
    companiesUsed: number
  }
}

export interface Invoice {
  id: string
  date: string // ISO
  amount: number
  status: "paid" | "open" | "void"
  description: string
}

export interface PaymentMethod {
  brand: string
  last4: string
  expMonth: number
  expYear: number
}

// Current mock account state — on the Growth plan.
export const SUBSCRIPTION: Subscription = {
  planId: "growth",
  status: "active",
  renewsAt: "2026-08-16T00:00:00Z",
  usage: {
    promptsUsed: 3120,
    companiesUsed: 4,
  },
}

export const PAYMENT_METHOD: PaymentMethod = {
  brand: "Visa",
  last4: "4242",
  expMonth: 8,
  expYear: 2027,
}

export const INVOICES: Invoice[] = [
  {
    id: "in_0072",
    date: "2026-07-16T00:00:00Z",
    amount: 149,
    status: "paid",
    description: "Growth plan — Jul 2026",
  },
  {
    id: "in_0061",
    date: "2026-06-16T00:00:00Z",
    amount: 149,
    status: "paid",
    description: "Growth plan — Jun 2026",
  },
  {
    id: "in_0053",
    date: "2026-05-16T00:00:00Z",
    amount: 149,
    status: "paid",
    description: "Growth plan — May 2026",
  },
  {
    id: "in_0044",
    date: "2026-04-16T00:00:00Z",
    amount: 49,
    status: "paid",
    description: "Starter plan — Apr 2026",
  },
]

export function getPlan(id: PlanId): Plan {
  return PLANS.find((p) => p.id === id) ?? PLANS[0]
}
