"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AccountTab } from "@/components/settings/account-tab"
import { DangerTab } from "@/components/settings/danger-tab"
import { NotificationsTab } from "@/components/settings/notifications-tab"
import { TrackingTab } from "@/components/settings/tracking-tab"
import { WorkspaceTab } from "@/components/settings/workspace-tab"

const TABS = ["account", "workspace", "tracking", "notifications", "danger"]

function SettingsTabs() {
  const searchParams = useSearchParams()
  const requested = searchParams.get("tab")
  const initial = requested && TABS.includes(requested) ? requested : "account"

  return (
    <Tabs defaultValue={initial} className="w-full">
      <TabsList className="max-w-full overflow-x-auto">
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="workspace">Workspace</TabsTrigger>
        <TabsTrigger value="tracking">Tracking</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="danger">Danger zone</TabsTrigger>
      </TabsList>

      {/* Clerk widget gets more room; forms stay at a readable measure. */}
      <TabsContent value="account" className="max-w-4xl">
        <AccountTab />
      </TabsContent>

      <TabsContent value="workspace" className="flex max-w-3xl flex-col gap-4">
        <WorkspaceTab />
      </TabsContent>

      <TabsContent value="tracking" className="flex max-w-3xl flex-col gap-4">
        <TrackingTab />
      </TabsContent>

      <TabsContent
        value="notifications"
        className="flex max-w-3xl flex-col gap-4"
      >
        <NotificationsTab />
      </TabsContent>

      <TabsContent value="danger" className="flex max-w-3xl flex-col gap-4">
        <DangerTab />
      </TabsContent>
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
