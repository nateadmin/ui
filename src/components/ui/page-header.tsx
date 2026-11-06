import * as React from "react"
import { cn } from "@/lib/utils"

/*
 * The top of a page: optional icon, title, optional count or meta text next to
 * the title, optional description, and buttons on the right. On narrow screens
 * the buttons wrap under the title.
 */
function PageHeader({
  title,
  icon,
  meta,
  description,
  actions,
  className,
}: {
  title: React.ReactNode
  icon?: React.ReactNode
  /** Short text next to the title, for example "2,237 services". */
  meta?: React.ReactNode
  description?: React.ReactNode
  /** Buttons on the right. */
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <header
      data-slot="page-header"
      className={cn("flex flex-wrap items-start justify-between gap-x-6 gap-y-3", className)}
    >
      <div className="flex min-w-0 flex-[1_1_20rem] items-start gap-3">
        {icon ? (
          <div
            aria-hidden="true"
            className="bg-primary/10 text-primary dark:bg-primary/15 flex size-10 shrink-0 items-center justify-center rounded-lg [&_svg:not([class*='size-'])]:size-5"
          >
            {icon}
          </div>
        ) : null}
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            {meta ? <span className="text-muted-foreground text-sm tabular-nums">{meta}</span> : null}
          </div>
          {description ? <p className="text-muted-foreground max-w-3xl text-sm">{description}</p> : null}
        </div>
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  )
}

export { PageHeader }
