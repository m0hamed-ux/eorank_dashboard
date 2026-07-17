"use client"

import * as React from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { SettingRow } from "@/components/settings/setting-row"

interface NotificationSetting {
  id: string
  title: string
  description: string
  defaultOn: boolean
}

// TODO(api): load from GET /api/v1/settings/notifications
const NOTIFICATIONS: NotificationSetting[] = [
  {
    id: "job_completed",
    title: "Job completed",
    description: "A tracking job finishes and results are ready.",
    defaultOn: false,
  },
  {
    id: "job_failed",
    title: "Job failed",
    description: "A job fails or completes only partially.",
    defaultOn: true,
  },
  {
    id: "weekly_digest",
    title: "Weekly visibility digest",
    description: "A Monday summary of your citation rate and trend.",
    defaultOn: true,
  },
  {
    id: "competitor_overtake",
    title: "Competitor overtakes you",
    description: "A tracked competitor passes your visibility score.",
    defaultOn: true,
  },
  {
    id: "score_drop",
    title: "Score drops by 5+ points",
    description: "Your AI visibility score falls sharply between audits.",
    defaultOn: true,
  },
]

export function NotificationsTab() {
  const [enabled, setEnabled] = React.useState<Record<string, boolean>>(() =>
    NOTIFICATIONS.reduce(
      (acc, n) => ({ ...acc, [n.id]: n.defaultOn }),
      {} as Record<string, boolean>
    )
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email notifications</CardTitle>
        <CardDescription>
          Choose what EORank emails you about. Delivered to your account
          address.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col divide-y">
          {NOTIFICATIONS.map((n) => (
            <SettingRow key={n.id} title={n.title} description={n.description}>
              <Switch
                checked={enabled[n.id]}
                onCheckedChange={(checked) =>
                  // TODO(api): PATCH /api/v1/settings/notifications
                  setEnabled((prev) => ({ ...prev, [n.id]: checked }))
                }
                aria-label={n.title}
              />
            </SettingRow>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
