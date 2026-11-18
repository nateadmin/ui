import { Fragment, useState, type ReactNode } from "react"
import {
  CalendarDays,
  Check,
  ChevronDown,
  FileBarChart,
  GanttChart,
  GripVertical,
  LayoutGrid,
  List,
  Plus,
  Save,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Toolbar,
  ToolbarActiveFilters,
  ToolbarLabel,
  ToolbarCount,
  ToolbarDateRange,
  ToolbarExport,
  ToolbarFilter,
  ToolbarFilterDialog,
  ToolbarSavedViews,
  ToolbarSearch,
  ToolbarTabs,
  ToolbarViews,
  activeFilterItems,
  defaultDatePresets,
  type ToolbarActiveFilter,
  type ToolbarDateRangeValue,
  type ToolbarFilterGroup,
  type ToolbarFilterOption,
  type ToolbarFilterValues,
} from "@/components/ui/toolbar"

import { SimplyFundingList } from "./list-sample"
import { ListBuilder } from "./list-builder"

export type CatalogExample = { name: string; render: () => ReactNode; minHeight?: number }
export type CatalogEntry = { id: string; name: string; examples: CatalogExample[] }

/* ---------- Sample data ---------- */

const people: ToolbarFilterOption[] = [
  { value: "me", label: "Me" },
  { value: "sharon", label: "Sharon" },
  { value: "david", label: "David" },
  { value: "unassigned", label: "Unassigned" },
]

const statusOptions: ToolbarFilterOption[] = [
  { value: "active", label: "Active", color: "#22c55e" },
  { value: "at-risk", label: "At risk", color: "#f59e0b" },
  { value: "done", label: "Done", color: "#3b82f6" },
]

const firstNames = ["Avi", "Bella", "Chaim", "Dina", "Eli", "Faigy", "Gavriel", "Hadassah", "Isaac", "Judith"]
const lastNames = ["Adler", "Berger", "Cohen", "Dahan", "Edelman", "Feld", "Gold", "Hirsch", "Katz", "Levy"]
const manyPeople: ToolbarFilterOption[] = firstNames.flatMap((f) =>
  lastNames.map((l) => ({ value: `${f}-${l}`.toLowerCase(), label: `${f} ${l}` })),
)

const filterGroups: ToolbarFilterGroup[] = [
  { id: "status", label: "Status", options: statusOptions },
  { id: "owner", label: "Owner", options: manyPeople },
  {
    id: "priority",
    label: "Priority",
    options: [
      { value: "high", label: "High" },
      { value: "medium", label: "Medium" },
      { value: "low", label: "Low" },
    ],
  },
  {
    id: "due",
    label: "Due",
    options: [
      { value: "overdue", label: "Overdue" },
      { value: "today", label: "Today" },
      { value: "week", label: "This week" },
      { value: "month", label: "This month" },
    ],
  },
]

const twoViews = [
  { value: "board", label: "Board", icon: <LayoutGrid /> },
  { value: "list", label: "List", icon: <List /> },
]

const fourViews = [
  ...twoViews,
  { value: "calendar", label: "Calendar", icon: <CalendarDays /> },
  { value: "timeline", label: "Timeline", icon: <GanttChart /> },
]

/* Chips for multi-select inline filters. */
function chipsFor(label: string, options: ToolbarFilterOption[], values: string[], set: (v: string[]) => void) {
  return values.map<ToolbarActiveFilter>((v) => ({
    id: `${label}:${v}`,
    label,
    value: options.find((o) => o.value === v)?.label ?? v,
    onRemove: () => set(values.filter((x) => x !== v)),
  }))
}

/* ---------- Toolbar builder ---------- */

/* One toolbar. Switch parts on and off, then drag them (or use the arrow
   keys) to set the order they sit in. */

type PartKey =
  | "savedViews"
  | "views"
  | "search"
  | "statusTabs"
  | "filterShort"
  | "filterLong"
  | "filtersDialog"
  | "dateRange"
  | "count"
  | "reports"
  | "export"
  | "primary"
  | "spacer"
  | "chips"

const PARTS: Array<{ key: PartKey; label: string }> = [
  { key: "savedViews", label: "Saved views" },
  { key: "views", label: "Views" },
  { key: "search", label: "Search" },
  { key: "statusTabs", label: "Status tabs" },
  { key: "filterShort", label: "Filter (short list)" },
  { key: "filterLong", label: "Filter (long list)" },
  { key: "filtersDialog", label: "Filters dialog" },
  { key: "dateRange", label: "Date range" },
  { key: "count", label: "Count" },
  { key: "reports", label: "Report actions" },
  { key: "export", label: "Export" },
  { key: "primary", label: "Primary button" },
  { key: "spacer", label: "Push right" },
  { key: "chips", label: "Applied filter chips" },
]

const partLabel = (k: PartKey) => PARTS.find((p) => p.key === k)?.label ?? k

/* Default order. "Push right" is a spacer: parts after it sit at the right edge. */
const DEFAULT_ORDER: PartKey[] = [
  "savedViews",
  "reports",
  "views",
  "search",
  "statusTabs",
  "filterShort",
  "filterLong",
  "filtersDialog",
  "dateRange",
  "count",
  "spacer",
  "export",
  "primary",
]

const DEFAULT_PARTS: PartKey[] = [
  "savedViews",
  "views",
  "search",
  "filterShort",
  "filtersDialog",
  "spacer",
  "primary",
  "chips",
]

function ToolbarBuilder() {
  const [on, setOn] = useState<PartKey[]>(DEFAULT_PARTS)
  const [viewCount, setViewCount] = useState<2 | 4>(2)
  const [labels, setLabels] = useState<"show" | "icons" | "icons-on-phones">("show")
  const has = (k: PartKey) => on.includes(k)
  const flip = (k: PartKey) => setOn((cur) => (cur.includes(k) ? cur.filter((x) => x !== k) : [...cur, k]))

  // Order of the parts on the bar. Drag a chip onto another to move it there.
  const [order, setOrder] = useState<PartKey[]>(DEFAULT_ORDER)
  const [dragging, setDragging] = useState<PartKey | null>(null)
  const [over, setOver] = useState<PartKey | null>(null)
  const placed = order.filter(has)
  const move = (from: PartKey, to: PartKey) => {
    if (from === to) return
    setOrder((cur) => {
      const next = cur.filter((k) => k !== from)
      const at = next.indexOf(to)
      const fromIdx = cur.indexOf(from)
      const toIdx = cur.indexOf(to)
      next.splice(fromIdx < toIdx ? at + 1 : at, 0, from)
      return next
    })
  }
  const nudge = (k: PartKey, dir: -1 | 1) => {
    const i = placed.indexOf(k)
    const target = placed[i + dir]
    if (target) move(k, target)
  }

  const [view, setView] = useState("board")
  const [tab, setTab] = useState("active")
  const [status, setStatus] = useState<string[]>(["active"])
  const [owners, setOwners] = useState<string[]>([])
  const [filters, setFilters] = useState<ToolbarFilterValues>({})
  const [exported, setExported] = useState("")
  const thirty = defaultDatePresets.find((p) => p.id === "30-days")!
  const t = new Date()
  const [range, setRange] = useState<ToolbarDateRangeValue>(
    thirty.range(new Date(t.getFullYear(), t.getMonth(), t.getDate())),
  )

  // Saved views. In an app these live on the user's profile.
  type Snapshot = { status: string[]; owners: string[]; filters: ToolbarFilterValues }
  const blank: Snapshot = { status: [], owners: [], filters: {} }
  const [views, setViews] = useState<Array<{ id: string; name: string; snap: Snapshot }>>([
    { id: "v1", name: "My active projects", snap: { status: ["active"], owners: ["avi-adler"], filters: {} } },
    { id: "v2", name: "At risk this week", snap: { status: ["at-risk"], owners: [], filters: { due: ["week"] } } },
  ])
  const [activeView, setActiveView] = useState<string | null>(null)
  const current: Snapshot = { status, owners, filters }
  const apply = (snap: Snapshot) => {
    setStatus(snap.status)
    setOwners(snap.owners)
    setFilters(snap.filters)
  }
  const base = views.find((v) => v.id === activeView)?.snap ?? blank
  const modified = JSON.stringify(base) !== JSON.stringify(current)

  const chips = [
    ...(has("filterShort") ? chipsFor("Status", statusOptions, status, setStatus) : []),
    ...(has("filterLong") ? chipsFor("Owner", manyPeople, owners, setOwners) : []),
    ...(has("filtersDialog") ? activeFilterItems(filterGroups, filters, setFilters) : []),
  ]

  const renderPart = (k: PartKey): ReactNode => {
    switch (k) {
      case "savedViews":
        return (
          <ToolbarSavedViews
            views={views}
            activeId={activeView}
            modified={modified}
            onSelect={(id) => {
              setActiveView(id)
              apply(views.find((v) => v.id === id)?.snap ?? blank)
            }}
            onSave={(name) => {
              const id = `v${Date.now()}`
              setViews((cur) => [...cur, { id, name, snap: current }])
              setActiveView(id)
            }}
            onUpdate={(id) => setViews((cur) => cur.map((v) => (v.id === id ? { ...v, snap: current } : v)))}
            onDelete={(id) => {
              setViews((cur) => cur.filter((v) => v.id !== id))
              if (activeView === id) setActiveView(null)
            }}
          />
        )
      case "reports":
        return (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline" size="lg" className="gap-2 font-normal" />}>
                <FileBarChart aria-hidden="true" />
                <ToolbarLabel>Reports</ToolbarLabel>
                <ChevronDown aria-hidden="true" data-toolbar-chevron="" className="text-muted-foreground ml-auto" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem>Funded this month</DropdownMenuItem>
                <DropdownMenuItem>Defaults by ISO</DropdownMenuItem>
                <DropdownMenuItem>Renewals due</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="lg" className="font-normal">
              <Save aria-hidden="true" />
              <ToolbarLabel>Save as report</ToolbarLabel>
            </Button>
          </>
        )
      case "views":
        return (
          <ToolbarViews
            views={(viewCount === 2 ? twoViews : fourViews).map((v) => ({ ...v }))}
            value={view}
            onValueChange={setView}
          />
        )
      case "search":
        return <ToolbarSearch placeholder="Search projects" />
      case "statusTabs":
        return (
          <ToolbarTabs
            stretch={!has("search")}
            value={tab}
            onValueChange={setTab}
            tabs={[
              { value: "active", label: "Active", count: 128 },
              { value: "monitor", label: "Monitor", count: 41 },
              { value: "success", label: "Success", count: 312 },
              { value: "defaulted", label: "Defaulted", count: 17 },
            ]}
          />
        )
      case "filterShort":
        return (
          <ToolbarFilter
            multiple
            label="Status"
            placeholder="Any"
            options={statusOptions}
            values={status}
            onValuesChange={setStatus}
          />
        )
      case "filterLong":
        return (
          <ToolbarFilter
            multiple
            label="Owner"
            placeholder="Anyone"
            options={manyPeople}
            values={owners}
            onValuesChange={setOwners}
          />
        )
      case "filtersDialog":
        return <ToolbarFilterDialog filters={filterGroups} values={filters} onValuesChange={setFilters} />
      case "dateRange":
        return <ToolbarDateRange value={range} onValueChange={setRange} />
      case "count":
        return <ToolbarCount>{exported ? `Exporting ${exported.toUpperCase()}...` : "1,240 projects"}</ToolbarCount>
      case "export":
        return <ToolbarExport onExport={setExported} />
      case "primary":
        return (
          <Button size="lg">
            <Plus aria-hidden="true" />
            <ToolbarLabel>New project</ToolbarLabel>
          </Button>
        )
      case "spacer":
        return <div aria-hidden="true" className="-mr-2 ml-auto" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="text-muted-foreground text-xs font-medium">Parts on the toolbar</p>
        <div className="flex flex-wrap gap-2">
          {PARTS.map((part) => (
            <Button
              key={part.key}
              type="button"
              variant="outline"
              size="sm"
              aria-pressed={has(part.key)}
              onClick={() => flip(part.key)}
              className="aria-pressed:border-foreground/40 aria-pressed:bg-muted gap-1.5 rounded-full font-normal"
            >
              <span
                aria-hidden="true"
                className={`flex size-3.5 items-center justify-center rounded-full border ${
                  has(part.key) ? "bg-foreground border-foreground text-background" : "border-foreground/30"
                }`}
              >
                {has(part.key) ? <Check className="size-2.5" strokeWidth={3} /> : null}
              </span>
              {part.label}
            </Button>
          ))}
        </div>
        {has("views") ? (
          <div className="flex items-center gap-2 pt-1">
            <span className="text-muted-foreground text-xs">Number of views</span>
            {[2, 4].map((n) => (
              <Button
                key={n}
                type="button"
                variant="outline"
                size="xs"
                aria-pressed={viewCount === n}
                onClick={() => setViewCount(n as 2 | 4)}
                className="aria-pressed:border-foreground/40 aria-pressed:bg-muted rounded-full font-normal"
              >
                {n === 2 ? "2 (tabs)" : "4 (dropdown)"}
              </Button>
            ))}
          </div>
        ) : null}
        <div role="radiogroup" aria-label="Labels" className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-muted-foreground text-xs">Labels</span>
          {(
            [
              ["show", "Show"],
              ["icons", "Icons only"],
              ["icons-on-phones", "Icons only on phones"],
            ] as const
          ).map(([value, text]) => (
            <Button
              key={value}
              type="button"
              role="radio"
              aria-checked={labels === value}
              variant="outline"
              size="xs"
              onClick={() => setLabels(value)}
              className="aria-checked:border-foreground/40 aria-checked:bg-muted rounded-full font-normal"
            >
              {text}
            </Button>
          ))}
        </div>
        {placed.length > 1 ? (
          <div className="space-y-2 pt-2">
            <div className="flex items-center gap-3">
              <p className="text-muted-foreground text-xs font-medium">Order on the toolbar</p>
              <span className="text-muted-foreground text-xs">
                Drag to rearrange, or focus one and use the arrow keys.
              </span>
              <Button
                type="button"
                variant="link"
                size="xs"
                className="text-muted-foreground ml-auto px-0 font-normal"
                onClick={() => setOrder(DEFAULT_ORDER)}
              >
                Reset order
              </Button>
            </div>
            <ol aria-label="Order of parts on the toolbar" className="m-0 flex list-none flex-wrap gap-2 p-0">
              {placed.map((k, i) => (
                <li
                  key={k}
                  draggable
                  tabIndex={0}
                  aria-label={`${partLabel(k)}, position ${i + 1} of ${placed.length}`}
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
                    e.preventDefault()
                    if (over !== k) setOver(k)
                  }}
                  onDragLeave={() => setOver((cur) => (cur === k ? null : cur))}
                  onDrop={(e) => {
                    e.preventDefault()
                    if (dragging) move(dragging, k)
                    setDragging(null)
                    setOver(null)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                      e.preventDefault()
                      nudge(k, -1)
                    } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                      e.preventDefault()
                      nudge(k, 1)
                    }
                  }}
                  className={`bg-card focus-visible:ring-ring/50 flex h-8 cursor-grab items-center gap-1.5 rounded-lg border pr-3 pl-1.5 text-sm outline-none select-none focus-visible:ring-2 active:cursor-grabbing ${
                    dragging === k ? "opacity-40" : ""
                  } ${over === k && dragging && dragging !== k ? "border-foreground/60 bg-muted" : ""}`}
                >
                  <GripVertical aria-hidden="true" className="text-muted-foreground size-3.5" />
                  <span className="text-muted-foreground w-3 text-xs tabular-nums">{i + 1}</span>
                  {partLabel(k)}
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </div>

      <div>
        {on.filter((k) => k !== "chips").length === 0 ? (
          <p className="text-muted-foreground rounded-xl border border-dashed p-6 text-center text-sm">
            Turn on a part above to build the toolbar.
          </p>
        ) : (
          <Toolbar labels={labels}>
            {placed.map((k) => {
              const node = renderPart(k)
              return node ? <Fragment key={k}>{node}</Fragment> : null
            })}
          </Toolbar>
        )}
        {has("chips") ? (
          <ToolbarActiveFilters
            items={chips}
            onClearAll={() => {
              setStatus([])
              setOwners([])
              setFilters({})
            }}
          />
        ) : null}
      </div>
    </div>
  )
}

export const catalog: CatalogEntry[] = [
  {
    id: "list",
    name: "List",
    examples: [
      { name: "Build a list: turn columns and parts on and off", render: () => <ListBuilder />, minHeight: 980 },
      {
        name: "Applications list, current layout (placeholder data)",
        // The list fills the height it is given; here a 640px box stands in for the page.
        render: () => (
          <div className="h-[640px]">
            <SimplyFundingList />
          </div>
        ),
        minHeight: 640,
      },
    ],
  },
  {
    id: "toolbar",
    name: "Toolbar",
    examples: [{ name: "Build a toolbar: turn parts on and off", render: () => <ToolbarBuilder />, minHeight: 720 }],
  },
]
