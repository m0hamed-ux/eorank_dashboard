"use client"

import { useOrganization } from "@clerk/nextjs"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import type { BillingPeriod, SelfServePlanId } from "@/lib/api"
import { useApi } from "@/hooks/use-api"

/** Subscription + usage from GET /api/v1/billing, keyed by the active org.
 * Plan changes land via Dodo webhooks (seconds after a 202) — mutations
 * invalidate this query and callers may briefly poll. */
export function useBilling() {
  const api = useApi()
  const { organization, isLoaded } = useOrganization()

  return useQuery({
    queryKey: ["billing", organization?.id],
    queryFn: () => api.billing.overview(),
    enabled: isLoaded && organization !== null,
  })
}

export function useInvoices() {
  const api = useApi()
  const { organization, isLoaded } = useOrganization()

  return useQuery({
    queryKey: ["invoices", organization?.id],
    queryFn: () => api.billing.invoices({ limit: 50 }),
    enabled: isLoaded && organization !== null,
  })
}

function useInvalidateBilling() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: ["billing"] })
    void queryClient.invalidateQueries({ queryKey: ["invoices"] })
    // The webhook confirms a beat later — refetch again shortly.
    setTimeout(() => {
      void queryClient.invalidateQueries({ queryKey: ["billing"] })
    }, 4000)
  }
}

/** Redirects the browser to Dodo's hosted checkout on success. */
export function useCheckout() {
  const api = useApi()
  return useMutation({
    mutationFn: (input: { plan_id: SelfServePlanId; period: BillingPeriod }) =>
      api.billing.checkout(input),
    onSuccess: ({ checkout_url }) => {
      window.location.assign(checkout_url)
    },
  })
}

export function useChangePlan() {
  const api = useApi()
  const invalidate = useInvalidateBilling()
  return useMutation({
    mutationFn: (input: { plan_id: SelfServePlanId; period: BillingPeriod }) =>
      api.billing.changePlan(input),
    onSuccess: invalidate,
  })
}

export function useCancelSubscription() {
  const api = useApi()
  const invalidate = useInvalidateBilling()
  return useMutation({
    mutationFn: () => api.billing.cancel(),
    onSuccess: invalidate,
  })
}

export function useResumeSubscription() {
  const api = useApi()
  const invalidate = useInvalidateBilling()
  return useMutation({
    mutationFn: () => api.billing.resume(),
    onSuccess: invalidate,
  })
}

/** Opens Dodo's customer portal (card updates, receipts) in this tab. */
export function usePortal() {
  const api = useApi()
  return useMutation({
    mutationFn: () => api.billing.portal(),
    onSuccess: ({ portal_url }) => {
      window.location.assign(portal_url)
    },
  })
}
