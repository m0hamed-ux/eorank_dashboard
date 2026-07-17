import { cn } from "@/lib/utils"

// SVG radial score gauge. Violet ring = brand metric (the "you" color),
// per Design.md — the score itself is neutral information, not good/bad.

export function ScoreRing({
  score,
  size = 168,
  strokeWidth = 12,
  className,
  children,
}: {
  score: number // 0-100
  size?: number
  strokeWidth?: number
  className?: string
  children?: React.ReactNode
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  // Gap at the bottom (270° arc) reads better than a full closed circle
  const arc = circumference * 0.75
  const filled = (score / 100) * arc

  return (
    <div
      role="meter"
      aria-valuenow={score}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Score ${score} out of 100`}
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-[225deg]" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${arc} ${circumference}`}
          strokeLinecap="round"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${filled} ${circumference}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  )
}
