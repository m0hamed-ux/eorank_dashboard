import { cn } from "@/lib/utils"

// Vertical tick-strip meter (the "model usage" viz in the design reference):
// a row of thin bars where the first `filled` fraction is colored.

export function BarStrip({
  value, // 0-100
  bars = 40,
  className,
}: {
  value: number
  bars?: number
  className?: string
}) {
  const filled = Math.round((value / 100) * bars)

  return (
    <div
      role="meter"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("flex h-8 items-stretch gap-[3px]", className)}
    >
      {Array.from({ length: bars }, (_, i) => (
        <span
          key={i}
          className={cn(
            "w-[3px] flex-1 rounded-full",
            i < filled ? "bg-primary" : "bg-muted"
          )}
        />
      ))}
    </div>
  )
}
