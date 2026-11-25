"use client"

import * as React from "react"
import { PinIcon, PinOffIcon, SparklesIcon } from "lucide-react"
import { ContextMenu as ContextMenuPrimitive } from "@base-ui/react/context-menu"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator } from "@/components/ui/context-menu"
import { CustomizeMenu } from "@/components/ui/customize-menu"
import { ListPagination } from "@/components/ui/list-pagination"
import {
  ReportGridCard,
  ReportGridCell,
  ReportGridColumns,
  ReportGridGroupLabel,
  ReportGridRow,
  ReportGridScroll,
  ReportGridTable,
  ReportGridTotalRow,
} from "@/components/ui/report-grid"
import { DateRangePicker, defaultDatePresets } from "@/components/ui/date-range-picker"
import {
  Toolbar,
  ToolbarTabs,
  ToolbarDateRange,
  ToolbarTreeFilter,
  ToolbarExport,
  ToolbarFilter,
  ToolbarFilterDialog,
  ToolbarLabel,
  ToolbarReportLibrary,
  ToolbarSearch,
} from "@/components/ui/toolbar"

/*
 * Report: the whole reports page as one component. An app plugs its data in
 * and gets every rule of the page from here, the same on every page and in
 * every app:
 *
 *   - the bar, always in this order: tabs (Table, Charts), Chat, Search, Reports, the period,
 *     the report's own choices, Columns, Filters (or the date range alone), Export; icons only on a phone. Everything a person chooses
 *     is on the bar: nothing is picked from inside the page
 *   - the grid: column titles that sort (up, down, then back to the report's
 *     own order) and drag to a new place with a line showing where they land;
 *     groups that fold; subtotals; a Total band with equal space above and
 *     below its text; thin scrollbars; drag anywhere to pan
 *   - column widths settled from the whole report (the widest value of each
 *     column, its title and its total), so sorting or paging never moves a
 *     column
 *   - drag the right edge of a column title to make the column wider or narrower, as in a
 *     spreadsheet; double-click the edge to give the width back; the widths are for viewing only
 *     and are not kept
 *   - right-click (or long-press) a column or a row to freeze it: a frozen column stays at the
 *     left while the rest scroll sideways, a frozen row stays under the titles while the rest
 *     scroll up and down; the same menu unfreezes
 *   - only the rows in view are drawn, so a report of tens of thousands of
 *     rows stays fast
 *   - a report with more than a grid: tabs to switch what it shows (Table, Charts), a summary
 *     over the grids (figures, charts) and a note under them, each in its set place
 *   - a cell can be marked good or bad (green, red); the grid colors it
 *   - the footer: page size, "Showing x-y of total", Previous, a page number
 *     you can type, Next
 *
 * The app owns the data and nothing else: which rows, which columns, what a
 * cell says, what the filters are, and what happens on save, export or a row
 * click. It never styles, sizes, orders or wires any of the above.
 */

type ReportColumn = {
  key: string
  label: string
  /** Numbers, money, percents: digits line up. */
  numeric?: boolean
}

type ReportSort = { key: string; dir: "asc" | "desc" } | null

/** What is frozen in a grid: column keys (kept at the left) and row keys (kept under the titles). */
type ReportFrozen = { columns: string[]; rows: string[] }

/** One line of the grid, top to bottom. The app decides the lines; the grid decides how they look. */
type ReportItem<Row> =
  | { kind: "row"; key: string; row: Row }
  | {
      kind: "group"
      key: string
      label: React.ReactNode
      /** Shown in gray after the label, for example "(12 units)". */
      count?: React.ReactNode
      collapsed?: boolean
      onToggle?: () => void
      /** 1 for a group inside a group. */
      depth?: number
    }
  | {
      kind: "subtotal"
      key: string
      /** Text for the first column, for example "Northwind (12 units)". */
      label: React.ReactNode
      /** The other columns' totals, by column key. */
      values: Record<string, React.ReactNode>
      /** An outer total reads stronger than the subtotals inside it. Default true. */
      strong?: boolean
      depth?: number
    }
  | { kind: "gap"; key: string }

type ReportGridProps<Row> = {
  /** The grid's name for screen readers only. Never drawn: no heading above a grid (owner, 11/25/2026). */
  title?: string
  /** In a stacked report on a wide screen: how much of the row the grid takes. Default "full". */
  span?: "full" | "half" | "third"
  /** Shown columns, in order. */
  columns: ReportColumn[]
  items: ReportItem<Row>[]
  /** What a cell shows. */
  cell: (column: ReportColumn, row: Row) => React.ReactNode
  /**
   * The widest text of each column across the WHOLE report, not just the rows loaded (several
   * candidates are fine). Column widths come from these, the titles and the totals, so they are
   * settled before anyone sorts or pages. A column with none is sized from the rows loaded so far
   * and can then only grow.
   */
  widest?: Record<string, string[]>
  /** Plain text of a cell, used to size a column that has no `widest`. */
  cellText?: (column: ReportColumn, row: Row) => string
  /** The Total band, by column key. The first column says "Total". Leave out for no Total band. */
  totals?: Record<string, string>
  /** The first column's text in the Total band. Default "Total". */
  totalLabel?: string
  /** What a Total cell shows when it is more than its text, for example a link. `totals` still sizes the column. */
  totalCell?: (column: ReportColumn) => React.ReactNode
  /** Marks a cell good (green) or bad (red), for example a figure over or under its target. */
  cellTone?: (column: ReportColumn, row: Row) => "good" | "bad" | undefined
  /** Frozen when the grid first shows, for example the first column of a wide grid. People can still unfreeze it. */
  defaultFrozen?: ReportFrozen
  /**
   * Every grid sorts, reorders its columns and freezes with nothing passed: it keeps that itself while
   * it is open (owner, 11/25/2026: one feature set on every report window). Pass sort and onSortChange,
   * or onColumnsReorder, only to own that state, for example to sort on the server or save it with a
   * report. With onSortChange the app sorts the rows; without it the grid sorts them by their text.
   */
  sort?: ReportSort
  onSortChange?: (sort: ReportSort) => void
  onColumnsReorder?: (keys: string[]) => void
  onRowClick?: (row: Row) => void
  /** The last rows are in view: the app may load the next ones. */
  onEndReached?: () => void
  /** Rows are being replaced: the grid dims while it waits. */
  refreshing?: boolean
  /** Column keys whose values are still loading. */
  pendingColumns?: string[]
  /** Shown instead of the grid when there are no items. */
  empty?: React.ReactNode
  /**
   * Freezing works on every grid with nothing passed: the grid remembers what is frozen while it is
   * open. Pass both of these only to keep that somewhere, for example saved with a report.
   */
  frozen?: ReportFrozen
  onFrozenChange?: (frozen: ReportFrozen) => void
}

const ROW = 32 // every line of the grid; the reason only the rows in view need drawing
const GAP = 16
const OVERSCAN = 12

const itemHeight = (item: { kind: string }) => (item.kind === "gap" ? GAP : ROW)

/* A frozen cell rides over the cells scrolling under it, so its background is solid: the same
   color its row would show, mixed over the card instead of see-through. */
const mix = (pct: number) => `color-mix(in oklab, var(--muted) ${pct}%, var(--card))`
const FROZEN_BG = {
  row: "bg-card [tr:hover>&]:bg-[color-mix(in_oklab,var(--muted)_50%,var(--card))]",
  band: "bg-muted",
}
const NO_FROZEN: ReportFrozen = { columns: [], rows: [] }
/* A marked cell: solid, so it also reads right on a frozen column. */
const TONE = {
  none: null,
  good: "bg-[color-mix(in_oklab,var(--color-emerald-500)_15%,var(--card))]! text-emerald-800 dark:text-emerald-300",
  bad: "bg-[color-mix(in_oklab,var(--destructive)_15%,var(--card))]! text-destructive",
}

/** Text widths, measured once per distinct string in the page's own font. */
function useTextWidth() {
  const ctx = React.useMemo(
    () => (typeof document === "undefined" ? null : document.createElement("canvas").getContext("2d")),
    [],
  )
  const family = React.useMemo(
    () => (typeof document === "undefined" ? "sans-serif" : getComputedStyle(document.body).fontFamily || "sans-serif"),
    [],
  )
  return React.useCallback(
    (text: string, weight: number, size: number, spacing = 0) => {
      if (!ctx) return text.length * size * 0.6
      ctx.font = `${weight} ${size}px ${family}`
      return ctx.measureText(text).width + spacing * text.length
    },
    [ctx, family],
  )
}

function ReportGrid<Row>({
  title,
  span: _span,
  columns: columnsProp,
  items: givenItems,
  cell,
  widest,
  cellText,
  totals,
  totalLabel = "Total",
  totalCell,
  cellTone,
  defaultFrozen,
  sort = null,
  onSortChange,
  onColumnsReorder,
  onRowClick,
  onEndReached,
  refreshing,
  pendingColumns,
  empty,
  frozen: frozenProp,
  onFrozenChange,
  className,
}: ReportGridProps<Row> & { className?: string }) {
  const textWidth = useTextWidth()

  /* Sort and column order the grid keeps itself when the app does not own them. */
  const [ownSort, setOwnSort] = React.useState<ReportSort>(null)
  const sortState = onSortChange ? sort : ownSort
  const changeSort = onSortChange ?? setOwnSort
  const [ownOrder, setOwnOrder] = React.useState<string[] | null>(null)
  const givenColumns = React.useMemo(() => {
    if (onColumnsReorder || !ownOrder) return columnsProp
    const byKey = new Map(columnsProp.map((c) => [c.key, c]))
    const placed = ownOrder.map((k) => byKey.get(k)).filter((c): c is ReportColumn => !!c)
    const rest = columnsProp.filter((c) => !ownOrder.includes(c.key))
    return [...placed, ...rest]
  }, [columnsProp, ownOrder, onColumnsReorder])
  const allItems = React.useMemo(() => {
    if (onSortChange || !ownSort || !cellText) return givenItems
    const column = columnsProp.find((c) => c.key === ownSort.key)
    if (!column) return givenItems
    // A figure ($1,234.50, 12%) sorts as a number and a date (mm/dd/yyyy) as a date; anything else as text.
    const num = (t: string) => {
      const date = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(t.trim())
      if (date) return new Date(Number(date[3]), Number(date[1]) - 1, Number(date[2])).getTime()
      if (!/[0-9]/.test(t)) return null
      const n = Number(t.replace(/[^0-9.-]/g, ""))
      return Number.isNaN(n) ? null : n
    }
    const compare = (a: Row, b: Row) => {
      const ta = cellText(column, a)
      const tb = cellText(column, b)
      const na = num(ta)
      const nb = num(tb)
      const out = na != null && nb != null ? na - nb : ta.localeCompare(tb, undefined, { numeric: true, sensitivity: "base" })
      return ownSort.dir === "asc" ? out : -out
    }
    // Rows are sorted within their run (between group lines and subtotals), so groups keep their shape.
    const out: ReportItem<Row>[] = []
    let run: Extract<ReportItem<Row>, { kind: "row" }>[] = []
    const flush = () => {
      if (run.length) out.push(...[...run].sort((a, b) => compare(a.row, b.row)))
      run = []
    }
    for (const item of givenItems) {
      if (item.kind === "row") run.push(item)
      else {
        flush()
        out.push(item)
      }
    }
    flush()
    return out
  }, [givenItems, ownSort, onSortChange, cellText, columnsProp])

  /* Frozen columns and rows. Frozen columns are drawn first, in their own order, and stay at the
     left. Frozen rows are drawn under the titles and stay there. */
  const [ownFrozen, setOwnFrozen] = React.useState<ReportFrozen>(defaultFrozen ?? NO_FROZEN)
  const frozen = frozenProp ?? ownFrozen
  const setFrozen = (next: ReportFrozen) => {
    if (!frozenProp) setOwnFrozen(next)
    onFrozenChange?.(next)
  }
  const frozenColumns = givenColumns.filter((c) => frozen.columns.includes(c.key))
  const frozenCount = frozenColumns.length
  const columns = frozenCount
    ? [...frozenColumns, ...givenColumns.filter((c) => !frozen.columns.includes(c.key))]
    : givenColumns
  const keys = columns.map((c) => c.key)
  const frozenRowSet = new Set(frozen.rows)
  const isFrozenRow = (item: ReportItem<Row>) => item.kind === "row" && frozenRowSet.has(item.key)
  const frozenItems = frozenRowSet.size ? allItems.filter(isFrozenRow) : []
  const items = frozenItems.length ? allItems.filter((item) => !isFrozenRow(item)) : allItems
  /** What was right-clicked: the menu offers to freeze or unfreeze exactly that. */
  const [target, setTarget] = React.useState<{ col?: string; row?: string }>({})

  /* Column widths. Settled from the whole report where the app says what is widest; otherwise from
     the rows loaded so far, kept in a ref so a column only ever grows and never jumps back. */
  const grown = React.useRef<Record<string, number>>({})
  const autoWidths = React.useMemo(() => {
    return columns.map((c, i) => {
      let w = 0
      const known = widest?.[c.key]
      if (known?.length) {
        for (const t of known) w = Math.max(w, textWidth(t, 400, 13))
      } else if (cellText) {
        const seen = new Set<string>()
        for (const item of allItems) if (item.kind === "row") seen.add(cellText(c, item.row))
        for (const t of seen) w = Math.max(w, textWidth(t, 400, 13))
        w = Math.max(w, grown.current[c.key] ?? 0)
        grown.current[c.key] = w
      }
      const total = i === 0 && totals ? totalLabel : (totals?.[c.key] ?? "")
      w = Math.max(w, textWidth(total, 600, 13))
      // Title: 11px semibold caps with wide letter spacing, then the 11px sort arrows after a 4px gap.
      w = Math.max(w, textWidth(c.label.toUpperCase(), 600, 11, 11 * 0.05) + 15)
      // Cell padding 8px a side, the first column 16px on the left, a few px for rounding.
      return Math.ceil(w + 16 + (i === 0 ? 8 : 0) + 4)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keys.join("\u0001"), widest, totals, totalLabel, allItems, textWidth])

  /* Widths a person set by dragging a title's edge. For viewing only: kept while the grid is open. */
  const [sized, setSized] = React.useState<Record<string, number>>({})
  const colWidths = autoWidths.map((w, i) => sized[columns[i]!.key] ?? w)

  /* Where each frozen column sits: after the frozen columns before it. */
  const lefts: number[] = []
  for (let i = 0, x = 0; i < frozenCount; i += 1) {
    lefts.push(x)
    x += colWidths[i] ?? 0
  }
  const edge = "inset -1px 0 0 var(--border)" // the line down the last frozen column
  const under = "inset 0 -1px 0 var(--border)" // the line under a frozen row
  /** Pins a cell: `col` its column's place, `frozenRow` its place among the frozen rows (or none). */
  const pin = (col: number, z: number, frozenRow?: number, background?: string): React.CSSProperties | undefined => {
    const inColumn = col < frozenCount
    if (!inColumn && frozenRow == null) return undefined
    const shadows = [inColumn && col === frozenCount - 1 ? edge : "", frozenRow != null ? under : ""].filter(Boolean)
    return {
      position: "sticky",
      left: inColumn ? lefts[col] : undefined,
      top: frozenRow != null ? ROW * (1 + frozenRow) : undefined,
      zIndex: z + (inColumn ? 1 : 0),
      boxShadow: shadows.join(", ") || undefined,
      background,
    }
  }

  /* Only the lines in view are drawn. Every line has a known height, so the rest is two spacers. */
  const [view, setView] = React.useState({ scrollTop: 0, height: 0 })
  const offsets = React.useMemo(() => {
    const out = new Array<number>(items.length + 1)
    out[0] = 0
    for (let i = 0; i < items.length; i += 1) out[i + 1] = out[i]! + itemHeight(items[i]!)
    return out
  }, [items])
  const totalHeight = offsets[items.length] ?? 0
  const windowed = items.length > 80
  let start = 0
  let end = items.length
  if (windowed) {
    const top = Math.max(0, view.scrollTop - ROW) // the title band scrolls with nothing; rows start under it
    const bottom = top + (view.height || 800)
    start = 0
    while (start < items.length && offsets[start + 1]! < top) start += 1
    end = start
    while (end < items.length && offsets[end]! < bottom) end += 1
    start = Math.max(0, start - OVERSCAN)
    end = Math.min(items.length, end + OVERSCAN)
  }
  const padTop = offsets[start] ?? 0
  const padBottom = totalHeight - (offsets[end] ?? totalHeight)

  const onEndRef = React.useRef(onEndReached)
  onEndRef.current = onEndReached
  React.useEffect(() => {
    if (items.length > 0 && end >= items.length) onEndRef.current?.()
  }, [end, items.length])

  // The sort cycle, the same on every report: up, down, then back to the report's own order.
  const cycle = (key: string) => {
    if (sortState?.key !== key) changeSort({ key, dir: "asc" })
    else if (sortState.dir === "asc") changeSort({ key, dir: "desc" })
    else changeSort(null)
  }

  const pad = (px: number, key: string) =>
    px > 0 ? (
      <tr key={key} aria-hidden="true">
        <td colSpan={Math.max(columns.length, 1)} style={{ height: px, padding: 0, border: 0 }} />
      </tr>
    ) : null

  const line = (item: ReportItem<Row>, frozenRow?: number) => {
    if (item.kind === "gap") return pad(GAP, item.key)
    if (item.kind === "group") {
      return (
        <ReportGridRow key={item.key} tone="group" aria-expanded={!item.collapsed} onClick={item.onToggle}>
          <ReportGridCell colSpan={Math.max(columns.length, 1)} className={cn(item.depth ? "pl-8! font-normal" : null)}>
            <ReportGridGroupLabel collapsed={item.collapsed} count={item.count}>
              {item.label}
            </ReportGridGroupLabel>
          </ReportGridCell>
        </ReportGridRow>
      )
    }
    if (item.kind === "subtotal") {
      return (
        <ReportGridRow key={item.key} tone={item.strong === false ? "subtotal-light" : "subtotal"}>
          {columns.map((c, i) => (
            <ReportGridCell
              key={c.key}
              data-col={c.key}
              numeric={c.numeric}
              className={cn(i === 0 && item.depth ? "pl-8!" : null)}
              style={pin(i, 4, undefined, mix(item.strong === false ? 30 : 60))}
            >
              {i === 0 ? item.label : (item.values[c.key] ?? "")}
            </ReportGridCell>
          ))}
        </ReportGridRow>
      )
    }
    return (
      <ReportGridRow
        key={item.key}
        data-row={item.key}
        clickable={!!onRowClick}
        onClick={onRowClick ? () => onRowClick(item.row) : undefined}
      >
        {columns.map((c, i) => (
          <ReportGridCell
            key={c.key}
            data-col={c.key}
            numeric={c.numeric}
            className={cn(i < frozenCount || frozenRow != null ? FROZEN_BG.row : null, TONE[cellTone?.(c, item.row) ?? "none"])}
            style={pin(i, frozenRow != null ? 7 : 4, frozenRow)}
          >
            {pendingColumns?.includes(c.key) && cell(c, item.row) == null ? (
              <span className="bg-muted inline-block h-3 w-12 animate-pulse rounded" aria-label="Loading" />
            ) : (
              cell(c, item.row)
            )}
          </ReportGridCell>
        ))}
      </ReportGridRow>
    )
  }

  return (
    <ReportGridCard className={cn("h-full flex-1", className)}>
      <h2 className="sr-only">{title || "Report"}</h2>
      <div className="min-h-0 flex-1 overflow-hidden">
        {allItems.length === 0 ? (
          <div className="text-muted-foreground flex h-full min-h-24 items-center justify-center text-[13px]">
            {empty ?? "No rows match these filters."}
          </div>
        ) : (
          <ReportGridScroll onViewport={setView}>
           <ContextMenu>
            <ContextMenuPrimitive.Trigger
              render={
                <ReportGridTable
                  className="min-w-full"
                  style={{ tableLayout: "fixed", width: colWidths.reduce((a, b) => a + b, 0) }}
                />
              }
              // Runs before the menu opens: note what was pressed. A link keeps the browser's own menu,
              // and so does anything that is neither a column nor a row (a group's heading).
              onContextMenuCapture={(e) => {
                const el = e.target as HTMLElement
                const col = el.closest<HTMLElement>("[data-col]")?.dataset.col
                const row = el.closest<HTMLElement>("tr[data-row]")?.dataset.row
                if (el.closest("a") || (!col && !row)) {
                  e.stopPropagation()
                  return
                }
                setTarget({ col, row })
              }}
            >
              <colgroup>
                {colWidths.map((w, i) => (
                  <col key={columns[i]!.key} style={{ width: w }} />
                ))}
              </colgroup>
              <thead>
                <ReportGridColumns
                  columns={columns}
                  sort={sortState}
                  onSort={cycle}
                  onReorder={(key, target, side) => {
                    const next = keys.filter((k) => k !== key)
                    next.splice(next.indexOf(target) + (side === "after" ? 1 : 0), 0, key)
                    ;(onColumnsReorder ?? setOwnOrder)(next)
                  }}
                  headClassName="sticky top-0 z-10"
                  onResize={(key, width) =>
                    setSized((cur) => {
                      const next = { ...cur }
                      if (width == null) delete next[key]
                      else next[key] = width
                      return next
                    })
                  }
                  headProps={(c, i) => ({ "data-col": c.key, style: i < frozenCount ? pin(i, 20) : undefined })}
                />
                {frozenItems.map((item, i) => line(item, i))}
              </thead>
              <tbody className={cn("transition-opacity duration-300", refreshing && "opacity-40")} aria-busy={refreshing || undefined}>
                {pad(padTop, "pad-top")}
                {items.slice(start, end).map((item) => line(item))}
                {pad(padBottom, "pad-bottom")}
              </tbody>
              {totals ? (
                <tfoot>
                  <ReportGridTotalRow className="sticky bottom-0 z-10">
                    {columns.map((c, i) => (
                      <ReportGridCell
                        key={c.key}
                        data-col={c.key}
                        numeric={c.numeric}
                        className={cn("h-[calc(2rem+var(--hbar,0px))] pb-(--hbar-pad)", i < frozenCount && FROZEN_BG.band)}
                        style={pin(i, 4)}
                      >
                        {totalCell?.(c) ?? (i === 0 ? totalLabel : (totals[c.key] ?? ""))}
                      </ReportGridCell>
                    ))}
                  </ReportGridTotalRow>
                </tfoot>
              ) : null}
            </ContextMenuPrimitive.Trigger>
            <ContextMenuContent className="min-w-44">
              {target.col ? (
                frozen.columns.includes(target.col) ? (
                  <ContextMenuItem
                    onClick={() => setFrozen({ ...frozen, columns: frozen.columns.filter((k) => k !== target.col) })}
                  >
                    <PinOffIcon aria-hidden /> Unfreeze column
                  </ContextMenuItem>
                ) : (
                  <ContextMenuItem onClick={() => setFrozen({ ...frozen, columns: [...frozen.columns, target.col!] })}>
                    <PinIcon aria-hidden /> Freeze column
                  </ContextMenuItem>
                )
              ) : null}
              {target.row ? (
                frozen.rows.includes(target.row) ? (
                  <ContextMenuItem onClick={() => setFrozen({ ...frozen, rows: frozen.rows.filter((k) => k !== target.row) })}>
                    <PinOffIcon aria-hidden /> Unfreeze row
                  </ContextMenuItem>
                ) : (
                  <ContextMenuItem onClick={() => setFrozen({ ...frozen, rows: [...frozen.rows, target.row!] })}>
                    <PinIcon aria-hidden /> Freeze row
                  </ContextMenuItem>
                )
              ) : null}
              {frozen.columns.length + frozen.rows.length > 0 ? (
                <>
                  <ContextMenuSeparator />
                  <ContextMenuItem onClick={() => setFrozen(NO_FROZEN)}>
                    <PinOffIcon aria-hidden /> Unfreeze all
                  </ContextMenuItem>
                </>
              ) : null}
            </ContextMenuContent>
           </ContextMenu>
          </ReportGridScroll>
        )}
      </div>
    </ReportGridCard>
  )
}

type ReportProps<Row> = {
  /** Chat about the report. Leave out to hide the button. */
  onChat?: () => void
  /** Search field. Any input props; leave out to hide it. */
  search?: React.ComponentProps<typeof ToolbarSearch>
  /** Saved reports. Leave out to hide the menu. */
  library?: React.ComponentProps<typeof ToolbarReportLibrary>
  /** The Columns menu. Leave out to hide it. */
  columnsMenu?: Omit<React.ComponentProps<typeof CustomizeMenu<string>>, "label">
  /** The Filters dialog. Leave out to hide it. */
  filters?: React.ComponentProps<typeof ToolbarFilterDialog>
  /**
   * The report's date range. It sits at the top of the Filters dialog (on the bar itself when the
   * report has no Filters dialog), with the
   * library's periods (days, weeks, months, quarters, years), and counts as one applied filter.
   */
  dateRange?: Omit<React.ComponentProps<typeof DateRangePicker>, "value" | "onChange"> & {
    value: { from?: Date; to?: Date }
    onValueChange: (value: { from?: Date; to?: Date }) => void
    /** What the dates are of, when "Date range" is not enough, for example "Funding month". */
    label?: string
  }
  /** Export: formats, download and email. Leave out to hide it. */
  exportMenu?: React.ComponentProps<typeof ToolbarExport>
  /** One grid, or two for a report with a summary over its rows. */
  grids: ReportGridProps<Row>[]
  /** Switches what the report shows, for example Table and Charts. First on the bar. */
  tabs?: React.ComponentProps<typeof ToolbarTabs>
  /**
   * The report's own choices as dropdowns on the bar: a filter with a short list, a chart's type
   * and its metrics. Each needs its own icon (a phone shows icons only) and a key.
   */
  /**
   * The report's period as a dropdown of checkboxes in groups (months under years, week endings
   * under months), named for what it picks ("Week Ending"). On the bar, after Reports.
   */
  period?: React.ComponentProps<typeof ToolbarTreeFilter>
  controls?: Array<React.ComponentProps<typeof ToolbarFilter> & { key: string; icon: React.ReactNode }>
  /** Shown over the grids: the report's headline figures or charts. */
  summary?: React.ReactNode
  /** Small print under the grids, for example when the data was last refreshed. */
  footnote?: React.ReactNode
  /**
   * A report that is a page of several things (figures, charts, more than one grid): the page
   * scrolls, and each grid is as tall as its rows up to most of the screen. Without it the report
   * fills its box and the grid scrolls inside.
   */
  stacked?: boolean
  /** The footer. Leave out while there is nothing to page. */
  pagination?: React.ComponentProps<typeof ListPagination>
  /** Shown above the bar, for example an error. */
  notice?: React.ReactNode
  /** Shown in place of the grids, for example a loader on first load. */
  placeholder?: React.ReactNode
  className?: string
}

function Report<Row>({
  onChat,
  search,
  library,
  columnsMenu,
  filters,
  dateRange,
  exportMenu,
  grids,
  tabs,
  controls,
  period,
  summary,
  footnote,
  stacked,
  pagination,
  notice,
  placeholder,
  className,
}: ReportProps<Row>) {
  const dated = !!(dateRange?.value.from || dateRange?.value.to)
  const { value: dateValue, onValueChange: onDateChange, label: dateLabel = "Date range", ...datePicker } = dateRange ?? {
    value: {},
    onValueChange: () => {},
  }
  return (
    <div
      data-slot="report"
      className={cn("flex min-h-0 min-w-0 flex-col gap-3 text-[13px] [&_[data-slot=button]]:text-[13px]", className)}
    >
      {notice}
      <Toolbar labels="icons-on-phones">
        {tabs ? <ToolbarTabs aria-label="View" {...tabs} /> : null}
        {onChat ? (
          <Button type="button" variant="outline" size="lg" className="gap-2 font-normal" aria-label="Chat" onClick={onChat}>
            <SparklesIcon aria-hidden="true" />
            <ToolbarLabel>Chat</ToolbarLabel>
          </Button>
        ) : null}
        {search ? <ToolbarSearch {...search} /> : null}
        {library ? <ToolbarReportLibrary fill={!search} {...library} /> : null}
        {period ? <ToolbarTreeFilter {...period} /> : null}
        {controls?.map(({ key, ...control }) => <ToolbarFilter key={key} {...control} />)}
        {columnsMenu ? (
          <CustomizeMenu label="Columns" itemsLabel="Columns" searchPlaceholder="Search columns" {...columnsMenu} />
        ) : null}
        {filters ? (
          <ToolbarFilterDialog
            {...filters}
            extraCount={(filters.extraCount ?? 0) + (dated ? 1 : 0)}
            onClearAll={() => {
              if (dated) onDateChange({})
              filters.onClearAll?.()
            }}
          >
            {dateRange ? (
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium">{dateLabel}</span>
                <DateRangePicker
                  presets={defaultDatePresets}
                  timeZone="America/New_York"
                  placeholder="Any date"
                  {...datePicker}
                  value={dateValue}
                  onChange={onDateChange}
                />
              </div>
            ) : null}
            {filters.children}
          </ToolbarFilterDialog>
        ) : null}
        {dateRange && !filters ? <ToolbarDateRange {...datePicker} value={dateValue} onValueChange={onDateChange} /> : null}
        {exportMenu ? <ToolbarExport {...exportMenu} /> : null}
      </Toolbar>
      <div className={cn("flex min-w-0 flex-col overflow-x-hidden", stacked ? "gap-3" : "min-h-0 flex-1 gap-3")}>
        {summary}
        {placeholder ??
          (stacked ? (
            <div className="grid grid-cols-6 gap-3">
              {grids.map(({ span, ...grid }, i) => (
                <div
                  key={grid.title ?? i}
                  className={cn(
                    "col-span-6 flex min-w-0 flex-col",
                    span === "half" && "lg:col-span-3",
                    span === "third" && "md:col-span-3 lg:col-span-2",
                  )}
                >
                  <ReportGrid {...grid} className="h-auto max-h-[max(20rem,calc(100svh-12rem))] flex-none" />
                </div>
              ))}
            </div>
          ) : (
            grids.map(({ span: _span, ...grid }, i) => <ReportGrid key={grid.title ?? i} {...grid} />)
          ))}
        {footnote ? <p className="text-muted-foreground text-xs">{footnote}</p> : null}
      </div>
      {pagination ? <ListPagination {...pagination} /> : null}
    </div>
  )
}

export { Report, ReportGrid }
export type { ReportProps, ReportGridProps, ReportColumn, ReportItem, ReportSort, ReportFrozen }
