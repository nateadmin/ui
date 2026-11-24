import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { ChevronDownIcon, SparklesIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { SortIcon } from "@/components/ui/data-list"
import { CustomizeMenu, CustomizeOption } from "@/components/ui/customize-menu"
import { ListPagination } from "@/components/ui/list-pagination"
import {
  Toolbar,
  ToolbarDateRange,
  ToolbarExport,
  ToolbarFilterDialog,
  ToolbarLabel,
  ToolbarReportLibrary,
  ToolbarSearch,
  matchesCondition,
  type ToolbarColumnConditions,
  type ToolbarColumnFilter,
  type ToolbarDateRangeValue,
  type ToolbarFilterGroup,
  type ToolbarReport,
  type ToolbarReportCategory,
} from "@/components/ui/toolbar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

/*
 * The Report page for the Simply Funding Data app, with made-up rows (this
 * repo is public). Its top bar and footer are the library's own components;
 * only the grid and a few small pieces live here.
 */

/* ---------- Small local pieces ---------- */

const inputClass =
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-[13px] transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 dark:bg-input/30"

function SfInput(props: React.ComponentProps<"input">) {
  return <input {...props} className={cn(inputClass, props.className)} />
}

function Label({ htmlFor, children }: { htmlFor?: string; children: ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="flex items-center gap-2 text-[13px] leading-none font-medium select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
    >
      {children}
    </label>
  )
}

function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      data-slot="card"
      className={cn(
        "group/card bg-card text-card-foreground ring-foreground/10 flex flex-col gap-(--card-spacing) overflow-hidden rounded-xl py-(--card-spacing) text-[13px] ring-1 [--card-spacing:--spacing(4)] has-data-[slot=card-footer]:pb-0",
        className,
      )}
    >
      {children}
    </div>
  )
}

/** Select: a trigger with the chosen label and a menu of options. */
/** Combobox with chips, like the Data app's MultiSelectCombobox: picked values show as chips, the rest in a list. */

/** From / To date fields with a calendar button, mm/dd/yyyy. */

/* ---------- Placeholder data ---------- */

type Deal = {
  id: number
  name: string
  lawFirm: string
  iso: string
  status: "Active" | "Paid off" | "Defaulted" | "Renewed"
  fundedAt: string // mm/dd/yyyy
  lastPaidAt: string // mm/dd/yyyy
  amount: number
  balance: number
  factor: number
}

const businesses = [
  "Lakeside Land Clearing, LLC",
  "Harbor Tax Llc",
  "SUMMIT HOMES CONSTRUCTION LLC",
  "BLUEBIRD PAINTING CONTRACTOR CORP",
  "Maple Childcare Center Inc",
  "NORTHWIND AUTO CRAFT INC",
  "SAMPLE MEDICAL CORP",
  "CEDAR PAVER PROS LLC",
  "PINECREST CHILD ACADEMY LLC",
  "GOLDEN GATE CONSTRUCTION LLC",
  "RIVERBEND TREE SERVICE LLC",
  "OAKWOOD STYLE LLC",
  "SILVER HOME ENTERTAINMENT LLC",
  "IRONSIDE INTERIORS LLC",
  "MEADOW PAINTING LLC",
  "CLEARWATER DUMPSTER DEPOT LLC",
  "Westfield Renovation LLC",
]
const lawFirms = ["Sample legal team", "Placeholder law group", "Example recovery partners"]
const isos = ["Northwind Capital", "Bluebird Funding", "Summit Partners", "Harbor Finance", "Cedar Advance"]
const statuses: Deal["status"][] = ["Defaulted", "Active", "Paid off", "Renewed"]

const pad = (n: number) => String(n).padStart(2, "0")
const deals: Deal[] = Array.from({ length: 6145 }, (_, i) => {
  const d = new Date(Date.UTC(2026, 10, 25) - i * 0.9 * 86400000)
  const amount = (((i * 7919) % 23) + 2) * 5000
  return {
    id: 35261 - i * 3,
    name: businesses[i % businesses.length]!,
    lawFirm: lawFirms[i % lawFirms.length]!,
    iso: isos[i % isos.length]!,
    status: statuses[i % 7 === 0 ? 0 : (i % 3) + 1]!,
    fundedAt: `${pad(d.getUTCMonth() + 1)}/${pad(d.getUTCDate())}/${d.getUTCFullYear()}`,
    lastPaidAt: (() => {
      const paid = new Date(Math.min(d.getTime() + (((i * 37) % 120) + 5) * 86400000, Date.UTC(2026, 10, 25)))
      return `${pad(paid.getUTCMonth() + 1)}/${pad(paid.getUTCDate())}/${paid.getUTCFullYear()}`
    })(),
    amount,
    balance: Math.round(amount * (0.2 + ((i * 31) % 100) / 125) * 100) / 100,
    factor: 1.3 + ((i * 13) % 20) / 100,
  }
})

type ColKey = "id" | "name" | "lawFirm" | "fundedAt" | "lastPaidAt" | "amount" | "iso" | "status" | "balance" | "factor"
type Col = { key: ColKey; label: string; kind: "id" | "text" | "date" | "money" | "number" }

const COLUMNS: Col[] = [
  { key: "id", label: "Funding ID", kind: "id" },
  { key: "name", label: "Name", kind: "text" },
  { key: "lawFirm", label: "Law Firm", kind: "text" },
  { key: "fundedAt", label: "Funding Date (Parsed)", kind: "date" },
  { key: "lastPaidAt", label: "Last Payment Date", kind: "date" },
  { key: "amount", label: "Funded Amount", kind: "money" },
  { key: "iso", label: "Referring ISO", kind: "text" },
  { key: "status", label: "Status", kind: "text" },
  { key: "balance", label: "Balance", kind: "money" },
  { key: "factor", label: "Factor Rate", kind: "number" },
]
const DEFAULT_COLS: ColKey[] = ["id", "name", "lawFirm", "fundedAt", "amount", "iso", "status", "balance"]

const SOURCES = [
  { id: "merchants", label: "Merchants", rows: 124792 },
  { id: "deals", label: "Deals", rows: 6145 },
  { id: "payments", label: "Payments", rows: 465950 },
  { id: "applications", label: "Applications", rows: 183079 },
]

/* Saved reports for the toolbar layout: each keeps the whole view. */
type ReportView = {
  sources: string[]
  status: string[]
  lawFirm: string[]
  iso: string[]
  amount: string[]
  from: string | null
  to: string | null
  q: string
  cols: ColKey[]
  groupBy: string
  sort: { key: ColKey; dir: "asc" | "desc" } | null
  conditions: ToolbarColumnConditions
  /** The date column the date range filters. */
  dateField?: ColKey
}
type SavedReport = ToolbarReport & { view: ReportView }

const PLAIN_VIEW: ReportView = {
  sources: ["deals"],
  status: [],
  lawFirm: [],
  iso: [],
  amount: [],
  from: null,
  to: null,
  q: "",
  cols: ["id", "name", "lawFirm", "fundedAt", "amount", "iso", "status", "balance"],
  groupBy: "none",
  sort: null,
  conditions: {},
}
const day = (y: number, m: number, d: number) => new Date(y, m - 1, d).toISOString()
const SEED_CATEGORIES: ToolbarReportCategory[] = [
  { id: "defaults", name: "Defaults" },
  { id: "funding", name: "Funding" },
  { id: "iso", name: "ISO performance" },
]
const SEED_REPORTS: SavedReport[] = [
  {
    id: "2026-defaults",
    name: "2026 defaults",
    categoryId: "defaults",
    view: { ...PLAIN_VIEW, status: ["Defaulted"], from: day(2026, 1, 1), to: day(2026, 12, 31) },
  },
  {
    id: "defaults-by-firm",
    name: "Defaults by law firm",
    categoryId: "defaults",
    view: { ...PLAIN_VIEW, status: ["Defaulted"], groupBy: "lawFirm" },
  },
  {
    id: "big-defaults",
    name: "Defaults over $100k",
    categoryId: "defaults",
    view: { ...PLAIN_VIEW, status: ["Defaulted"], amount: ["100+"], sort: { key: "amount", dir: "desc" } },
  },
  {
    id: "funded-month",
    name: "Funded this month",
    categoryId: "funding",
    view: { ...PLAIN_VIEW, from: day(2026, 11, 1), to: day(2026, 11, 30) },
  },
  {
    id: "active-book",
    name: "Active book",
    categoryId: "funding",
    view: { ...PLAIN_VIEW, status: ["Active"], cols: ["id", "name", "fundedAt", "amount", "balance", "factor"] },
  },
  { id: "volume-iso", name: "Volume by ISO", categoryId: "iso", view: { ...PLAIN_VIEW, groupBy: "iso" } },
  {
    id: "paid-iso",
    name: "Paid off by ISO",
    categoryId: "iso",
    view: { ...PLAIN_VIEW, status: ["Paid off"], groupBy: "iso" },
  },
]

/* Filters dialog groups for the toolbar layout. */
const AMOUNT_BANDS = [
  { value: "u25", label: "Under $25k" },
  { value: "25-50", label: "$25k to $50k" },
  { value: "50-100", label: "$50k to $100k" },
  { value: "100+", label: "$100k and up" },
]
const amountBand = (n: number) => (n < 25000 ? "u25" : n < 50000 ? "25-50" : n < 100000 ? "50-100" : "100+")
const statusColor: Record<string, string> = {
  Defaulted: "#ef4444",
  Active: "#22c55e",
  "Paid off": "#3b82f6",
  Renewed: "#a855f7",
}
const reportFilters: ToolbarFilterGroup[] = [
  { id: "source", label: "Data", required: true, options: SOURCES.map((x) => ({ value: x.id, label: x.label })) },
  { id: "status", label: "Status", options: statuses.map((x) => ({ value: x, label: x, color: statusColor[x] })) },
  { id: "lawFirm", label: "Law firm", options: lawFirms.map((x) => ({ value: x, label: x })) },
  // The real ISO list is long, so it is a searchable dropdown rather than pills.
  { id: "iso", label: "Referring ISO", display: "dropdown", options: isos.map((x) => ({ value: x, label: x })) },
  { id: "amount", label: "Funded amount", options: AMOUNT_BANDS },
]
/* The date columns the toolbar's date range can filter (a real deals report has many). */
const DATE_FIELDS = [
  { id: "fundedAt", label: "Funding Date" },
  { id: "lastPaidAt", label: "Last Payment Date" },
]

/* Every column but the ID can be filtered by a condition in the Filters dialog. */
const FILTER_COLUMNS: ToolbarColumnFilter[] = COLUMNS.filter((c) => c.kind !== "id").map((c) => ({
  id: c.key,
  label: c.label,
  kind: c.kind === "money" || c.kind === "number" ? "number" : c.kind === "date" ? "date" : "text",
}))
const mdyDate = (mdY: string) => {
  const [m, d, y] = mdY.split("/").map(Number)
  return new Date(y!, m! - 1, d!)
}
const inRange = (mdY: string, from: Date, to: Date) => {
  const [m, d, y] = mdY.split("/").map(Number)
  const t = new Date(y!, m! - 1, d!).getTime()
  const f = new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime()
  const e = new Date(to.getFullYear(), to.getMonth(), to.getDate()).getTime()
  return t >= f && t <= e
}

const money = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" })
const dateKey = (s: string) => {
  const [m, d, y] = s.split("/")
  return `${y}${m}${d}`
}

/* ---------- Pieces ---------- */

function FormulaDialog() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [expr, setExpr] = useState("")
  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        Add formula
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add formula</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-2">
              <Label htmlFor="report-formula-name">Name</Label>
              <SfInput id="report-formula-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="report-formula-expr">Formula</Label>
              <SfInput id="report-formula-expr" value={expr} onChange={(e) => setExpr(e.target.value)} />
            </div>
            <div className="flex flex-wrap gap-1">
              {["+", "-", "*", "/", "(", ")"].map((op) => (
                <Button
                  key={op}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 min-w-7 px-2"
                  onClick={() => setExpr((e) => `${e} ${op} `)}
                >
                  {op}
                </Button>
              ))}
            </div>
            <div className="flex max-h-40 flex-wrap gap-1 overflow-y-auto">
              {COLUMNS.filter((c) => c.kind === "money" || c.kind === "number").map((c) => (
                <Button
                  key={c.key}
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto px-2 py-1 text-xs"
                  onClick={() => setExpr((e) => `${e}[${c.label}]`)}
                >
                  {c.label}
                </Button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={!name || !expr} onClick={() => setOpen(false)}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function ChatDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[min(42rem,88vh)] max-h-[min(42rem,88vh)] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
        <DialogHeader className="shrink-0 border-b px-4 py-3">
          <DialogTitle>Report and data chat</DialogTitle>
        </DialogHeader>
        <div className="flex min-h-0 flex-1 flex-col justify-center px-4 py-4">
          <p className="text-muted-foreground m-0 px-2 text-center text-[13px]">
            Ask for a report in plain language. Successful queries stay here so you can reload them later.
          </p>
        </div>
        <div className="shrink-0 border-t px-4 py-3">
          <textarea
            rows={2}
            placeholder="e.g. payments over $10k last month by ISO"
            aria-label="Report request"
            className="border-input dark:bg-input/30 mb-3 w-full min-w-0 rounded-lg border bg-transparent px-2.5 py-1.5 text-[13px] outline-none"
          />
          <div className="flex justify-end gap-2">
            <Button type="button" aria-label="Send">
              Send
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ---------- Page ---------- */

/*
 * The report, driven by the library's own parts: Toolbar with
 * ToolbarReportLibrary, ToolbarSearch, ToolbarDateRange, ToolbarFilterDialog,
 * CustomizeMenu (Columns) and ToolbarExport, plus ListPagination. They are
 * imported, not copied, so every change to them shows up here and everywhere
 * else they are used.
 */
export function SimplyFundingReport() {
  const [sources, setSources] = useState(["deals"])
  const [cols, setCols] = useState<ColKey[]>(DEFAULT_COLS)
  const [groupBy, setGroupBy] = useState("none")
  const [lawFirm, setLawFirm] = useState<string[]>([])
  const [iso, setIso] = useState<string[]>([])
  const [status, setStatus] = useState<string[]>(["Defaulted"])
  // No sort means the report's normal order (newest funding first). Column titles follow the List's rule:
  // click once for ascending, again for descending, a third time to go back to no sort.
  const [sort, setSort] = useState<{ key: ColKey; dir: "asc" | "desc" } | null>(null)
  const sortBy = (key: ColKey) =>
    setSort((s) => (s?.key !== key ? { key, dir: "asc" } : s.dir === "asc" ? { key, dir: "desc" } : null))
  const [pageSize, setPageSize] = useState("50")
  const [dates, setDates] = useState<ToolbarDateRangeValue>({})
  const [dateField, setDateField] = useState<ColKey>("fundedAt")
  const [amountBands, setAmountBands] = useState<string[]>([])
  const [conditions, setConditions] = useState<ToolbarColumnConditions>({})
  // Saved reports (toolbar layout). In an app these live on the server; each keeps the whole view.
  const [reportCategories, setReportCategories] = useState<ToolbarReportCategory[]>(SEED_CATEGORIES)
  const [savedReports, setSavedReports] = useState<SavedReport[]>(SEED_REPORTS)
  const [q, setQ] = useState("")
  const [page, setPage] = useState(1)
  const [chatOpen, setChatOpen] = useState(false)
  const [activeReport, setActiveReport] = useState("")
  const [detail, setDetail] = useState<Deal | null>(null)
  const [collapsed, setCollapsed] = useState<string[]>([])
  const dragCol = useRef<ColKey | null>(null)
  // While a column title is dragged: which column it hovers and which half, so a line shows where it lands.
  const [dragging, setDragging] = useState<ColKey | null>(null)
  const [drop, setDrop] = useState<{ key: ColKey; side: "before" | "after" } | null>(null)
  /* The drop line: a 2px bar down the whole column edge where the dragged column will land. */
  const dropLine = (k: ColKey) =>
    cn(
      drop?.key === k && drop.side === "before" && "shadow-[inset_2px_0_0_0_var(--primary)]",
      drop?.key === k && drop.side === "after" && "shadow-[inset_-2px_0_0_0_var(--primary)]",
      dragging === k && "opacity-40",
    )
  const endDrag = () => {
    dragCol.current = null
    setDragging(null)
    setDrop(null)
  }

  const columns = useMemo(() => cols.map((k) => COLUMNS.find((c) => c.key === k)!), [cols])

  const snapshot: ReportView = {
    sources,
    status,
    lawFirm,
    iso,
    amount: amountBands,
    from: dates.from ? dates.from.toISOString() : null,
    to: dates.to ? dates.to.toISOString() : null,
    q,
    cols,
    groupBy,
    sort,
    conditions,
    ...(dateField !== "fundedAt" ? { dateField } : {}),
  }
  const applyView = (v: ReportView) => {
    setSources(v.sources)
    setStatus(v.status)
    setLawFirm(v.lawFirm)
    setIso(v.iso)
    setAmountBands(v.amount)
    setDates(v.from && v.to ? { from: new Date(v.from), to: new Date(v.to) } : {})
    setQ(v.q)
    setCols(v.cols)
    setGroupBy(v.groupBy)
    setSort(v.sort)
    setConditions(v.conditions ?? {})
    setDateField(v.dateField ?? "fundedAt")
  }
  const openReport = savedReports.find((x) => x.id === activeReport) ?? null
  const sameView = (a: ReportView, b: ReportView) => JSON.stringify(a) === JSON.stringify(b)

  // Every filter but the date range: the date range's gray hint shows the first and last date in these rows.
  const base = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return deals.filter(
      (d) =>
        (!status.length || status.includes(d.status)) &&
        (!lawFirm.length || lawFirm.includes(d.lawFirm)) &&
        (!iso.length || iso.includes(d.iso)) &&
        (!needle || d.name.toLowerCase().includes(needle) || String(d.id).includes(needle)) &&
        (!amountBands.length || amountBands.includes(amountBand(d.amount))) &&
        FILTER_COLUMNS.every((c) =>
          matchesCondition(
            conditions[c.id],
            c.kind ?? "text",
            c.kind === "date" ? mdyDate(d[c.id as "fundedAt"]) : d[c.id as ColKey],
          ),
        ),
    )
  }, [q, status, lawFirm, iso, amountBands, conditions])

  const dataRange = useMemo(() => {
    let lo = "",
      hi = ""
    for (const d of base) {
      const k = dateKey(d[dateField as "fundedAt"])
      if (!lo || k < lo) lo = k
      if (!hi || k > hi) hi = k
    }
    const toDate = (k: string) => new Date(Number(k.slice(0, 4)), Number(k.slice(4, 6)) - 1, Number(k.slice(6, 8)))
    return lo ? { from: toDate(lo), to: toDate(hi) } : {}
  }, [base, dateField])

  const filtered = useMemo(() => {
    let rows =
      dates.from && dates.to ? base.filter((d) => inRange(d[dateField as "fundedAt"], dates.from!, dates.to!)) : base
    if (!sort) return rows
    const k = sort.key
    const isDate = COLUMNS.find((c) => c.key === k)?.kind === "date"
    rows = [...rows].sort((a, b) => {
      const va = isDate ? dateKey(a[k] as string) : a[k]
      const vb = isDate ? dateKey(b[k] as string) : b[k]
      const cmp = typeof va === "number" && typeof vb === "number" ? va - vb : String(va).localeCompare(String(vb))
      return sort.dir === "asc" ? cmp : -cmp
    })
    return rows
  }, [base, sort, dates, dateField])

  useEffect(
    () => setPage(1),
    [q, status, lawFirm, iso, sort, pageSize, groupBy, amountBands, dates, conditions, dateField],
  )

  const size = Number(pageSize)
  const pageCount = Math.max(1, Math.ceil(filtered.length / size))
  const current = Math.min(page, pageCount)
  const pageRows = filtered.slice((current - 1) * size, current * size)

  const totalOf = (key: ColKey, rows: Deal[]) => rows.reduce((s, r) => s + (r[key] as number), 0)
  const isNum = (c: Col) => c.kind === "money" || c.kind === "number"
  const cell = (c: Col, r: Deal) => {
    const v = r[c.key]
    if (c.kind === "money") return money(v as number)
    if (c.kind === "number") return (v as number).toFixed(2)
    if (c.kind === "id")
      return (
        <a href="#" className="text-primary underline" onClick={(e) => e.preventDefault()}>
          {v}
        </a>
      )
    return String(v)
  }

  /* Column widths come from every row in the report (plus the title and the Total), not just the rows on
     this page, so sorting or paging never moves a column. Text is measured once per distinct value. */
  const colWidths = useMemo(() => {
    const ctx = document.createElement("canvas").getContext("2d")
    const family = getComputedStyle(document.body).fontFamily || "system-ui, sans-serif"
    const measure = (text: string, font: string, spacing = 0) => {
      if (!ctx) return text.length * 8
      ctx.font = font
      return ctx.measureText(text).width + spacing * text.length
    }
    const text = (c: Col, r: Deal) => {
      const v = r[c.key]
      return c.kind === "money" ? money(v as number) : c.kind === "number" ? (v as number).toFixed(2) : String(v)
    }
    return columns.map((c, i) => {
      const seen = new Set(filtered.map((r) => text(c, r)))
      let widest = 0
      for (const t of seen) widest = Math.max(widest, measure(t, `400 13px ${family}`))
      const total = i === 0 ? "Total" : c.kind === "money" ? money(totalOf(c.key, filtered)) : ""
      widest = Math.max(widest, measure(total, `600 13px ${family}`))
      // Title: 11px semibold caps with wide letter spacing, then the 11px sort arrows after a 4px gap.
      widest = Math.max(widest, measure(c.label.toUpperCase(), `600 11px ${family}`, 11 * 0.05) + 15)
      // Cell padding 8px a side, the first column 16px on the left, a few px for rounding.
      return Math.ceil(widest + 16 + (i === 0 ? 8 : 0) + 4)
    })
  }, [columns, filtered])

  // Group by: section header, rows, then a subtotal row per group.
  const groups = useMemo(() => {
    if (groupBy === "none") return null
    const key = groupBy as ColKey
    const map = new Map<string, Deal[]>()
    for (const r of pageRows) {
      const g = String(r[key])
      map.set(g, [...(map.get(g) ?? []), r])
    }
    return [...map.entries()]
  }, [groupBy, pageRows])

  const head = (
    <tr className="bg-muted">
      {columns.map((c) => {
        const active = sort?.key === c.key
        return (
          <th
            key={c.key}
            draggable
            tabIndex={0}
            aria-sort={active ? (sort!.dir === "asc" ? "ascending" : "descending") : "none"}
            onClick={() => sortBy(c.key)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                sortBy(c.key)
              }
            }}
            onDragStart={(e) => {
              dragCol.current = c.key
              setDragging(c.key)
              e.dataTransfer.effectAllowed = "move"
              e.dataTransfer.setData("text/plain", c.key)
            }}
            onDragOver={(e) => {
              const from = dragCol.current
              if (!from) return
              e.preventDefault()
              e.dataTransfer.dropEffect = "move"
              const box = e.currentTarget.getBoundingClientRect()
              const side = e.clientX < box.left + box.width / 2 ? "before" : "after"
              // No line where the column already sits (on itself, or the edge it already touches).
              const at = cols.indexOf(c.key) + (side === "after" ? 1 : 0)
              const fromAt = cols.indexOf(from)
              const same = at === fromAt || at === fromAt + 1
              setDrop((cur) => (same ? null : cur?.key === c.key && cur.side === side ? cur : { key: c.key, side }))
            }}
            onDrop={(e) => {
              e.preventDefault()
              const from = dragCol.current
              const target = drop
              endDrag()
              if (!from || !target || from === target.key) return
              setCols((cur) => {
                const next = cur.filter((k) => k !== from)
                next.splice(next.indexOf(target.key) + (target.side === "after" ? 1 : 0), 0, from)
                return next
              })
            }}
            onDragEnd={endDrag}
            className={cn(
              dropLine(c.key),
              "bg-muted text-foreground sticky top-0 z-10 h-8 cursor-grab px-2 text-left align-middle text-[11px] font-semibold tracking-wider whitespace-nowrap uppercase select-none active:cursor-grabbing",
            )}
          >
            <span className="inline-flex items-center gap-1">
              {c.label}
              <span aria-hidden className="inline-flex shrink-0 cursor-pointer items-center justify-center">
                <SortIcon dir={active ? sort!.dir : null} />
              </span>
            </span>
          </th>
        )
      })}
    </tr>
  )

  const row = (r: Deal) => (
    <tr key={r.id} className="hover:bg-muted/50 cursor-pointer border-b transition-colors" onClick={() => setDetail(r)}>
      {columns.map((c) => (
        <td
          key={c.key}
          className={cn("px-2 py-1.5 align-middle whitespace-nowrap", isNum(c) && "tabular-nums", dropLine(c.key))}
        >
          {cell(c, r)}
        </td>
      ))}
    </tr>
  )

  const subtotal = (label: string, rows: Deal[], strong = true) => (
    <tr className={cn("border-b", strong ? "bg-muted/60 hover:bg-muted/60" : "bg-muted/30 hover:bg-muted/30")}>
      {columns.map((c, i) => (
        <td
          key={c.key}
          className={cn(
            "px-2 py-1.5 align-middle whitespace-nowrap",
            strong ? "font-semibold" : "font-medium",
            isNum(c) && "tabular-nums",
            dropLine(c.key),
          )}
        >
          {i === 0
            ? `${label} (${rows.length} ${rows.length === 1 ? "unit" : "units"})`
            : c.kind === "money"
              ? money(totalOf(c.key, rows))
              : ""}
        </td>
      ))}
    </tr>
  )

  return (
    <div className={cn("flex min-w-0 flex-col text-[13px] [&_[data-slot=button]]:text-[13px]", "h-[820px] gap-2")}>
      <Toolbar>
        <ToolbarReportLibrary
          reports={savedReports}
          categories={reportCategories}
          activeId={openReport?.id ?? null}
          modified={!!openReport && !sameView(openReport.view, snapshot)}
          onSelect={(id) => {
            const next = savedReports.find((x) => x.id === id)
            setActiveReport(next?.id ?? "")
            applyView(next ? next.view : PLAIN_VIEW)
          }}
          onSave={({ name, categoryId }) => {
            const id = `r${Date.now()}`
            setSavedReports((cur) => [...cur, { id, name, categoryId, view: snapshot }])
            setActiveReport(id)
          }}
          onUpdate={(id) => setSavedReports((cur) => cur.map((x) => (x.id === id ? { ...x, view: snapshot } : x)))}
          onRename={(id, name) => setSavedReports((cur) => cur.map((x) => (x.id === id ? { ...x, name } : x)))}
          onDelete={(id) => {
            setSavedReports((cur) => cur.filter((x) => x.id !== id))
            if (id === activeReport) setActiveReport("")
          }}
          onCreateCategory={(name) => setReportCategories((cur) => [...cur, { id: `c${Date.now()}`, name }])}
          onRenameCategory={(id, name) =>
            setReportCategories((cur) => cur.map((c) => (c.id === id ? { ...c, name } : c)))
          }
          onDeleteCategory={(id) => {
            setReportCategories((cur) => cur.filter((c) => c.id !== id))
            setSavedReports((cur) => cur.map((x) => (x.categoryId === id ? { ...x, categoryId: null } : x)))
          }}
        />
        <ToolbarSearch
          placeholder="Search name or funding ID"
          aria-label="Search the report"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <ToolbarDateRange
          value={dates}
          onValueChange={setDates}
          dataRange={dataRange}
          fields={DATE_FIELDS}
          field={dateField}
          onFieldChange={(f) => setDateField(f as ColKey)}
        />
        <ToolbarFilterDialog
          filters={reportFilters}
          values={{ source: sources, status, lawFirm, iso, amount: amountBands }}
          onValuesChange={(v) => {
            setSources(v.source?.length ? v.source : ["deals"])
            setStatus(v.status ?? [])
            setLawFirm(v.lawFirm ?? [])
            setIso(v.iso ?? [])
            setAmountBands(v.amount ?? [])
          }}
          columns={FILTER_COLUMNS}
          conditions={conditions}
          onConditionsChange={setConditions}
        />
        <CustomizeMenu
          label="Columns"
          itemsLabel="Columns"
          searchPlaceholder="Search columns"
          items={COLUMNS.map((c) => ({ key: c.key, label: c.label }))}
          value={cols}
          onValueChange={(v) => setCols(v.length ? v : cols)}
          defaultValue={DEFAULT_COLS}
        >
          <CustomizeOption
            label="Group by"
            value={groupBy}
            onValueChange={setGroupBy}
            options={[
              { value: "none", label: "None" },
              { value: "lawFirm", label: "Law firm" },
              { value: "iso", label: "ISO" },
              { value: "status", label: "Status" },
            ]}
          />
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground text-xs font-medium">Formulas</span>
            <FormulaDialog />
          </div>
        </CustomizeMenu>
        <div aria-hidden="true" className="-mr-2 ml-auto" />
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="gap-2 font-normal"
          onClick={() => setChatOpen(true)}
        >
          <SparklesIcon aria-hidden="true" />
          <ToolbarLabel>Chat</ToolbarLabel>
        </Button>
        <ToolbarExport onExport={() => {}} onEmail={() => new Promise<void>((done) => setTimeout(done, 600))} />
      </Toolbar>

      {/* Table */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 overflow-x-hidden">
        <Card
          className={cn(
            // No padding: the title and Total bands reach the card's edges, and the card's rounded corners clip them.
            "relative h-full min-h-0 flex-1 gap-0 overflow-hidden py-0",
          )}
        >
          <h2 className="sr-only">Report</h2>
          <div className="min-h-0 flex-1 overflow-hidden">
            {filtered.length === 0 ? (
              <div className="text-muted-foreground flex h-full items-center justify-center text-[13px]">
                No rows match these filters.
              </div>
            ) : (
              <CanvasScroll>
                {/* 16px before the first column, so the text lines up with the band edges. */}
                <table
                  className="min-w-full caption-bottom text-[13px] [&_tr>*:first-child]:pl-4"
                  style={{ tableLayout: "fixed", width: colWidths.reduce((a, b) => a + b, 0) }}
                >
                  <colgroup>
                    {colWidths.map((w, i) => (
                      <col key={columns[i]!.key} style={{ width: w }} />
                    ))}
                  </colgroup>
                  <thead>{head}</thead>
                  <tbody>
                    {groups
                      ? groups.map(([g, rows]) => {
                          const isCollapsed = collapsed.includes(g)
                          return (
                            <GroupRows key={g}>
                              <tr
                                className="hover:bg-muted/50 cursor-pointer border-b"
                                aria-expanded={!isCollapsed}
                                onClick={() =>
                                  setCollapsed((cur) => (isCollapsed ? cur.filter((x) => x !== g) : [...cur, g]))
                                }
                              >
                                <td
                                  colSpan={columns.length}
                                  className="px-2 py-1.5 align-middle font-medium whitespace-nowrap"
                                >
                                  <span className="inline-flex items-center gap-2">
                                    <ChevronDownIcon
                                      className={cn(
                                        "size-4 shrink-0 transition-transform",
                                        isCollapsed && "-rotate-90",
                                      )}
                                      aria-hidden
                                    />
                                    <span>
                                      {g}
                                      <span className="text-muted-foreground ml-2 font-normal tabular-nums">
                                        ({rows.length} {rows.length === 1 ? "unit" : "units"})
                                      </span>
                                    </span>
                                  </span>
                                </td>
                              </tr>
                              {isCollapsed ? null : rows.map(row)}
                              {isCollapsed ? null : subtotal(g, rows)}
                            </GroupRows>
                          )
                        })
                      : pageRows.map(row)}
                  </tbody>
                  <tfoot>
                    <tr className="bg-muted sticky bottom-0 z-10">
                      {columns.map((c, i) => (
                        <td
                          key={c.key}
                          className={cn(
                            "h-[calc(2rem+var(--hbar,0px))] px-2 pt-0 pb-(--hbar) align-middle font-semibold whitespace-nowrap",
                            isNum(c) && "tabular-nums",
                            dropLine(c.key),
                          )}
                        >
                          {i === 0 ? "Total" : c.kind === "money" ? money(totalOf(c.key, filtered)) : ""}
                        </td>
                      ))}
                    </tr>
                  </tfoot>
                </table>
              </CanvasScroll>
            )}
          </div>
        </Card>
      </div>

      {/* Footer */}
      <ListPagination
        page={current}
        pageSize={size}
        total={filtered.length}
        onPageChange={setPage}
        onPageSizeChange={(n) => setPageSize(String(n))}
      />

      <Dialog open={detail != null} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Row details</DialogTitle>
          </DialogHeader>
          <dl className="grid gap-2 text-[13px]">
            {detail
              ? COLUMNS.map((c) => (
                  <div key={c.key} className="grid grid-cols-[8rem_1fr] gap-2">
                    <dt className="text-muted-foreground">{c.label}</dt>
                    <dd className="m-0 break-all">{cell(c, detail)}</dd>
                  </div>
                ))
              : null}
          </dl>
        </DialogContent>
      </Dialog>

      <ChatDialog open={chatOpen} onOpenChange={setChatOpen} />
    </div>
  )
}

function GroupRows({ children }: { children: ReactNode }) {
  return <>{children}</>
}

/*
 * The grid scrolls like a canvas, the way the Data app's table does. The
 * column-title band and the Total band run edge to edge across the card as
 * fixed anchors; only the rows between them scroll.
 *   - the table's own scrollbars are hidden; a separate vertical bar runs only
 *     beside the rows (below the column titles, above the Total row), so it
 *     never sits under the expand icon, and a horizontal bar sits at the bottom
 *     when the columns are wider than the card
 *   - press and drag anywhere on the rows to move around, sideways and up and
 *     down; links, buttons and column titles still click as usual, and a drag
 *     never opens a row
 */
const GUTTER = 10 // the vertical scrollbar's track (ui-scrollbar draws a thin thumb in it)
const HBAR = 10 // the sideways scrollbar's track

function CanvasScroll({ children }: { children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null)
  const vbar = useRef<HTMLDivElement>(null)
  const hbar = useRef<HTMLDivElement>(null)
  const [dims, setDims] = useState({ sh: 0, ch: 0, sw: 0, cw: 0, head: 0, foot: 0, vh: 0 })

  useEffect(() => {
    const el = box.current
    if (!el) return
    const measure = () =>
      setDims({
        sh: el.scrollHeight,
        ch: el.clientHeight,
        sw: el.scrollWidth,
        cw: el.clientWidth,
        head: el.querySelector("thead")?.getBoundingClientRect().height ?? 0,
        foot: el.querySelector("tfoot")?.getBoundingClientRect().height ?? 0,
        vh: vbar.current?.clientHeight ?? 0,
      })
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
  const usingBar = useRef<"v" | "h" | null>(null)
  const idle = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
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
  useEffect(() => {
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
    if (usingBar.current) return
    copyTop(box.current, vbar.current)
    copyLeft(box.current, hbar.current)
  }

  /* At the top or bottom of the grid, the wheel goes on to the page right away. Browsers keep a wheel
     gesture on the box it started in until the mouse moves, so without this the page only scrolls after
     a nudge of the mouse. */
  useEffect(() => {
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
  const drag = useRef<{ x: number; y: number; left: number; top: number; id: number; moved: boolean } | null>(null)
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
  const band = "bg-muted shrink-0"
  return (
    // --hbar: how much the Total row grows while the sideways bar shows, so the bar sits under the text and
    // the gap from the text to the visible bar matches the space above the text. (The thumb is drawn 2px
    // inside its 10px track, so the row grows a little less than the track.)
    <div
      className="relative flex h-full min-h-0 flex-col"
      style={{ ["--hbar" as string]: wide ? `${HBAR - 3}px` : "0px" }}
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
            className="ui-scrollbar min-h-0 flex-1 overflow-x-hidden overflow-y-auto"
          >
            <div style={{ height: dims.vh + Math.max(0, dims.sh - dims.ch) }} />
          </div>
          <div className={band} style={{ height: dims.foot }} />
        </div>
      </div>
      {wide ? (
        // The sideways scrollbar lies along the bottom edge of the Total band, over it, so the band keeps
        // its own height and its text stays centered.
        <div
          ref={hbar}
          aria-hidden
          onScroll={() => usingBar.current === "h" && copyLeft(hbar.current, box.current)}
          {...barHandlers("h")}
          className="ui-scrollbar absolute bottom-0 left-0 z-30 overflow-x-auto overflow-y-hidden"
          style={{ right: GUTTER, height: HBAR }}
        >
          <div className="h-px" style={{ width: dims.sw }} />
        </div>
      ) : null}
    </div>
  )
}
