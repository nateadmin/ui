"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { SortIcon } from "@/components/ui/data-list"

/*
 * The parts of a report's grid: the wide table under a report's toolbar, with a
 * column-title band on top, a Total band at the bottom, groups that fold, and
 * subtotals. Every report draws its table with these, so they all look the same
 * and a change here reaches all of them.
 *
 *   <ReportGridCard>
 *     <ReportGridScroll>            (or the app's own scrolling, for very long reports)
 *       <ReportGridTable>
 *         <thead><ReportGridHeadRow><ReportGridHead .../></ReportGridHeadRow></thead>
 *         <tbody><ReportGridRow><ReportGridCell .../></ReportGridRow></tbody>
 *         <tfoot><ReportGridTotalRow><ReportGridCell .../></ReportGridTotalRow></tfoot>
 *       </ReportGridTable>
 *     </ReportGridScroll>
 *   </ReportGridCard>
 *
 * The parts only carry the look. The app owns the data, sorting, column order
 * and which rows are drawn.
 */

/** Frame around a report grid. No padding: the title and Total bands reach its edges. */
function ReportGridCard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="report-grid-card"
      data-report-grid=""
      className={cn(
        "bg-card text-card-foreground ring-foreground/10 relative flex min-h-0 flex-col overflow-hidden rounded-xl text-[13px] ring-1",
        className,
      )}
      {...props}
    />
  )
}

/** The table itself. 16px before the first column, so text lines up with the band edges. */
function ReportGridTable({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <table
      data-slot="report-grid-table"
      className={cn("caption-bottom text-[13px] [&_tr>*:first-child]:pl-4", className)}
      {...props}
    />
  )
}

/** The band a grid's column titles or totals sit on. For an app that scrolls its own panes. */
const reportGridBandClass = "bg-muted"

function ReportGridHeadRow({ className, ...props }: React.ComponentProps<"tr">) {
  return <tr data-slot="report-grid-head-row" className={cn(reportGridBandClass, className)} {...props} />
}


/**
 * A column title. With `sort` it shows the sort arrows: null when the report is
 * not sorted by this column. Dragging and clicking are the app's handlers, passed
 * straight through.
 */
function ReportGridHead({
  className,
  children,
  sort,
  movable,
  ...props
}: React.ComponentProps<"th"> & {
  /** "asc" or "desc" when sorted by this column, null when it can sort but is not, undefined when it cannot sort. */
  sort?: "asc" | "desc" | null
  /** The column can be dragged to a new place. */
  movable?: boolean
}) {
  const sortable = sort !== undefined
  return (
    <th
      data-slot="report-grid-head"
      aria-sort={sortable ? (sort === "asc" ? "ascending" : sort === "desc" ? "descending" : "none") : undefined}
      className={cn(
        "bg-muted text-foreground h-8 px-2 text-left align-middle text-[11px] font-semibold tracking-wider whitespace-nowrap uppercase select-none",
        movable ? "cursor-grab active:cursor-grabbing" : sortable && "cursor-pointer",
        className,
      )}
      {...props}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        {sortable ? (
          <span aria-hidden className="inline-flex shrink-0 cursor-pointer items-center justify-center">
            <SortIcon dir={sort ?? null} />
          </span>
        ) : null}
      </span>
    </th>
  )
}

/*
 * The column-title row with everything a report's titles do, so every report behaves the same:
 *   - click a title to sort; the app cycles ascending, descending, then back to no sort
 *   - drag a title to move its column; a line down the whole column shows where it will land,
 *     and the column being moved fades
 * The line is drawn on every table inside the nearest [data-report-grid] box (ReportGridCard is
 * one), so it also works when an app keeps its titles, rows and totals in separate tables.
 */
type ReportGridColumn = { key: string; label: React.ReactNode }

let reportGridSeq = 0

function ReportGridColumns({
  columns,
  sort,
  onSort,
  onReorder,
  className,
  headClassName,
}: {
  columns: ReportGridColumn[]
  /** The sorted column, or null when the report is in its own order. */
  sort?: { key: string; dir: "asc" | "desc" } | null
  /** A title was clicked. Leave out for a grid that cannot sort. */
  onSort?: (key: string) => void
  /** A title was dropped before or after another. Leave out for a grid whose columns stay put. */
  onReorder?: (key: string, target: string, side: "before" | "after") => void
  className?: string
  headClassName?: string
}) {
  const rowRef = React.useRef<HTMLTableRowElement>(null)
  const dragKey = React.useRef<string | null>(null)
  const [dragging, setDragging] = React.useState<string | null>(null)
  const [drop, setDrop] = React.useState<{ key: string; side: "before" | "after" } | null>(null)
  const keys = columns.map((c) => c.key)

  // The line and the fade, as one style rule on the grid's box, so title, row and total cells all follow.
  React.useEffect(() => {
    const box = rowRef.current?.closest<HTMLElement>("[data-report-grid]")
    if (!box) return
    if (!box.dataset.reportGrid) box.dataset.reportGrid = `g${(reportGridSeq += 1)}`
    const scope = `[data-report-grid="${box.dataset.reportGrid}"] tr > :not([colspan])`
    const rules: string[] = []
    const dragAt = dragging ? keys.indexOf(dragging) : -1
    if (dragAt >= 0) rules.push(`${scope}:nth-child(${dragAt + 1}) { opacity: 0.4; }`)
    const dropAt = drop ? keys.indexOf(drop.key) : -1
    if (drop && dropAt >= 0) {
      const inset = drop.side === "before" ? "2px" : "-2px"
      rules.push(`${scope}:nth-child(${dropAt + 1}) { box-shadow: inset ${inset} 0 0 0 var(--primary); }`)
    }
    if (!rules.length) return
    const style = document.createElement("style")
    style.textContent = rules.join("\n")
    box.appendChild(style)
    return () => style.remove()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging, drop, keys.join("\u0001")])

  const end = () => {
    dragKey.current = null
    setDragging(null)
    setDrop(null)
  }

  return (
    <ReportGridHeadRow ref={rowRef} className={className}>
      {columns.map((c) => (
        <ReportGridHead
          key={c.key}
          draggable={!!onReorder}
          movable={!!onReorder}
          tabIndex={onSort ? 0 : undefined}
          sort={onSort ? (sort?.key === c.key ? sort.dir : null) : undefined}
          onClick={onSort ? () => onSort(c.key) : undefined}
          onKeyDown={
            onSort
              ? (e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    onSort(c.key)
                  }
                }
              : undefined
          }
          onDragStart={(e) => {
            if (!onReorder) return
            dragKey.current = c.key
            setDragging(c.key)
            e.dataTransfer.effectAllowed = "move"
            e.dataTransfer.setData("text/plain", c.key)
          }}
          onDragOver={(e) => {
            const from = dragKey.current
            if (!from) return
            e.preventDefault()
            e.dataTransfer.dropEffect = "move"
            const box = e.currentTarget.getBoundingClientRect()
            const side = e.clientX < box.left + box.width / 2 ? "before" : "after"
            // No line where the column already sits (on itself, or the edge it already touches).
            const at = keys.indexOf(c.key) + (side === "after" ? 1 : 0)
            const fromAt = keys.indexOf(from)
            const same = at === fromAt || at === fromAt + 1
            setDrop((cur) => (same ? null : cur?.key === c.key && cur.side === side ? cur : { key: c.key, side }))
          }}
          onDrop={(e) => {
            e.preventDefault()
            const from = dragKey.current
            const target = drop
            end()
            if (!from || !target || from === target.key) return
            onReorder?.(from, target.key, target.side)
          }}
          onDragEnd={end}
          className={headClassName}
        >
          {c.label}
        </ReportGridHead>
      ))}
    </ReportGridHeadRow>
  )
}

/**
 * A body row. tone: "row" (default), "group" (a group's heading), "subtotal"
 * (a group's total), "subtotal-light" (a sub-group's total).
 */
function ReportGridRow({
  className,
  tone = "row",
  clickable,
  ...props
}: React.ComponentProps<"tr"> & {
  tone?: "row" | "group" | "subtotal" | "subtotal-light"
  /** The row opens something when clicked. */
  clickable?: boolean
}) {
  return (
    <tr
      data-slot="report-grid-row"
      data-tone={tone}
      className={cn(
        "border-b transition-colors",
        tone === "row" && "hover:bg-muted/50",
        tone === "group" && "hover:bg-muted/50 cursor-pointer font-medium",
        tone === "subtotal" && "bg-muted/60 font-semibold",
        tone === "subtotal-light" && "bg-muted/30 font-medium",
        clickable && "cursor-pointer",
        className,
      )}
      {...props}
    />
  )
}

/** A cell. `numeric` lines digits up. Every row is one height, so long reports can draw only the rows in view. */
function ReportGridCell({
  className,
  numeric,
  ...props
}: React.ComponentProps<"td"> & { numeric?: boolean }) {
  return (
    <td
      data-slot="report-grid-cell"
      className={cn("h-8 px-2 py-0 align-middle whitespace-nowrap", numeric && "tabular-nums", className)}
      {...props}
    />
  )
}

/** The arrow and label inside a group's heading row. */
function ReportGridGroupLabel({
  collapsed,
  count,
  children,
  className,
}: {
  collapsed?: boolean
  /** Shown in gray after the label, for example "(12 units)". */
  count?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <ChevronDownIcon aria-hidden className={cn("size-4 shrink-0 transition-transform", collapsed && "-rotate-90")} />
      <span>
        {children}
        {count != null ? <span className="text-muted-foreground ml-2 font-normal tabular-nums">{count}</span> : null}
      </span>
    </span>
  )
}

/** The Total row at the bottom of the grid. */
function ReportGridTotalRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr data-slot="report-grid-total-row" className={cn(reportGridBandClass, "font-semibold", className)} {...props} />
  )
}

/*
 * Scrolls a grid like a canvas. The column-title band and the Total band run
 * edge to edge across the card as fixed anchors; only the rows between them
 * scroll.
 *   - the table's own scrollbars are hidden; a separate vertical bar runs only
 *     beside the rows (below the column titles, above the Total row), and a
 *     horizontal bar sits at the bottom when the columns are wider than the card
 *   - press and drag anywhere on the rows to move around, sideways and up and
 *     down; links, buttons and column titles still click as usual, and a drag
 *     never opens a row
 * The table inside needs a sticky thead (top-0) and tfoot (bottom-0).
 */
const GUTTER = 10 // the vertical scrollbar's track (ui-scrollbar draws a thin thumb in it)
const HBAR = 10 // the sideways scrollbar's track

/** The thin scrollbar a report grid uses. Needs @nateadmin/ui/components.css (or styles.css). */
const reportGridScrollbarClass = "ui-scrollbar"

const HBAR_THUMB = 5 // how thick the sideways thumb is drawn
const HBAR_EDGE = 3 // from the thumb down to the band's bottom edge

/**
 * How much taller the Total band gets while the sideways bar shows, so the gap from the Total text down
 * to the bar's thumb equals the gap from the band's top edge down to the text. Measured from the text as
 * drawn (its real font and size), not assumed: letters and digits sit on the baseline, so the text's
 * bottom is the baseline (a comma's tail hangs a little under it and is not counted).
 */
function totalLift(scrollBox: HTMLElement): number {
  const cell = scrollBox.querySelector<HTMLElement>("tfoot td, tfoot th")
  if (!cell || typeof document === "undefined") return REPORT_GRID_TOTAL_LIFT_PX
  const ctx = document.createElement("canvas").getContext("2d")
  if (!ctx) return REPORT_GRID_TOTAL_LIFT_PX
  const cs = getComputedStyle(cell)
  ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`
  const caps = ctx.measureText("T0")
  if (!caps.actualBoundingBoxAscent) return REPORT_GRID_TOTAL_LIFT_PX
  // The text is centered in the band's first 32px (the lift is all padding under it). With the text's
  // height h centered there, the gap above it is (32 - h) / 2 and its bottom is at (32 + h) / 2. The thumb's
  // top must be that same gap further down: at 32. The band then ends a thumb and an edge below that.
  const line = Number.parseFloat(cs.lineHeight) || Number.parseFloat(cs.fontSize) * 1.5
  const font = caps.fontBoundingBoxAscent + caps.fontBoundingBoxDescent
  const baseline = (32 - line) / 2 + (line - font) / 2 + caps.fontBoundingBoxAscent
  const above = baseline - caps.actualBoundingBoxAscent
  const thumbTop = baseline + above
  return Math.max(0, Math.round(thumbTop + HBAR_THUMB + HBAR_EDGE - 32))
}

function ReportGridScroll({
  children,
  className,
  onViewport,
}: {
  children: React.ReactNode
  className?: string
  /** Called when the grid scrolls or changes size, so the caller can draw only the rows in view. */
  onViewport?: (view: { scrollTop: number; height: number }) => void
}) {
  const box = React.useRef<HTMLDivElement>(null)
  const onViewportRef = React.useRef(onViewport)
  onViewportRef.current = onViewport
  const reportViewport = () => {
    const el = box.current
    if (el) onViewportRef.current?.({ scrollTop: el.scrollTop, height: el.clientHeight })
  }
  const vbar = React.useRef<HTMLDivElement>(null)
  const hbar = React.useRef<HTMLDivElement>(null)
  const hthumb = React.useRef<HTMLDivElement>(null)
  const [dims, setDims] = React.useState({ sh: 0, ch: 0, sw: 0, cw: 0, head: 0, foot: 0, vh: 0, lift: REPORT_GRID_TOTAL_LIFT_PX })

  React.useEffect(() => {
    const el = box.current
    if (!el) return
    const measure = () => {
      setDims({
        sh: el.scrollHeight,
        ch: el.clientHeight,
        sw: el.scrollWidth,
        cw: el.clientWidth,
        head: el.querySelector("thead")?.getBoundingClientRect().height ?? 0,
        foot: el.querySelector("tfoot")?.getBoundingClientRect().height ?? 0,
        vh: vbar.current?.clientHeight ?? 0,
        lift: totalLift(el),
      })
      reportViewport()
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    if (vbar.current) ro.observe(vbar.current)
    const table = el.firstElementChild
    if (table) ro.observe(table)
    return () => ro.disconnect()
  }, [])

  /* Keep the grid and the two bars in step. Each bar's spacer is sized so the bar scrolls exactly as far
     as the grid (bar size + the grid's overflow), so both reach their ends together. A copy only moves
     when it differs from its source, so the two never pull against each other and scrolling keeps its
     full speed all the way to the top and bottom. */
  const copyTop = (from: HTMLElement | null, to: HTMLElement | null) => {
    if (from && to && Math.abs(to.scrollTop - from.scrollTop) >= 1) to.scrollTop = from.scrollTop
  }
  const copyLeft = (from: HTMLElement | null, to: HTMLElement | null) => {
    if (from && to && Math.abs(to.scrollLeft - from.scrollLeft) >= 1) to.scrollLeft = from.scrollLeft
  }
  /* A bar only moves the grid while the person is using that bar (pressing on it or wheeling over it).
     Its scroll events that come from following the grid are never sent back, so nothing writes to the
     grid while it scrolls and the browser's smooth scrolling runs at full speed to the very end. */
  const usingBar = React.useRef<"v" | "h" | null>(null)
  const idle = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const useBar = (which: "v" | "h") => {
    usingBar.current = which
    clearTimeout(idle.current)
  }
  const leaveBar = () => {
    clearTimeout(idle.current)
    idle.current = setTimeout(() => (usingBar.current = null), 200)
  }
  const barHandlers = (which: "v" | "h") => ({
    onPointerDown: () => useBar(which),
    onPointerUp: leaveBar,
    onPointerCancel: leaveBar,
    onWheel: () => {
      useBar(which)
      leaveBar()
    },
    onKeyDown: () => {
      useBar(which)
      leaveBar()
    },
  })
  // Chrome doesn't always send pointerup to a scrollbar, so a release anywhere ends using it.
  React.useEffect(() => {
    const up = () => leaveBar()
    window.addEventListener("pointerup", up)
    return () => window.removeEventListener("pointerup", up)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  // Any wheel or press on the grid itself hands control back to the grid.
  const useGrid = () => {
    clearTimeout(idle.current)
    usingBar.current = null
  }
  const onGrid = () => {
    reportViewport()
    if (usingBar.current) return
    copyTop(box.current, vbar.current)
    placeThumb()
  }

  /* At the top or bottom of the grid, the wheel goes on to the page right away. Browsers keep a wheel
     gesture on the box it started in until the mouse moves, so without this the page only scrolls after
     a nudge of the mouse. */
  React.useEffect(() => {
    const el = box.current
    if (!el) return
    let target: { node: HTMLElement; top: number } | null = null
    let settle: ReturnType<typeof setTimeout> | undefined
    /* The nearest box that can still move that way: a scrolling parent, the page, or (when the report sits
       in a frame, like the catalog preview) the page around the frame. */
    const canMove = (n: Element, dy: number) =>
      dy > 0 ? n.scrollTop < n.scrollHeight - n.clientHeight - 1 : n.scrollTop > 0
    const outer = (dy: number): HTMLElement | null => {
      let win: Window = window
      let n: HTMLElement | null = el.parentElement
      for (;;) {
        for (; n; n = n.parentElement) {
          const oy = win.getComputedStyle(n).overflowY
          if ((oy === "auto" || oy === "scroll") && canMove(n, dy)) return n
        }
        const root = win.document.scrollingElement as HTMLElement | null
        if (root && canMove(root, dy)) return root
        let frame: Element | null = null
        try {
          frame = win.frameElement
        } catch {
          frame = null // a frame from another site: leave it to the browser
        }
        if (!frame || !win.parent || win.parent === win) return null
        win = win.parent
        n = frame.parentElement
      }
    }
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return
      const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * el.clientHeight : e.deltaY
      if (canMove(el, dy)) return
      const node = target && canMove(target.node, dy) ? target.node : outer(dy)
      if (!node) return
      e.preventDefault()
      const max = node.scrollHeight - node.clientHeight
      const from = target && target.node === node ? target.top : node.scrollTop
      const top = Math.min(max, Math.max(0, from + dy))
      // Mouse wheels step in big notches, so glide; trackpads send small steps, so follow them exactly.
      const glide = Math.abs(dy) >= 40
      target = glide ? { node, top } : null
      node.scrollTo({ top, behavior: glide ? "smooth" : "instant" })
      clearTimeout(settle)
      settle = setTimeout(() => (target = null), 300)
    }
    el.addEventListener("wheel", onWheel, { passive: false })
    return () => {
      el.removeEventListener("wheel", onWheel)
      clearTimeout(settle)
    }
  }, [])

  // Drag to pan.
  const drag = React.useRef<{ x: number; y: number; left: number; top: number; id: number; moved: boolean } | null>(
    null,
  )
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    if ((e.target as HTMLElement).closest("a, button, input, select, textarea, label, th, [role=button]")) return
    const el = box.current!
    drag.current = { x: e.clientX, y: e.clientY, left: el.scrollLeft, top: el.scrollTop, id: e.pointerId, moved: false }
  }
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    const el = box.current
    if (!d || !el) return
    const dx = e.clientX - d.x
    const dy = e.clientY - d.y
    if (!d.moved) {
      if (Math.abs(dx) < 4 && Math.abs(dy) < 4) return
      d.moved = true
      el.setPointerCapture(d.id)
      el.style.cursor = "grabbing"
      el.style.userSelect = "none"
    }
    el.scrollLeft = d.left - dx
    el.scrollTop = d.top - dy
  }
  const endDrag = () => {
    const d = drag.current
    const el = box.current
    drag.current = null
    if (!d || !el) return
    el.style.cursor = ""
    el.style.userSelect = ""
    if (el.hasPointerCapture(d.id)) el.releasePointerCapture(d.id)
    if (d.moved) {
      // The drag ends in a click on whatever row is under the pointer; swallow it.
      const stop = (ev: Event) => {
        ev.stopPropagation()
        ev.preventDefault()
      }
      el.addEventListener("click", stop, { capture: true, once: true })
      setTimeout(() => el.removeEventListener("click", stop, { capture: true }), 0)
    }
  }

  const wide = dims.sw > dims.cw + 1

  /* The sideways thumb: as long as the share of the columns in view, placed by how far the grid is scrolled. */
  const trackWidth = Math.max(0, dims.cw)
  const thumbWidth = wide ? Math.max(32, Math.round((dims.cw / dims.sw) * trackWidth)) : 0
  const placeThumb = () => {
    const el = box.current
    const thumb = hthumb.current
    if (!el || !thumb) return
    const max = el.scrollWidth - el.clientWidth
    const room = el.clientWidth - thumb.offsetWidth
    thumb.style.transform = `translateX(${max > 0 ? (el.scrollLeft / max) * room : 0}px)`
  }
  React.useLayoutEffect(placeThumb)
  const barDrag = React.useRef<{ x: number; left: number } | null>(null)
  const onBarDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = box.current
    const thumb = hthumb.current
    if (!el || !thumb) return
    const max = el.scrollWidth - el.clientWidth
    const room = el.clientWidth - thumb.offsetWidth
    const rect = thumb.getBoundingClientRect()
    // A press off the thumb jumps the thumb's middle to the pointer, then the drag carries on from there.
    if (e.clientX < rect.left || e.clientX > rect.right) {
      const track = e.currentTarget.getBoundingClientRect()
      const at = Math.min(room, Math.max(0, e.clientX - track.left - thumb.offsetWidth / 2))
      el.scrollLeft = room > 0 ? (at / room) * max : 0
    }
    barDrag.current = { x: e.clientX, left: el.scrollLeft }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onBarMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = box.current
    const thumb = hthumb.current
    const d = barDrag.current
    if (!el || !thumb || !d) return
    const max = el.scrollWidth - el.clientWidth
    const room = el.clientWidth - thumb.offsetWidth
    el.scrollLeft = d.left + (room > 0 ? ((e.clientX - d.x) / room) * max : 0)
  }
  const onBarUp = (e: React.PointerEvent<HTMLDivElement>) => {
    barDrag.current = null
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
  }
  const band = cn(reportGridBandClass, "shrink-0")
  return (
    // --hbar: how much the Total row grows while the sideways bar shows. It is worked out from where the
    // Total text really is (see totalLift), so the space from the text down to the bar equals the space
    // above the text. Without the bar the text is dead center. The Total row's cells use it:
    // h-[calc(2rem+var(--hbar,0px))] pb-(--hbar).
    <div
      data-slot="report-grid-scroll"
      className={cn("relative flex h-full min-h-0 flex-col", className)}
      style={{ ["--hbar" as string]: wide ? `${dims.lift}px` : "0px" }}
    >
      <div className="flex min-h-0 flex-1">
        <div
          ref={box}
          onScroll={onGrid}
          onWheel={useGrid}
          onPointerDown={(e) => {
            useGrid()
            onPointerDown(e)
          }}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          className="min-h-0 min-w-0 flex-1 cursor-grab overflow-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {children}
        </div>
        {/* Right edge: the title band, the vertical scrollbar flush to the edge, then the Total band. */}
        <div className="flex shrink-0 flex-col" style={{ width: GUTTER }}>
          <div className={band} style={{ height: dims.head }} />
          <div
            ref={vbar}
            aria-hidden
            onScroll={() => usingBar.current === "v" && copyTop(vbar.current, box.current)}
            {...barHandlers("v")}
            className={cn(reportGridScrollbarClass, "min-h-0 flex-1 overflow-x-hidden overflow-y-auto")}
          >
            <div style={{ height: dims.vh + Math.max(0, dims.sh - dims.ch) }} />
          </div>
          <div className={band} style={{ height: dims.foot }} />
        </div>
      </div>
      {wide ? (
        // The sideways scrollbar, drawn here rather than by the browser, so it is the same on every machine:
        // a thin thumb whose top edge is as far under the Total text as the band's top edge is above it.
        <div
          ref={hbar}
          aria-hidden
          onPointerDown={onBarDown}
          onPointerMove={onBarMove}
          onPointerUp={onBarUp}
          onPointerCancel={onBarUp}
          // The wheel over the bar moves the grid sideways.
          onWheel={(e) => {
            if (box.current) box.current.scrollLeft += e.deltaX || e.deltaY
          }}
          className="group/hbar absolute left-0 z-30 cursor-pointer touch-none"
          // 3px of hit area above and below the 5px thumb.
          style={{ right: GUTTER, bottom: HBAR_EDGE - 3, height: HBAR_THUMB + 6 }}
        >
          <div
            ref={hthumb}
            className="bg-muted-foreground/35 group-hover/hbar:bg-muted-foreground/60 absolute top-[3px] rounded-full"
            style={{ height: HBAR_THUMB, width: thumbWidth }}
          />
        </div>
      ) : null}
    </div>
  )
}

/** How far the Total row grows (and its text lifts) while the sideways bar shows. The thumb is drawn 2px
    inside its 10px track, so the row grows a little less than the track. */
const REPORT_GRID_TOTAL_LIFT_PX = HBAR - 3

const REPORT_GRID_SCROLLBAR_PX = GUTTER

export {
  ReportGridCard,
  ReportGridTable,
  ReportGridHeadRow,
  ReportGridHead,
  ReportGridColumns,
  ReportGridRow,
  ReportGridCell,
  ReportGridGroupLabel,
  ReportGridTotalRow,
  ReportGridScroll,
  reportGridBandClass,
  reportGridScrollbarClass,
  REPORT_GRID_SCROLLBAR_PX,
  REPORT_GRID_TOTAL_LIFT_PX,
}
export type { ReportGridColumn }
