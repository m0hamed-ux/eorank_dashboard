"use client"

import * as React from "react"
import { useUser } from "@clerk/nextjs"

import { isValidDomain, normalizeDomain } from "@/types/competitor"

// UI label: "Brand". API entity: Company (backend `companies` table) — the
// tracked business/domain whose citations EORank measures. One workspace
// (Clerk org) tracks several brands, up to the plan's companies quota.
// TODO(api): GET /api/v1/companies + POST /api/v1/companies
export interface Brand {
  id: string
  name: string
  domain: string
}

export function useBrands() {
  const { user } = useUser()

  // Seed from onboarding answers (stored in Clerk publicMetadata).
  const seed = React.useMemo<Brand>(() => {
    const name =
      (user?.publicMetadata?.companyName as string | undefined)?.trim() ||
      "Your brand"
    const website =
      (user?.publicMetadata?.companyWebsite as string | undefined)?.trim() || ""
    const domain = website ? normalizeDomain(website) : "eorank.com"
    return { id: "brand_seed", name, domain }
  }, [user?.publicMetadata?.companyName, user?.publicMetadata?.companyWebsite])

  const [added, setAdded] = React.useState<Brand[]>([])
  const [activeId, setActiveId] = React.useState<string | null>(null)

  const brands = React.useMemo(() => [seed, ...added], [seed, added])
  const active =
    brands.find((brand) => brand.id === activeId) ?? brands[0]

  function addBrand(name: string, rawDomain: string): Brand | null {
    const domain = normalizeDomain(rawDomain)
    if (!name.trim() || !isValidDomain(domain)) return null
    if (brands.some((brand) => brand.domain === domain)) return null
    const brand: Brand = {
      id: `brand_${domain.replaceAll(".", "_")}`,
      name: name.trim(),
      domain,
    }
    setAdded((prev) => [...prev, brand])
    setActiveId(brand.id)
    return brand
  }

  return {
    brands,
    active,
    setActive: setActiveId,
    addBrand,
  }
}
