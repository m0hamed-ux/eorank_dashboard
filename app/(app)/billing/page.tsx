"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowUpDown,
  ExternalLink,
  ReceiptText,
  RefreshCw,
  TriangleAlert,
} from "lucide-react"

import { ApiError, type SubscriptionRead } from "@/lib/api"
import { effectivePlanId, getPlan } from "@/lib/billing"
import {
  useBilling,
  useCancelSubscription,
  useInvoices,
  usePortal,
  useResumeSubscription,
} from "@/hooks/use-billing"
import { AdminOnly } from "@/components/admin-only"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
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
} from "@/components/ui/dialog"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
})

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

// null price = custom / contact-sales tier (Scale).
function formatPrice(price: number | null): string {
  return price === null ? "Custom" : currency.format(price)
}

type BadgeVariant = React.ComponentProps<typeof Badge>["variant"]

const SUBSCRIPTION_STATUS: Record<
  SubscriptionRead["status"],
  { label: string; variant: BadgeVariant }
> = {
  active: { label: "Active", variant: "success" },
  trialing: { label: "Trialing", variant: "warning" },
  past_due: { label: "Past due", variant: "destructive" },
  canceled: { label: "Canceled", variant: "secondary" },
}

const INVOICE_STATUS: Record<string, { label: string; variant: BadgeVariant }> = {
  paid: { label: "Paid", variant: "success" },
  open: { label: "Open", variant: "warning" },
  void: { label: "Void", variant: "secondary" },
}

function UsageMeter({
  label,
  used,
  limit,
}: {
  label: string
  used: number
  limit: number
}) {
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0
  const nearLimit = pct > 80

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm">{label}</span>
        <span className="font-mono text-sm tabular-nums text-muted-foreground">
          {used.toLocaleString("en-US")} / {limit.toLocaleString("en-US")}
        </span>
      </div>
      <Progress value={pct} className="h-1.5" aria-label={`${label}: ${pct}%`} />
      {nearLimit && (
        <p className="flex items-center gap-1.5 text-xs text-warning">
          <TriangleAlert className="size-3.5 shrink-0" />
          You&apos;re approaching your monthly limit — consider upgrading.
        </p>
      )}
    </div>
  )
}

function BillingSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 xl:grid-cols-5">
        <Skeleton className="h-48 rounded-xl xl:col-span-3" />
        <Skeleton className="h-48 rounded-xl xl:col-span-2" />
      </div>
      <Skeleton className="h-72 rounded-xl" />
    </div>
  )
}

function InvoicesCard() {
  const { data, isLoading, isError } = useInvoices()
  const invoices = data?.items ?? []

  return (
    <Card className="xl:col-span-2">
      <CardHeader>
        <CardTitle>Invoices</CardTitle>
        <CardDescription>Billing history for this workspace</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        {isLoading ? (
          <div className="flex flex-col gap-3 px-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-8" />
            ))}
          </div>
        ) : isError ? (
          <Empty className="border-0">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <TriangleAlert />
              </EmptyMedia>
              <EmptyTitle>Couldn&apos;t load invoices</EmptyTitle>
              <EmptyDescription>
                Check that the backend is reachable, then try again.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : invoices.length === 0 ? (
          <Empty className="border-0">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ReceiptText />
              </EmptyMedia>
              <EmptyTitle>No invoices yet</EmptyTitle>
              <EmptyDescription>
                Your first invoice appears after your first paid billing cycle.
                Receipts and PDFs live in the billing portal.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4">Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="pr-4">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => {
                const invoiceStatus =
                  INVOICE_STATUS[invoice.status] ?? INVOICE_STATUS.open
                return (
                  <TableRow key={invoice.id}>
                    <TableCell className="pl-4 font-mono tabular-nums">
                      {dateFormatter.format(new Date(invoice.date))}
                    </TableCell>
                    <TableCell>{invoice.description ?? "Subscription payment"}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {currency.format(Number(invoice.amount))}
                    </TableCell>
                    <TableCell className="pr-4">
                      <Badge variant={invoiceStatus.variant}>
                        {invoiceStatus.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

function PortalCard({ hasBillingProfile }: { hasBillingProfile: boolean }) {
  const portal = usePortal()

  return (
    <Card className="self-start">
      <CardHeader>
        <CardTitle>Billing portal</CardTitle>
        <CardDescription>
          Update your card, download receipts, and manage your subscription in
          the secure Dodo Payments portal.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Button
          variant="outline"
          disabled={!hasBillingProfile || portal.isPending}
          onClick={() => portal.mutate()}
        >
          {portal.isPending ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <ExternalLink data-icon="inline-start" />
          )}
          Open portal
        </Button>
        {!hasBillingProfile && (
          <p className="text-xs text-muted-foreground">
            Available after your first subscription.
          </p>
        )}
        {portal.isError && (
          <p className="text-xs text-destructive">
            {portal.error instanceof ApiError
              ? portal.error.message
              : "Could not open the portal."}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export default function BillingPage() {
  // Billing is admin-only: plan changes, payment methods, and invoices are
  // workspace-level actions. The backend enforces the same rule from the JWT.
  return (
    <AdminOnly>
      <BillingContent />
    </AdminOnly>
  )
}

function BillingContent() {
  const { data, isLoading, isError, refetch } = useBilling()

  if (isLoading) return <BillingSkeleton />

  if (isError || !data) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <TriangleAlert />
          </EmptyMedia>
          <EmptyTitle>Couldn&apos;t load billing</EmptyTitle>
          <EmptyDescription>
            The EORank API is unreachable. Start the backend and try again.
          </EmptyDescription>
        </EmptyHeader>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw data-icon="inline-start" />
          Retry
        </Button>
      </Empty>
    )
  }

  return <BillingLoaded subscription={data} />
}

function BillingLoaded({ subscription }: { subscription: SubscriptionRead }) {
  const currentPlan = getPlan(subscription.plan_id)
  const effectiveId = effectivePlanId(subscription)
  const status = SUBSCRIPTION_STATUS[subscription.status]
  const renewsOn = subscription.renews_at
    ? dateFormatter.format(new Date(subscription.renews_at))
    : null
  const isPaid = effectiveId !== "free"

  const cancel = useCancelSubscription()
  const resume = useResumeSubscription()

  const [cancelOpen, setCancelOpen] = React.useState(false)
  // Local flag: the backend has no scheduled-cancel field; the Dodo portal
  // shows the authoritative state.
  const [cancelScheduled, setCancelScheduled] = React.useState(false)
  const [actionError, setActionError] = React.useState<string | null>(null)

  async function confirmCancel() {
    setActionError(null)
    try {
      await cancel.mutateAsync()
      setCancelScheduled(true)
      setCancelOpen(false)
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : "Could not cancel. Try again."
      )
    }
  }

  async function handleResume() {
    setActionError(null)
    try {
      await resume.mutateAsync()
      setCancelScheduled(false)
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : "Could not resume. Try again."
      )
    }
  }

  return (
    <>
      {subscription.status === "past_due" && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm">
          <TriangleAlert className="size-4 shrink-0 text-destructive" />
          <span>
            Your last payment failed — your workspace is on Free limits until
            it&apos;s resolved. Update your card in the billing portal.
          </span>
        </div>
      )}
      {cancelScheduled && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/40 px-4 py-3 text-sm">
          <span>
            Cancellation scheduled — your {currentPlan.name} plan stays active
            {renewsOn ? (
              <>
                {" "}
                until <span className="font-mono tabular-nums">{renewsOn}</span>
              </>
            ) : null}
            , then your workspace moves to Free.
          </span>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto"
            disabled={resume.isPending}
            onClick={handleResume}
          >
            {resume.isPending && <Spinner data-icon="inline-start" />}
            Resume subscription
          </Button>
        </div>
      )}
      {/* Current plan + usage */}
      <div className="grid gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle className="flex flex-wrap items-center gap-2">
              {currentPlan.name}
              <Badge>Current plan</Badge>
              <Badge variant={status.variant}>{status.label}</Badge>
            </CardTitle>
            <CardDescription>{currentPlan.tagline}</CardDescription>
            <CardAction className="flex items-center gap-2">
              {/* Upgrades/downgrades happen on the plans page. */}
              <Button variant="outline" asChild>
                <Link href="/choose-plan">
                  <ArrowUpDown data-icon="inline-start" />
                  {isPaid ? "Upgrade / downgrade" : "Upgrade"}
                </Link>
              </Button>
              {isPaid && !cancelScheduled && (
                <Button
                  variant="ghost"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setCancelOpen(true)}
                >
                  Cancel subscription
                </Button>
              )}
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-4xl font-semibold tracking-tight tabular-nums">
                {formatPrice(currentPlan.priceMonthly)}
              </span>
              <span className="text-sm text-muted-foreground">/mo</span>
            </div>
            {renewsOn && (
              <p className="text-xs text-muted-foreground">
                Renews on{" "}
                <span className="font-mono tabular-nums">{renewsOn}</span>
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Usage this cycle</CardTitle>
            <CardDescription>
              {renewsOn ? (
                <>
                  Resets on{" "}
                  <span className="font-mono tabular-nums">{renewsOn}</span>
                </>
              ) : (
                "Resets monthly"
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <UsageMeter
              label="Prompts used"
              used={subscription.usage.prompts.used}
              limit={subscription.usage.prompts.limit}
            />
            <UsageMeter
              label="Tracked companies"
              used={subscription.usage.companies.used}
              limit={subscription.usage.companies.limit}
            />
            <UsageMeter
              label="Running jobs"
              used={subscription.usage.concurrent_jobs.active}
              limit={subscription.usage.concurrent_jobs.limit}
            />
          </CardContent>
        </Card>
      </div>

      {/* Portal + invoices */}
      <div className="grid gap-4 xl:grid-cols-3">
        <PortalCard hasBillingProfile={subscription.plan_id !== "free"} />
        <InvoicesCard />
      </div>

      {/* Cancel subscription confirm */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel subscription?</DialogTitle>
            <DialogDescription>
              Your {currentPlan.name} plan stays active
              {renewsOn ? (
                <>
                  {" "}
                  until{" "}
                  <span className="font-mono tabular-nums">{renewsOn}</span>
                </>
              ) : null}
              , then your workspace moves to the Free plan (20 prompts/month, 1
              brand, 7-day history).
            </DialogDescription>
          </DialogHeader>
          {actionError && <p className="text-xs text-destructive">{actionError}</p>}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Keep subscription</Button>
            </DialogClose>
            <Button
              variant="destructive"
              disabled={cancel.isPending}
              onClick={confirmCancel}
            >
              {cancel.isPending && <Spinner data-icon="inline-start" />}
              Cancel subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </>
  )
}
