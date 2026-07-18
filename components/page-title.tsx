"use client"

import { usePathname } from "next/navigation"

const TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/score": "Score",
  "/citations": "Citations",
  "/analytics": "Analytics",
  "/jobs": "Jobs",
  "/competitors": "Competitors",
  "/team": "Team",
  "/settings": "Settings",
  "/billing": "Billing",
}

// Prefix titles for dynamic detail routes.
const PREFIXES: [string, string][] = [
  ["/jobs/", "Job details"],
  ["/citations/", "Citation details"],
]

export function PageTitle() {
  const pathname = usePathname()

  const title =
    TITLES[pathname] ??
    PREFIXES.find(([prefix]) => pathname.startsWith(prefix))?.[1] ??
    "EORank"

  return <h1 className="text-base font-semibold">{title}</h1>
}
