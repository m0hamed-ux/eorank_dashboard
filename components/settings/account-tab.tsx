"use client"

import { UserProfile } from "@clerk/nextjs"

// Clerk-powered account management: profile, email addresses, password,
// connected accounts, active sessions, MFA. Clerk owns this data — we only
// theme it to match the EORank design tokens.
//
// `appearance` maps Clerk's slots onto our CSS variables so the embedded
// widget reads as part of the dashboard, not a bolted-on iframe.

export function AccountTab() {
  return (
    <UserProfile
      routing="hash"
      appearance={{
        variables: {
          colorPrimary: "#7c4dff",
          colorForeground: "var(--foreground)",
          colorMutedForeground: "var(--muted-foreground)",
          colorBackground: "var(--card)",
          colorInput: "var(--background)",
          colorInputForeground: "var(--foreground)",
          colorDanger: "var(--destructive)",
          colorBorder: "var(--border)",
          colorRing: "#7c4dff",
          borderRadius: "0.625rem",
          fontFamily: "var(--font-sans)",
        },
        elements: {
          // Drop Clerk's own outer card so it inherits our tab surface.
          rootBox: "w-full",
          cardBox:
            "w-full max-w-none rounded-xl border border-border bg-card ring-1 ring-foreground/10",
          navbar: "border-border",
          footer: "hidden",
        },
      }}
    />
  )
}
