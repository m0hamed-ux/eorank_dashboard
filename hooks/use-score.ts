"use client"

import { useOrganization } from "@clerk/nextjs"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { ApiError } from "@/lib/api"
import { useApi } from "@/hooks/use-api"

/** Latest audit for a company. 404 = no audit yet (surfaced as `noAudit`,
 * not an error — new companies audit in the background and may lag). */
export function useScore(companyId: string | null) {
  const api = useApi()
  const { organization, isLoaded } = useOrganization()

  const query = useQuery({
    queryKey: ["score", organization?.id, companyId],
    queryFn: () => api.score.get(companyId!),
    enabled: isLoaded && organization !== null && companyId !== null,
    retry: false,
    // While the post-creation background audit runs, poll until it lands.
    refetchInterval: (q) =>
      q.state.error instanceof ApiError && q.state.error.status === 404
        ? 5000
        : false,
  })

  const noAudit =
    query.error instanceof ApiError && query.error.status === 404

  return { ...query, noAudit }
}

export function useRunAudit(companyId: string | null) {
  const api = useApi()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => api.score.audit(companyId!),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["score"] })
    },
  })
}

export function useToggleTip() {
  const api = useApi()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ tipId, done }: { tipId: string; done: boolean }) =>
      api.score.setTipDone(tipId, done),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["score"] })
    },
  })
}
