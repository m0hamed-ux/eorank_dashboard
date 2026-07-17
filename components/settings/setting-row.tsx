import { cn } from "@/lib/utils"

// A single settings row: label + description on the left, control on the right.
// Used inside a `divide-y` list so rows share one consistent rhythm across
// every settings tab (py-4, first/last trimmed to meet the card padding).
export function SettingRow({
  title,
  description,
  htmlFor,
  className,
  children,
}: {
  title: string
  description?: string
  htmlFor?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0",
        className
      )}
    >
      <div className="flex flex-col gap-0.5">
        <label
          htmlFor={htmlFor}
          className={cn("text-sm font-medium", htmlFor && "cursor-pointer")}
        >
          {title}
        </label>
        {description && (
          <span className="text-xs text-muted-foreground">{description}</span>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}
