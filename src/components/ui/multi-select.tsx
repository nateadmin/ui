"use client"

import * as React from "react"
import { CheckIcon, ChevronDownIcon, SearchIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

type MultiSelectOption = {
  value: string
  label: string
  /** Optional status color, shown as a dot. Any CSS color or gradient. */
  color?: string
}

/*
 * A dropdown for picking several options out of a long list: a search box on
 * top, a scrolling list of checkboxes, and a count with Clear at the bottom.
 * Use it when a list is too long for pills or a plain menu (people, statuses,
 * companies).
 */
function MultiSelect({
  options,
  values,
  onValuesChange,
  placeholder = "Any",
  searchPlaceholder = "Search",
  trigger,
  className,
  align = "start",
  "aria-label": ariaLabel,
}: {
  options: MultiSelectOption[]
  values: string[]
  onValuesChange: (values: string[]) => void
  /** Trigger text when nothing is selected. */
  placeholder?: string
  searchPlaceholder?: string
  /** Custom trigger content. By default the trigger shows the placeholder, the one picked name, or "3 selected". */
  trigger?: React.ReactNode
  className?: string
  align?: "start" | "center" | "end"
  "aria-label"?: string
}) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const listId = React.useId()

  const q = query.trim().toLowerCase()
  const shown = q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options
  const picked = options.filter((o) => values.includes(o.value))

  const toggle = (value: string) =>
    onValuesChange(values.includes(value) ? values.filter((v) => v !== value) : [...values, value])

  const summary =
    picked.length === 0 ? (
      <span className="text-muted-foreground">{placeholder}</span>
    ) : picked.length === 1 ? (
      picked[0]?.label
    ) : (
      `${picked.length} selected`
    )

  return (
    <Popover
      open={open}
      onOpenChange={(next: boolean) => {
        setOpen(next)
        if (!next) setQuery("")
      }}
    >
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            size="lg"
            data-slot="multi-select-trigger"
            aria-label={ariaLabel}
            className={cn("justify-between gap-2 font-normal", className)}
          />
        }
      >
        {trigger ?? <span className="truncate">{summary}</span>}
        <ChevronDownIcon aria-hidden="true" className="text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent align={align} className="w-(--anchor-width) min-w-72 gap-0 p-0">
        <div className="relative border-b">
          <SearchIcon
            aria-hidden="true"
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            aria-controls={listId}
            autoFocus
            className="placeholder:text-muted-foreground h-10 w-full bg-transparent pr-3 pl-9 text-sm outline-none"
          />
        </div>
        <div id={listId} role="group" aria-label={ariaLabel ?? "Options"} className="max-h-64 overflow-y-auto p-1">
          {shown.length === 0 ? (
            <p className="text-muted-foreground px-2 py-6 text-center text-sm">No matches</p>
          ) : (
            shown.map((o) => {
              const on = values.includes(o.value)
              return (
                <label
                  key={o.value}
                  className="hover:bg-muted has-focus-visible:bg-muted flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm"
                >
                  <input type="checkbox" checked={on} onChange={() => toggle(o.value)} className="peer sr-only" />
                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex size-4 shrink-0 items-center justify-center rounded border",
                      on ? "bg-primary border-primary text-primary-foreground" : "border-input",
                    )}
                  >
                    {on ? <CheckIcon className="size-3" /> : null}
                  </span>
                  {o.color ? (
                    <span aria-hidden="true" className="size-2 shrink-0 rounded-full" style={{ background: o.color }} />
                  ) : null}
                  <span className="truncate">{o.label}</span>
                </label>
              )
            })
          )}
        </div>
        <div className="text-muted-foreground flex items-center justify-between border-t px-3 py-2 text-xs">
          <span className="tabular-nums">
            {values.length} of {options.length} selected
          </span>
          <button
            type="button"
            disabled={values.length === 0}
            onClick={() => onValuesChange([])}
            className="hover:text-foreground rounded px-1 font-medium disabled:opacity-50"
          >
            Clear
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { MultiSelect }
export type { MultiSelectOption }
