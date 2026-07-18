"use client"

import { useOrganization } from "@clerk/nextjs"

// Clerk default org roles. Custom roles (org:billing_manager, ...) would come
// from the Clerk dashboard; the backend will re-verify roles from the JWT —
// this hook is UI gating only, never a security boundary.
export const ORG_ROLES = [
  { value: "org:admin", label: "Admin" },
  { value: "org:member", label: "Member" },
] as const

export function roleLabel(role: string | undefined | null): string {
  if (!role) return "Member"
  const known = ORG_ROLES.find((r) => r.value === role)
  if (known) return known.label
  const raw = role.replace(/^org:/, "").replaceAll("_", " ")
  return raw.charAt(0).toUpperCase() + raw.slice(1)
}

/**
 * Current user's role in the active Clerk organization.
 *
 * - `isLoaded` false → Clerk still hydrating; render skeletons, don't gate yet.
 * - `organization` null → user has no active org (Team page prompts creation).
 * - `isAdmin` gates admin-only UI: Billing, workspace/tracking/danger settings,
 *   member management.
 */
export function useOrgRole() {
  const { isLoaded, organization, membership } = useOrganization()

  const role = membership?.role ?? null

  return {
    isLoaded,
    organization,
    membership,
    role,
    roleLabel: roleLabel(role),
    isAdmin: role === "org:admin",
  }
}
