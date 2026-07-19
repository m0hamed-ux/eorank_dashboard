"use client"

import * as React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

// One QueryClient per browser session (created lazily inside state so SSR
// never shares a client between requests).
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: (failureCount, error) => {
              // Never retry auth/permission/validation failures.
              const status = (error as { status?: number }).status ?? 0
              if (status >= 400 && status < 500) return false
              return failureCount < 2
            },
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
