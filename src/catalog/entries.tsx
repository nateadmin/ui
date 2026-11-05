import { useState, type ReactNode } from "react"
import { LayoutGrid, List, Plus, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Toolbar, ToolbarActions, ToolbarFilter, ToolbarSearch, ToolbarViews } from "@/components/ui/toolbar"

export type CatalogExample = { name: string; render: () => ReactNode; minHeight?: number }
export type CatalogEntry = { id: string; name: string; examples: CatalogExample[] }

const people = [
  { value: "anyone", label: "Anyone" },
  { value: "me", label: "Me" },
  { value: "unassigned", label: "Unassigned" },
]

const statuses = [
  { value: "all", label: "All statuses", color: "conic-gradient(#3b82f6, #f59e0b, #22c55e, #3b82f6)" },
  { value: "active", label: "Active", color: "#22c55e" },
  { value: "at-risk", label: "At risk", color: "#f59e0b" },
  { value: "done", label: "Done", color: "#3b82f6" },
]

function BoardToolbar() {
  const [view, setView] = useState("board")
  const [who, setWho] = useState("anyone")
  const [status, setStatus] = useState("all")
  return (
    <Toolbar>
      <ToolbarViews
        views={[
          { value: "board", label: "Board", icon: <LayoutGrid /> },
          { value: "list", label: "List", icon: <List /> },
        ]}
        value={view}
        onValueChange={setView}
      />
      <ToolbarSearch placeholder="Search projects" />
      <ToolbarFilter options={people} value={who} onValueChange={setWho} />
      <ToolbarFilter options={statuses} value={status} onValueChange={setStatus} />
      <Button variant="outline" size="lg">
        <SlidersHorizontal />
        Filters
      </Button>
      <ToolbarActions>
        <Button size="lg">
          <Plus />
          New project
        </Button>
      </ToolbarActions>
    </Toolbar>
  )
}

function ListToolbar() {
  const [service, setService] = useState("all")
  const [rep, setRep] = useState("anyone")
  const [status, setStatus] = useState("active")
  return (
    <Toolbar>
      <ToolbarSearch placeholder="Search clients or companies" />
      <ToolbarFilter
        label="Service"
        options={[
          { value: "all", label: "All services" },
          { value: "1040", label: "1040" },
          { value: "1065", label: "1065" },
          { value: "1120", label: "1120" },
        ]}
        value={service}
        onValueChange={setService}
      />
      <ToolbarFilter label="Rep" options={people} value={rep} onValueChange={setRep} />
      <ToolbarFilter
        label="Status"
        options={[
          { value: "active", label: "active" },
          { value: "paused", label: "paused" },
          { value: "ended", label: "ended" },
        ]}
        value={status}
        onValueChange={setStatus}
      />
    </Toolbar>
  )
}

function MinimalToolbar() {
  const [status, setStatus] = useState("all")
  return (
    <Toolbar>
      <ToolbarSearch placeholder="Search" />
      <ToolbarFilter options={statuses} value={status} onValueChange={setStatus} />
    </Toolbar>
  )
}

export const catalog: CatalogEntry[] = [
  {
    id: "toolbar",
    name: "Toolbar",
    examples: [
      { name: "Views, search, filters, and an action", render: () => <BoardToolbar />, minHeight: 260 },
      { name: "Search and three labeled filters", render: () => <ListToolbar />, minHeight: 260 },
      { name: "Search and one filter", render: () => <MinimalToolbar />, minHeight: 260 },
    ],
  },
]
