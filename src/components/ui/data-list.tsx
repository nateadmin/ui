"use client"

import * as React from "react"
import { CheckIcon, ChevronRightIcon, MinusIcon, MoreVerticalIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from "@/components/ui/context-menu"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

/*
 * DataList: the list under a toolbar, built from columns.
 *
 *   <DataList
 *     rows={pageRows}
 *     getRowId={(r) => r.id}
 *     columns={[
 *       { id: "name", header: "Name", cell: (r) => <ListTitle>{r.name}</ListTitle>, sortable: true, width: "fit" },
 *       { id: "amount", header: "Amount", cell: (r) => <ListNumber value={r.amount} format="currency" />, align: "end" },
 *       { id: "status", header: "Status", cell: (r) => <ListBadge tone="green">Active</ListBadge> },
 *     ]}
 *     footer={<ListPagination ... />}
 *   />
 *
 * Columns line up with a CSS grid: every column sizes to its widest value and
 * the gap between columns is the same 24px everywhere. Text never wraps, so
 * every row keeps one height, and the list never scrolls sideways: when room
 * runs short, text columns squeeze and cut their text with "...", and once
 * they can't squeeze any further every row becomes a card. The list fills the
 * height its parent gives it; rows scroll inside their own window (no visible
 * scrollbar) with the column titles pinned on top, so the footer always stays
 * in view.
 *
 * Optional parts, each one prop: bulk select (round checkboxes, Shift+click
 * for a range), sortable column titles, a three-dot menu or a chevron at the
 * end of each row, rows that expand, a right-click menu for selected rows,
 * dimmed rows (inactive users), three row heights, plain, CAPS or hidden
 * column titles, and a "cards" layout where each row is its own box.
 *
 * Sorting and paging are the page's job: DataList shows the sort state and
 * calls onSortChange; sortRows() sorts with the columns' sortValue.
 */

type ListSort = { column: string; dir: "asc" | "desc" } | null

type DataListColumn<T> = {
  id: string
  header: React.ReactNode
  cell: (row: T) => React.ReactNode
  /**
   * "auto" (default): as wide as its widest value and never squeezed. Use it
   * for badges, numbers, dates, buttons and inline controls.
   * "fit": text. As wide as its widest value up to maxWidth (14rem by default);
   * when the list runs short of room it squeezes down to minWidth (6rem by
   * default) and cuts the text with "...".
   * "grow": text that takes the free room, and squeezes like "fit".
   * Text never wraps, so every row keeps one height.
   */
  width?: "auto" | "fit" | "grow"
  /** Narrowest a "fit" or "grow" column gets before the list turns into cards. */
  minWidth?: string
  /** Widest a "fit" column gets. */
  maxWidth?: string
  align?: "start" | "end" | "center"
  /** Clicks inside this cell don't open the row (inputs, dropdowns, buttons). */
  interactive?: boolean
  /** The column title sorts the list. Pair with sortValue for sortRows(). */
  sortable?: boolean
  sortValue?: (row: T) => string | number
  /** Card view on phones: shown on top as the card's title. */
  primary?: boolean
  /** Card view on phones: left out. */
  hideOnMobile?: boolean
}

type DataListProps<T> = {
  rows: T[]
  columns: DataListColumn<T>[]
  getRowId: (row: T) => string
  "aria-label"?: string

  /** Round checkboxes for bulk select. */
  selected?: string[]
  onSelectedChange?: (ids: string[]) => void

  sort?: ListSort
  /** Click cycles a column: ascending, descending, then back to no sort. */
  onSortChange?: (sort: ListSort) => void

  /** Makes the whole row open something. Shows a chevron at the end when rowEnd is "chevron". */
  onRowClick?: (row: T) => void
  /** What sits at the right edge of each row. */
  rowEnd?: "none" | "menu" | "chevron"
  /** Items of the three-dot menu (DropdownMenuItem elements). */
  rowMenu?: (row: T) => React.ReactNode
  /** Detail shown under a row when it is expanded. Adds a chevron at the start of each row. */
  renderExpanded?: (row: T) => React.ReactNode
  expanded?: string[]
  onExpandedChange?: (ids: string[]) => void
  /** Dims a row, for example an inactive user. */
  rowMuted?: (row: T) => boolean
  /** Right-click menu for the selected rows (ContextMenu items). */
  bulkMenu?: (ids: string[]) => React.ReactNode

  density?: "compact" | "default" | "comfortable"
  headerStyle?: "default" | "caps" | "hidden"
  /** "rows": one box with lines between rows. "cards": each row is its own box. */
  layout?: "rows" | "cards"

  /** Under the list and always in view, usually ListPagination. */
  footer?: React.ReactNode
  empty?: React.ReactNode
  /** When this changes the list scrolls back to the top (new page, new sort). */
  scrollKey?: unknown
  className?: string
}

const hideScrollbar = "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden"

const squeezes = (c: DataListColumn<never>) => c.width === "fit" || c.width === "grow"

function track(c: DataListColumn<never>) {
  const min = c.minWidth ?? "6rem"
  if (c.width === "fit") return `minmax(${min},max-content)`
  if (c.width === "grow") return `minmax(${min},1fr)`
  return "max-content"
}

/** Sorts rows with the sorted column's sortValue. Returns the rows as they are when nothing is sorted. */
function sortRows<T>(rows: T[], columns: DataListColumn<T>[], sort: ListSort): T[] {
  const col = sort && columns.find((c) => c.id === sort.column)
  if (!sort || !col?.sortValue) return rows
  const value = col.sortValue
  return [...rows].sort((a, b) => {
    const va = value(a)
    const vb = value(b)
    const cmp =
      typeof va === "number" && typeof vb === "number"
        ? va - vb
        : String(va).localeCompare(String(vb), undefined, { numeric: true })
    return sort.dir === "asc" ? cmp : -cmp
  })
}

/** Round checkbox used for bulk select. Fills with the accent color when on. */
function ListCheckbox({
  checked,
  indeterminate = false,
  onToggle,
  label,
}: {
  checked: boolean
  indeterminate?: boolean
  onToggle: (event: React.MouseEvent) => void
  label: string
}) {
  const on = checked || indeterminate
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? "mixed" : checked}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation()
        onToggle(e)
      }}
      className="focus-visible:ring-ring/50 relative flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-full outline-none before:absolute before:-inset-2.5 focus-visible:ring-3"
    >
      <span
        aria-hidden="true"
        className={cn(
          "flex size-4 items-center justify-center rounded-full border transition-colors",
          on ? "bg-primary border-primary text-primary-foreground" : "border-foreground/30 hover:border-foreground/60",
        )}
      >
        {indeterminate ? (
          <MinusIcon className="size-2.5" strokeWidth={3} />
        ) : checked ? (
          <CheckIcon className="size-2.5" strokeWidth={3} />
        ) : null}
      </span>
    </button>
  )
}

/** Two angular arrows: the right one fills when sorted up, the left one when sorted down. */
function SortIcon({ dir }: { dir: "asc" | "desc" | null }) {
  const arrow = (on: boolean) => ({
    fill: on ? "currentColor" : "none",
    stroke: "currentColor",
    strokeWidth: 1,
    strokeLinejoin: "round" as const,
    opacity: on ? 1 : 0.45,
  })
  return (
    <svg aria-hidden="true" viewBox="0 0 12 12" className="size-[11px] shrink-0">
      <path d="M5 11.25 1 6.75h2V2h2z" {...arrow(dir === "desc")} />
      <path d="M7 .75 11 5.25H9V10H7z" {...arrow(dir === "asc")} />
    </svg>
  )
}

/** Three-dot button that opens a row's actions. The menu itself is only set up
    on the first click or focus, so a page of 2,000 rows stays fast. */
function RowMenu({ label, children }: { label: string; children: React.ReactNode }) {
  const [ready, setReady] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const viaFocus = React.useRef(false)
  const trigger = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (ready && viaFocus.current) trigger.current?.focus()
  }, [ready])

  if (!ready) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={label}
        aria-haspopup="menu"
        className="text-muted-foreground -my-1 h-8 w-8"
        onFocus={(e) => {
          // Keyboard focus only; a mouse or touch press is handled by onClick.
          if (!e.currentTarget.matches(":focus-visible")) return
          viaFocus.current = true
          setReady(true)
        }}
        onClick={(e) => {
          e.stopPropagation()
          setReady(true)
          setOpen(true)
        }}
      >
        <MoreVerticalIcon />
      </Button>
    )
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            ref={trigger}
            aria-label={label}
            className="text-muted-foreground -my-1 h-8 w-8"
            onClick={(e) => e.stopPropagation()}
          />
        }
      >
        <MoreVerticalIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const rowHeight = {
  compact: "min-h-9 py-1",
  default: "min-h-10 py-1.5",
  comfortable: "min-h-13 py-2.5",
}

function DataList<T>({
  rows,
  columns,
  getRowId,
  "aria-label": ariaLabel = "List",
  selected,
  onSelectedChange,
  sort = null,
  onSortChange,
  onRowClick,
  rowEnd = "none",
  rowMenu,
  renderExpanded,
  expanded: expandedProp,
  onExpandedChange,
  rowMuted,
  bulkMenu,
  density = "default",
  headerStyle = "default",
  layout = "rows",
  footer,
  empty = "Nothing to show.",
  scrollKey,
  className,
}: DataListProps<T>) {
  const selectable = !!onSelectedChange
  const picked = selected ?? []
  const anchor = React.useRef<string | null>(null)
  const ids = rows.map(getRowId)

  // Expanded rows: controlled when the page passes them, otherwise kept here.
  const [ownExpanded, setOwnExpanded] = React.useState<string[]>([])
  const expanded = expandedProp ?? ownExpanded
  const setExpanded = onExpandedChange ?? setOwnExpanded
  const toggleExpanded = (id: string) =>
    setExpanded(expanded.includes(id) ? expanded.filter((x) => x !== id) : [...expanded, id])

  const desktop = React.useRef<HTMLDivElement>(null)
  const mobile = React.useRef<HTMLUListElement>(null)
  React.useEffect(() => {
    desktop.current?.scrollTo({ top: 0 })
    mobile.current?.scrollTo({ top: 0 })
  }, [scrollKey])

  /* Click selects one row. Shift+click selects (or clears) every row between
     the last clicked row and this one. */
  const toggle = (id: string, event: React.MouseEvent) => {
    if (!onSelectedChange) return
    const turnOn = !picked.includes(id)
    const from = anchor.current ? ids.indexOf(anchor.current) : -1
    const to = ids.indexOf(id)
    const range = event.shiftKey && from !== -1 ? ids.slice(Math.min(from, to), Math.max(from, to) + 1) : [id]
    onSelectedChange(turnOn ? [...new Set([...picked, ...range])] : picked.filter((x) => !range.includes(x)))
    anchor.current = id
  }
  const pickedHere = ids.filter((id) => picked.includes(id)).length
  const allPicked = rows.length > 0 && pickedHere === rows.length
  const toggleAll = () =>
    onSelectedChange?.(allPicked ? picked.filter((id) => !ids.includes(id)) : [...new Set([...picked, ...ids])])

  const sortBy = (column: string) => {
    if (!onSortChange) return
    if (sort?.column !== column) onSortChange({ column, dir: "asc" })
    else onSortChange(sort.dir === "asc" ? { column, dir: "desc" } : null)
  }

  const showEnd = rowEnd === "menu" ? !!rowMenu : rowEnd === "chevron"
  const grows = columns.some((c) => c.width === "grow")
  const template = [
    ...(renderExpanded ? ["max-content"] : []),
    ...(selectable ? ["max-content"] : []),
    ...columns.map((c) => track(c as DataListColumn<never>)),
    // Nothing grows: an empty track takes the free room so the row end sits at the right edge.
    ...(grows ? [] : ["minmax(0,1fr)"]),
    ...(showEnd ? ["max-content"] : []),
  ].join(" ")

  /* The list never scrolls sideways. As its box narrows: "fit" and "grow"
     columns squeeze down to their minWidth, then the gap between columns
     tightens from 24px to 12px, then every row turns into a card. Each step
     remembers how wide the rows needed to be, so the list steps back up when
     its box grows past that again. */
  const root = React.useRef<HTMLDivElement>(null)
  const table = React.useRef<HTMLDivElement>(null)
  const [fit, setFit] = React.useState<"rows" | "tight" | "cards">("rows")
  const fitRef = React.useRef(fit)
  fitRef.current = fit
  const need = React.useRef({ rows: 0, tight: 0 })
  const stepDown = React.useCallback(() => {
    const el = table.current
    if (!el || el.scrollWidth <= el.clientWidth + 1) return false
    if (fitRef.current === "rows") {
      need.current.rows = el.scrollWidth
      setFit("tight")
    } else if (fitRef.current === "tight") {
      need.current.tight = el.scrollWidth
      setFit("cards")
    }
    return true
  }, [])
  const shape = `${columns.map((c) => c.id).join(",")}|${selectable}|${showEnd}|${!!renderExpanded}|${layout}|${density}`
  React.useLayoutEffect(() => {
    setFit("rows")
  }, [shape])
  React.useLayoutEffect(() => {
    stepDown()
  })
  React.useEffect(() => {
    const box = root.current
    if (!box) return
    const ro = new ResizeObserver(() => {
      if (stepDown()) return
      const width = box.clientWidth
      if (fitRef.current === "cards" && width >= need.current.tight) setFit("tight")
      else if (fitRef.current === "tight" && width >= need.current.rows) setFit("rows")
    })
    ro.observe(box)
    return () => ro.disconnect()
  }, [stepDown])
  const fits = fit !== "cards"

  const cards = layout === "cards"
  const caps = headerStyle === "caps"
  const alignClass = (a?: DataListColumn<T>["align"]) =>
    a === "end" ? "justify-end text-right" : a === "center" ? "justify-center text-center" : ""

  const onRowContext = (id: string) => {
    if (bulkMenu && onSelectedChange && !picked.includes(id)) {
      onSelectedChange([id])
      anchor.current = id
    }
  }

  const header =
    headerStyle === "hidden" ? null : (
      <div
        role="row"
        className={cn(
          "sticky top-0 z-10 col-span-full grid h-9 grid-cols-subgrid items-center px-3",
          cards ? "bg-background" : "bg-card border-border/40 border-b",
          caps ? "text-[11px] font-semibold tracking-wide uppercase" : "text-[11px] font-medium",
        )}
      >
        {renderExpanded ? (
          <div role="columnheader">
            <span className="sr-only">Expand</span>
          </div>
        ) : null}
        {selectable ? (
          <div role="columnheader" className="flex">
            <ListCheckbox
              checked={allPicked}
              indeterminate={pickedHere > 0 && !allPicked}
              onToggle={toggleAll}
              label="Select all"
            />
          </div>
        ) : null}
        {columns.map((c) => {
          const active = sort?.column === c.id
          const dir = active ? sort.dir : null
          return (
            <div
              key={c.id}
              role="columnheader"
              aria-sort={
                c.sortable ? (dir === "asc" ? "ascending" : dir === "desc" ? "descending" : "none") : undefined
              }
              className={cn("flex min-w-0 overflow-hidden whitespace-nowrap select-none", alignClass(c.align))}
            >
              {c.sortable && onSortChange ? (
                <button
                  type="button"
                  onClick={() => sortBy(c.id)}
                  className={cn(
                    "hover:text-foreground focus-visible:ring-ring/50 -mx-1 inline-flex cursor-pointer items-center gap-1 rounded px-1 py-0.5 outline-none focus-visible:ring-2",
                    // Buttons don't take text-transform from their parent, so CAPS is set here too.
                    caps && "uppercase",
                    active ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {c.header}
                  <SortIcon dir={dir} />
                </button>
              ) : (
                <span className={caps ? "text-foreground/80" : "text-muted-foreground"}>{c.header}</span>
              )}
            </div>
          )
        })}
        {grows ? null : <div aria-hidden="true" />}
        {showEnd ? (
          <div role="columnheader">
            <span className="sr-only">Actions</span>
          </div>
        ) : null}
      </div>
    )

  const body = rows.map((row) => {
    const id = getRowId(row)
    const on = picked.includes(id)
    const open = expanded.includes(id)
    const muted = rowMuted?.(row) ?? false
    const clickable = !!onRowClick
    return (
      <div
        key={id}
        role="row"
        aria-selected={selectable ? on : undefined}
        aria-expanded={renderExpanded ? open : undefined}
        data-state={on ? "selected" : undefined}
        tabIndex={clickable ? 0 : undefined}
        onClick={clickable ? () => onRowClick(row) : undefined}
        onKeyDown={
          clickable
            ? (e) => {
                if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault()
                  onRowClick(row)
                }
              }
            : undefined
        }
        onContextMenu={() => onRowContext(id)}
        className={cn(
          "group col-span-full grid grid-cols-subgrid items-center px-3 text-[13px] transition-colors outline-none",
          rowHeight[density],
          cards ? "bg-card border-border/60 rounded-lg border" : "border-border/40 border-b last:border-b-0",
          "hover:bg-muted/30 data-[state=selected]:bg-primary/5 focus-visible:bg-muted/40",
          clickable && "cursor-pointer",
        )}
      >
        {renderExpanded ? (
          <div role="cell" className="flex">
            <button
              type="button"
              aria-label={open ? "Collapse row" : "Expand row"}
              aria-expanded={open}
              onClick={(e) => {
                e.stopPropagation()
                toggleExpanded(id)
              }}
              className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 -m-1 flex size-6 cursor-pointer items-center justify-center rounded outline-none focus-visible:ring-2"
            >
              <ChevronRightIcon className={cn("size-4 transition-transform", open && "rotate-90")} />
            </button>
          </div>
        ) : null}
        {selectable ? (
          <div role="cell" className="flex">
            <ListCheckbox checked={on} onToggle={(e) => toggle(id, e)} label="Select row" />
          </div>
        ) : null}
        {columns.map((c) => (
          <div
            key={c.id}
            role="cell"
            onClick={c.interactive ? (e) => e.stopPropagation() : undefined}
            onKeyDown={c.interactive ? (e) => e.stopPropagation() : undefined}
            style={
              squeezes(c as DataListColumn<never>)
                ? { maxWidth: c.width === "fit" ? (c.maxWidth ?? "14rem") : undefined }
                : undefined
            }
            className={cn(
              "min-w-0 whitespace-nowrap",
              // Text columns cut what doesn't fit with "...". Other columns line their parts up in a row.
              squeezes(c as DataListColumn<never>) ? "truncate" : "flex items-center gap-1.5",
              squeezes(c as DataListColumn<never>) && c.align === "end" && "text-right",
              !squeezes(c as DataListColumn<never>) && alignClass(c.align),
              muted && !c.interactive && "opacity-50",
            )}
          >
            {c.cell(row)}
          </div>
        ))}
        {grows ? null : <div aria-hidden="true" />}
        {showEnd ? (
          <div role="cell" className="flex justify-end">
            {rowEnd === "menu" && rowMenu ? (
              <RowMenu label="Row actions">{rowMenu(row)}</RowMenu>
            ) : (
              <ChevronRightIcon
                aria-hidden="true"
                className={cn("text-muted-foreground size-4", muted && "opacity-50")}
              />
            )}
          </div>
        ) : null}
        {renderExpanded && open ? (
          <div
            className="text-muted-foreground col-span-full pt-1 pb-2 text-[13px] whitespace-normal"
            onClick={(e) => e.stopPropagation()}
          >
            {renderExpanded(row)}
          </div>
        ) : null}
      </div>
    )
  })

  const grid = (
    <div
      role="table"
      aria-label={ariaLabel}
      ref={table}
      className={cn("grid w-full", fit === "tight" ? "gap-x-3" : "gap-x-6", cards && "gap-y-2")}
      style={{ gridTemplateColumns: template }}
    >
      {header}
      {body}
    </div>
  )

  const windowClass = cn(
    "min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain select-auto",
    hideScrollbar,
    cards ? "" : "bg-card border-border/40 rounded-lg border",
  )

  const primary = columns.find((c) => c.primary) ?? columns[0]
  const rest = columns.filter((c) => c !== primary && !c.hideOnMobile)

  return (
    <div ref={root} data-slot="data-list" className={cn("flex h-full min-h-0 flex-col gap-3", className)}>
      {rows.length === 0 ? (
        <div className="bg-card text-muted-foreground border-border/40 rounded-lg border p-12 text-center text-[13px]">
          {empty}
        </div>
      ) : (
        <>
          {/* Not enough room for the columns: one card per row. */}
          {fits ? null : (
            <ul
              ref={mobile}
              aria-label={ariaLabel}
              className={cn(
                "m-0 grid min-h-0 flex-1 list-none content-start gap-2 overflow-y-auto overscroll-contain p-0",
                hideScrollbar,
              )}
            >
              {rows.map((row) => {
                const id = getRowId(row)
                const muted = rowMuted?.(row) ?? false
                return (
                  <li
                    key={id}
                    data-state={picked.includes(id) ? "selected" : undefined}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={cn(
                      "bg-card border-border/40 data-[state=selected]:bg-primary/5 rounded-lg border p-3 text-[13px]",
                      onRowClick && "cursor-pointer",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {selectable ? (
                        <div className="pt-0.5">
                          <ListCheckbox
                            checked={picked.includes(id)}
                            onToggle={(e) => toggle(id, e)}
                            label="Select row"
                          />
                        </div>
                      ) : null}
                      <div className={cn("min-w-0 flex-1 font-medium break-words", muted && "opacity-50")}>
                        {primary?.cell(row)}
                      </div>
                      {showEnd ? (
                        <div className="-mt-1 -mr-1 shrink-0">
                          {rowEnd === "menu" && rowMenu ? (
                            <RowMenu label="Row actions">{rowMenu(row)}</RowMenu>
                          ) : (
                            <ChevronRightIcon aria-hidden="true" className="text-muted-foreground mt-1 size-4" />
                          )}
                        </div>
                      ) : null}
                    </div>
                    {rest.length > 0 ? (
                      <dl className={cn("mt-2 flex flex-wrap gap-x-4 gap-y-2", muted && "opacity-50")}>
                        {rest.map((c) => (
                          <div
                            key={c.id}
                            className="min-w-0 max-w-full"
                            onClick={c.interactive ? (e) => e.stopPropagation() : undefined}
                          >
                            <dt className="text-muted-foreground text-[11px]">{c.header}</dt>
                            <dd className="m-0 flex flex-wrap items-center gap-1.5">{c.cell(row)}</dd>
                          </div>
                        ))}
                      </dl>
                    ) : null}
                    {renderExpanded ? (
                      <div className="text-muted-foreground mt-2 border-t pt-2">{renderExpanded(row)}</div>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          )}

          {!fits ? null : bulkMenu ? (
            <ContextMenu>
              <ContextMenuTrigger render={<div ref={desktop} className={windowClass} />}>{grid}</ContextMenuTrigger>
              <ContextMenuContent>{bulkMenu(picked)}</ContextMenuContent>
            </ContextMenu>
          ) : (
            <div ref={desktop} className={windowClass}>
              {grid}
            </div>
          )}
        </>
      )}
      {footer}
    </div>
  )
}

/* ---------- Cell parts ---------- */

type Tone = "neutral" | "blue" | "green" | "amber" | "orange" | "red" | "purple"

const tones: Record<Tone, { soft: string; outline: string; solid: string; text: string }> = {
  neutral: {
    soft: "bg-muted text-foreground/80",
    outline: "border-border text-foreground/80",
    solid: "bg-foreground text-background",
    text: "text-muted-foreground",
  },
  blue: {
    soft: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
    outline: "border-blue-500/60 text-blue-700 dark:text-blue-400",
    solid: "bg-blue-600 text-white",
    text: "text-blue-700 dark:text-blue-400",
  },
  green: {
    soft: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
    outline: "border-emerald-500/60 text-emerald-700 dark:text-emerald-400",
    solid: "bg-emerald-600 text-white",
    text: "text-emerald-700 dark:text-emerald-400",
  },
  amber: {
    soft: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
    outline: "border-amber-500/60 text-amber-700 dark:text-amber-400",
    solid: "bg-amber-500 text-white",
    text: "text-amber-700 dark:text-amber-400",
  },
  orange: {
    soft: "bg-orange-500/15 text-orange-700 dark:text-orange-400",
    outline: "border-orange-500/60 text-orange-700 dark:text-orange-400",
    solid: "bg-orange-500 text-white",
    text: "text-orange-700 dark:text-orange-400",
  },
  red: {
    soft: "bg-red-500/15 text-red-700 dark:text-red-400",
    outline: "border-red-500/60 text-red-700 dark:text-red-400",
    solid: "bg-red-600 text-white",
    text: "text-red-700 dark:text-red-400",
  },
  purple: {
    soft: "bg-violet-500/15 text-violet-700 dark:text-violet-400",
    outline: "border-violet-500/60 text-violet-700 dark:text-violet-400",
    solid: "bg-violet-600 text-white",
    text: "text-violet-700 dark:text-violet-400",
  },
}

/**
 * A short label: status (Active, Paused), role (Hub admin), tag (1st, DL), flag
 * (Plan adjustment) or result (Confirmed). "soft" is a tinted pill, "outline"
 * a bordered pill, "solid" a filled pill, "text" colored CAPS text with no pill.
 */
function ListBadge({
  tone = "neutral",
  variant = "soft",
  size = "default",
  className,
  ...props
}: React.ComponentProps<"span"> & {
  tone?: Tone
  variant?: "soft" | "outline" | "solid" | "text"
  size?: "default" | "sm"
}) {
  return (
    <span
      data-slot="list-badge"
      className={cn(
        "inline-flex shrink-0 items-center font-medium whitespace-nowrap",
        variant === "text"
          ? "text-[11px] tracking-wide uppercase"
          : cn(
              "rounded-full",
              size === "sm" ? "h-4 px-1.5 text-[10px]" : "h-5 px-2 text-[11px]",
              variant === "outline" && "border",
            ),
        tones[tone][variant],
        className,
      )}
      {...props}
    />
  )
}

/**
 * The main name of a row, optionally a link, with a count and tags after it and
 * a second line under it.
 */
function ListTitle({
  children,
  href,
  onClick,
  count,
  tags,
  description,
  className,
}: {
  children: React.ReactNode
  href?: string
  onClick?: () => void
  /** Shown in parentheses after the name, for example the number of payments. */
  count?: number
  /** Small badges after the name. */
  tags?: React.ReactNode
  /** A second, muted line. */
  description?: React.ReactNode
  className?: string
}) {
  const link = !!(href || onClick)
  const name = link ? (
    <a
      href={href ?? "#"}
      onClick={(e) => {
        e.stopPropagation()
        if (onClick) {
          e.preventDefault()
          onClick()
        }
      }}
      className="truncate font-medium text-blue-700 underline-offset-2 hover:underline dark:text-blue-400"
    >
      {children}
    </a>
  ) : (
    <span className="truncate font-medium">{children}</span>
  )
  return (
    <span className={cn("flex min-w-0 flex-col", className)}>
      <span className="flex min-w-0 items-center gap-1.5">
        {name}
        {count != null ? <span className="text-muted-foreground shrink-0 tabular-nums">({count})</span> : null}
        {tags}
      </span>
      {description ? <span className="text-muted-foreground truncate text-[11px]">{description}</span> : null}
    </span>
  )
}

/** Monospace text: email senders, API keys, codes, "1.32 vs 1.30". Long text is cut with "...". */
function ListMono({ className, ...props }: React.ComponentProps<"span">) {
  return <span className={cn("truncate font-mono text-[12px]", className)} {...props} />
}

/** Secondary text: domains, sources ("Manual"), lists of names. */
function ListMuted({ className, ...props }: React.ComponentProps<"span">) {
  return <span className={cn("text-muted-foreground truncate", className)} {...props} />
}

/** Shown when a cell has no value. */
function ListNone() {
  return (
    <span className="text-muted-foreground" aria-label="None">
      -
    </span>
  )
}

/** A number with lined-up digits. Put it in a column with align: "end". */
function ListNumber({
  value,
  format = "number",
  decimals,
  mono = false,
  className,
}: {
  value: number | null | undefined
  format?: "number" | "currency" | "percent"
  /** Defaults: 0 for numbers and percents, 2 for currency. */
  decimals?: number
  mono?: boolean
  className?: string
}) {
  if (value == null) return <ListNone />
  const d = decimals ?? (format === "currency" ? 2 : 0)
  const text =
    format === "currency"
      ? value.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: d,
          maximumFractionDigits: d,
        })
      : format === "percent"
        ? `${value.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d })}%`
        : value.toLocaleString("en-US", {
            minimumFractionDigits: d,
            maximumFractionDigits: d,
          })
  return <span className={cn("tabular-nums", mono && "font-mono text-[12px]", className)}>{text}</span>
}

/** mm/dd/yyyy, or with time "mm/dd/yyyy, h:mm AM". Shown in America/New_York unless a zone is given. */
function formatListDate(date: Date, withTime = false, timeZone = "America/New_York") {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
      .formatToParts(date)
      .map((p) => [p.type, p.value]),
  )
  const day = `${parts.month}/${parts.day}/${parts.year}`
  return withTime ? `${day}, ${parts.hour}:${parts.minute} ${parts.dayPeriod}` : day
}

/** A date, with an optional small line under it ("Submitted 11/17/2026, 4:50 PM"). */
function ListDate({
  date,
  time = false,
  description,
  timeZone,
  className,
}: {
  date: Date | null | undefined
  time?: boolean
  description?: React.ReactNode
  timeZone?: string
  className?: string
}) {
  if (!date) return <ListNone />
  return (
    <span className={cn("flex flex-col", className)}>
      <span className="tabular-nums">{formatListDate(date, time, timeZone)}</span>
      {description ? <span className="text-muted-foreground text-[11px] tabular-nums">{description}</span> : null}
    </span>
  )
}

export {
  DataList,
  ListBadge,
  ListCheckbox,
  ListDate,
  ListMono,
  ListMuted,
  ListNone,
  ListNumber,
  ListTitle,
  SortIcon,
  formatListDate,
  sortRows,
}
export type { DataListColumn, DataListProps, ListSort }
