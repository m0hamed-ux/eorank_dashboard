"use client"

import * as React from "react"
import { useAuth } from "@clerk/nextjs"

import { createApi, type Api } from "@/lib/api"

/** Client-component handle to the backend API, bound to the Clerk session.
 * skipCache matters after org changes: setActive() mints the org claim into
 * a NEW token, and the backend rejects tokens without one. */
export function useApi(): Api {
  const { getToken } = useAuth()
  return React.useMemo(
    () => createApi(() => getToken({ skipCache: true })),
    [getToken]
  )
}
