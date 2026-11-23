import { Fragment, useState, type ReactNode } from "react"
import { CalendarDays, ChevronDown, FileBarChart, GanttChart, LayoutGrid, List, Plus, Save } from "lucide-react"
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

import { CustomizeMenu, CustomizeOption, CustomizeSwitch } from "@/components/ui/customize-menu"
import { SimplyFundingList } from "./list-sample"
import { SimplyFundingReport } from "./report-sample"
import { SimpleCheckboxDemo, SplashCheckboxDemo } from "./checkbox-samples"
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
]

/* Shown parts, in order. "Push right" is a spacer: parts after it sit at the right edge. */
const DEFAULT_PARTS: PartKey[] = ["savedViews", "views", "search", "filterShort", "filtersDialog", "spacer", "primary"]

function ToolbarBuilder() {
  // Shown parts, in order. In an app this is saved to the user's profile.
  const [placed, setPlaced] = useState<PartKey[]>(DEFAULT_PARTS)
  const [showChips, setShowChips] = useState(true)
  const [viewCount, setViewCount] = useState<"2" | "4">("2")
  const [labels, setLabels] = useState<"show" | "icons" | "icons-on-phones">("show")
  const has = (k: PartKey | "chips") => (k === "chips" ? showChips : placed.includes(k))

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
            views={(viewCount === "2" ? twoViews : fourViews).map((v) => ({ ...v }))}
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
        return <ToolbarCount>{exported || "1,240 projects"}</ToolbarCount>
      case "export":
        return (
          <ToolbarExport
            onExport={(format) => setExported(`Exporting ${format.toUpperCase()}...`)}
            // The catalog has no mail server: this waits a moment, then reports what would be sent.
            onEmail={({ to, format }) =>
              new Promise<void>((done) =>
                setTimeout(() => {
                  setExported(
                    `Emailed ${format.toUpperCase()} to ${to.length} ${to.length === 1 ? "person" : "people"}`,
                  )
                  done()
                }, 600),
              )
            }
          />
        )
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
    <div className="space-y-4">
      <CustomizeMenu
        label="Customize toolbar"
        itemsLabel="Parts"
        items={PARTS}
        value={placed}
        onValueChange={setPlaced}
        defaultValue={DEFAULT_PARTS}
      >
        <CustomizeOption
          label="Labels"
          value={labels}
          onValueChange={setLabels}
          options={[
            { value: "show", label: "Show" },
            { value: "icons", label: "Icons" },
            { value: "icons-on-phones", label: "Icons on phones" },
          ]}
        />
        <CustomizeOption
          label="Views"
          value={viewCount}
          onValueChange={setViewCount}
          options={[
            { value: "2", label: "2 (tabs)" },
            { value: "4", label: "4 (dropdown)" },
          ]}
        />
        <CustomizeSwitch label="Applied filter chips" checked={showChips} onCheckedChange={setShowChips} />
      </CustomizeMenu>

      <div>
        {placed.length === 0 ? (
          <p className="text-muted-foreground rounded-xl border border-dashed p-6 text-center text-sm">
            Turn on a part in Customize toolbar to build it.
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
    id: "checkbox",
    name: "Checkbox",
    examples: [
      {
        name: "Simple: round, fills with the accent color (the List's bulk select)",
        render: () => <SimpleCheckboxDemo />,
        minHeight: 220,
      },
      {
        name: "Splash: round, splashes when ticked (Sales Deals CTE)",
        render: () => <SplashCheckboxDemo />,
        minHeight: 220,
      },
    ],
  },
  {
    id: "report",
    name: "Report",
    examples: [
      {
        name: "Report and Data page, as it looks in the Data app today (placeholder data)",
        render: () => <SimplyFundingReport />,
        minHeight: 880,
      },
    ],
  },
  {
    id: "toolbar",
    name: "Toolbar",
    examples: [{ name: "Build a toolbar: turn parts on and off", render: () => <ToolbarBuilder />, minHeight: 720 }],
  },
]
