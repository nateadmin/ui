"use client"

import * as React from "react"
import { SparklesIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
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
  ToolbarExport,
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
 *   - the bar, always in this order: Chat, Search, Reports, Columns, Filters,
 *     Export; icons only on a phone
 *   - the grid: column titles that sort (up, down, then back to the report's
 *     own order) and drag to a new place with a line showing where they land;
 *     groups that fold; subtotals; a Total band with equal space above and
 *     below its text; thin scrollbars; drag anywhere to pan
 *   - column widths settled from the whole report (the widest value of each
 *     column, its title and its total), so sorting or paging never moves a
 *     column
 *   - only the rows in view are drawn, so a report of tens of thousands of
 *     rows stays fast
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
  /** Heading over the grid, when a report shows more than one. */
  title?: string
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
  sort?: ReportSort
  /** Leave out for a grid that cannot sort. Gets the next state of the cycle: up, down, none. */
  onSortChange?: (sort: ReportSort) => void
  /** Leave out for a grid whose columns stay put. Gets the new order of column keys. */
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
}

const ROW = 32 // every line of the grid; the reason only the rows in view need drawing
const GAP = 16
const OVERSCAN = 12

const itemHeight = (item: { kind: string }) => (item.kind === "gap" ? GAP : ROW)

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
  columns,
  items,
  cell,
  widest,
  cellText,
  totals,
  sort = null,
  onSortChange,
  onColumnsReorder,
  onRowClick,
  onEndReached,
  refreshing,
  pendingColumns,
  empty,
  className,
}: ReportGridProps<Row> & { className?: string }) {
  const textWidth = useTextWidth()
  const keys = columns.map((c) => c.key)

  /* Column widths. Settled from the whole report where the app says what is widest; otherwise from
     the rows loaded so far, kept in a ref so a column only ever grows and never jumps back. */
  const grown = React.useRef<Record<string, number>>({})
  const colWidths = React.useMemo(() => {
    return columns.map((c, i) => {
      let w = 0
      const known = widest?.[c.key]
      if (known?.length) {
        for (const t of known) w = Math.max(w, textWidth(t, 400, 13))
      } else if (cellText) {
        const seen = new Set<string>()
        for (const item of items) if (item.kind === "row") seen.add(cellText(c, item.row))
        for (const t of seen) w = Math.max(w, textWidth(t, 400, 13))
        w = Math.max(w, grown.current[c.key] ?? 0)
        grown.current[c.key] = w
      }
      const total = i === 0 && totals ? "Total" : (totals?.[c.key] ?? "")
      w = Math.max(w, textWidth(total, 600, 13))
      // Title: 11px semibold caps with wide letter spacing, then the 11px sort arrows after a 4px gap.
      w = Math.max(w, textWidth(c.label.toUpperCase(), 600, 11, 11 * 0.05) + (onSortChange ? 15 : 0))
      // Cell padding 8px a side, the first column 16px on the left, a few px for rounding.
      return Math.ceil(w + 16 + (i === 0 ? 8 : 0) + 4)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keys.join("\u0001"), widest, totals, items, textWidth, !!onSortChange])

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
    if (!onSortChange) return
    if (sort?.key !== key) onSortChange({ key, dir: "asc" })
    else if (sort.dir === "asc") onSortChange({ key, dir: "desc" })
    else onSortChange(null)
  }

  const pad = (px: number, key: string) =>
    px > 0 ? (
      <tr key={key} aria-hidden="true">
        <td colSpan={Math.max(columns.length, 1)} style={{ height: px, padding: 0, border: 0 }} />
      </tr>
    ) : null

  const line = (item: ReportItem<Row>) => {
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
            <ReportGridCell key={c.key} numeric={c.numeric} className={cn(i === 0 && item.depth ? "pl-8!" : null)}>
              {i === 0 ? item.label : (item.values[c.key] ?? "")}
            </ReportGridCell>
          ))}
        </ReportGridRow>
      )
    }
    return (
      <ReportGridRow
        key={item.key}
        clickable={!!onRowClick}
        onClick={onRowClick ? () => onRowClick(item.row) : undefined}
      >
        {columns.map((c) => (
          <ReportGridCell key={c.key} numeric={c.numeric}>
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
      {title ? <h2 className="shrink-0 px-4 pt-3 pb-2 text-sm font-medium">{title}</h2> : <h2 className="sr-only">Report</h2>}
      <div className="min-h-0 flex-1 overflow-hidden">
        {items.length === 0 ? (
          <div className="text-muted-foreground flex h-full min-h-24 items-center justify-center text-[13px]">
            {empty ?? "No rows match these filters."}
          </div>
        ) : (
          <ReportGridScroll onViewport={setView}>
            <ReportGridTable
              className="min-w-full"
              style={{ tableLayout: "fixed", width: colWidths.reduce((a, b) => a + b, 0) }}
            >
              <colgroup>
                {colWidths.map((w, i) => (
                  <col key={columns[i]!.key} style={{ width: w }} />
                ))}
              </colgroup>
              <thead>
                <ReportGridColumns
                  columns={columns}
                  sort={sort}
                  onSort={onSortChange ? cycle : undefined}
                  onReorder={
                    onColumnsReorder
                      ? (key, target, side) => {
                          const next = keys.filter((k) => k !== key)
                          next.splice(next.indexOf(target) + (side === "after" ? 1 : 0), 0, key)
                          onColumnsReorder(next)
                        }
                      : undefined
                  }
                  headClassName="sticky top-0 z-10"
                />
              </thead>
              <tbody className={cn("transition-opacity duration-300", refreshing && "opacity-40")} aria-busy={refreshing || undefined}>
                {pad(padTop, "pad-top")}
                {items.slice(start, end).map(line)}
                {pad(padBottom, "pad-bottom")}
              </tbody>
              {totals ? (
                <tfoot>
                  <ReportGridTotalRow className="sticky bottom-0 z-10">
                    {columns.map((c, i) => (
                      <ReportGridCell
                        key={c.key}
                        numeric={c.numeric}
                        className="h-[calc(2rem+var(--hbar,0px))] pb-(--hbar)"
                      >
                        {i === 0 ? "Total" : (totals[c.key] ?? "")}
                      </ReportGridCell>
                    ))}
                  </ReportGridTotalRow>
                </tfoot>
              ) : null}
            </ReportGridTable>
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
   * The report's date range. It sits at the top of the Filters dialog on every report, with the
   * library's periods (days, weeks, months, quarters, years), and counts as one applied filter.
   */
  dateRange?: Omit<React.ComponentProps<typeof DateRangePicker>, "value" | "onChange"> & {
    value: { from?: Date; to?: Date }
    onValueChange: (value: { from?: Date; to?: Date }) => void
  }
  /** Export: formats, download and email. Leave out to hide it. */
  exportMenu?: React.ComponentProps<typeof ToolbarExport>
  /** One grid, or two for a report with a summary over its rows. */
  grids: ReportGridProps<Row>[]
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
  pagination,
  notice,
  placeholder,
  className,
}: ReportProps<Row>) {
  const dated = !!(dateRange?.value.from || dateRange?.value.to)
  const { value: dateValue, onValueChange: onDateChange, ...datePicker } = dateRange ?? {
    value: {},
    onValueChange: () => {},
  }
  return (
    <div
      data-slot="report"
      className={cn("flex min-h-0 min-w-0 flex-col gap-2 text-[13px] [&_[data-slot=button]]:text-[13px]", className)}
    >
      {notice}
      <Toolbar labels="icons-on-phones">
        {onChat ? (
          <Button type="button" variant="outline" size="lg" className="gap-2 font-normal" aria-label="Chat" onClick={onChat}>
            <SparklesIcon aria-hidden="true" />
            <ToolbarLabel>Chat</ToolbarLabel>
          </Button>
        ) : null}
        {search ? <ToolbarSearch {...search} /> : null}
        {library ? <ToolbarReportLibrary {...library} /> : null}
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
                <span className="text-sm font-medium">Date range</span>
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
        {exportMenu ? <ToolbarExport {...exportMenu} /> : null}
      </Toolbar>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 overflow-x-hidden">
        {placeholder ??
          grids.map((grid, i) => <ReportGrid key={grid.title ?? i} {...grid} />)}
      </div>
      {pagination ? <ListPagination {...pagination} /> : null}
    </div>
  )
}

export { Report, ReportGrid }
export type { ReportProps, ReportGridProps, ReportColumn, ReportItem, ReportSort }
