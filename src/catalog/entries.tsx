import { useState, type ReactNode } from "react"
import {
  CalendarDays,
  ChevronDown,
  ChevronsUpDown,
  Download,
  GanttChart,
  LayoutGrid,
  List,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Toolbar,
  ToolbarActions,
  ToolbarActiveFilters,
  ToolbarCount,
  ToolbarDateRange,
  ToolbarFilter,
  ToolbarFilterDialog,
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

const filterGroups: ToolbarFilterGroup[] = [
  { id: "status", label: "Status", options: statusOptions },
  { id: "owner", label: "Owner", options: people },
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

const firstNames = ["Avi", "Bella", "Chaim", "Dina", "Eli", "Faigy", "Gavriel", "Hadassah", "Isaac", "Judith"]
const lastNames = ["Adler", "Berger", "Cohen", "Dahan", "Edelman", "Feld", "Gold", "Hirsch", "Katz", "Levy"]
const manyPeople: ToolbarFilterOption[] = firstNames.flatMap((f) =>
  lastNames.map((l) => ({ value: `${f}-${l}`.toLowerCase(), label: `${f} ${l}` })),
)
const statusWords = [
  "New",
  "Contacted",
  "Qualified",
  "Docs requested",
  "Docs received",
  "In review",
  "Underwriting",
  "Approved",
  "Offer sent",
  "Offer accepted",
  "Contracts out",
  "Contracts in",
  "Funded",
  "Active",
  "Monitor",
  "Late",
  "Bounced",
  "Promise to pay",
  "Payment plan",
  "Settled",
  "Paid off",
  "Renewal",
  "Declined",
  "Withdrawn",
  "Duplicate",
  "On hold",
  "Escalated",
  "Legal",
  "Defaulted",
  "Closed",
]
const palette = ["#22c55e", "#f59e0b", "#3b82f6", "#a855f7", "#ef4444", "#14b8a6"]
const manyStatuses: ToolbarFilterOption[] = statusWords.map((label, i) => ({
  value: label.toLowerCase().replace(/\s+/g, "-"),
  label,
  color: palette[i % palette.length],
}))
const bigGroups: ToolbarFilterGroup[] = [
  { id: "status", label: "Status", options: manyStatuses },
  { id: "owner", label: "Owner", options: manyPeople },
  filterGroups[2]!,
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

function NewProject() {
  return (
    <ToolbarActions>
      <Button size="lg">
        <Plus />
        New project
      </Button>
    </ToolbarActions>
  )
}

/* ---------- Toolbar examples ---------- */

function BoardToolbar() {
  const [view, setView] = useState("board")
  const [owners, setOwners] = useState<string[]>([])
  const [status, setStatus] = useState<string[]>(["active"])
  const [filters, setFilters] = useState<ToolbarFilterValues>({ due: ["week"] })
  return (
    <div>
      <Toolbar>
        <ToolbarViews views={twoViews} value={view} onValueChange={setView} />
        <ToolbarSearch placeholder="Search projects" />
        <ToolbarFilter multiple placeholder="Anyone" options={people} values={owners} onValuesChange={setOwners} />
        <ToolbarFilter
          multiple
          placeholder="All statuses"
          options={statusOptions}
          values={status}
          onValuesChange={setStatus}
        />
        <ToolbarFilterDialog filters={filterGroups} values={filters} onValuesChange={setFilters} />
        <NewProject />
      </Toolbar>
      <ToolbarActiveFilters
        items={[
          ...chipsFor("Assigned to", people, owners, setOwners),
          ...chipsFor("Status", statusOptions, status, setStatus),
          ...activeFilterItems(filterGroups, filters, setFilters),
        ]}
        onClearAll={() => {
          setOwners([])
          setStatus([])
          setFilters({})
        }}
      />
    </div>
  )
}

function ManyViewsToolbar() {
  const [view, setView] = useState("board")
  const views = fourViews.map((v, i) => ({ ...v, count: [42, 42, 18, 7][i] }))
  return (
    <Toolbar>
      <ToolbarViews views={views} value={view} onValueChange={setView} />
      <ToolbarSearch placeholder="Search projects" />
      <NewProject />
    </Toolbar>
  )
}

function ListToolbar() {
  const services = [
    { value: "1040", label: "1040" },
    { value: "1065", label: "1065" },
    { value: "1120", label: "1120" },
    { value: "1120s", label: "1120-S" },
  ]
  const statuses = [
    { value: "active", label: "Active" },
    { value: "paused", label: "Paused" },
    { value: "ended", label: "Ended" },
  ]
  const [service, setService] = useState<string[]>([])
  const [rep, setRep] = useState<string[]>([])
  const [status, setStatus] = useState<string[]>(["active"])
  return (
    <div>
      <Toolbar>
        <ToolbarSearch placeholder="Search clients or companies" />
        <ToolbarFilter
          multiple
          label="Service"
          placeholder="All services"
          options={services}
          values={service}
          onValuesChange={setService}
        />
        <ToolbarFilter
          multiple
          label="Rep"
          placeholder="Anyone"
          options={people}
          values={rep}
          onValuesChange={setRep}
        />
        <ToolbarFilter
          multiple
          label="Status"
          placeholder="Any"
          options={statuses}
          values={status}
          onValuesChange={setStatus}
        />
        <ToolbarCount>2,237 services</ToolbarCount>
      </Toolbar>
      <ToolbarActiveFilters
        items={[
          ...chipsFor("Service", services, service, setService),
          ...chipsFor("Rep", people, rep, setRep),
          ...chipsFor("Status", statuses, status, setStatus),
        ]}
        onClearAll={() => {
          setService([])
          setRep([])
          setStatus([])
        }}
      />
    </div>
  )
}

function LargeListsToolbar() {
  const [owners, setOwners] = useState<string[]>([])
  const [status, setStatus] = useState<string[]>([])
  const [filters, setFilters] = useState<ToolbarFilterValues>({})
  return (
    <div>
      <Toolbar>
        <ToolbarSearch placeholder="Search deals" />
        <ToolbarFilter
          multiple
          label="Owner"
          placeholder="Anyone"
          options={manyPeople}
          values={owners}
          onValuesChange={setOwners}
        />
        <ToolbarFilter
          multiple
          label="Status"
          placeholder="Any"
          options={manyStatuses}
          values={status}
          onValuesChange={setStatus}
        />
        <ToolbarFilterDialog filters={bigGroups} values={filters} onValuesChange={setFilters} />
      </Toolbar>
      <ToolbarActiveFilters
        items={[
          ...chipsFor("Owner", manyPeople, owners, setOwners),
          ...chipsFor("Status", manyStatuses, status, setStatus),
          ...activeFilterItems(bigGroups, filters, setFilters),
        ]}
        onClearAll={() => {
          setOwners([])
          setStatus([])
          setFilters({})
        }}
      />
    </div>
  )
}

function FiltersOnlyToolbar() {
  const [owners, setOwners] = useState<string[]>([])
  const [status, setStatus] = useState<string[]>([])
  const [filters, setFilters] = useState<ToolbarFilterValues>({ priority: ["high"] })
  return (
    <div>
      <Toolbar>
        <ToolbarFilter
          multiple
          label="Owner"
          placeholder="Anyone"
          options={people}
          values={owners}
          onValuesChange={setOwners}
        />
        <ToolbarFilter
          multiple
          label="Status"
          placeholder="All"
          options={statusOptions}
          values={status}
          onValuesChange={setStatus}
        />
        <ToolbarFilterDialog filters={filterGroups} values={filters} onValuesChange={setFilters} />
      </Toolbar>
      <ToolbarActiveFilters
        items={[
          ...chipsFor("Owner", people, owners, setOwners),
          ...chipsFor("Status", statusOptions, status, setStatus),
          ...activeFilterItems(filterGroups, filters, setFilters),
        ]}
        onClearAll={() => {
          setOwners([])
          setStatus([])
          setFilters({})
        }}
      />
    </div>
  )
}

function SearchOnlyToolbar() {
  return (
    <Toolbar>
      <ToolbarSearch placeholder="Search" />
    </Toolbar>
  )
}

function SearchCountActionToolbar() {
  return (
    <Toolbar>
      <ToolbarSearch placeholder="Search email or name" />
      <ToolbarCount>49 users</ToolbarCount>
      <ToolbarActions>
        <Button size="lg">
          <Plus />
          Add user
        </Button>
      </ToolbarActions>
    </Toolbar>
  )
}

function ReportsMenuToolbar() {
  return (
    <Toolbar>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="lg" />}>
          Reports
          <ChevronDown />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem>Funded this month</DropdownMenuItem>
          <DropdownMenuItem>Defaults by ISO</DropdownMenuItem>
          <DropdownMenuItem>Renewals due</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button variant="outline" size="lg">
        Save as report
      </Button>
      <ToolbarSearch placeholder="Filter rows" />
      <ToolbarCount>6,113 rows total</ToolbarCount>
      <ToolbarActions>
        <Button size="lg">
          <Download />
          Export
        </Button>
      </ToolbarActions>
    </Toolbar>
  )
}

function StatusTabsToolbar() {
  const [tab, setTab] = useState("active")
  return (
    <Toolbar>
      <ToolbarSearch placeholder="Search merchant, funding ID, phone" className="flex-[1_1_14rem]" />
      <ToolbarTabs
        stretch
        value={tab}
        onValueChange={setTab}
        tabs={[
          { value: "active", label: "Active", count: 128 },
          { value: "monitor", label: "Monitor", count: 41 },
          { value: "no-action", label: "No action", count: 9 },
          { value: "success", label: "Success", count: 312 },
          { value: "defaulted", label: "Defaulted", count: 17 },
        ]}
      />
      <Button variant="outline" size="icon-lg" aria-label="Expand all">
        <ChevronsUpDown />
      </Button>
    </Toolbar>
  )
}

function DateRangeToolbar() {
  const thirty = defaultDatePresets.find((p) => p.id === "30-days")!
  const t = new Date()
  const [range, setRange] = useState<ToolbarDateRangeValue>(
    thirty.range(new Date(t.getFullYear(), t.getMonth(), t.getDate())),
  )
  return (
    <Toolbar>
      <ToolbarDateRange value={range} onValueChange={setRange} />
    </Toolbar>
  )
}

export const catalog: CatalogEntry[] = [
  {
    id: "list",
    name: "List",
    examples: [
      { name: "Applications list, current layout (placeholder data)", render: () => <SimplyFundingList />, minHeight: 640 },
    ],
  },
  {
    id: "toolbar",
    name: "Toolbar",
    examples: [
      { name: "Views, search, filters, Filters dialog, and an action", render: () => <BoardToolbar />, minHeight: 600 },
      {
        name: "Long lists: 100 people and 30 statuses (searchable dropdowns)",
        render: () => <LargeListsToolbar />,
        minHeight: 600,
      },
      { name: "Four or more views become a dropdown, with counts", render: () => <ManyViewsToolbar />, minHeight: 300 },
      { name: "Search, three labeled filters, and a count", render: () => <ListToolbar />, minHeight: 260 },
      { name: "Status tabs with counts", render: () => <StatusTabsToolbar /> },
      { name: "Date range with presets", render: () => <DateRangeToolbar />, minHeight: 460 },
      { name: "Action menu, buttons, search, count, and export", render: () => <ReportsMenuToolbar />, minHeight: 220 },
      { name: "Search, count, and an action", render: () => <SearchCountActionToolbar /> },
      { name: "Filters only, no search", render: () => <FiltersOnlyToolbar />, minHeight: 600 },
      { name: "Search only", render: () => <SearchOnlyToolbar /> },
    ],
  },
]
