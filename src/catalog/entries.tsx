import { useState, type ReactNode } from "react"
import { CalendarDays, Check, ChevronDown, GanttChart, LayoutGrid, List, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Toolbar,
  ToolbarActions,
  ToolbarActiveFilters,
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

/* One toolbar. Switch parts on and off and they drop into place, in the
   order the toolbar always uses, so the toolbar reads as one component. */

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
  { key: "chips", label: "Applied filter chips" },
]

const DEFAULT_PARTS: PartKey[] = ["savedViews", "views", "search", "filterShort", "filtersDialog", "primary", "chips"]

function ToolbarBuilder() {
  const [on, setOn] = useState<PartKey[]>(DEFAULT_PARTS)
  const [viewCount, setViewCount] = useState<2 | 4>(2)
  const has = (k: PartKey) => on.includes(k)
  const flip = (k: PartKey) => setOn((cur) => (cur.includes(k) ? cur.filter((x) => x !== k) : [...cur, k]))

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
      </div>

      <div>
        {on.filter((k) => k !== "chips").length === 0 ? (
          <p className="text-muted-foreground rounded-xl border border-dashed p-6 text-center text-sm">
            Turn on a part above to build the toolbar.
          </p>
        ) : (
          <Toolbar>
            {has("savedViews") ? (
              <ToolbarSavedViews
                views={views}
                activeId={activeView}
                modified={modified}
                defaultLabel="All projects"
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
            ) : null}
            {has("reports") ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button variant="outline" size="lg" className="gap-2 font-normal" />}>
                    Reports
                    <ChevronDown className="text-muted-foreground" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem>Funded this month</DropdownMenuItem>
                    <DropdownMenuItem>Defaults by ISO</DropdownMenuItem>
                    <DropdownMenuItem>Renewals due</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="outline" size="lg" className="font-normal">
                  Save as report
                </Button>
              </>
            ) : null}
            {has("views") ? (
              <ToolbarViews
                views={(viewCount === 2 ? twoViews : fourViews).map((v) => ({ ...v }))}
                value={view}
                onValueChange={setView}
              />
            ) : null}
            {has("search") ? <ToolbarSearch placeholder="Search projects" /> : null}
            {has("statusTabs") ? (
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
            ) : null}
            {has("filterShort") ? (
              <ToolbarFilter
                multiple
                label="Status"
                placeholder="Any"
                options={statusOptions}
                values={status}
                onValuesChange={setStatus}
              />
            ) : null}
            {has("filterLong") ? (
              <ToolbarFilter
                multiple
                label="Owner"
                placeholder="Anyone"
                options={manyPeople}
                values={owners}
                onValuesChange={setOwners}
              />
            ) : null}
            {has("filtersDialog") ? (
              <ToolbarFilterDialog filters={filterGroups} values={filters} onValuesChange={setFilters} />
            ) : null}
            {has("dateRange") ? <ToolbarDateRange value={range} onValueChange={setRange} /> : null}
            {has("count") ? (
              <ToolbarCount>{exported ? `Exporting ${exported.toUpperCase()}...` : "1,240 projects"}</ToolbarCount>
            ) : null}
            {has("export") || has("primary") ? (
              <ToolbarActions>
                {has("export") ? <ToolbarExport onExport={setExported} /> : null}
                {has("primary") ? (
                  <Button size="lg">
                    <Plus />
                    New project
                  </Button>
                ) : null}
              </ToolbarActions>
            ) : null}
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
      {
        name: "Applications list, current layout (placeholder data)",
        render: () => <SimplyFundingList />,
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
