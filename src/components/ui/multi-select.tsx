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
 *
 * Pass allLabel for a filter where nothing chosen means everything shows: then
 * every box starts ticked, unticking hides that option, the last one stays
 * ticked, and the footer offers Select all. The value is still [] for "all".
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
  allLabel,
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
  /** Turns on "everything selected by default" and is the trigger text while all are selected. */
  allLabel?: string
  "aria-label"?: string
}) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const listId = React.useId()

  const q = query.trim().toLowerCase()
  const shown = q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options
  const all = options.map((o) => o.value)
  const allMode = allLabel !== undefined
  // In all mode an empty value means every option is ticked.
  const ticked = allMode && values.length === 0 ? all : values
  const picked = options.filter((o) => ticked.includes(o.value))

  const toggle = (value: string) => {
    const kept = ticked.includes(value) ? ticked.filter((v) => v !== value) : [...ticked, value]
    if (!allMode) return onValuesChange(kept)
    if (kept.length === 0) return
    onValuesChange(all.every((v) => kept.includes(v)) ? [] : all.filter((v) => kept.includes(v)))
  }

  const summary =
    allMode && values.length === 0 ? (
      allLabel
    ) : picked.length === 0 ? (
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
        <ChevronDownIcon aria-hidden="true" data-toolbar-chevron="" className="text-muted-foreground ml-auto" />
      </PopoverTrigger>
      <PopoverContent align={align} className="w-(--anchor-width) min-w-48 max-w-80 gap-0 p-0">
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
        <div
          id={listId}
          role="group"
          aria-label={ariaLabel ?? "Options"}
          className="max-h-64 overflow-y-auto p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {shown.length === 0 ? (
            <p className="text-muted-foreground px-2 py-6 text-center text-sm">No matches</p>
          ) : (
            shown.map((o) => {
              const on = ticked.includes(o.value)
              return (
                <label
                  key={o.value}
                  className="hover:bg-muted has-focus-visible:bg-muted flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm"
                >
                  <input type="checkbox" checked={on} onChange={() => toggle(o.value)} className="peer sr-only" />
                  {o.color ? (
                    <span aria-hidden="true" className="size-2 shrink-0 rounded-full" style={{ background: o.color }} />
                  ) : null}
                  <span className="truncate">{o.label}</span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "ml-auto flex size-4 shrink-0 items-center justify-center rounded border",
                      on ? "bg-primary border-primary text-primary-foreground" : "border-input",
                    )}
                  >
                    {on ? <CheckIcon className="size-3" /> : null}
                  </span>
                </label>
              )
            })
          )}
        </div>
        <div className="text-muted-foreground flex items-center justify-between border-t px-3 py-2 text-xs">
          <span className="tabular-nums">
            {picked.length} of {options.length} selected
          </span>
          <button
            type="button"
            disabled={values.length === 0}
            onClick={() => onValuesChange([])}
            className="hover:text-foreground cursor-pointer rounded px-1 font-medium disabled:cursor-default disabled:opacity-50"
          >
            {allMode ? "Select all" : "Clear"}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { MultiSelect }
export type { MultiSelectOption }
