import { useState, type ReactNode } from "react"
import { CalendarDays, GanttChart, LayoutGrid, List, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Toolbar,
  ToolbarActions,
  ToolbarFilter,
  ToolbarFilterDialog,
  ToolbarSearch,
  ToolbarViews,
  type ToolbarFilterGroup,
  type ToolbarFilterValues,
} from "@/components/ui/toolbar"

export type CatalogExample = { name: string; render: () => ReactNode; minHeight?: number }
export type CatalogEntry = { id: string; name: string; examples: CatalogExample[] }

const people = [
  { value: "anyone", label: "Anyone" },
  { value: "me", label: "Me" },
  { value: "unassigned", label: "Unassigned" },
]

const statusOptions = [
  { value: "active", label: "Active", color: "#22c55e" },
  { value: "at-risk", label: "At risk", color: "#f59e0b" },
  { value: "done", label: "Done", color: "#3b82f6" },
]

const filterGroups: ToolbarFilterGroup[] = [
  { id: "status", label: "Status", options: statusOptions },
  {
    id: "owner",
    label: "Owner",
    options: [
      { value: "me", label: "Me" },
      { value: "sharon", label: "Sharon" },
      { value: "david", label: "David" },
      { value: "unassigned", label: "Unassigned" },
    ],
  },
  {
    id: "priority",
    label: "Priority",
    multiple: false,
    options: [
      { value: "high", label: "High" },
      { value: "medium", label: "Medium" },
      { value: "low", label: "Low" },
    ],
  },
  {
    id: "due",
    label: "Due",
    multiple: false,
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

function BoardToolbar() {
  const [view, setView] = useState("board")
  const [who, setWho] = useState("anyone")
  const [status, setStatus] = useState<string[]>([])
  const [filters, setFilters] = useState<ToolbarFilterValues>({})
  return (
    <Toolbar>
      <ToolbarViews views={twoViews} value={view} onValueChange={setView} />
      <ToolbarSearch placeholder="Search projects" />
      <ToolbarFilter options={people} value={who} onValueChange={setWho} />
      <ToolbarFilter multiple placeholder="All statuses" options={statusOptions} values={status} onValuesChange={setStatus} />
      <ToolbarFilterDialog filters={filterGroups} values={filters} onValuesChange={setFilters} />
      <NewProject />
    </Toolbar>
  )
}

function ManyViewsToolbar() {
  const [view, setView] = useState("board")
  return (
    <Toolbar>
      <ToolbarViews views={fourViews} value={view} onValueChange={setView} />
      <ToolbarSearch placeholder="Search projects" />
      <NewProject />
    </Toolbar>
  )
}

function ListToolbar() {
  const [service, setService] = useState<string[]>([])
  const [rep, setRep] = useState("anyone")
  const [status, setStatus] = useState("active")
  return (
    <Toolbar>
      <ToolbarSearch placeholder="Search clients or companies" />
      <ToolbarFilter
        multiple
        label="Service"
        placeholder="All services"
        options={[
          { value: "1040", label: "1040" },
          { value: "1065", label: "1065" },
          { value: "1120", label: "1120" },
          { value: "1120s", label: "1120-S" },
        ]}
        values={service}
        onValuesChange={setService}
      />
      <ToolbarFilter label="Rep" options={people} value={rep} onValueChange={setRep} />
      <ToolbarFilter
        label="Status"
        options={[
          { value: "active", label: "Active" },
          { value: "paused", label: "Paused" },
          { value: "ended", label: "Ended" },
        ]}
        value={status}
        onValueChange={setStatus}
      />
    </Toolbar>
  )
}

function FiltersOnlyToolbar() {
  const [who, setWho] = useState("anyone")
  const [status, setStatus] = useState<string[]>([])
  const [filters, setFilters] = useState<ToolbarFilterValues>({})
  return (
    <Toolbar>
      <ToolbarFilter label="Owner" options={people} value={who} onValueChange={setWho} />
      <ToolbarFilter multiple label="Status" placeholder="All" options={statusOptions} values={status} onValuesChange={setStatus} />
      <ToolbarFilterDialog filters={filterGroups} values={filters} onValuesChange={setFilters} />
    </Toolbar>
  )
}

function SearchOnlyToolbar() {
  return (
    <Toolbar>
      <ToolbarSearch placeholder="Search" />
    </Toolbar>
  )
}

function MinimalToolbar() {
  const [status, setStatus] = useState<string[]>([])
  return (
    <Toolbar>
      <ToolbarSearch placeholder="Search" />
      <ToolbarFilter multiple placeholder="All statuses" options={statusOptions} values={status} onValuesChange={setStatus} />
    </Toolbar>
  )
}

export const catalog: CatalogEntry[] = [
  {
    id: "toolbar",
    name: "Toolbar",
    examples: [
      { name: "Views, search, filters, Filters dialog, and an action", render: () => <BoardToolbar />, minHeight: 600 },
      { name: "Four or more views become a dropdown", render: () => <ManyViewsToolbar />, minHeight: 300 },
      { name: "Search and three labeled filters (Service is multi-select)", render: () => <ListToolbar />, minHeight: 260 },
      { name: "Filters only, no search", render: () => <FiltersOnlyToolbar />, minHeight: 600 },
      { name: "Search only", render: () => <SearchOnlyToolbar /> },
      { name: "Search and one multi-select filter", render: () => <MinimalToolbar />, minHeight: 260 },
    ],
  },
]
