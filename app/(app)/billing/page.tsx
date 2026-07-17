"use client"

import * as React from "react"
import {
  Check,
  CreditCard,
  Download,
  ReceiptText,
  TriangleAlert,
} from "lucide-react"

// TODO: replace mock data with GET /api/v1/billing (subscription, usage, payment method, invoices)
// once the FastAPI backend + Stripe integration exist.
import {
  getPlan,
  INVOICES,
  PAYMENT_METHOD,
  PLANS,
  SUBSCRIPTION,
  type Invoice,
  type Plan,
  type Subscription,
} from "@/lib/billing"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

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

type BadgeVariant = React.ComponentProps<typeof Badge>["variant"]

const SUBSCRIPTION_STATUS: Record<
  Subscription["status"],
  { label: string; variant: BadgeVariant }
> = {
  active: { label: "Active", variant: "success" },
  trialing: { label: "Trialing", variant: "warning" },
  past_due: { label: "Past due", variant: "destructive" },
  canceled: { label: "Canceled", variant: "secondary" },
}

const INVOICE_STATUS: Record<
  Invoice["status"],
  { label: string; variant: BadgeVariant }
> = {
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

export default function BillingPage() {
  const currentPlan = getPlan(SUBSCRIPTION.planId)
  const status = SUBSCRIPTION_STATUS[SUBSCRIPTION.status]
  const renewsOn = dateFormatter.format(new Date(SUBSCRIPTION.renewsAt))

  const plansRef = React.useRef<HTMLDivElement>(null)
  const [cancelOpen, setCancelOpen] = React.useState(false)
  const [planDialog, setPlanDialog] = React.useState<Plan | null>(null)

  const isUpgrade =
    planDialog !== null && planDialog.priceMonthly > currentPlan.priceMonthly

  function confirmPlanChange() {
    // TODO: POST /api/v1/billing/plan { planId } — Stripe subscription update + proration.
    setPlanDialog(null)
  }

  function confirmCancel() {
    // TODO: DELETE /api/v1/billing/subscription — cancels at period end via Stripe.
    setCancelOpen(false)
  }

  return (
    <>
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
              <Button
                variant="outline"
                onClick={() =>
                  plansRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  })
                }
              >
                Change plan
              </Button>
              <Button
                variant="ghost"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setCancelOpen(true)}
              >
                Cancel subscription
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-4xl font-semibold tracking-tight tabular-nums">
                {currency.format(currentPlan.priceMonthly)}
              </span>
              <span className="text-sm text-muted-foreground">/mo</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Renews on{" "}
              <span className="font-mono tabular-nums">{renewsOn}</span>
            </p>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Usage this cycle</CardTitle>
            <CardDescription>
              Resets on <span className="font-mono tabular-nums">{renewsOn}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <UsageMeter
              label="Prompts used"
              used={SUBSCRIPTION.usage.promptsUsed}
              limit={currentPlan.promptsPerMonth}
            />
            <UsageMeter
              label="Tracked companies"
              used={SUBSCRIPTION.usage.companiesUsed}
              limit={currentPlan.trackedCompanies}
            />
          </CardContent>
        </Card>
      </div>

      {/* Plans grid */}
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-medium">Plans</h2>
        <p className="text-xs text-muted-foreground">
          Switch anytime — changes take effect at the next billing cycle.
        </p>
      </div>
      <div
        ref={plansRef}
        className="grid scroll-mt-4 gap-4 md:grid-cols-2 xl:grid-cols-4"
      >
        {PLANS.map((plan) => {
          const isCurrent = plan.id === SUBSCRIPTION.planId
          return (
            <Card
              key={plan.id}
              className={cn(plan.popular && "ring-primary/40")}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  {plan.name}
                  {plan.popular && <Badge>Popular</Badge>}
                </CardTitle>
                <CardDescription className="text-xs">
                  {plan.tagline}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-4">
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-4xl font-semibold tracking-tight tabular-nums">
                    {currency.format(plan.priceMonthly)}
                  </span>
                  <span className="text-xs text-muted-foreground">/mo</span>
                </div>
                <ul className="flex flex-col gap-2">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm"
                    >
                      <Check className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-2">
                  {isCurrent ? (
                    <Button variant="outline" className="w-full" disabled>
                      Current plan
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setPlanDialog(plan)}
                    >
                      {plan.priceMonthly > currentPlan.priceMonthly
                        ? "Upgrade"
                        : "Downgrade"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Payment method + invoices */}
      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="self-start">
          <CardHeader>
            <CardTitle>Payment method</CardTitle>
            <CardDescription>Charged on each renewal</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <CreditCard className="size-4" />
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {PAYMENT_METHOD.brand}{" "}
                  <span className="font-mono tabular-nums">
                    •••• {PAYMENT_METHOD.last4}
                  </span>
                </span>
                <span className="text-xs text-muted-foreground">
                  Expires{" "}
                  <span className="font-mono tabular-nums">
                    {String(PAYMENT_METHOD.expMonth).padStart(2, "0")}/
                    {PAYMENT_METHOD.expYear}
                  </span>
                </span>
              </div>
            </div>
            {/* TODO: open a Stripe SetupIntent flow to update the card. */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" aria-disabled className="opacity-50">
                  Update
                </Button>
              </TooltipTrigger>
              <TooltipContent>Coming soon</TooltipContent>
            </Tooltip>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
            <CardDescription>Billing history for this workspace</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            {INVOICES.length === 0 ? (
              <Empty className="border-0">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <ReceiptText />
                  </EmptyMedia>
                  <EmptyTitle>No invoices yet</EmptyTitle>
                  <EmptyDescription>
                    Your first invoice appears after your first paid billing
                    cycle.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-4">Invoice</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="pr-4 text-right">
                      <span className="sr-only">Download</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {INVOICES.map((invoice) => {
                    const invoiceStatus = INVOICE_STATUS[invoice.status]
                    return (
                      <TableRow key={invoice.id}>
                        <TableCell className="pl-4 font-mono tabular-nums">
                          {invoice.id}
                        </TableCell>
                        <TableCell className="font-mono tabular-nums">
                          {dateFormatter.format(new Date(invoice.date))}
                        </TableCell>
                        <TableCell>{invoice.description}</TableCell>
                        <TableCell className="text-right font-mono tabular-nums">
                          {currency.format(invoice.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={invoiceStatus.variant}>
                            {invoiceStatus.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="pr-4 text-right">
                          {/* TODO: GET /api/v1/billing/invoices/{id}/pdf (Stripe hosted invoice URL) */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label={`Download invoice ${invoice.id}`}
                              >
                                <Download />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Download PDF</TooltipContent>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cancel subscription confirm */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel subscription?</DialogTitle>
            <DialogDescription>
              Your {currentPlan.name} plan stays active until{" "}
              <span className="font-mono tabular-nums">{renewsOn}</span>, then
              your workspace moves to the Free plan. Tracking beyond Free plan
              limits will pause and history older than 7 days becomes
              unavailable.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Keep subscription</Button>
            </DialogClose>
            <Button variant="destructive" onClick={confirmCancel}>
              Cancel subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Plan change confirm */}
      <Dialog
        open={planDialog !== null}
        onOpenChange={(open) => {
          if (!open) setPlanDialog(null)
        }}
      >
        <DialogContent>
          {planDialog && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {isUpgrade ? "Upgrade" : "Downgrade"} to {planDialog.name}?
                </DialogTitle>
                <DialogDescription>
                  Your subscription changes from {currentPlan.name} (
                  <span className="font-mono tabular-nums">
                    {currency.format(currentPlan.priceMonthly)}
                  </span>
                  /mo) to {planDialog.name} (
                  <span className="font-mono tabular-nums">
                    {currency.format(planDialog.priceMonthly)}
                  </span>
                  /mo). The new limits apply at the next billing cycle.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={confirmPlanChange}>
                  Confirm {isUpgrade ? "upgrade" : "downgrade"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
