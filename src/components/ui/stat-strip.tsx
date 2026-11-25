"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"
import { cn } from "@/lib/utils"

/*
 * StatStrip: the headline numbers above a list (owner, 11/25/2026). Closed, it is one thin row with
 * each title and value side by side, so it takes almost no height; open, each number is a tile.
 * Clicking the row or the tiny arrow at its top right folds it. It starts closed.
 */

type StatStripItem = {
  key: string
  label: string
  value: React.ReactNode
  /** Shown in gray after the value, for example how many rows made it. */
  count?: number
}

function StatStrip({
  items,
  open: openProp,
  onOpenChange,
  defaultOpen = false,
  "aria-label": ariaLabel = "Metrics",
  className,
}: {
  items: StatStripItem[]
  open?: boolean
  onOpenChange?: (open: boolean) => void
  defaultOpen?: boolean
  "aria-label"?: string
  className?: string
}) {
  const [ownOpen, setOwnOpen] = React.useState(defaultOpen)
  const open = openProp ?? ownOpen
  const setOpen = (next: boolean) => {
    if (openProp == null) setOwnOpen(next)
    onOpenChange?.(next)
  }
  return (
    <section
      aria-label={ariaLabel}
      data-slot="stat-strip"
      data-state={open ? "open" : "closed"}
      className={cn("bg-card text-card-foreground relative rounded-xl border", className)}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? "Collapse metrics" : "Expand metrics"}
        onClick={() => setOpen(!open)}
        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 absolute top-1.5 right-1.5 z-10 flex size-5 cursor-pointer items-center justify-center rounded outline-none focus-visible:ring-2"
      >
        <ChevronDownIcon aria-hidden="true" className={cn("size-3.5 transition-transform", open && "rotate-180")} />
      </button>
      {open ? (
        <div
          className="grid cursor-pointer grid-cols-2 gap-2 p-2 sm:grid-cols-3 md:grid-cols-5 md:gap-3"
          onClick={() => setOpen(false)}
        >
          {items.map((item) => (
            <div key={item.key} className="bg-muted/30 rounded-lg px-3 py-2">
              <p className="text-muted-foreground m-0 text-xs font-medium">{item.label}</p>
              <p className="m-0 mt-1 text-xl font-semibold tabular-nums md:text-2xl">
                {item.value}
                {item.count ? <span className="text-muted-foreground ml-1 text-sm font-normal">({item.count.toLocaleString("en-US")})</span> : null}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              setOpen(true)
            }
          }}
          className="flex cursor-pointer flex-wrap items-center gap-x-6 gap-y-1 px-3 py-1.5 pr-8 text-[13px] outline-none"
        >
          {items.map((item) => (
            <span key={item.key} className="inline-flex items-baseline gap-1.5 whitespace-nowrap">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-semibold tabular-nums">{item.value}</span>
              {item.count ? <span className="text-muted-foreground text-xs">({item.count.toLocaleString("en-US")})</span> : null}
            </span>
          ))}
        </div>
      )}
    </section>
  )
}

export { StatStrip }
export type { StatStripItem }
