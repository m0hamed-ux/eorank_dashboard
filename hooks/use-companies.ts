"use client"

import { useOrganization } from "@clerk/nextjs"
import { useQuery } from "@tanstack/react-query"

import { useApi } from "@/hooks/use-api"

/**
 * The org's tracked companies (shown in the UI as "brands"), fetched from
 * GET /api/v1/companies. The query key includes the ACTIVE ORG id, so
 * switching workspaces refetches and one org's list is never shown while
 * another org is active — client-side mirror of the backend tenancy rule.
 */
export function useCompanies() {
  const api = useApi()
  const { organization, isLoaded } = useOrganization()

  return useQuery({
    queryKey: ["companies", organization?.id],
    queryFn: () => api.companies.list({ limit: 50 }),
    // No org → no tenant → the backend would 403; don't even ask.
    enabled: isLoaded && organization !== null,
  })
}
