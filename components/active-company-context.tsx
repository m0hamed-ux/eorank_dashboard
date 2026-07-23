"use client"

import * as React from "react"

import type { CompanyRead } from "@/lib/api"
import { useCompanies } from "@/hooks/use-companies"

// The dashboard's cross-page context: WHICH tracked company (brand/project)
// the pages are scoped to. The sidebar brand switcher sets it; Score (and
// later Jobs/Citations) read it. Defaults to the most recent company.
interface ActiveCompanyValue {
  companies: CompanyRead[]
  active: CompanyRead | null
  setActiveId: (id: string) => void
  isLoading: boolean
  isError: boolean
}

const ActiveCompanyContext = React.createContext<ActiveCompanyValue | null>(null)

// Selection survives reloads via a cookie (readable by future server
// components too). Safe against hydration mismatch: until the companies
// query resolves, `active` is null on both server and client regardless of
// the cookie.
const COOKIE_NAME = "eorank_active_company"
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365

function readActiveCookie(): string | null {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`)
  )
  return match ? decodeURIComponent(match[1]) : null
}

export function ActiveCompanyProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { data, isLoading, isError } = useCompanies()
  const [activeId, setActiveIdState] = React.useState<string | null>(
    readActiveCookie
  )

  const setActiveId = React.useCallback((id: string) => {
    setActiveIdState(id)
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(id)}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`
  }, [])

  const companies = React.useMemo(() => data?.items ?? [], [data])
  // Cookie id may point at a deleted company (or another org's) — fall back
  // to the most recent one.
  const active =
    companies.find((company) => company.id === activeId) ?? companies[0] ?? null

  const value = React.useMemo(
    () => ({ companies, active, setActiveId, isLoading, isError }),
    [companies, active, setActiveId, isLoading, isError]
  )

  return (
    <ActiveCompanyContext.Provider value={value}>
      {children}
    </ActiveCompanyContext.Provider>
  )
}

export function useActiveCompany(): ActiveCompanyValue {
  const value = React.useContext(ActiveCompanyContext)
  if (value === null) {
    throw new Error("useActiveCompany must be used inside ActiveCompanyProvider")
  }
  return value
}
