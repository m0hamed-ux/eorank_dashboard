"use client"

import { usePathname } from "next/navigation"

const TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/score": "Score",
  "/citations": "Citations",
  "/analytics": "Analytics",
  "/jobs": "Jobs",
  "/competitors": "Competitors",
  "/settings": "Settings",
}

export function PageTitle() {
  const pathname = usePathname()

  return (
    <h1 className="text-base font-semibold">{TITLES[pathname] ?? "EORank"}</h1>
  )
}
