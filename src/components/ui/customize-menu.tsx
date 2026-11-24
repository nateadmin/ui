"use client"

import * as React from "react"
import { CheckIcon, ChevronDownIcon, GripVerticalIcon, SearchIcon, Settings2Icon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

/*
 * One dropdown to choose which parts show and in what order: a toolbar's
 * parts, a list's columns. Everything happens in one place:
 *
 *   - tick a row to show it, untick to hide it
 *   - drag a shown row by its handle, or focus it and press Alt with the up or
 *     down arrow, to move it
 *   - search when the list is long
 *   - Show all, and Reset back to the defaults
 *   - extra settings (row height, labels...) go in as children, under the list
 *   - sections, when one menu covers more than one list (a report with two
 *     tables): a switch on top picks the section, and the app passes that
 *     section's items, value and children
 *
 * Shown rows sit on top in their order; hidden rows follow, in the default
 * order. The value is the ordered list of shown keys. In an app, save it to the
 * user's profile and pass it back in.
 */

type CustomizeItem<K extends string> = { key: K; label: string }

function CustomizeMenu<K extends string>({
  items,
  value,
  onValueChange,
  defaultValue,
  label = "Customize",
  itemsLabel = "Parts",
  searchPlaceholder = "Search",
  children,
  sections,
  section,
  onSectionChange,
  disabled,
  align = "start",
  className,
}: {
  /** Every part, in the default order. */
  items: CustomizeItem<K>[]
  /** Shown parts, in order. */
  value: K[]
  onValueChange: (value: K[]) => void
  /** What Reset goes back to. */
  defaultValue: K[]
  label?: string
  /** Title over the list, for example "Columns". */
  itemsLabel?: string
  searchPlaceholder?: string
  /** Extra settings shown under the list. Use CustomizeOption for each. */
  children?: React.ReactNode
  /** Two or more lists in one menu. A switch on top picks one; pass that section's items, value,
      defaultValue and children. The button counts the open section. */
  sections?: Array<{ key: string; label: string }>
  section?: string
  onSectionChange?: (key: string) => void
  /** Locks the button, for example while a fixed report decides its columns. */
  disabled?: boolean
  align?: "start" | "center" | "end"
  className?: string
}) {
  const [query, setQuery] = React.useState("")
  const [dragging, setDragging] = React.useState<K | null>(null)
  // Where a dragged row would land: before or after the row under the pointer. A line shows there.
  const [over, setOver] = React.useState<{ key: K; side: "before" | "after" } | null>(null)
  const listRef = React.useRef<HTMLUListElement>(null)
  const listId = React.useId()

  const labelOf = (k: K) => items.find((i) => i.key === k)?.label ?? k
  const shown = value.filter((k) => items.some((i) => i.key === k))
  const hidden = items.map((i) => i.key).filter((k) => !shown.includes(k))
  const q = query.trim().toLowerCase()
  const matches = (k: K) => !q || labelOf(k).toLowerCase().includes(q)
  const rows = [...shown, ...hidden].filter(matches)
  const searching = q.length > 0

  const toggle = (k: K) => onValueChange(shown.includes(k) ? shown.filter((x) => x !== k) : [...shown, k])

  const moveTo = (from: K, to: K) => {
    if (from === to) return
    const next = shown.filter((x) => x !== from)
    const at = next.indexOf(to)
    next.splice(shown.indexOf(from) < shown.indexOf(to) ? at + 1 : at, 0, from)
    onValueChange(next)
  }
  const dropAt = (from: K, to: K, side: "before" | "after") => {
    if (from === to) return
    const next = shown.filter((x) => x !== from)
    next.splice(next.indexOf(to) + (side === "after" ? 1 : 0), 0, from)
    if (next.every((x, i) => x === shown[i])) return
    onValueChange(next)
  }
  // No line where the drop would leave the order as it is (on itself, or right beside itself).
  const lineAt = (k: K) => {
    if (!dragging || !over || over.key !== k || dragging === k) return null
    const i = shown.indexOf(k)
    if (over.side === "after" && shown[i + 1] === dragging) return null
    if (over.side === "before" && shown[i - 1] === dragging) return null
    return over.side
  }
  const nudge = (k: K, by: -1 | 1) => {
    const target = shown[shown.indexOf(k) + by]
    if (!target) return
    moveTo(k, target)
    // Keep focus on the row that moved.
    requestAnimationFrame(() => listRef.current?.querySelector<HTMLElement>(`[data-key="${k}"]`)?.focus())
  }

  const same = value.length === defaultValue.length && value.every((k, i) => k === defaultValue[i])

  return (
    <Popover onOpenChange={(open: boolean) => !open && setQuery("")}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            size="lg"
            data-slot="customize-menu-trigger"
            disabled={disabled}
            className={cn("gap-2 font-normal", className)}
          />
        }
      >
        <Settings2Icon aria-hidden="true" />
        {/* Inside a Toolbar that shows icons only, the text and arrow hide like every other part's. */}
        <span data-toolbar-label="" className="inline-flex items-center gap-2">
          {label}
          <span className="text-muted-foreground text-xs tabular-nums">
            {shown.length}/{items.length}
          </span>
        </span>
        <ChevronDownIcon aria-hidden="true" data-toolbar-chevron="" className="text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent
        align={align}
        className={cn("w-max max-w-[calc(100vw-2rem)] gap-0 p-0", !children && "max-w-[min(22rem,calc(100vw-2rem))]")}
      >
        {/* Two columns side by side, the list on the left and the settings on the
            right, so the menu stays short. On a phone they stack. */}
        {sections && sections.length > 1 ? (
          <div className="border-b p-2">
            <div role="radiogroup" aria-label="Section" className="bg-muted flex rounded-md p-0.5">
              {sections.map((x) => (
                <button
                  key={x.key}
                  type="button"
                  role="radio"
                  aria-checked={section === x.key}
                  onClick={() => {
                    setQuery("")
                    onSectionChange?.(x.key)
                  }}
                  className="text-muted-foreground aria-checked:bg-background aria-checked:text-foreground focus-visible:ring-ring/50 h-7 flex-1 cursor-pointer rounded px-3 text-xs font-medium whitespace-nowrap outline-none focus-visible:ring-2 aria-checked:shadow-sm"
                >
                  {x.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}
        <div className="flex max-h-[min(30rem,calc(var(--available-height)-3rem))] flex-col sm:flex-row">
          <div className="flex min-h-40 min-w-56 flex-1 flex-col sm:min-h-0">
            {items.length > 10 ? (
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
                  className="placeholder:text-muted-foreground h-10 w-full bg-transparent pr-3 pl-9 text-sm outline-none"
                />
              </div>
            ) : null}

            <div className="flex items-center justify-between gap-4 px-3 pt-2.5 pb-1">
              <span className="text-muted-foreground text-xs font-medium">{itemsLabel}</span>
              <span className="text-muted-foreground text-[11px]">
                {searching ? "Clear search to reorder" : "Drag to reorder"}
              </span>
            </div>

            <ul
              ref={listRef}
              id={listId}
              aria-label={itemsLabel}
              className="m-0 min-h-0 flex-1 list-none overflow-y-auto p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {rows.length === 0 ? (
                <li className="text-muted-foreground px-2 py-6 text-center text-sm">No matches</li>
              ) : null}
              {rows.map((k, i) => {
                const on = shown.includes(k)
                const canMove = on && !searching
                // A thin line between the shown and hidden groups.
                const firstHidden = !on && i > 0 && shown.includes(rows[i - 1]!)
                return (
                  <li
                    key={k}
                    data-key={k}
                    tabIndex={0}
                    role="checkbox"
                    aria-checked={on}
                    aria-label={
                      on
                        ? `${labelOf(k)}, shown, position ${shown.indexOf(k) + 1} of ${shown.length}`
                        : `${labelOf(k)}, hidden`
                    }
                    draggable={canMove}
                    onClick={() => toggle(k)}
                    onKeyDown={(e) => {
                      if (e.key === " " || e.key === "Enter") {
                        e.preventDefault()
                        toggle(k)
                      } else if (canMove && e.altKey && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
                        e.preventDefault()
                        nudge(k, e.key === "ArrowUp" ? -1 : 1)
                      } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                        e.preventDefault()
                        const sib =
                          e.key === "ArrowDown"
                            ? e.currentTarget.nextElementSibling
                            : e.currentTarget.previousElementSibling
                        ;(sib as HTMLElement | null)?.focus()
                      }
                    }}
                    onDragStart={(e) => {
                      setDragging(k)
                      e.dataTransfer.effectAllowed = "move"
                      e.dataTransfer.setData("text/plain", k)
                    }}
                    onDragEnd={() => {
                      setDragging(null)
                      setOver(null)
                    }}
                    onDragOver={(e) => {
                      if (!dragging || !on) return
                      e.preventDefault()
                      const r = e.currentTarget.getBoundingClientRect()
                      const side = e.clientY < r.top + r.height / 2 ? "before" : "after"
                      if (over?.key !== k || over.side !== side) setOver({ key: k, side })
                    }}
                    onDrop={(e) => {
                      e.preventDefault()
                      if (dragging && on && over) dropAt(dragging, over.key, over.side)
                      setDragging(null)
                      setOver(null)
                    }}
                    className={cn(
                      "hover:bg-muted focus-visible:bg-muted relative flex h-8 cursor-pointer items-center gap-2 rounded-md pr-2 pl-1 text-sm outline-none select-none",
                      firstHidden && "border-border/60 mt-1 rounded-t-none border-t pt-0",
                      dragging === k && "opacity-40",
                      // The drop line: 2px in the accent color, between this row and its neighbor.
                      lineAt(k) &&
                        "before:bg-primary before:pointer-events-none before:absolute before:inset-x-1 before:h-0.5 before:rounded-full",
                      lineAt(k) === "before" && "before:-top-px",
                      lineAt(k) === "after" && "before:-bottom-px",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center",
                        canMove ? "text-muted-foreground cursor-grab active:cursor-grabbing" : "invisible",
                      )}
                    >
                      <GripVerticalIcon className="size-3.5" />
                    </span>
                    <span className={cn("flex-1 truncate", !on && "text-muted-foreground")}>{labelOf(k)}</span>
                    <span
                      aria-hidden="true"
                      className={cn(
                        "ml-3 flex size-4 shrink-0 items-center justify-center rounded border",
                        on ? "bg-primary border-primary text-primary-foreground" : "border-input",
                      )}
                    >
                      {on ? <CheckIcon className="size-3" /> : null}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
          {children ? (
            <div className="flex shrink-0 flex-col gap-2.5 overflow-y-auto border-t px-3 py-3 [scrollbar-width:none] sm:border-t-0 sm:border-l [&::-webkit-scrollbar]:hidden">
              {children}
            </div>
          ) : null}
        </div>

        <div className="text-muted-foreground flex items-center justify-between gap-4 border-t px-3 py-2 text-xs">
          <span className="tabular-nums">
            {shown.length} of {items.length} shown
          </span>
          <span className="flex items-center gap-3">
            <button
              type="button"
              disabled={hidden.length === 0}
              onClick={() => onValueChange([...shown, ...hidden])}
              className="hover:text-foreground cursor-pointer rounded font-medium disabled:cursor-default disabled:opacity-50"
            >
              Show all
            </button>
            <button
              type="button"
              disabled={same}
              onClick={() => onValueChange(defaultValue)}
              className="hover:text-foreground cursor-pointer rounded font-medium disabled:cursor-default disabled:opacity-50"
            >
              Reset
            </button>
          </span>
        </div>
      </PopoverContent>
    </Popover>
  )
}

/** One extra setting inside CustomizeMenu: a label and a row of choices. */
function CustomizeOption<V extends string>({
  label,
  value,
  options,
  onValueChange,
}: {
  label: string
  value: V
  options: Array<{ value: V; label: string }>
  onValueChange: (value: V) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground text-xs font-medium whitespace-nowrap">{label}</span>
      <div role="radiogroup" aria-label={label} className="bg-muted flex rounded-md p-0.5">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={value === o.value}
            onClick={() => onValueChange(o.value)}
            className="text-muted-foreground aria-checked:bg-background aria-checked:text-foreground focus-visible:ring-ring/50 h-6 cursor-pointer rounded px-2 text-xs whitespace-nowrap outline-none focus-visible:ring-2 aria-checked:shadow-sm"
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

/** An on/off setting inside CustomizeMenu. */
function CustomizeSwitch({
  label,
  checked,
  onCheckedChange,
}: {
  label: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className="group focus-visible:ring-ring/50 flex cursor-pointer items-center justify-between gap-4 rounded text-left outline-none focus-visible:ring-2"
    >
      <span className="text-muted-foreground text-xs font-medium whitespace-nowrap">{label}</span>
      <span
        aria-hidden="true"
        className="bg-input group-aria-checked:bg-primary relative h-4 w-7 shrink-0 rounded-full transition-colors"
      >
        <span className="bg-background absolute top-0.5 left-0.5 size-3 rounded-full shadow-sm transition-transform group-aria-checked:translate-x-3" />
      </span>
    </button>
  )
}

export { CustomizeMenu, CustomizeOption, CustomizeSwitch }
export type { CustomizeItem }
