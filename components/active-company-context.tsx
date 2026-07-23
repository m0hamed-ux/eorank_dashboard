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

export function ActiveCompanyProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { data, isLoading, isError } = useCompanies()
  const [activeId, setActiveId] = React.useState<string | null>(null)

  const companies = React.useMemo(() => data?.items ?? [], [data])
  const active =
    companies.find((company) => company.id === activeId) ?? companies[0] ?? null

  const value = React.useMemo(
    () => ({ companies, active, setActiveId, isLoading, isError }),
    [companies, active, isLoading, isError]
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
