"use client"

import * as React from "react"
import { Download, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { SettingRow } from "@/components/settings/setting-row"

// TODO(api): workspace name comes from GET /api/v1/settings/workspace
const WORKSPACE_NAME = "EORank"

export function DangerTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Danger zone</CardTitle>
        <CardDescription>
          Irreversible actions for this workspace. Proceed carefully.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col divide-y">
          <SettingRow
            title="Export all data"
            description="Download every job, prompt, raw response, and citation result as JSON."
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                // TODO(api): POST /api/v1/settings/export — email a download link
              }}
            >
              <Download data-icon="inline-start" />
              Export
            </Button>
          </SettingRow>

          <SettingRow
            title="Delete workspace"
            description="Permanently remove this workspace, its tracked companies, jobs, and citation history."
          >
            <DeleteWorkspaceDialog />
          </SettingRow>
        </div>
      </CardContent>
    </Card>
  )
}

function DeleteWorkspaceDialog() {
  const [open, setOpen] = React.useState(false)
  const [confirmText, setConfirmText] = React.useState("")

  const confirmed = confirmText === WORKSPACE_NAME

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) setConfirmText("")
  }

  function handleDelete() {
    if (!confirmed) return
    // TODO(api): DELETE /api/v1/settings/workspace, then sign out + redirect
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" variant="destructive">
          <Trash2 data-icon="inline-start" />
          Delete workspace
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete workspace</DialogTitle>
          <DialogDescription>
            This permanently deletes{" "}
            <span className="font-mono text-foreground">{WORKSPACE_NAME}</span>{" "}
            along with all jobs, prompts, and citation history. This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <Field>
          <FieldLabel htmlFor="confirm-workspace-name">
            Type{" "}
            <span className="font-mono font-normal">{WORKSPACE_NAME}</span> to
            confirm
          </FieldLabel>
          <Input
            id="confirm-workspace-name"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={WORKSPACE_NAME}
            autoComplete="off"
            spellCheck={false}
            className="font-mono"
          />
        </Field>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            disabled={!confirmed}
            onClick={handleDelete}
          >
            Delete workspace
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
