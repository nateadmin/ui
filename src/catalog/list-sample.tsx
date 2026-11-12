import { useRef, useState, type MouseEvent } from "react"
import {
  Check as CheckIcon,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Minus,
  Paperclip,
  Download,
  Trash2,
  UserPlus,
  ClipboardList,
  ExternalLink,
  MoreVertical,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

/*
 * The applications list layout as it ships in Simply Funding (underwriting):
 * a table that always fits its box (no sideways scroll; long text is cut with "…"),
 * cards on mobile, and Previous / Next under it. Each row ends with a three-dot actions menu. This is the starting point
 * for the library's list design; it is a sample, not an exported component.
 * All rows are made-up placeholder data.
 */

type Row = {
  id: string
  from: string
  files: number
  subject: string
  agent: string
  underwriter: string
  decision: "APPROVE" | "DECLINE" | "REVIEW" | null
  onyx: string | null
  received: string
}

const rows: Row[] = [
  {
    id: "1",
    from: "intake@northbrokers.example",
    files: 5,
    subject: "North Brokers: New Application for Sample Home Health Services LLC",
    agent: "AI Agent",
    underwriter: "0",
    decision: "APPROVE",
    onyx: "11/12/26, 9:41 AM",
    received: "11/12/26, 9:38 AM",
  },
  {
    id: "2",
    from: "support@harborfunding.example",
    files: 6,
    subject: "Re: New Submission - Sample Garden Restaurant Inc - CA-0412",
    agent: "AI Agent",
    underwriter: "0",
    decision: "DECLINE",
    onyx: "11/12/26, 9:38 AM",
    received: "11/12/26, 9:35 AM",
  },
  {
    id: "3",
    from: "info@summitcapital.example",
    files: 5,
    subject: "Summit - NEW DEAL - SAMPLE HEALTHCARE PRODUCTS LLC",
    agent: "AI Agent",
    underwriter: "0",
    decision: "APPROVE",
    onyx: "11/12/26, 9:35 AM",
    received: "11/12/26, 9:32 AM",
  },
  {
    id: "4",
    from: "house@directworks.example",
    files: 7,
    subject: "New Submission for Review - Sample Storm Shelters LLC",
    agent: "AI Agent",
    underwriter: "0",
    decision: "DECLINE",
    onyx: "11/12/26, 9:32 AM",
    received: "11/12/26, 9:29 AM",
  },
  {
    id: "5",
    from: "Lakeside business funding",
    files: 0,
    subject: "SAMPLE IMAGE & DESIGN, INC.",
    agent: "-",
    underwriter: "0",
    decision: null,
    onyx: null,
    received: "11/12/26, 9:26 AM",
  },
  {
    id: "6",
    from: "deals@ridgecapital.example",
    files: 5,
    subject: "New Submission From Ridge Capital: Sample Chiropractic Group",
    agent: "AI Agent",
    underwriter: "0",
    decision: "DECLINE",
    onyx: "11/12/26, 9:26 AM",
    received: "11/12/26, 9:23 AM",
  },
  {
    id: "7",
    from: "jsmith@curated.example",
    files: 8,
    subject: "New Submission: Sample Features",
    agent: "AI Agent",
    underwriter: "0",
    decision: "APPROVE",
    onyx: "11/12/26, 9:23 AM",
    received: "11/12/26, 9:20 AM",
  },
  {
    id: "8",
    from: "alex@easyfinance.example",
    files: 8,
    subject: "New Submission: Sample Security Systems Llc",
    agent: "AI Agent",
    underwriter: "0",
    decision: "APPROVE",
    onyx: "11/12/26, 9:20 AM",
    received: "11/12/26, 9:17 AM",
  },
  {
    id: "9",
    from: "processing@formula.example",
    files: 6,
    subject: "Submission For - SAMPLE DIVERSIFIED, LLC - Formula",
    agent: "AI Agent",
    underwriter: "0",
    decision: "REVIEW",
    onyx: "11/12/26, 9:17 AM",
    received: "11/12/26, 9:14 AM",
  },
  {
    id: "10",
    from: "funding@blockequity.example",
    files: 5,
    subject: "New Form Submission - Sample Childcare Center, Inc.",
    agent: "AI Agent",
    underwriter: "0",
    decision: "REVIEW",
    onyx: "11/12/26, 9:14 AM",
    received: "11/12/26, 9:11 AM",
  },
  {
    id: "11",
    from: "intake@northbrokers.example",
    files: 5,
    subject: "North Brokers: New Application for Sample Meat Market",
    agent: "AI Agent",
    underwriter: "Sample Underwriter",
    decision: "APPROVE",
    onyx: "11/12/26, 9:11 AM",
    received: "11/12/26, 9:08 AM",
  },
  {
    id: "12",
    from: "operations@frontline.example",
    files: 6,
    subject: "[Frontline] - New Submission - SAMPLE EXPRESS LLC",
    agent: "AI Agent",
    underwriter: "0",
    decision: "DECLINE",
    onyx: "11/12/26, 9:08 AM",
    received: "11/12/26, 9:05 AM",
  },
]

const TOTAL = 1240
const PAGE_SIZE = 50
const TOTAL_PAGES = Math.ceil(TOTAL / PAGE_SIZE)

const decisionLabel = { APPROVE: "Approve", DECLINE: "Decline", REVIEW: "Review" }
const decisionClass = {
  APPROVE: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  DECLINE: "bg-red-500/15 text-red-700 dark:text-red-400",
  REVIEW: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
}

function Files({ count }: { count: number }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] ${count <= 0 ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`}
      aria-label={count <= 0 ? "No attachments" : `${count} attachments`}
    >
      <Paperclip className="h-3 w-3" aria-hidden />
      {count}
    </span>
  )
}

function Check({ row }: { row: Row }) {
  return row.decision ? (
    <CheckCircle2
      className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400"
      aria-label="Forml responded"
    />
  ) : (
    <span className="text-muted-foreground text-[11px]">-</span>
  )
}

function Decision({ row }: { row: Row }) {
  return row.decision ? (
    <span
      className={`inline-flex h-5 items-center rounded-full px-2 text-[11px] font-medium ${decisionClass[row.decision]}`}
    >
      {decisionLabel[row.decision]}
    </span>
  ) : (
    <span className="text-muted-foreground text-[11px]">-</span>
  )
}

function Onyx({ row }: { row: Row }) {
  return row.onyx ? (
    <span className="text-[11px] font-medium text-emerald-600">{row.onyx}</span>
  ) : (
    <span className="text-muted-foreground text-[11px]">-</span>
  )
}

/** Round checkbox for bulk select. Fills with the accent color when on. */
function SelectCircle({
  checked,
  indeterminate = false,
  onChange,
  label,
}: {
  checked: boolean
  indeterminate?: boolean
  onChange: (event: MouseEvent) => void
  label: string
}) {
  const on = checked || indeterminate
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? "mixed" : checked}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation()
        onChange(e)
      }}
      className="focus-visible:ring-ring/50 relative flex size-4 shrink-0 items-center justify-center rounded-full outline-none before:absolute before:-inset-2.5 focus-visible:ring-3"
    >
      <span
        aria-hidden="true"
        className={`flex size-4 items-center justify-center rounded-full border transition-colors ${
          on ? "bg-primary border-primary text-primary-foreground" : "border-foreground/30 hover:border-foreground/60"
        }`}
      >
        {indeterminate ? (
          <Minus className="size-2.5" strokeWidth={3} />
        ) : checked ? (
          <CheckIcon className="size-2.5" strokeWidth={3} />
        ) : null}
      </span>
    </button>
  )
}

type SortKey = "from" | "files" | "subject" | "agent" | "underwriter" | "forml" | "underwriting" | "onyx" | "received"

/** "11/12/26, 9:38 AM" as a sortable number. */
function stamp(text: string): number {
  const m = /^(\d+)\/(\d+)\/(\d+), (\d+):(\d+) (AM|PM)$/.exec(text)
  if (!m) return 0
  const hour = (Number(m[4]) % 12) + (m[6] === "PM" ? 12 : 0)
  return Date.UTC(2000 + Number(m[3]), Number(m[1]) - 1, Number(m[2]), hour, Number(m[5]))
}

function sortValue(r: Row, key: SortKey): string | number {
  switch (key) {
    case "files":
      return r.files
    case "forml":
      return r.decision ? 1 : 0
    case "underwriting":
      return r.decision ?? ""
    case "onyx":
      return r.onyx ? stamp(r.onyx) : 0
    case "received":
      return stamp(r.received)
    default:
      return r[key].toLowerCase()
  }
}

/** Three-dot button at the end of a row; opens that row's actions. */
function RowActions({ row, onDelete }: { row: Row; onDelete: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label={`Actions for ${row.subject}`}
            className="text-muted-foreground"
            onClick={(e) => e.stopPropagation()}
          />
        }
      >
        <MoreVertical />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem>
          <ExternalLink />
          Open application
        </DropdownMenuItem>
        <DropdownMenuItem>
          <ClipboardList />
          Scorecard
        </DropdownMenuItem>
        <DropdownMenuItem>
          <UserPlus />
          Assign underwriter
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Download />
          Export
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={onDelete}>
          <Trash2 />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

type Sort = { key: SortKey; dir: "asc" | "desc" } | null

/** Two angular arrows side by side: down on the left, up on the right.
    Sorting up fills the right arrow, sorting down fills the left one. */
function SortIcon({ dir }: { dir: "asc" | "desc" | null }) {
  const arrow = (on: boolean) => ({
    fill: on ? "currentColor" : "none",
    stroke: "currentColor",
    strokeWidth: 1,
    strokeLinejoin: "round" as const,
    opacity: on ? 1 : 0.45,
  })
  return (
    <svg aria-hidden="true" viewBox="0 0 12 12" className="size-[11px] shrink-0">
      <path d="M5 11.25 1 6.75h2V2h2z" {...arrow(dir === "desc")} />
      <path d="M7 .75 11 5.25H9V10H7z" {...arrow(dir === "asc")} />
    </svg>
  )
}

/** Column title that sorts. The arrows always show: faint when idle, solid on the sorted column. */
function SortHead({
  label,
  field,
  sort,
  onSort,
  className = "",
  align = "left",
}: {
  label: string
  field: SortKey
  sort: Sort
  onSort: (key: SortKey) => void
  className?: string
  align?: "left" | "right"
}) {
  const active = sort?.key === field
  const dir = active ? sort.dir : null
  return (
    <TableHead
      aria-sort={dir === "asc" ? "ascending" : dir === "desc" ? "descending" : "none"}
      className={`h-8 text-[11px] font-medium select-none ${align === "right" ? "text-right" : ""} ${className}`}
    >
      <button
        type="button"
        onClick={() => onSort(field)}
        className={`hover:text-foreground focus-visible:ring-ring/50 -mx-1 inline-flex items-center gap-1 rounded px-1 py-0.5 outline-none focus-visible:ring-2 ${
          active ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        {label}
        <SortIcon dir={dir} />
      </button>
    </TableHead>
  )
}

export function SimplyFundingList() {
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<string[]>([])
  const [sort, setSort] = useState<Sort>(null)
  const anchor = useRef<string | null>(null)

  const [data, setData] = useState(rows)
  const [note, setNote] = useState("")
  const act = (what: string) =>
    setNote(`${what}: ${selected.length} ${selected.length === 1 ? "application" : "applications"}`)
  const removeRow = (id: string) => {
    setNote("Deleted: 1 application")
    setData((cur) => cur.filter((r) => r.id !== id))
    setSelected((cur) => cur.filter((x) => x !== id))
  }
  const removeSelected = () => {
    setNote(`Deleted: ${selected.length} ${selected.length === 1 ? "application" : "applications"}`)
    setData((cur) => cur.filter((r) => !selected.includes(r.id)))
    setSelected([])
  }
  // No sort picked: rows stay in their original order.
  const shown = !sort
    ? data
    : [...data].sort((a, b) => {
        const va = sortValue(a, sort.key)
        const vb = sortValue(b, sort.key)
        const cmp = typeof va === "number" && typeof vb === "number" ? va - vb : String(va).localeCompare(String(vb))
        return sort.dir === "asc" ? cmp : -cmp
      })

  const sortBy = (key: SortKey) =>
    setSort((cur) => {
      if (cur?.key !== key) return { key, dir: "asc" }
      return cur.dir === "asc" ? { key, dir: "desc" } : null
    })

  /* Click selects one row. Shift+click selects (or clears) every row between
     the last clicked row and this one. */
  const toggle = (id: string, event: MouseEvent) => {
    const turnOn = !selected.includes(id)
    const ids = shown.map((r) => r.id)
    const from = anchor.current ? ids.indexOf(anchor.current) : -1
    const to = ids.indexOf(id)
    const range = event.shiftKey && from !== -1 ? ids.slice(Math.min(from, to), Math.max(from, to) + 1) : [id]
    setSelected((cur) => (turnOn ? [...new Set([...cur, ...range])] : cur.filter((x) => !range.includes(x))))
    anchor.current = id
  }

  const shownIds = shown.map((r) => r.id)
  const pickedShown = shownIds.filter((id) => selected.includes(id)).length
  const allPicked = shown.length > 0 && pickedShown === shown.length
  const toggleAll = () =>
    setSelected((cur) => (allPicked ? cur.filter((id) => !shownIds.includes(id)) : [...new Set([...cur, ...shownIds])]))

  return (
    <div className="space-y-3">
      {shown.length === 0 ? (
        <div className="bg-card rounded-lg border border-border/60 p-12 text-center">
          <p className="text-muted-foreground text-[13px]">No applications to show.</p>
        </div>
      ) : (
        <>
          <ul className="m-0 grid list-none gap-2 p-0 lg:hidden">
            {shown.map((r) => (
              <li key={r.id}>
                <div
                  role="button"
                  tabIndex={0}
                  className="bg-card w-full rounded-lg border border-border/60 p-3 text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="pt-0.5">
                      <SelectCircle
                        checked={selected.includes(r.id)}
                        onChange={(e) => toggle(r.id, e)}
                        label={`Select ${r.subject}`}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-muted-foreground text-[11px]">From</p>
                      <p className="text-[13px] break-all">{r.from}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-muted-foreground text-[11px]">Received</p>
                      <p className="text-muted-foreground text-[11px]">{r.received}</p>
                    </div>
                    <div className="-mt-1 -mr-1 shrink-0">
                      <RowActions row={r} onDelete={() => removeRow(r.id)} />
                    </div>
                  </div>
                  <div className="mt-2 min-w-0">
                    <p className="text-muted-foreground text-[11px]">Subject</p>
                    <p className="text-[13px] font-medium break-words">{r.subject}</p>
                  </div>
                  <div className="mt-2 flex flex-wrap items-start gap-x-4 gap-y-2">
                    <div>
                      <p className="text-muted-foreground text-[11px]">Files</p>
                      <Files count={r.files} />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-[11px]">Agent</p>
                      <p className="text-[13px]">{r.agent}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-[11px]">Underwriter</p>
                      <p className="text-[13px]">{r.underwriter}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-[11px]">Forml</p>
                      <Check row={r} />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-[11px]">Underwriting</p>
                      <Decision row={r} />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-[11px]">ONYX</p>
                      <Onyx row={r} />
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <ContextMenu>
            <ContextMenuTrigger
              render={
                <div className="bg-card hidden overflow-hidden rounded-lg border border-border/60 select-auto lg:block" />
              }
            >
              <table className="w-full table-fixed caption-bottom text-[13px]">
                <colgroup>
                  <col className="w-9" />
                  <col className="w-[15%]" />
                  <col className="w-14" />
                  <col />
                  <col className="w-20" />
                  <col className="w-[7.5rem]" />
                  <col className="w-16" />
                  <col className="w-[6.5rem]" />
                  <col className="w-[7.5rem]" />
                  <col className="w-[7.5rem]" />
                  <col className="w-10" />
                </colgroup>
                <TableHeader>
                  <TableRow className="border-border/60 hover:bg-transparent">
                    <TableHead className="h-8 w-9 pr-0 pl-3">
                      <SelectCircle
                        checked={allPicked}
                        indeterminate={pickedShown > 0 && !allPicked}
                        onChange={toggleAll}
                        label="Select all"
                      />
                    </TableHead>
                    <SortHead label="From" field="from" sort={sort} onSort={sortBy} />
                    <SortHead label="Files" field="files" sort={sort} onSort={sortBy} />
                    <SortHead label="Subject" field="subject" sort={sort} onSort={sortBy} />
                    <SortHead label="Agent" field="agent" sort={sort} onSort={sortBy} />
                    <SortHead label="Underwriter" field="underwriter" sort={sort} onSort={sortBy} />
                    <SortHead label="Forml" field="forml" sort={sort} onSort={sortBy} />
                    <SortHead label="Underwriting" field="underwriting" sort={sort} onSort={sortBy} />
                    <SortHead label="ONYX" field="onyx" sort={sort} onSort={sortBy} />
                    <SortHead label="Received" field="received" sort={sort} onSort={sortBy} align="right" />
                    <TableHead className="h-8 pr-2">
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shown.map((r) => (
                    <TableRow
                      key={r.id}
                      data-state={selected.includes(r.id) ? "selected" : undefined}
                      className="group border-border/60 hover:bg-muted/30 data-[state=selected]:bg-primary/5 cursor-pointer"
                      onContextMenu={() => {
                        if (!selected.includes(r.id)) {
                          setSelected([r.id])
                          anchor.current = r.id
                        }
                      }}
                    >
                      <TableCell className="w-9 py-2.5 pr-0 pl-3">
                        <SelectCircle
                          checked={selected.includes(r.id)}
                          onChange={(e) => toggle(r.id, e)}
                          label={`Select ${r.subject}`}
                        />
                      </TableCell>
                      <TableCell className="py-2.5 overflow-hidden">
                        <p className="truncate text-[13px]" title={r.from}>
                          {r.from}
                        </p>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <Files count={r.files} />
                      </TableCell>
                      <TableCell className="py-2.5 overflow-hidden">
                        <p className="truncate text-[13px] font-medium" title={r.subject}>
                          {r.subject}
                        </p>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <span className="block truncate text-[13px]">{r.agent}</span>
                      </TableCell>
                      <TableCell className="py-2.5 overflow-hidden">
                        <span className="block truncate text-[13px]" title={r.underwriter}>
                          {r.underwriter}
                        </span>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <Check row={r} />
                      </TableCell>
                      <TableCell className="py-2.5">
                        <Decision row={r} />
                      </TableCell>
                      <TableCell className="py-2.5 whitespace-nowrap">
                        <Onyx row={r} />
                      </TableCell>
                      <TableCell className="py-2.5 text-right whitespace-nowrap">
                        <span className="text-muted-foreground text-[11px]">{r.received}</span>
                      </TableCell>
                      <TableCell className="py-2.5 pr-2 text-right">
                        <RowActions row={r} onDelete={() => removeRow(r.id)} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </table>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-56">
              {selected.length === 0 ? (
                <ContextMenuGroup>
                  <ContextMenuLabel>Select rows to see bulk actions</ContextMenuLabel>
                </ContextMenuGroup>
              ) : (
                <>
                  <ContextMenuGroup>
                    <ContextMenuLabel>
                      {selected.length} {selected.length === 1 ? "application" : "applications"} selected
                    </ContextMenuLabel>
                  </ContextMenuGroup>
                  <ContextMenuItem onClick={() => act("Assigned to an underwriter")}>
                    <UserPlus />
                    Assign underwriter
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => act("Marked as reviewed")}>
                    <CheckCircle2 />
                    Mark as reviewed
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => act("Exported")}>
                    <Download />
                    Export selected
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem variant="destructive" onClick={removeSelected}>
                    <Trash2 />
                    Delete
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem onClick={() => setSelected([])}>Clear selection</ContextMenuItem>
                </>
              )}
            </ContextMenuContent>
          </ContextMenu>

          <div className="flex flex-col items-stretch justify-between gap-2 pt-1 sm:flex-row sm:items-center">
            <p className="text-muted-foreground text-center text-[11px] sm:text-left" aria-live="polite">
              {selected.length > 0 ? (
                <>
                  <span className="text-foreground font-medium">{selected.length} selected</span>
                  {" · "}
                  <button
                    type="button"
                    className="hover:text-foreground underline-offset-2 hover:underline"
                    onClick={() => setSelected([])}
                  >
                    Clear
                  </button>
                  {" · "}
                </>
              ) : null}
              {note ? <>{note} · </> : null}
              Showing {((page - 1) * PAGE_SIZE + 1).toLocaleString("en-US")}–
              {(page * PAGE_SIZE).toLocaleString("en-US")} of {TOTAL.toLocaleString("en-US")}
            </p>
            <div className="flex w-full items-center justify-between gap-2 sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-muted-foreground min-w-18 text-center font-mono text-[11px]">
                {page} / {TOTAL_PAGES}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1"
                disabled={page >= TOTAL_PAGES}
                onClick={() => setPage(page + 1)}
              >
                <ChevronRight className="h-4 w-4" />
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
