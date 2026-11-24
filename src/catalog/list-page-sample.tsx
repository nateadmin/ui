import { useMemo, useState } from "react"
import { PlusIcon } from "lucide-react"
import { ListBadge, ListMuted, ListTitle } from "@/components/ui/data-list"
import { ListPage } from "@/components/ui/list-page"

/*
 * A users list on the library's ListPage component, with made-up people (this
 * repo is public). This file only supplies rows, columns and filter choices;
 * the bar, the list, sorting, paging and the footer are the component's.
 */

type Person = { id: string; email: string; name: string; admin: boolean; active: boolean; apps: string }

const first = ["Avery", "Jordan", "Riley", "Morgan", "Casey", "Quinn", "Reese", "Rowan", "Sage", "Emery"]
const last = ["Lane", "Brooks", "Hayes", "Ellis", "Parker", "Reid", "Shaw", "Blake", "Frost", "Wells"]
const appSets = ["Collections, Sales", "Data, Billing", "Sales", "Submissions, Underwriting", "All apps"]
const people: Person[] = Array.from({ length: 137 }, (_, i) => {
  const name = `${first[i % 10]} ${last[(i * 7) % 10]}`
  return {
    id: String(i + 1),
    name,
    email: `${name.toLowerCase().replace(" ", ".")}${i > 9 ? i : ""}@example.com`,
    admin: i % 11 === 0,
    active: i % 9 !== 4,
    apps: appSets[i % appSets.length]!,
  }
})

export function UsersListPage() {
  const [q, setQ] = useState("")
  const [access, setAccess] = useState("all")
  const [status, setStatus] = useState("all")
  const [pageSize, setPageSize] = useState(50)

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return people.filter(
      (p) =>
        (!needle || p.email.includes(needle) || p.name.toLowerCase().includes(needle)) &&
        (access === "all" || (access === "admin") === p.admin) &&
        (status === "all" || (status === "active") === p.active),
    )
  }, [q, access, status])

  return (
    <ListPage<Person>
      search={{ placeholder: "Search email or name", value: q, onChange: (e) => setQ(e.target.value) }}
      filters={[
        {
          key: "access",
          label: "Access",
          value: access,
          onValueChange: setAccess,
          options: [
            { value: "all", label: "All" },
            { value: "admin", label: "Admin" },
            { value: "standard", label: "Standard" },
          ],
        },
        {
          key: "status",
          label: "Status",
          value: status,
          onValueChange: setStatus,
          options: [
            { value: "all", label: "All" },
            { value: "active", label: "Active", color: "#22c55e" },
            { value: "inactive", label: "Inactive", color: "#94a3b8" },
          ],
        },
      ]}
      actions={[{ label: "Add user", icon: <PlusIcon aria-hidden="true" />, primary: true, onClick: () => {} }]}
      rows={rows}
      pageSize={pageSize}
      onPageSizeChange={setPageSize}
      list={{
        "aria-label": "Users",
        getRowId: (p) => p.id,
        onRowClick: () => {},
        rowEnd: "chevron",
        rowMuted: (p) => !p.active,
        empty: "No users match your search or filters.",
        columns: [
          { id: "email", header: "Email", primary: true, width: "fit", maxWidth: "22rem", sortable: true, sortValue: (p) => p.email, cell: (p) => <ListTitle>{p.email}</ListTitle> },
          { id: "name", header: "Name", width: "fit", sortable: true, sortValue: (p) => p.name, cell: (p) => p.name },
          { id: "access", header: "Access", sortable: true, sortValue: (p) => (p.admin ? 0 : 1), cell: (p) => <ListBadge tone={p.admin ? "blue" : "neutral"}>{p.admin ? "Admin" : "Standard"}</ListBadge> },
          { id: "apps", header: "Apps", width: "grow", cell: (p) => <ListMuted>{p.apps}</ListMuted> },
          { id: "status", header: "Status", sortable: true, sortValue: (p) => (p.active ? 0 : 1), cell: (p) => <ListBadge tone={p.active ? "green" : "neutral"}>{p.active ? "Active" : "Inactive"}</ListBadge> },
        ],
      }}
    />
  )
}
