import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import {
  CalendarIcon,
  CheckIcon,
  ChevronDownIcon,
  EllipsisVerticalIcon,
  Maximize2Icon,
  Minimize2Icon,
  PlusIcon,
  XIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { SortIcon } from "@/components/ui/data-list"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

/*
 * The Report and Data page from the Simply Funding Data app, brought in as it
 * looks today: same layout, classes and controls, with made-up rows (this repo
 * is public). Next steps swap its parts for the library's own components.
 *
 * Its controls are local copies of the Data app's primitives (Card, Label,
 * Select, chips combobox, date fields, table) so the look matches the app.
 */

/* ---------- Data app primitives (local copies) ---------- */

const inputClass =
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 md:text-sm dark:bg-input/30"

function SfInput(props: React.ComponentProps<"input">) {
  return <input {...props} className={cn(inputClass, props.className)} />
}

function Label({ htmlFor, children }: { htmlFor?: string; children: ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="flex items-center gap-2 text-sm leading-none font-medium select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
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
        "group/card bg-card text-card-foreground ring-foreground/10 flex flex-col gap-(--card-spacing) overflow-hidden rounded-xl py-(--card-spacing) text-sm ring-1 [--card-spacing:--spacing(4)] has-data-[slot=card-footer]:pb-0",
        className,
      )}
    >
      {children}
    </div>
  )
}

/** Select: a trigger with the chosen label and a menu of options. */
function Select({
  id,
  value,
  options,
  onChange,
  ariaLabel,
}: {
  id?: string
  value: string
  options: Array<{ value: string; label: string }>
  onChange: (v: string) => void
  ariaLabel?: string
}) {
  const current = options.find((o) => o.value === value)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        id={id}
        aria-label={ariaLabel}
        className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50 flex h-8 w-full items-center justify-between gap-1.5 rounded-lg border bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:ring-3"
      >
        <span className="line-clamp-1 flex flex-1 text-left">{current?.label}</span>
        <ChevronDownIcon className="text-muted-foreground pointer-events-none size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {options.map((o) => (
          <DropdownMenuItem key={o.value} onClick={() => onChange(o.value)} className="relative pr-8">
            {o.label}
            {o.value === value ? (
              <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
                <CheckIcon />
              </span>
            ) : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** Combobox with chips, like the Data app's MultiSelectCombobox: picked values show as chips, the rest in a list. */
function ChipsCombobox({
  id,
  label,
  values,
  options,
  onChange,
  placeholder = "All",
}: {
  id: string
  label: string
  values: string[]
  options: string[]
  onChange: (v: string[]) => void
  placeholder?: string
}) {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const shown = options.filter((o) => o.toLowerCase().includes(query.trim().toLowerCase()))
  const toggle = (v: string) => onChange(values.includes(v) ? values.filter((x) => x !== v) : [...values, v])
  return (
    <div className="grid min-w-0 gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          nativeButton={false}
          render={
            <div className="border-input focus-within:border-ring focus-within:ring-ring/50 dark:bg-input/30 flex min-h-8 w-full cursor-text flex-wrap items-center gap-1 rounded-lg border bg-transparent bg-clip-padding px-2.5 py-1 text-sm transition-colors focus-within:ring-3 has-data-[slot=combobox-chip]:px-1" />
          }
        >
          {values.map((v) => (
            <span
              key={v}
              data-slot="combobox-chip"
              className="bg-muted text-foreground flex h-[calc(--spacing(5.25))] w-fit max-w-full min-w-0 items-center justify-center gap-1 rounded-sm pl-1.5 text-xs font-medium whitespace-nowrap"
            >
              <span className="min-w-0 truncate">{v}</span>
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label={`Remove ${v}`}
                className="-ml-1 opacity-50 hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation()
                  toggle(v)
                }}
              >
                <XIcon />
              </Button>
            </span>
          ))}
          <input
            id={id}
            aria-label={label}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setOpen(true)
            }}
            placeholder={values.length ? undefined : placeholder}
            className="placeholder:text-muted-foreground min-w-16 flex-1 bg-transparent outline-none"
          />
        </PopoverTrigger>
        <PopoverContent
          align="start"
          initialFocus={false}
          className="w-(--anchor-width) min-w-(--anchor-width) gap-0 overflow-hidden p-1"
        >
          {shown.length === 0 ? (
            <p className="text-muted-foreground py-2 text-center text-sm">No matches</p>
          ) : (
            <div className="max-h-64 overflow-y-auto [scrollbar-width:none]">
              {shown.map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => toggle(o)}
                  className="hover:bg-accent hover:text-accent-foreground relative flex w-full cursor-default items-center gap-2 rounded-md py-1 pr-8 pl-1.5 text-left text-sm outline-hidden select-none"
                >
                  {o}
                  {values.includes(o) ? (
                    <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
                      <CheckIcon className="size-4" />
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}

/** From / To date fields with a calendar button, mm/dd/yyyy. */
function DateField({
  id,
  label,
  value,
  onChange,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-muted-foreground absolute top-1/2 left-1 size-7 -translate-y-1/2"
          aria-label={`${label}, open calendar`}
        >
          <CalendarIcon />
        </Button>
        <SfInput
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="mm/dd/yyyy"
          inputMode="numeric"
          autoComplete="off"
          className="pl-9 font-normal"
        />
      </div>
    </div>
  )
}

/* ---------- Placeholder data ---------- */

type Deal = {
  id: number
  name: string
  lawFirm: string
  iso: string
  status: "Active" | "Paid off" | "Defaulted" | "Renewed"
  fundedAt: string // mm/dd/yyyy
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
    amount,
    balance: Math.round(amount * (0.2 + ((i * 31) % 100) / 125) * 100) / 100,
    factor: 1.3 + ((i * 13) % 20) / 100,
  }
})

type ColKey = "id" | "name" | "lawFirm" | "fundedAt" | "amount" | "iso" | "status" | "balance" | "factor"
type Col = { key: ColKey; label: string; kind: "id" | "text" | "date" | "money" | "number" }

const COLUMNS: Col[] = [
  { key: "id", label: "Funding ID", kind: "id" },
  { key: "name", label: "Name", kind: "text" },
  { key: "lawFirm", label: "Law Firm", kind: "text" },
  { key: "fundedAt", label: "Funding Date (Parsed)", kind: "date" },
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

const money = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" })
const dateKey = (s: string) => {
  const [m, d, y] = s.split("/")
  return `${y}${m}${d}`
}

/* ---------- Pieces ---------- */

function ColumnPicker({ selected, onChange }: { selected: ColKey[]; onChange: (v: ColKey[]) => void }) {
  const [q, setQ] = useState("")
  const [open, setOpen] = useState(false)
  const shown = COLUMNS.filter((c) => c.label.toLowerCase().includes(q.trim().toLowerCase()))
  return (
    <div className="grid gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              aria-label="Select report columns"
              className="h-9 w-full justify-between font-normal"
            />
          }
        >
          <span className="text-muted-foreground truncate">
            {selected.length} {selected.length === 1 ? "column" : "columns"} selected
          </span>
          <ChevronDownIcon
            className={cn("size-4 shrink-0 opacity-50 transition-transform", open && "rotate-180")}
            aria-hidden
          />
        </PopoverTrigger>
        <PopoverContent align="start" className="w-(--anchor-width) max-w-full min-w-0 gap-2 overflow-x-hidden p-2">
          <SfInput
            placeholder="Search columns"
            aria-label="Search columns"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <div
            role="listbox"
            aria-label="Report columns"
            aria-multiselectable="true"
            className="border-border grid max-h-64 gap-0.5 overflow-x-hidden overflow-y-auto rounded-md border p-1"
          >
            {shown.length === 0 ? (
              <p className="text-muted-foreground px-2 py-3 text-center text-sm">No matching columns</p>
            ) : (
              shown.map((c) => {
                const on = selected.includes(c.key)
                return (
                  <Button
                    key={c.key}
                    type="button"
                    role="option"
                    aria-selected={on}
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (on && selected.length === 1) return
                      onChange(on ? selected.filter((k) => k !== c.key) : [...selected, c.key])
                    }}
                    className={cn(
                      "h-auto min-h-8 w-full max-w-full min-w-0 shrink justify-start py-1.5 whitespace-normal",
                      on && "bg-accent/40",
                    )}
                  >
                    <CheckIcon className={cn("size-4 shrink-0", !on && "opacity-0")} aria-hidden />
                    <span className="flex min-w-0 flex-col items-start text-left">
                      <span className="line-clamp-2 max-w-full break-words whitespace-normal">{c.label}</span>
                      <span className="text-muted-foreground text-xs">
                        Deal ·{" "}
                        {c.kind === "money"
                          ? "money"
                          : c.kind === "date"
                            ? "date"
                            : c.kind === "number"
                              ? "number"
                              : "text"}
                      </span>
                    </span>
                  </Button>
                )
              })
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

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

type ColumnFilter = { id: string; text: string }

function ColumnFilters({
  filters,
  onApply,
  onRemove,
}: {
  filters: ColumnFilter[]
  onApply: (f: ColumnFilter) => void
  onRemove: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [ops, setOps] = useState<Record<string, string>>({})
  const [vals, setVals] = useState<Record<string, string>>({})
  const opsFor = (c: Col) =>
    c.kind === "money" || c.kind === "number"
      ? ["Less than", "Greater than", "At least", "At most", "Between", "Equal to"]
      : c.kind === "date"
        ? ["At least", "At most", "Between"]
        : ["Equal to", "Is not", "Contains"]
  return (
    <div className="grid min-w-0 gap-2">
      <Button type="button" variant="outline" className="w-full" onClick={() => setOpen(true)}>
        Column filters
      </Button>
      {filters.length ? (
        <div className="grid min-w-0 gap-1">
          {filters.map((f) => (
            <div
              key={f.id}
              className="border-border flex w-full min-w-0 items-start justify-between gap-2 rounded-md border px-2 py-1.5 text-sm"
            >
              <span className="min-w-0 flex-1 break-words">{f.text}</span>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="h-auto shrink-0 px-1 py-0"
                onClick={() => onRemove(f.id)}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      ) : null}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[min(36rem,85vh)] overflow-y-auto [scrollbar-gutter:stable] sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Column filters</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2">
            {COLUMNS.filter((c) => c.kind !== "id").map((c) => {
              const list = opsFor(c)
              const op = ops[c.key] ?? list[0]!
              return (
                <div
                  key={c.key}
                  className="grid grid-cols-[minmax(7rem,11rem)_9.5rem_minmax(0,1fr)] items-center gap-2"
                >
                  <p className="m-0 truncate text-sm">{c.label}</p>
                  <Select
                    ariaLabel={`${c.label} operator`}
                    value={op}
                    options={list.map((o) => ({ value: o, label: o }))}
                    onChange={(v) => setOps((cur) => ({ ...cur, [c.key]: v }))}
                  />
                  <SfInput
                    aria-label={`${c.label} value`}
                    placeholder={c.kind === "date" ? "mm/dd/yyyy" : undefined}
                    inputMode={c.kind === "money" || c.kind === "number" ? "decimal" : "text"}
                    value={vals[c.key] ?? ""}
                    onChange={(e) => setVals((cur) => ({ ...cur, [c.key]: e.target.value }))}
                  />
                </div>
              )
            })}
          </div>
          <DialogFooter>
            <Button
              type="button"
              onClick={() => {
                for (const c of COLUMNS) {
                  const v = vals[c.key]?.trim()
                  if (!v) continue
                  const op = ops[c.key] ?? opsFor(c)[0]!
                  onApply({ id: c.key, text: `${c.label} ${op.toLowerCase()} ${v}` })
                }
                setVals({})
                setOpen(false)
              }}
            >
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

const libraryCategories = ["Collections", "Funding", "Renewals", "ISO performance"]
const libraryReports: Record<string, string[]> = {
  Collections: ["Defaulted deals by law firm", "Payments bounced this week", "Deals behind pace"],
  Funding: ["Funded this month", "Funded by ISO", "Average deal size by month"],
  Renewals: ["Renewals due", "Renewed deals this quarter"],
  "ISO performance": ["Defaults by ISO", "Volume by ISO"],
}

function ReportLibraryMenu({ active, onPick }: { active: string; onPick: (name: string) => void }) {
  const [category, setCategory] = useState(libraryCategories[0]!)
  const [saveOpen, setSaveOpen] = useState(false)
  const reports = libraryReports[category] ?? []
  const card = (on: boolean) =>
    cn(
      "border-border bg-background hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 relative flex min-h-12 w-full items-center rounded-lg border px-2.5 py-2 text-left text-sm font-medium shadow-xs transition-colors outline-none focus-visible:ring-3",
      on && "border-primary bg-primary/10 text-primary hover:bg-primary/15",
    )
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2">
      <Popover>
        <PopoverTrigger className="group/navigation-menu-trigger hover:bg-muted focus:bg-muted data-popup-open:bg-muted/50 inline-flex h-8 w-max items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium outline-none">
          Reports
          <ChevronDownIcon className="relative top-px size-3 transition duration-100 group-data-popup-open/navigation-menu-trigger:rotate-180" />
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[min(52rem,calc(100vw-2rem))] max-w-[min(52rem,calc(100vw-2rem))] gap-0 p-0"
        >
          <div className="flex min-h-56">
            <div className="flex w-52 shrink-0 flex-col border-r p-2">
              <div className="mb-2 flex items-center gap-1 px-1">
                <p className="text-muted-foreground min-w-0 flex-1 text-xs font-medium tracking-wide uppercase">
                  Categories
                </p>
                <Button type="button" variant="ghost" size="icon-xs" aria-label="Category">
                  <PlusIcon />
                </Button>
              </div>
              <div className="flex flex-col gap-1">
                {libraryCategories.map((c) => (
                  <div key={c} className="flex items-center gap-1">
                    <button
                      type="button"
                      onMouseEnter={() => setCategory(c)}
                      onFocus={() => setCategory(c)}
                      onClick={() => setCategory(c)}
                      className={cn(
                        "hover:bg-muted focus-visible:ring-ring/50 min-w-0 flex-1 rounded-md px-2 py-1.5 text-left text-sm outline-none focus-visible:ring-3",
                        c === category && "bg-primary/10 text-primary font-medium",
                      )}
                    >
                      {c}
                    </button>
                    <span className="text-muted-foreground inline-flex size-6 items-center justify-center rounded-md">
                      <EllipsisVerticalIcon className="size-3.5" />
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="min-w-0 flex-1 p-2">
              <div
                className={cn(
                  "grid grid-cols-1 items-stretch gap-2",
                  reports.length > 1 && "lg:grid-cols-2",
                  reports.length >= 3 && "xl:grid-cols-3",
                )}
              >
                {reports.map((r) => (
                  <div key={r} className="flex items-stretch gap-1">
                    <button type="button" className={card(r === active)} onClick={() => onPick(r)}>
                      <span className="min-w-0 break-words">{r}</span>
                    </button>
                    <span className="text-muted-foreground inline-flex size-6 shrink-0 items-center justify-center self-center rounded-md">
                      <EllipsisVerticalIcon className="size-3.5" />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 border-t p-2">
            <Button size="sm" onClick={() => setSaveOpen(true)}>
              Save as report
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      <Button type="button" variant="outline" onClick={() => setSaveOpen(true)}>
        Save as report
      </Button>
      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save as report</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-2">
              <Label htmlFor="report-save-name">Name</Label>
              <SfInput id="report-save-name" maxLength={80} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="report-save-category">Category</Label>
              <Select
                id="report-save-category"
                value={category}
                options={libraryCategories.map((c) => ({ value: c, label: c }))}
                onChange={setCategory}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setSaveOpen(false)}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
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
          <p className="text-muted-foreground m-0 px-2 text-center text-sm">
            Ask for a report in plain language. Successful queries stay here so you can reload them later.
          </p>
        </div>
        <div className="shrink-0 border-t px-4 py-3">
          <textarea
            rows={2}
            placeholder="e.g. payments over $10k last month by ISO"
            aria-label="Report request"
            className="border-input dark:bg-input/30 mb-3 w-full min-w-0 rounded-lg border bg-transparent px-2.5 py-1.5 text-sm outline-none"
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

export function SimplyFundingReport() {
  const [sources, setSources] = useState(["deals"])
  const [cols, setCols] = useState<ColKey[]>(DEFAULT_COLS)
  const [groupBy, setGroupBy] = useState("none")
  const [range, setRange] = useState("all")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [lawFirm, setLawFirm] = useState<string[]>([])
  const [iso, setIso] = useState<string[]>([])
  const [status, setStatus] = useState<string[]>(["Defaulted"])
  const [colFilters, setColFilters] = useState<ColumnFilter[]>([
    { id: "default-date", text: "Date of Default between 2026-01-01 and 2026-11-30" },
  ])
  // No sort means the report's normal order (newest funding first). Column titles follow the List's rule:
  // click once for ascending, again for descending, a third time to go back to no sort.
  const [sort, setSort] = useState<{ key: ColKey; dir: "asc" | "desc" } | null>(null)
  const sortBy = (key: ColKey) =>
    setSort((s) => (s?.key !== key ? { key, dir: "asc" } : s.dir === "asc" ? { key, dir: "desc" } : null))
  const [pageSize, setPageSize] = useState("50")
  const [q, setQ] = useState("")
  const [page, setPage] = useState(1)
  const [chatOpen, setChatOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)
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

  const columns = cols.map((k) => COLUMNS.find((c) => c.key === k)!)

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    let rows = deals.filter(
      (d) =>
        (!status.length || status.includes(d.status)) &&
        (!lawFirm.length || lawFirm.includes(d.lawFirm)) &&
        (!iso.length || iso.includes(d.iso)) &&
        (!needle || d.name.toLowerCase().includes(needle) || String(d.id).includes(needle)),
    )
    if (!sort) return rows
    const k = sort.key
    rows = [...rows].sort((a, b) => {
      const va = k === "fundedAt" ? dateKey(a.fundedAt) : a[k]
      const vb = k === "fundedAt" ? dateKey(b.fundedAt) : b[k]
      const cmp = typeof va === "number" && typeof vb === "number" ? va - vb : String(va).localeCompare(String(vb))
      return sort.dir === "asc" ? cmp : -cmp
    })
    return rows
  }, [q, status, lawFirm, iso, sort])

  useEffect(() => setPage(1), [q, status, lawFirm, iso, sort, pageSize, groupBy])

  const size = Number(pageSize)
  const pageCount = Math.max(1, Math.ceil(filtered.length / size))
  const current = Math.min(page, pageCount)
  const pageRows = filtered.slice((current - 1) * size, current * size)
  const first = filtered.length ? (current - 1) * size + 1 : 0
  const last = Math.min(current * size, filtered.length)

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

  const filtersActive =
    status.length > 0 || lawFirm.length > 0 || iso.length > 0 || colFilters.length > 0 || !!from || !!to || q !== ""
  const reset = () => {
    setStatus([])
    setLawFirm([])
    setIso([])
    setColFilters([])
    setFrom("")
    setTo("")
    setRange("all")
    setQ("")
    setGroupBy("none")
    setCols(DEFAULT_COLS)
  }

  const expandButton = (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className="size-7"
      aria-label={expanded ? "Collapse" : "Expand"}
      onClick={() => setExpanded((e) => !e)}
    >
      {expanded ? <Minimize2Icon /> : <Maximize2Icon />}
    </Button>
  )

  const head = (
    <tr className="bg-muted/50 border-b">
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
              "bg-muted text-foreground sticky top-0 z-10 h-10 cursor-grab px-2 text-left align-middle text-[10px] font-semibold tracking-wider whitespace-nowrap uppercase select-none active:cursor-grabbing md:text-xs",
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
      {/* Fixed corner at the right end of the title band: column titles slide under it. */}
      <th className="bg-muted sticky top-0 right-0 z-20 w-10 p-0 pr-1 text-right align-middle">{expandButton}</th>
    </tr>
  )

  const row = (r: Deal) => (
    <tr key={r.id} className="hover:bg-muted/50 cursor-pointer border-b transition-colors" onClick={() => setDetail(r)}>
      {columns.map((c) => (
        <td
          key={c.key}
          className={cn("p-2 align-middle whitespace-nowrap", isNum(c) && "tabular-nums", dropLine(c.key))}
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
            "p-2 align-middle whitespace-nowrap",
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
    <div className="flex h-[820px] min-w-0 flex-col gap-4 overflow-x-hidden lg:grid lg:min-h-0 lg:grid-cols-[18rem_minmax(0,1fr)] lg:grid-rows-[auto_minmax(0,1fr)_auto] lg:gap-x-4 lg:gap-y-2 lg:overflow-hidden">
      {/* Left: filters card */}
      <div className="w-full shrink-0 lg:col-start-1 lg:row-start-2 lg:flex lg:h-full lg:min-h-0 lg:flex-col lg:overflow-hidden">
        <Card className="flex min-h-0 w-full flex-1 flex-col overflow-hidden pt-2">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 overflow-x-hidden overflow-y-auto overscroll-y-auto px-(--card-spacing) pt-0 pb-(--card-spacing) [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="grid shrink-0 grid-cols-2 gap-2">
              {SOURCES.map((s) => {
                const on = sources.includes(s.id)
                return (
                  <Button
                    key={s.id}
                    type="button"
                    size="sm"
                    variant={on ? "default" : "outline"}
                    aria-pressed={on}
                    onClick={() =>
                      setSources((cur) =>
                        on ? (cur.length > 1 ? cur.filter((x) => x !== s.id) : cur) : [...cur, s.id],
                      )
                    }
                    className="h-auto w-full min-w-0 shrink-0 flex-col gap-0 py-1 leading-tight"
                  >
                    <span className="truncate">{s.label}</span>
                    <span
                      className={cn(
                        "text-[10px] font-normal tabular-nums",
                        on ? "text-primary-foreground/80" : "text-muted-foreground",
                      )}
                    >
                      {s.rows.toLocaleString("en-US")} rows
                    </span>
                  </Button>
                )
              })}
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-2">
              <ColumnPicker selected={cols} onChange={setCols} />
              <FormulaDialog />
              <div className="grid min-w-0 gap-2">
                <Label>Group by</Label>
                <Select
                  ariaLabel="Group by"
                  value={groupBy}
                  onChange={setGroupBy}
                  options={[
                    { value: "none", label: "None" },
                    { value: "lawFirm", label: "Law Firm" },
                    { value: "iso", label: "Referring ISO" },
                    { value: "status", label: "Status" },
                  ]}
                />
              </div>
            </div>

            <div className="grid min-w-0 grid-cols-2 gap-3 lg:grid-cols-1">
              <div className="grid gap-2">
                <Label htmlFor="report-range">Range</Label>
                <Select
                  id="report-range"
                  value={range}
                  onChange={setRange}
                  options={[
                    { value: "all", label: "All" },
                    { value: "today", label: "Today" },
                    { value: "yesterday", label: "Yesterday" },
                    { value: "7d", label: "Last 7 days" },
                    { value: "30d", label: "Last 30 days" },
                    { value: "month", label: "This month" },
                    { value: "last-month", label: "Last month" },
                    { value: "year", label: "This year" },
                  ]}
                />
              </div>
              <div className="col-span-2 grid grid-cols-2 gap-3 lg:col-span-1 lg:grid-cols-1">
                <DateField id="report-from" label="From" value={from} onChange={setFrom} />
                <DateField id="report-to" label="To" value={to} onChange={setTo} />
              </div>
              <ChipsCombobox
                id="report-value-lawFirm"
                label="Law Firm"
                values={lawFirm}
                options={lawFirms}
                onChange={setLawFirm}
              />
              <ChipsCombobox
                id="report-value-iso"
                label="Referring ISO"
                values={iso}
                options={isos}
                onChange={setIso}
              />
              <ChipsCombobox
                id="report-status"
                label="Status"
                values={status}
                options={statuses}
                onChange={setStatus}
                placeholder="all"
              />
              <ColumnFilters
                filters={colFilters}
                onApply={(f) => setColFilters((cur) => [...cur.filter((x) => x.id !== f.id), f])}
                onRemove={(id) => setColFilters((cur) => cur.filter((x) => x.id !== id))}
              />
              <div className="grid gap-2">
                <Label htmlFor="report-sort">Sort</Label>
                <Select
                  id="report-sort"
                  value={sort?.key === "name" ? "name" : sort?.key === "amount" ? "amount" : "date"}
                  onChange={(v) =>
                    setSort(
                      v === "name"
                        ? { key: "name", dir: "asc" }
                        : v === "amount"
                          ? { key: "amount", dir: "desc" }
                          : null,
                    )
                  }
                  options={[
                    { value: "date", label: "Date" },
                    { value: "name", label: "Name" },
                    { value: "amount", label: "Amount" },
                  ]}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="report-page-size">Rows per page</Label>
                <Select
                  id="report-page-size"
                  value={pageSize}
                  onChange={setPageSize}
                  options={["50", "100", "250", "500", "1000"].map((v) => ({
                    value: v,
                    label: Number(v).toLocaleString("en-US"),
                  }))}
                />
              </div>
            </div>
          </div>
          <div
            data-slot="card-footer"
            className="bg-muted/50 flex shrink-0 flex-col items-center gap-2 rounded-b-xl border-t p-(--card-spacing)"
          >
            <Button type="button" variant="outline" className="w-full" onClick={() => setChatOpen(true)}>
              Chat
            </Button>
            {filtersActive ? (
              <Button type="button" variant="destructive" size="lg" className="w-full" onClick={reset}>
                Reset
              </Button>
            ) : null}
          </div>
        </Card>
      </div>

      {/* Top bar */}
      <div className="flex min-w-0 shrink-0 flex-col gap-2 lg:col-start-2 lg:row-start-1">
        <div className="flex min-w-0 shrink-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <ReportLibraryMenu active={activeReport} onPick={setActiveReport} />
          <SfInput
            id="report-search"
            className="w-full min-w-0 sm:min-w-[12rem] sm:flex-1"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search"
          />
          <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:shrink-0">
            <span className="text-muted-foreground text-sm tabular-nums">
              {filtered.length.toLocaleString("en-US")} rows total
            </span>
            <Button type="button" aria-label="Export">
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex min-w-0 flex-1 flex-col gap-2 overflow-x-hidden lg:col-start-2 lg:row-start-2 lg:h-full lg:min-h-0">
        {expanded ? (
          <div
            className="fixed inset-0 z-50 bg-black/10 supports-backdrop-filter:backdrop-blur-xs"
            aria-hidden
            onClick={() => setExpanded(false)}
          />
        ) : null}
        <Card
          className={cn(
            // No padding: the title and Total bands reach the card's edges, and the card's rounded corners clip them.
            "relative gap-0 overflow-hidden py-0",
            expanded ? "fixed inset-4 z-50 h-[calc(100dvh-2rem)] max-h-none" : "h-full min-h-0 flex-1",
          )}
        >
          <h2 className="sr-only">Report</h2>
          <div className="min-h-0 flex-1 overflow-hidden">
            {filtered.length === 0 ? (
              <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
                No rows match these filters.
              </div>
            ) : (
              <CanvasScroll>
                {/* 16px before the first column, so the text lines up with the band edges. */}
                <table className="w-max min-w-full caption-bottom text-sm [&_tr>*:first-child]:pl-4">
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
                                <td colSpan={columns.length} className="p-2 align-middle font-medium whitespace-nowrap">
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
                    <tr className="bg-muted sticky bottom-0 z-10 border-t">
                      {columns.map((c, i) => (
                        <td
                          key={c.key}
                          className={cn(
                            "p-2 align-middle font-semibold whitespace-nowrap",
                            isNum(c) && "tabular-nums",
                            dropLine(c.key),
                          )}
                        >
                          {i === 0 ? "Total" : c.kind === "money" ? money(totalOf(c.key, filtered)) : ""}
                        </td>
                      ))}
                      <td aria-hidden className="w-10" />
                    </tr>
                  </tfoot>
                </table>
              </CanvasScroll>
            )}
          </div>
        </Card>
      </div>

      {/* Footer */}
      <div className="flex shrink-0 flex-wrap items-center gap-2 lg:col-start-2 lg:row-start-3">
        <span className="text-muted-foreground mr-auto text-sm tabular-nums">
          Showing {first.toLocaleString("en-US")}-{last.toLocaleString("en-US")} of{" "}
          {filtered.length.toLocaleString("en-US")}
        </span>
        <Button type="button" variant="outline" disabled={current <= 1} onClick={() => setPage(current - 1)}>
          Previous
        </Button>
        <Button type="button" variant="outline" disabled={current >= pageCount} onClick={() => setPage(current + 1)}>
          Next
        </Button>
      </div>

      <Dialog open={detail != null} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Row details</DialogTitle>
          </DialogHeader>
          <dl className="grid gap-2 text-sm">
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
const GUTTER = 10 // the scrollbars' track (ui-scrollbar draws a 6px thumb in it)

function CanvasScroll({ children }: { children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null)
  const vbar = useRef<HTMLDivElement>(null)
  const hbar = useRef<HTMLDivElement>(null)
  const [dims, setDims] = useState({ sh: 0, ch: 0, sw: 0, cw: 0, head: 0, foot: 0 })

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
      })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    const table = el.firstElementChild
    if (table) ro.observe(table)
    return () => ro.disconnect()
  }, [])

  // Keep the grid and the two bars in step. Each bar's spacer is sized so it scrolls exactly as far as the grid.
  const syncing = useRef(false)
  const follow = (from: HTMLElement | null, apply: () => void) => {
    if (!from || syncing.current) return
    syncing.current = true
    apply()
    requestAnimationFrame(() => (syncing.current = false))
  }
  const onGrid = () =>
    follow(box.current, () => {
      if (vbar.current) vbar.current.scrollTop = box.current!.scrollTop
      if (hbar.current) hbar.current.scrollLeft = box.current!.scrollLeft
    })

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
    <div className="relative flex h-full min-h-0 flex-col">
      <div className="flex min-h-0 flex-1">
        <div
          ref={box}
          onScroll={onGrid}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          className="min-h-0 min-w-0 flex-1 cursor-grab overflow-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {children}
        </div>
        {/* Right edge: the title band, the vertical scrollbar flush to the edge, then the Total band. */}
        <div className="flex shrink-0 flex-col" style={{ width: GUTTER }}>
          <div className={cn(band, "border-b")} style={{ height: dims.head }} />
          <div
            ref={vbar}
            aria-hidden
            onScroll={() => follow(vbar.current, () => (box.current!.scrollTop = vbar.current!.scrollTop))}
            className="ui-scrollbar min-h-0 flex-1 overflow-x-hidden overflow-y-auto"
          >
            <div style={{ height: Math.max(0, dims.sh - dims.head - dims.foot) }} />
          </div>
          <div className={cn(band, "border-t")} style={{ height: dims.foot }} />
        </div>
      </div>
      {wide ? (
        // The sideways scrollbar sits in the Total band, along the bottom edge.
        <div className={cn(band, "flex")}>
          <div
            ref={hbar}
            aria-hidden
            onScroll={() => follow(hbar.current, () => (box.current!.scrollLeft = hbar.current!.scrollLeft))}
            className="ui-scrollbar min-w-0 flex-1 overflow-x-auto overflow-y-hidden"
          >
            <div className="h-px" style={{ width: dims.sw }} />
          </div>
          <div className="shrink-0" style={{ width: GUTTER }} />
        </div>
      ) : null}
    </div>
  )
}
