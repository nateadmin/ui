import * as React from "react"
import { cn } from "@/lib/utils"

/** A row of number tiles. Tiles share the width and wrap onto new rows when narrow. */
function StatGrid({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="stat-grid"
      className={cn("grid grid-cols-[repeat(auto-fit,minmax(11rem,1fr))] gap-3", className)}
      {...props}
    />
  )
}

/** One number tile: a label, a big value, and an optional note under it. */
function StatCard({
  label,
  value,
  hint,
  className,
}: {
  label: React.ReactNode
  /** Pass it already formatted, for example "$18,040.55" or "7,977". */
  value: React.ReactNode
  hint?: React.ReactNode
  className?: string
}) {
  return (
    <div data-slot="stat-card" className={cn("bg-card text-card-foreground rounded-xl border p-4", className)}>
      <p className="text-muted-foreground text-sm">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
      {hint ? <p className="text-muted-foreground mt-1 text-xs">{hint}</p> : null}
    </div>
  )
}

export { StatCard, StatGrid }
