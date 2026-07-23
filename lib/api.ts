// The single typed client for the FastAPI backend (per root CLAUDE.md:
// never call fetch to the backend ad hoc). Every request carries the Clerk
// session JWT; the backend derives the tenant (org_id) from the verified
// token — the client never sends it.

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

// ── Error envelope (mirrors backend app/core/errors.py) ─────────────────────

export interface ApiErrorBody {
  code: string
  message: string
  detail: Record<string, unknown>
  request_id: string | null
}

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly detail: Record<string, unknown>
  readonly requestId: string | null

  constructor(status: number, body: ApiErrorBody) {
    super(body.message)
    this.name = "ApiError"
    this.status = status
    this.code = body.code
    this.detail = body.detail
    this.requestId = body.request_id
  }
}

// ── Schemas (mirror backend app/schemas/*) ───────────────────────────────────

export type CompanyType =
  | "saas"
  | "ecommerce"
  | "agency"
  | "media"
  | "local"
  | "other"

export interface CompanyCreate {
  name: string
  domain: string
  description?: string | null
  type?: CompanyType
  aliases?: string[]
  logo_url?: string | null
}

export interface CompanyRead {
  id: string
  name: string
  domain: string
  description: string | null
  type: CompanyType
  aliases: string[]
  logo_url: string | null
  created_at: string
}

export interface Page<T> {
  items: T[]
  total: number
  limit: number
  offset: number
}

// ── Billing (mirrors backend app/schemas/billing.py) ────────────────────────

export type PlanId = "free" | "starter" | "growth" | "scale"
export type SelfServePlanId = "starter" | "growth"
export type SubscriptionStatus = "active" | "trialing" | "past_due" | "canceled"
export type BillingPeriod = "monthly" | "yearly"
export type InvoiceStatus = "paid" | "open" | "void"

export interface UsageMeterRead {
  used: number
  limit: number
}

export interface QuotaSnapshot {
  plan_id: PlanId
  prompts: UsageMeterRead
  companies: UsageMeterRead
  concurrent_jobs: { active: number; limit: number }
}

export interface SubscriptionRead {
  plan_id: PlanId
  status: SubscriptionStatus
  renews_at: string | null // ISO
  usage: QuotaSnapshot
}

export interface InvoiceRead {
  id: string
  date: string // ISO
  // Backend Decimal — pydantic serializes it as a string to keep precision.
  amount: string
  status: InvoiceStatus
  description: string | null
}

// ── Score / audit (mirrors backend app/schemas/score.py) ────────────────────

export type ScorePillarId =
  | "geo"
  | "aeo"
  | "authority"
  | "structured"
  | "content"
  | "freshness"
export type TipImpact = "high" | "medium" | "low"
export type TipEffort = "easy" | "medium" | "hard"

export interface PillarRead {
  pillar: ScorePillarId
  value: number
  delta: number | null
}

export interface TipRead {
  id: string
  title: string
  description: string
  pillar: ScorePillarId
  impact: TipImpact
  effort: TipEffort
  gain: number
  done: boolean
}

export interface ScoreRead {
  company_id: string
  overall: number
  grade: string
  delta: number | null
  audited_at: string // ISO
  pillars: PillarRead[]
  tips: TipRead[]
  history: { audited_at: string; overall: number }[]
}

// ── Core request helper ──────────────────────────────────────────────────────

type GetToken = () => Promise<string | null>

async function request<T>(
  getToken: GetToken,
  method: "GET" | "POST" | "PATCH" | "DELETE",
  path: string,
  body?: unknown
): Promise<T> {
  const token = await getToken()
  if (!token) {
    throw new ApiError(401, {
      code: "unauthorized",
      message: "Not signed in.",
      detail: {},
      request_id: null,
    })
  }

  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError(0, {
      code: "network_error",
      message: "Could not reach the EORank API. Is the backend running?",
      detail: {},
      request_id: null,
    })
  }

  if (!response.ok) {
    let errorBody: ApiErrorBody = {
      code: "unknown_error",
      message: `Request failed (${response.status}).`,
      detail: {},
      request_id: null,
    }
    try {
      const parsed = await response.json()
      if (parsed?.error) errorBody = parsed.error
    } catch {
      // non-JSON error body — keep the fallback
    }
    throw new ApiError(response.status, errorBody)
  }

  return (await response.json()) as T
}

// ── Typed endpoint surface ───────────────────────────────────────────────────

export function createApi(getToken: GetToken) {
  return {
    companies: {
      create: (input: CompanyCreate) =>
        request<CompanyRead>(getToken, "POST", "/api/v1/companies", input),
      list: (params?: { limit?: number; offset?: number }) => {
        const query = new URLSearchParams()
        if (params?.limit) query.set("limit", String(params.limit))
        if (params?.offset) query.set("offset", String(params.offset))
        const suffix = query.size ? `?${query}` : ""
        return request<Page<CompanyRead>>(
          getToken,
          "GET",
          `/api/v1/companies${suffix}`
        )
      },
      get: (id: string) =>
        request<CompanyRead>(getToken, "GET", `/api/v1/companies/${id}`),
    },
    billing: {
      overview: () =>
        request<SubscriptionRead>(getToken, "GET", "/api/v1/billing"),
      checkout: (input: { plan_id: SelfServePlanId; period: BillingPeriod }) =>
        request<{ checkout_url: string }>(
          getToken,
          "POST",
          "/api/v1/billing/checkout",
          input
        ),
      changePlan: (input: { plan_id: SelfServePlanId; period: BillingPeriod }) =>
        request<{ status: string }>(getToken, "POST", "/api/v1/billing/plan", input),
      cancel: () =>
        request<{ status: string }>(
          getToken,
          "DELETE",
          "/api/v1/billing/subscription"
        ),
      resume: () =>
        request<{ status: string }>(
          getToken,
          "POST",
          "/api/v1/billing/subscription/resume"
        ),
      portal: () =>
        request<{ portal_url: string }>(getToken, "POST", "/api/v1/billing/portal"),
      invoices: (params?: { limit?: number; offset?: number }) => {
        const query = new URLSearchParams()
        if (params?.limit) query.set("limit", String(params.limit))
        if (params?.offset) query.set("offset", String(params.offset))
        const suffix = query.size ? `?${query}` : ""
        return request<Page<InvoiceRead>>(
          getToken,
          "GET",
          `/api/v1/billing/invoices${suffix}`
        )
      },
    },
    score: {
      get: (companyId: string) =>
        request<ScoreRead>(
          getToken,
          "GET",
          `/api/v1/score?company_id=${encodeURIComponent(companyId)}`
        ),
      audit: (companyId: string) =>
        request<ScoreRead>(getToken, "POST", "/api/v1/score/audit", {
          company_id: companyId,
        }),
      setTipDone: (tipId: string, done: boolean) =>
        request<TipRead>(getToken, "PATCH", `/api/v1/score/tips/${tipId}`, {
          done,
        }),
    },
  }
}

export type Api = ReturnType<typeof createApi>
