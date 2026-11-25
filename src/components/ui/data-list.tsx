"use client"

import * as React from "react"
import { CheckIcon, ChevronRightIcon, MinusIcon, MoreVerticalIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTextWidth } from "@/lib/text-width"
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
   * "grow": text that takes free room up to maxWidth (24rem by default), and squeezes like "fit".
   * Text never wraps, so every row keeps one height.
   */
  width?: "auto" | "fit" | "grow"
  /** Narrowest a "fit" or "grow" column gets before the list turns into cards. */
  minWidth?: string
  /** Widest the column gets. Every column has one: 14rem for "fit", 24rem for "grow", 20rem for "auto". */
  maxWidth?: string
  /**
   * The cell's plain text, for sizing. A column's width is fixed from the widest text over EVERY row
   * the list can show (`sizeFrom`, or the rows given) and its title, capped at maxWidth, so a page turn
   * or a sort never moves a column (owner rule, 11/25/2026). Give it to every column; one without it is
   * sized from the rows on screen and can shift, which the list reports while developing.
   */
  text?: (row: T) => string
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
  /** Every row the list can show, across all pages, so column widths are settled once. Default: rows. */
  sizeFrom?: T[]
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
  /**
   * Sub-rows (owner, 11/25/2026): the rows under a row, in the same columns, for example a merchant
   * and its bounced payments. They fold from one place, the toolbar's ToolbarFoldAll (pass it
   * `openRows` and `parentIds`); rows carry no chevron of their own. Sub-rows are indented, cannot
   * be selected, and count for column widths. They sort with their parent, never on their own.
   */
  children?: (row: T) => T[] | undefined
  /** Which rows show their sub-rows. Controlled when passed; otherwise kept here (`defaultOpen`). */
  openRows?: string[]
  onOpenRowsChange?: (ids: string[]) => void
  /** Every row with sub-rows starts open. Default false. */
  defaultOpen?: boolean
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

/* lead: extra width in front of the column (the select circle and expand
   arrow live inside the first column so they stay tight to it). */
/* A column without text(): as wide as its content up to its cap. No column ever takes the free room;
   the gaps share it evenly (owner rule, 11/25/2026). */
function track(c: DataListColumn<never>, lead = "0px") {
  const min = `calc(${c.minWidth ?? "6rem"} + ${lead})`
  if (c.width === "fit") return `minmax(min(${min}, calc(${c.maxWidth ?? "14rem"} + ${lead})), fit-content(calc(${c.maxWidth ?? "14rem"} + ${lead})))`
  if (c.width === "grow") return `minmax(min(${min}, calc(${c.maxWidth ?? "24rem"} + ${lead})), fit-content(calc(${c.maxWidth ?? "24rem"} + ${lead})))`
  return `fit-content(calc(${c.maxWidth ?? "20rem"} + ${lead}))`
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
      <DropdownMenuContent align="end">{children}</DropdownMenuContent>
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
  sizeFrom,
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
  children,
  openRows: openRowsProp,
  onOpenRowsChange,
  defaultOpen = false,
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

  /* Sub-rows: which parents are open. Controlled when the page passes them, otherwise kept here. */
  const kidsOf = (row: T) => (children ? children(row) ?? [] : [])
  const parentIds = React.useMemo(() => (children ? rows.filter((r) => kidsOf(r).length > 0).map(getRowId) : []), [rows, children, getRowId]) // eslint-disable-line react-hooks/exhaustive-deps
  const [ownOpen, setOwnOpen] = React.useState<string[] | null>(null)
  const openRows = openRowsProp ?? ownOpen ?? (defaultOpen ? parentIds : [])
  const setOpenRows = onOpenRowsChange ?? setOwnOpen
  void setOpenRows

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
  /* Every row across all pages (sizeFrom). Once the page's rows are all picked and there are more
     beyond it, a line under the titles offers to select every one of them (owner rule, 11/25/2026). */
  const everyId = React.useMemo(() => (sizeFrom ?? rows).map(getRowId), [sizeFrom, rows, getRowId])
  const everyPicked = everyId.length > 0 && everyId.every((id) => picked.includes(id))
  const offerAll = selectable && allPicked && everyId.length > rows.length
  const selectEveryRow = () => onSelectedChange?.([...new Set([...picked, ...everyId])])

  const sortBy = (column: string) => {
    if (!onSortChange) return
    if (sort?.column !== column) onSortChange({ column, dir: "asc" })
    else onSortChange(sort.dir === "asc" ? { column, dir: "desc" } : null)
  }

  const showEnd = rowEnd === "menu" ? !!rowMenu : rowEnd === "chevron"
  /* The expand arrow and select circle sit inside the first column, a fixed
     gap before its content. Free room is shared out evenly between the
     columns (justify-content: space-between), so the first column stays at
     the left edge, the row end stays at the right edge, and every gap in
     between is the same. */
  const leadCount = (renderExpanded ? 1 : 0) + (selectable ? 1 : 0)
  /* Column widths, settled once from every row the list can show (owner rule, 11/25/2026): the widest
     text of each column and its title, capped at the column's maxWidth. A page turn or a sort never
     moves a column. A column without `text` keeps the browser's max-content width and can shift. */
  const textWidth = useTextWidth()
  const sizeRows = sizeFrom ?? rows
  const shapeKey = columns.map((c) => `${c.id}:${c.width ?? "auto"}:${c.maxWidth ?? ""}:${c.minWidth ?? ""}:${!!c.text}`).join("|")
  const widths = React.useMemo(() => {
    const out: Record<string, number | null> = {}
    for (const c of columns) {
      if (!c.text) {
        out[c.id] = null
        continue
      }
      const title = typeof c.header === "string" ? c.header : ""
      let w = textWidth(title, 600, 11, 0.5) + (c.sortable ? 20 : 0)
      for (const row of sizeRows) {
        w = Math.max(w, textWidth(c.text(row), c.primary ? 500 : 400, 13))
        if (children) for (const kid of children(row) ?? []) w = Math.max(w, textWidth(c.text(kid), 400, 13) + (c === columns[0] ? 20 : 0))
      }
      out[c.id] = Math.ceil(w) + 2
    }
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shapeKey, sizeRows, textWidth])
  React.useEffect(() => {
    if (process.env.NODE_ENV === "production") return
    for (const c of columns) {
      if (!c.text) console.warn(`DataList: column "${c.id}" has no text(), so its width comes from the rows on screen and can move on a page turn or a sort. Give every column a text().`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shapeKey])
  const capOf = (c: DataListColumn<never>) => c.maxWidth ?? (c.width === "grow" ? "24rem" : c.width === "fit" ? "14rem" : "20rem")
  const fixedTrack = (c: DataListColumn<never>, lead: string) => {
    const w = widths[c.id]
    if (w == null) return track(c, lead)
    const cap = capOf(c)
    const size = `min(calc(${w}px + ${lead}), calc(${cap} + ${lead}))`
    if (c.width === "fit" || c.width === "grow") {
      const min = `calc(${c.minWidth ?? "6rem"} + ${lead})`
      // Squeezes toward minWidth when room runs short; otherwise exactly its settled width.
      return `minmax(min(${min}, ${size}), ${size})`
    }
    return size
  }
  const template = [
    ...columns.map((c, i) => fixedTrack(c as DataListColumn<never>, i === 0 && leadCount ? "var(--lead)" : "0px")),
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
        {columns.map((c, i) => {
          const active = sort?.column === c.id
          const dir = active ? sort.dir : null
          return (
            <div
              key={c.id}
              role="columnheader"
              aria-sort={
                c.sortable ? (dir === "asc" ? "ascending" : dir === "desc" ? "descending" : "none") : undefined
              }
              className={cn(
                "flex min-w-0 items-center overflow-hidden whitespace-nowrap select-none",
                i === 0 && leadCount ? "gap-(--gap)" : alignClass(c.align),
              )}
            >
              {i === 0 && renderExpanded ? <span aria-hidden="true" className="w-4 shrink-0" /> : null}
              {i === 0 && selectable ? (
                <ListCheckbox
                  checked={allPicked}
                  indeterminate={pickedHere > 0 && !allPicked}
                  onToggle={toggleAll}
                  label="Select all"
                />
              ) : null}
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
        {showEnd ? (
          <div role="columnheader">
            <span className="sr-only">Actions</span>
          </div>
        ) : null}
      </div>
    )

  const renderRow = (row: T, depth: number, last = false) => {
    const id = getRowId(row)
    const kids = depth === 0 ? kidsOf(row) : []
    const hasKids = kids.length > 0
    const kidsOpen = hasKids && openRows.includes(id)
    const sub = depth > 0
    const on = !sub && picked.includes(id)
    const open = expanded.includes(id)
    const muted = rowMuted?.(row) ?? false
    const clickable = !!onRowClick
    return (
      <div
        key={id}
        role="row"
        aria-level={children ? depth + 1 : undefined}
        aria-selected={selectable && !sub ? on : undefined}
        aria-expanded={renderExpanded ? open : hasKids ? kidsOpen : undefined}
        data-state={on ? "selected" : undefined}
        data-sub={sub ? "" : undefined}
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
          "group relative col-span-full grid grid-cols-subgrid items-center px-3 text-[13px] transition-colors outline-none",
          rowHeight[density],
          cards ? "bg-card border-border/60 rounded-lg border" : "border-border/40 border-b last:border-b-0",
          "hover:bg-muted/30 data-[state=selected]:bg-primary/5 focus-visible:bg-muted/40",
          clickable && "cursor-pointer",
          // A sub-row: a shade darker, so the parent reads as the line that speaks for it, with the
          // tree guide a sidebar draws for its sub-items: a line down from the parent and a tick in.
          sub && "bg-muted/20 hover:bg-muted/40",
          // The line runs under the parent's name (past its select circle and marker), as a sidebar's
          // sub-items hang under their parent's label.
          sub && "before:bg-sidebar-border/70 after:border-sidebar-border/70 before:absolute before:top-0 before:bottom-0 before:left-[4.1rem] before:w-px after:absolute after:top-0 after:left-[4.1rem] after:h-1/2 after:w-3 after:border-b after:border-l",
          sub && last && "before:bottom-1/2",
        )}
      >
        {columns.map((c, i) => {
          const text = squeezes(c as DataListColumn<never>)
          const lead = i === 0 && leadCount > 0
          const content = (
            <div
              role={lead ? undefined : "cell"}
              data-sub-cell={sub && i === 0 ? "" : undefined}
              onClick={c.interactive ? (e) => e.stopPropagation() : undefined}
              onKeyDown={c.interactive ? (e) => e.stopPropagation() : undefined}
              style={{ maxWidth: capOf(c as DataListColumn<never>) }}
              className={cn(
                "min-w-0 whitespace-nowrap",
                // Text columns cut what doesn't fit with "...". Other columns line their parts up in a row.
                text ? "truncate" : "flex items-center gap-1.5 overflow-hidden",
                text && c.align === "end" && "text-right",
                !text && alignClass(c.align),
                lead && "flex-1",
                muted && !c.interactive && "opacity-50",
                // Under the tick: the text starts just past it.
                // Right after the tick: the tick ends at 4.85rem from the row's edge; the cell starts after the row's padding and the lead slots.
                sub && i === 0 && "pl-[calc(4.35rem-var(--lead))]",
              )}
            >
              {c.cell(row)}
            </div>
          )
          if (!lead) return <React.Fragment key={c.id}>{content}</React.Fragment>
          return (
            <div key={c.id} role="cell" className="flex min-w-0 items-center gap-(--gap)">
              {renderExpanded ? (
                <div className="flex shrink-0">
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
                <div className="flex shrink-0">
                  {sub ? <span aria-hidden="true" className="inline-block size-4" /> : <ListCheckbox checked={on} onToggle={(e) => toggle(id, e)} label="Select row" />}
                </div>
              ) : null}
              {content}
            </div>
          )
        })}
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
  }
  const body = rows.flatMap((row) => {
    const parent = renderRow(row, 0)
    const kids = kidsOf(row)
    if (!kids.length || !openRows.includes(getRowId(row))) return [parent]
    return [parent, ...kids.map((kid, k) => renderRow(kid, 1, k === kids.length - 1))]
  })

  const grid = (
    <div
      role="table"
      aria-label={ariaLabel}
      ref={table}
      className={cn("grid w-full justify-between gap-x-(--gap)", cards && "gap-y-2")}
      style={
        {
          gridTemplateColumns: template,
          "--gap": fit === "tight" ? "0.75rem" : "1.5rem",
          // Width of the select circle and expand arrow, each 1rem plus a gap.
          "--lead": `calc(${leadCount} * (1rem + var(--gap)))`,
        } as React.CSSProperties
      }
    >
      {header}
      {offerAll ? (
        <div
          role="row"
          className="bg-primary/5 text-muted-foreground col-span-full border-b border-border/40 px-3 py-1.5 text-center text-[12px]"
        >
          {everyPicked ? (
            <span>
              All {everyId.length.toLocaleString("en-US")} selected.{" "}
              <button type="button" className="text-foreground underline-offset-2 hover:underline" onClick={() => onSelectedChange?.([])}>
                Clear
              </button>
            </span>
          ) : (
            <span>
              {pickedHere.toLocaleString("en-US")} on this page selected.{" "}
              <button type="button" className="text-foreground underline-offset-2 hover:underline" onClick={selectEveryRow}>
                Select all {everyId.length.toLocaleString("en-US")}
              </button>
            </span>
          )}
        </div>
      ) : null}
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

/*
 * A multi-line text field inside a row, for notes, like the Notes column on
 * the Sales Deals table: 64px tall, as wide as its column, and the person can
 * drag its corner to make it taller. The text is saved when they leave the
 * field. While saving is true the field is locked. Give its column
 * interactive: true so clicks stay in the field instead of opening the row.
 */
function ListTextarea({
  value,
  onValueChange,
  saving = false,
  maxLength = 4000,
  placeholder,
  className,
  "aria-label": ariaLabel,
}: {
  value: string
  /** Called with the new text when the person leaves the field. */
  onValueChange: (value: string) => void
  /** Locks the field while the app saves. */
  saving?: boolean
  maxLength?: number
  placeholder?: string
  className?: string
  "aria-label"?: string
}) {
  const [draft, setDraft] = React.useState(value)
  React.useEffect(() => setDraft(value), [value])
  return (
    <textarea
      value={draft}
      placeholder={placeholder}
      aria-label={ariaLabel}
      maxLength={maxLength}
      disabled={saving}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        if (draft !== value) onValueChange(draft)
      }}
      className={cn(
        "border-input dark:bg-input/30 placeholder:text-muted-foreground block min-h-16 w-full resize-y rounded-md border bg-transparent px-2 py-1 text-sm outline-none disabled:opacity-50",
        "focus-visible:shadow-[0_0_0_2px_color-mix(in_oklch,var(--foreground)_8%,transparent),0_0_5px_color-mix(in_oklch,var(--foreground)_12%,transparent)]",
        className,
      )}
    />
  )
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
  ListTextarea,
  ListTitle,
  SortIcon,
  formatListDate,
  sortRows,
}
export type { DataListColumn, DataListProps, ListSort }
