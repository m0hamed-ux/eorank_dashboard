"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AccountTab } from "@/components/settings/account-tab"
import { DangerTab } from "@/components/settings/danger-tab"
import { NotificationsTab } from "@/components/settings/notifications-tab"
import { TrackingTab } from "@/components/settings/tracking-tab"
import { WorkspaceTab } from "@/components/settings/workspace-tab"
import { useOrgRole } from "@/hooks/use-org-role"

// Personal tabs (everyone) vs workspace tabs (admin-only — they change
// tenant-wide config: brand profile, tracking defaults, deletion).
const MEMBER_TABS = ["account", "notifications"]
const ADMIN_TABS = ["account", "workspace", "tracking", "notifications", "danger"]

function SettingsTabs() {
  const searchParams = useSearchParams()
  const { isAdmin } = useOrgRole()

  const allowed = isAdmin ? ADMIN_TABS : MEMBER_TABS
  const requested = searchParams.get("tab")
  const initial = requested && allowed.includes(requested) ? requested : "account"

  return (
    <Tabs
      // Remount when the allowed set changes so a now-invalid active tab
      // falls back cleanly after Clerk hydrates the role.
      key={allowed.join(",")}
      defaultValue={initial}
      className="w-full"
    >
      <TabsList className="max-w-full overflow-x-auto">
        <TabsTrigger value="account">Account</TabsTrigger>
        {isAdmin && <TabsTrigger value="workspace">Workspace</TabsTrigger>}
        {isAdmin && <TabsTrigger value="tracking">Tracking</TabsTrigger>}
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        {isAdmin && <TabsTrigger value="danger">Danger zone</TabsTrigger>}
      </TabsList>

      {/* Clerk widget gets more room; forms stay at a readable measure. */}
      <TabsContent value="account" className="max-w-4xl">
        <AccountTab />
      </TabsContent>

      {isAdmin && (
        <TabsContent value="workspace" className="flex max-w-3xl flex-col gap-4">
          <WorkspaceTab />
        </TabsContent>
      )}

      {isAdmin && (
        <TabsContent value="tracking" className="flex max-w-3xl flex-col gap-4">
          <TrackingTab />
        </TabsContent>
      )}

      <TabsContent
        value="notifications"
        className="flex max-w-3xl flex-col gap-4"
      >
        <NotificationsTab />
      </TabsContent>

      {isAdmin && (
        <TabsContent value="danger" className="flex max-w-3xl flex-col gap-4">
          <DangerTab />
        </TabsContent>
      )}
    </Tabs>
  )
}

export default function SettingsPage() {
  // useSearchParams requires a Suspense boundary in Next.js.
  return (
    <React.Suspense fallback={null}>
      <SettingsTabs />
    </React.Suspense>
  )
}
