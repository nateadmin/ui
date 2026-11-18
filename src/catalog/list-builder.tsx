import { useState, type ReactNode } from "react"
import {
  Bookmark,
  Check,
  Clock,
  Download,
  ExternalLink,
  GripVertical,
  MessageSquare,
  Paperclip,
  Pencil,
  Trash2,
  User,
  UserPlus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ContextMenuGroup, ContextMenuItem, ContextMenuLabel, ContextMenuSeparator } from "@/components/ui/context-menu"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { ListPagination } from "@/components/ui/list-pagination"
import {
  DataList,
  ListBadge,
  ListDate,
  ListMono,
  ListMuted,
  ListNone,
  ListNumber,
  ListTitle,
  formatListDate,
  sortRows,
  type DataListColumn,
  type DataListProps,
  type ListSort,
} from "@/components/ui/data-list"

/*
 * List builder: turn columns and options on and off to see a list take shape.
 * Every kind of field found on our lists is here as a column. All data is
 * made up (this repo is public).
 */

/* ---------- Placeholder data ---------- */

type Status = "active" | "paused" | "monitor" | "inactive"
type Result = "confirmed" | "inconclusive" | "not"
type Decision = "approve" | "review" | "decline" | null

type Row = {
  id: string
  name: string
  count: number
  tags: string[]
  summary: string
  email: string
  domain: string
  person: string
  admin: boolean
  apps: string
  status: Status
  result: Result
  signal: "high" | "medium" | "low"
  decision: Decision
  flag: string | null
  amount: number
  balance: number
  pace: number
  days: number
  uses: number
  compare: [number, number]
  date: Date
  submitted: Date
  note: string
  files: number
  apiKey: string
  iso: string
  source: "Manual" | "Auto"
  recent: boolean
}

const companies = [
  "Sample Bakery LLC",
  "NORTHWIND AUTO REPAIR",
  "Bluebird Dental Group",
  "Maple Street Diner",
  "SUMMIT ROOFING CO",
  "Harbor Fitness LLC",
  "Cedar Landscaping Inc",
  "GOLDEN GATE PLUMBING",
  "Riverbend Pharmacy",
  "Oakwood Daycare Center",
  "Pinecrest Hardware",
  "LAKESIDE COFFEE COMPANY LLC",
]
const people = ["Jordan Lee", "Sam Rivera", "Taylor Brooks", "Morgan Chen", "Casey Patel", "Riley Adams", "Avery Kim"]
const isos = ["Northwind Capital", "Bluebird Funding", "Summit Partners", "Harbor Finance", "Cedar Advance"]
const appSets = ["All apps", "Sales, Tasks", "Submissions, Tasks", "Billing, Collections, Data", "None"]
const summaries = [
  "Typical rates were tied; the average was slightly higher in late accounts.",
  "Renewals were more common in healthy accounts, so renewal is a mild positive sign.",
  "Monthly sales were 7% lower in late accounts than in healthy ones.",
  "No real difference between the two groups on this measure.",
]
const notes = [
  "Please skip this week. Resume normal weekly payments on the 10th, or until we receive the next bank statements.",
  "Pushed one day.",
  "Please resume the current plan on the 25th.",
  "Auto-created retry",
]
const statuses: Status[] = ["active", "active", "monitor", "paused", "active", "inactive"]
const results: Result[] = ["confirmed", "inconclusive", "not", "confirmed"]
const signals: Row["signal"][] = ["medium", "low", "low", "high"]
const decisions: Decision[] = ["approve", "review", "decline", "review", null]
const flags = [null, null, "Plan adjustment", "Standard retry"]
const tagSets = [["1st"], ["1st"], ["1st", "DL"], []]

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "")

const SAMPLE_SIZE = 2000

/* A small seeded generator, so every page load shows the same numbers. */
function seeded(seed: number) {
  let x = seed
  return () => {
    x = (x * 1103515245 + 12345) % 2147483648
    return x / 2147483648
  }
}

const rows: Row[] = (() => {
  const rand = seeded(7)
  const now = Date.UTC(2026, 10, 17, 23, 0)
  return Array.from({ length: SAMPLE_SIZE }, (_, i) => {
    const company = companies[i % companies.length]!
    const domain = `${slug(company).slice(0, 14)}.example`
    const person = people[i % people.length]!
    const amount = Math.round(rand() * 60000 + 1000) * 1
    const date = new Date(now - i * 47 * 60_000)
    return {
      id: String(i + 1),
      name: company,
      count: Math.floor(rand() * 30) + 1,
      tags: tagSets[i % tagSets.length]!,
      summary: summaries[i % summaries.length]!,
      email: `${["intake", "deals", "funding", "ops"][i % 4]}@${domain}`,
      domain,
      person,
      admin: i % 9 === 2,
      apps: appSets[i % appSets.length]!,
      status: statuses[i % statuses.length]!,
      result: results[i % results.length]!,
      signal: signals[i % signals.length]!,
      decision: decisions[i % decisions.length]!,
      flag: flags[i % flags.length]!,
      amount,
      balance: Math.round(amount * (1.05 + rand() * 0.4) * 100) / 100,
      pace: Math.round(60 + rand() * 40),
      days: Math.floor(rand() * 300) + 20,
      uses: Math.floor(rand() * 2500),
      compare: [Math.round((1.2 + rand() * 0.2) * 100) / 100, Math.round((1.2 + rand() * 0.2) * 100) / 100],
      date,
      submitted: new Date(date.getTime() - 3 * 24 * 60 * 60_000),
      note: notes[i % notes.length]!,
      files: i % 11 === 4 ? 0 : Math.floor(rand() * 9) + 1,
      apiKey: `sfa_${Math.floor(rand() * 0xffffffff)
        .toString(16)
        .padStart(8, "0")}_${Math.floor(rand() * 0xffffff).toString(16)}`,
      iso: isos[i % isos.length]!,
      source: i % 7 === 3 ? "Auto" : "Manual",
      recent: i % 5 === 0,
    }
  })
})()

/* ---------- Columns ---------- */

type ColKey =
  | "name"
  | "titleDesc"
  | "email"
  | "domain"
  | "person"
  | "role"
  | "apps"
  | "status"
  | "result"
  | "decision"
  | "flag"
  | "amount"
  | "balance"
  | "pace"
  | "days"
  | "compare"
  | "date"
  | "dateSub"
  | "note"
  | "files"
  | "apiKey"
  | "inlineSelect"
  | "inlineInput"
  | "rowButton"
  | "iconActions"
  | "icon"
  | "source"

const COLUMNS: Array<{ key: ColKey; label: string }> = [
  { key: "name", label: "Name (link, count, tags)" },
  { key: "titleDesc", label: "Title and description" },
  { key: "email", label: "Email (mono)" },
  { key: "domain", label: "Domain" },
  { key: "person", label: "Person" },
  { key: "role", label: "Role badge" },
  { key: "apps", label: "List of items" },
  { key: "status", label: "Status pill" },
  { key: "result", label: "Outline pills" },
  { key: "decision", label: "Text status" },
  { key: "flag", label: "Tag" },
  { key: "amount", label: "Amount ($)" },
  { key: "balance", label: "Balance ($, mono)" },
  { key: "pace", label: "Percent" },
  { key: "days", label: "Number" },
  { key: "compare", label: "Comparison" },
  { key: "date", label: "Date" },
  { key: "dateSub", label: "Date with second line" },
  { key: "note", label: "Long text" },
  { key: "files", label: "Files" },
  { key: "apiKey", label: "Secret (masked)" },
  { key: "inlineSelect", label: "Inline dropdown" },
  { key: "inlineInput", label: "Inline input and buttons" },
  { key: "rowButton", label: "Row button" },
  { key: "iconActions", label: "Icon actions" },
  { key: "icon", label: "Icon" },
  { key: "source", label: "Muted label" },
]

const colLabel = (k: ColKey) => COLUMNS.find((c) => c.key === k)?.label ?? k

const DEFAULT_ORDER: ColKey[] = COLUMNS.map((c) => c.key)
const DEFAULT_ON: ColKey[] = ["name", "email", "person", "status", "amount", "pace", "date"]

const statusBadge: Record<Status, { label: string; tone: "green" | "neutral" | "amber" | "red" }> = {
  active: { label: "Active", tone: "green" },
  paused: { label: "Paused", tone: "red" },
  monitor: { label: "Monitor", tone: "amber" },
  inactive: { label: "Inactive", tone: "neutral" },
}
const resultBadge: Record<Result, { label: string; tone: "green" | "amber" | "red" }> = {
  confirmed: { label: "Confirmed", tone: "green" },
  inconclusive: { label: "Inconclusive", tone: "amber" },
  not: { label: "Not confirmed", tone: "red" },
}
const decisionTone = {
  approve: "green",
  review: "amber",
  decline: "red",
} as const

/* ---------- Builder controls ---------- */

function Toggle({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      aria-pressed={on}
      onClick={onClick}
      className="aria-pressed:border-foreground/40 aria-pressed:bg-muted gap-1.5 rounded-full font-normal"
    >
      <span
        aria-hidden="true"
        className={`flex size-3.5 items-center justify-center rounded-full border ${
          on ? "bg-foreground border-foreground text-background" : "border-foreground/30"
        }`}
      >
        {on ? <Check className="size-2.5" strokeWidth={3} /> : null}
      </span>
      {children}
    </Button>
  )
}

function Choice<V extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: V
  options: Array<{ value: V; label: string }>
  onChange: (v: V) => void
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap items-center gap-1.5">
      <span className="text-muted-foreground w-20 shrink-0 text-xs">{label}</span>
      {options.map((o) => (
        <Button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          variant="outline"
          size="xs"
          onClick={() => onChange(o.value)}
          className="aria-checked:border-foreground/40 aria-checked:bg-muted rounded-full font-normal"
        >
          {o.label}
        </Button>
      ))}
    </div>
  )
}

/** Chips in order. Drag one onto another, or focus one and use the arrow keys. */
function OrderChips<K extends string>({
  items,
  label,
  onMove,
  onNudge,
}: {
  items: K[]
  label: (k: K) => string
  onMove: (from: K, to: K) => void
  onNudge: (k: K, by: -1 | 1) => void
}) {
  const [dragging, setDragging] = useState<K | null>(null)
  const [over, setOver] = useState<K | null>(null)
  return (
    <ol aria-label="Order of columns" className="m-0 flex list-none flex-wrap gap-2 p-0">
      {items.map((k, i) => (
        <li
          key={k}
          draggable
          tabIndex={0}
          aria-label={`${label(k)}, position ${i + 1} of ${items.length}`}
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
            if (dragging) onMove(dragging, k)
            setDragging(null)
            setOver(null)
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
              e.preventDefault()
              onNudge(k, -1)
            } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
              e.preventDefault()
              onNudge(k, 1)
            }
          }}
          className={`bg-card focus-visible:ring-ring/50 flex h-8 cursor-grab items-center gap-1.5 rounded-lg border pr-3 pl-1.5 text-sm outline-none select-none focus-visible:ring-2 active:cursor-grabbing ${
            dragging === k ? "opacity-40" : ""
          } ${over === k && dragging && dragging !== k ? "border-foreground/60 bg-muted" : ""}`}
        >
          <GripVertical aria-hidden="true" className="text-muted-foreground size-3.5" />
          <span className="text-muted-foreground w-4 text-xs tabular-nums">{i + 1}</span>
          {label(k)}
        </li>
      ))}
    </ol>
  )
}

/* ---------- Builder ---------- */

type Opts = {
  select: boolean
  sortable: boolean
  expand: boolean
  dimInactive: boolean
  bulkMenu: boolean
  pagination: boolean
  rowEnd: NonNullable<DataListProps<Row>["rowEnd"]>
  density: NonNullable<DataListProps<Row>["density"]>
  headerStyle: NonNullable<DataListProps<Row>["headerStyle"]>
  layout: NonNullable<DataListProps<Row>["layout"]>
}

const DEFAULT_OPTS: Opts = {
  select: true,
  sortable: true,
  expand: false,
  dimInactive: true,
  bulkMenu: true,
  pagination: true,
  rowEnd: "menu",
  density: "default",
  headerStyle: "default",
  layout: "rows",
}

export function ListBuilder() {
  const [on, setOn] = useState<ColKey[]>(DEFAULT_ON)
  const [order, setOrder] = useState<ColKey[]>(DEFAULT_ORDER)
  const [opts, setOpts] = useState<Opts>(DEFAULT_OPTS)
  const set = <K extends keyof Opts>(k: K, v: Opts[K]) => setOpts((o) => ({ ...o, [k]: v }))
  const has = (k: ColKey) => on.includes(k)
  const flip = (k: ColKey) => setOn((cur) => (cur.includes(k) ? cur.filter((x) => x !== k) : [...cur, k]))
  const placed = order.filter(has)

  const move = (from: ColKey, to: ColKey) =>
    setOrder((cur) => {
      if (from === to) return cur
      const next = cur.filter((x) => x !== from)
      const at = next.indexOf(to)
      const fromIdx = cur.indexOf(from)
      const toIdx = cur.indexOf(to)
      next.splice(fromIdx < toIdx ? at + 1 : at, 0, from)
      return next
    })
  const nudge = (k: ColKey, by: -1 | 1) => {
    const i = placed.indexOf(k)
    const target = placed[i + by]
    if (target) move(k, target)
  }

  // List state. In an app, page size and column choices are saved to the user's profile.
  const [data, setData] = useState(rows)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [sort, setSort] = useState<ListSort>(null)
  const [selected, setSelected] = useState<string[]>([])
  const [isoBy, setIsoBy] = useState<Record<string, string>>({})
  const [tracking, setTracking] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState<string[]>(["4"])
  const [note, setNote] = useState("")

  const remove = (ids: string[]) => {
    setData((cur) => cur.filter((r) => !ids.includes(r.id)))
    setSelected((cur) => cur.filter((x) => !ids.includes(x)))
    setNote(`Deleted: ${ids.length} ${ids.length === 1 ? "row" : "rows"}`)
  }

  const columns: Record<ColKey, DataListColumn<Row>> = {
    name: {
      id: "name",
      header: "Name",
      width: "fit",
      minWidth: "8rem",
      maxWidth: "20rem",
      primary: true,
      sortValue: (r) => r.name.toLowerCase(),
      cell: (r) => (
        <ListTitle
          onClick={() => setNote(`Opened ${r.name}`)}
          count={r.count}
          tags={r.tags.map((t) => (
            <ListBadge key={t} size="sm" variant="solid" tone={t === "DL" ? "orange" : "blue"}>
              {t}
            </ListBadge>
          ))}
        >
          {r.name}
        </ListTitle>
      ),
    },
    titleDesc: {
      id: "titleDesc",
      header: "Finding",
      width: "fit",
      minWidth: "10rem",
      maxWidth: "28rem",
      sortValue: (r) => r.summary,
      cell: (r) => <ListTitle description={r.summary}>{`${r.name}: ${r.pace}% on pace`}</ListTitle>,
    },
    email: {
      id: "email",
      header: "Sender",
      width: "fit",
      sortValue: (r) => r.email,
      cell: (r) => <ListMono title={r.email}>{r.email}</ListMono>,
    },
    domain: {
      id: "domain",
      header: "Domain",
      width: "fit",
      sortValue: (r) => r.domain,
      cell: (r) => r.domain,
    },
    person: {
      id: "person",
      header: "Owner",
      width: "fit",
      sortValue: (r) => r.person,
      cell: (r) => r.person,
    },
    role: {
      id: "role",
      header: "Access",
      sortValue: (r) => (r.admin ? 0 : 1),
      cell: (r) =>
        r.admin ? (
          <ListBadge variant="solid" tone="blue">
            Hub admin
          </ListBadge>
        ) : (
          <ListBadge>Standard</ListBadge>
        ),
    },
    apps: {
      id: "apps",
      header: "Apps",
      width: "fit",
      sortValue: (r) => r.apps,
      cell: (r) => <ListMuted title={r.apps}>{r.apps}</ListMuted>,
    },
    status: {
      id: "status",
      header: "Status",
      sortValue: (r) => r.status,
      cell: (r) => <ListBadge tone={statusBadge[r.status].tone}>{statusBadge[r.status].label}</ListBadge>,
    },
    result: {
      id: "result",
      header: "Result",
      sortValue: (r) => r.result,
      cell: (r) => (
        <>
          <ListBadge variant="outline" tone={resultBadge[r.result].tone}>
            {resultBadge[r.result].label}
          </ListBadge>
          <ListBadge
            variant="outline"
            tone={r.signal === "medium" ? "blue" : r.signal === "high" ? "purple" : "neutral"}
          >
            {r.signal[0]!.toUpperCase() + r.signal.slice(1)} signal
          </ListBadge>
        </>
      ),
    },
    decision: {
      id: "decision",
      header: "Underwriting",
      sortValue: (r) => r.decision ?? "",
      cell: (r) =>
        r.decision ? (
          <ListBadge variant="text" tone={decisionTone[r.decision]}>
            {r.decision}
          </ListBadge>
        ) : (
          <ListNone />
        ),
    },
    flag: {
      id: "flag",
      header: "Flag",
      sortValue: (r) => r.flag ?? "",
      cell: (r) =>
        r.flag ? (
          <ListBadge variant="outline" size="sm">
            {r.flag}
          </ListBadge>
        ) : null,
    },
    amount: {
      id: "amount",
      header: "Amount",
      align: "end",
      sortValue: (r) => r.amount,
      cell: (r) => <ListNumber value={r.amount} format="currency" />,
    },
    balance: {
      id: "balance",
      header: "Balance",
      align: "end",
      sortValue: (r) => r.balance,
      cell: (r) => <ListNumber value={r.balance} format="currency" mono />,
    },
    pace: {
      id: "pace",
      header: "Pace",
      align: "end",
      sortValue: (r) => r.pace,
      cell: (r) => <ListNumber value={r.pace} format="percent" />,
    },
    days: {
      id: "days",
      header: "Days",
      align: "end",
      sortValue: (r) => r.days,
      cell: (r) => <ListNumber value={r.days} />,
    },
    compare: {
      id: "compare",
      header: "Late vs healthy",
      align: "end",
      sortValue: (r) => r.compare[0] - r.compare[1],
      cell: (r) => (
        <ListMono>
          {r.compare[0].toFixed(2)} vs {r.compare[1].toFixed(2)}
        </ListMono>
      ),
    },
    date: {
      id: "date",
      header: "Last seen",
      sortValue: (r) => r.date.getTime(),
      cell: (r) => <ListDate date={r.date} />,
    },
    dateSub: {
      id: "dateSub",
      header: "Promised",
      sortValue: (r) => r.date.getTime(),
      cell: (r) => <ListDate date={r.date} description={`Submitted ${formatListDate(r.submitted, true)}`} />,
    },
    note: {
      id: "note",
      header: "Note",
      width: "fit",
      minWidth: "8rem",
      maxWidth: "24rem",
      cell: (r) => <span title={r.note}>{r.note}</span>,
    },
    files: {
      id: "files",
      header: "Files",
      sortValue: (r) => r.files,
      cell: (r) => (
        <span
          className={`inline-flex items-center gap-1 text-[11px] ${r.files === 0 ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`}
          aria-label={r.files === 0 ? "No attachments" : `${r.files} attachments`}
        >
          <Paperclip className="size-3" aria-hidden="true" />
          {r.files}
        </span>
      ),
    },
    apiKey: {
      id: "apiKey",
      header: "API key",
      cell: (r) => <ListMono className="text-muted-foreground">{`${r.apiKey.slice(0, 12)}...`}</ListMono>,
    },
    inlineSelect: {
      id: "inlineSelect",
      header: "ISO",
      interactive: true,
      sortValue: (r) => isoBy[r.id] ?? r.iso,
      cell: (r) => {
        const value = isoBy[r.id] ?? r.iso
        return (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" size="sm" className="w-44 justify-between font-normal" aria-label="ISO" />
              }
            >
              <span className="truncate">{value}</span>
              <Pencil aria-hidden="true" className="text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuRadioGroup
                value={value}
                onValueChange={(v: unknown) => setIsoBy((cur) => ({ ...cur, [r.id]: String(v) }))}
              >
                {isos.map((iso) => (
                  <DropdownMenuRadioItem key={iso} value={iso} closeOnClick>
                    {iso}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
    inlineInput: {
      id: "inlineInput",
      header: "Action",
      interactive: true,
      cell: (r) => (
        <div className="flex items-center gap-1.5">
          <Input
            value={tracking[r.id] ?? ""}
            onChange={(e) => setTracking((cur) => ({ ...cur, [r.id]: e.target.value }))}
            placeholder="Payment ID"
            aria-label="Payment ID"
            className="h-7 w-32 font-mono text-[12px]"
          />
          <Button size="sm" onClick={() => setNote(`Confirmed ${r.name}`)}>
            Confirm
          </Button>
          <Button size="sm" variant="destructive" onClick={() => remove([r.id])}>
            Delete
          </Button>
        </div>
      ),
    },
    rowButton: {
      id: "rowButton",
      header: "Scorecard",
      interactive: true,
      cell: (r) => (
        <Button size="sm" onClick={() => setNote(`Scorecard: ${r.name}`)}>
          Scorecard
        </Button>
      ),
    },
    iconActions: {
      id: "iconActions",
      header: <span className="sr-only">Quick actions</span>,
      interactive: true,
      cell: (r) => {
        const isSaved = saved.includes(r.id)
        return (
          <div className="-my-1 flex items-center">
            <Button variant="ghost" size="icon-sm" aria-label="Comments" className="text-muted-foreground">
              <MessageSquare />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={isSaved ? "Remove bookmark" : "Bookmark"}
              aria-pressed={isSaved}
              onClick={() => setSaved((cur) => (isSaved ? cur.filter((x) => x !== r.id) : [...cur, r.id]))}
              className={isSaved ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground"}
            >
              <Bookmark className={isSaved ? "fill-current" : ""} />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Delete"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => remove([r.id])}
            >
              <Trash2 />
            </Button>
          </div>
        )
      },
    },
    icon: {
      id: "icon",
      header: <span className="sr-only">Indicators</span>,
      cell: (r) =>
        r.recent ? (
          <Clock aria-label="Changed recently" className="size-4 text-blue-600 dark:text-blue-400" />
        ) : (
          <User aria-label="Has an owner" className="text-muted-foreground size-4" />
        ),
    },
    source: {
      id: "source",
      header: "Source",
      sortValue: (r) => r.source,
      cell: (r) => <ListMuted>{r.source}</ListMuted>,
    },
  }

  const cols = placed.map((k) => {
    const c = columns[k]
    return { ...c, sortable: opts.sortable && !!c.sortValue }
  })

  const sorted = sortRows(data, cols, sort)
  // Without the footer the sample shows its first 200 rows.
  const size = opts.pagination ? pageSize : 200
  const pageCount = Math.max(1, Math.ceil(sorted.length / size))
  const current = Math.min(page, pageCount)
  const pageRows = sorted.slice((current - 1) * size, current * size)

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <div className="space-y-2">
          <p className="text-muted-foreground text-xs font-medium">Columns</p>
          <div className="flex flex-wrap gap-2">
            {COLUMNS.map((c) => (
              <Toggle key={c.key} on={has(c.key)} onClick={() => flip(c.key)}>
                {c.label}
              </Toggle>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-muted-foreground text-xs font-medium">Row parts</p>
          <div className="flex flex-wrap gap-2">
            <Toggle on={opts.select} onClick={() => set("select", !opts.select)}>
              Bulk select
            </Toggle>
            <Toggle on={opts.sortable} onClick={() => set("sortable", !opts.sortable)}>
              Sortable titles
            </Toggle>
            <Toggle on={opts.expand} onClick={() => set("expand", !opts.expand)}>
              Expandable rows
            </Toggle>
            <Toggle on={opts.dimInactive} onClick={() => set("dimInactive", !opts.dimInactive)}>
              Dim inactive rows
            </Toggle>
            <Toggle on={opts.bulkMenu} onClick={() => set("bulkMenu", !opts.bulkMenu)}>
              Right-click bulk menu
            </Toggle>
            <Toggle on={opts.pagination} onClick={() => set("pagination", !opts.pagination)}>
              Pagination footer
            </Toggle>
          </div>
        </div>

        <div className="space-y-1.5">
          <Choice
            label="Row end"
            value={opts.rowEnd}
            onChange={(v) => set("rowEnd", v)}
            options={[
              { value: "menu", label: "Three dots" },
              { value: "chevron", label: "Chevron (row opens)" },
              { value: "none", label: "Nothing" },
            ]}
          />
          <Choice
            label="Row height"
            value={opts.density}
            onChange={(v) => set("density", v)}
            options={[
              { value: "compact", label: "Compact" },
              { value: "default", label: "Default" },
              { value: "comfortable", label: "Comfortable" },
            ]}
          />
          <Choice
            label="Titles"
            value={opts.headerStyle}
            onChange={(v) => set("headerStyle", v)}
            options={[
              { value: "default", label: "Normal" },
              { value: "caps", label: "CAPS" },
              { value: "hidden", label: "Hidden" },
            ]}
          />
          <Choice
            label="Layout"
            value={opts.layout}
            onChange={(v) => set("layout", v)}
            options={[
              { value: "rows", label: "Rows" },
              { value: "cards", label: "Cards" },
            ]}
          />
        </div>

        {placed.length > 1 ? (
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-3">
              <p className="text-muted-foreground text-xs font-medium">Column order</p>
              <span className="text-muted-foreground text-xs">
                Drag to rearrange, or focus one and use the arrow keys.
              </span>
              <Button
                type="button"
                variant="link"
                size="xs"
                className="text-muted-foreground ml-auto px-0 font-normal"
                onClick={() => {
                  setOn(DEFAULT_ON)
                  setOrder(DEFAULT_ORDER)
                  setOpts(DEFAULT_OPTS)
                }}
              >
                Reset all
              </Button>
            </div>
            <OrderChips items={placed} label={colLabel} onMove={move} onNudge={nudge} />
          </div>
        ) : null}
      </div>

      {/* The list fills the height it is given; here a 600px box stands in for the page. */}
      <div className="h-[600px]">
        {placed.length === 0 ? (
          <p className="text-muted-foreground rounded-xl border border-dashed p-6 text-center text-sm">
            Turn on a column above to build the list.
          </p>
        ) : (
          <DataList
            aria-label="Sample list"
            rows={pageRows}
            columns={cols}
            getRowId={(r) => r.id}
            selected={opts.select ? selected : undefined}
            onSelectedChange={opts.select ? setSelected : undefined}
            sort={sort}
            onSortChange={opts.sortable ? setSort : undefined}
            rowEnd={opts.rowEnd}
            onRowClick={opts.rowEnd === "chevron" ? (r) => setNote(`Opened ${r.name}`) : undefined}
            rowMenu={(r) => (
              <>
                <DropdownMenuItem onClick={() => setNote(`Opened ${r.name}`)}>
                  <ExternalLink />
                  Open
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <UserPlus />
                  Assign owner
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download />
                  Export
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={() => remove([r.id])}>
                  <Trash2 />
                  Delete
                </DropdownMenuItem>
              </>
            )}
            renderExpanded={
              opts.expand
                ? (r) => (
                    <div className="space-y-1">
                      <p>{r.summary}</p>
                      <p>{r.note}</p>
                    </div>
                  )
                : undefined
            }
            rowMuted={opts.dimInactive ? (r) => r.status === "inactive" : undefined}
            bulkMenu={
              opts.bulkMenu && opts.select
                ? (ids) =>
                    ids.length === 0 ? (
                      <ContextMenuGroup>
                        <ContextMenuLabel>Select rows to see bulk actions</ContextMenuLabel>
                      </ContextMenuGroup>
                    ) : (
                      <>
                        <ContextMenuGroup>
                          <ContextMenuLabel>
                            {ids.length} {ids.length === 1 ? "row" : "rows"} selected
                          </ContextMenuLabel>
                        </ContextMenuGroup>
                        <ContextMenuItem onClick={() => setNote(`Assigned: ${ids.length}`)}>
                          <UserPlus />
                          Assign owner
                        </ContextMenuItem>
                        <ContextMenuItem onClick={() => setNote(`Exported: ${ids.length}`)}>
                          <Download />
                          Export selected
                        </ContextMenuItem>
                        <ContextMenuSeparator />
                        <ContextMenuItem variant="destructive" onClick={() => remove(ids)}>
                          <Trash2 />
                          Delete
                        </ContextMenuItem>
                        <ContextMenuSeparator />
                        <ContextMenuItem onClick={() => setSelected([])}>Clear selection</ContextMenuItem>
                      </>
                    )
                : undefined
            }
            density={opts.density}
            headerStyle={opts.headerStyle}
            layout={opts.layout}
            scrollKey={`${current}-${size}-${sort?.column}-${sort?.dir}`}
            footer={
              opts.pagination ? (
                <ListPagination
                  page={current}
                  pageSize={pageSize}
                  total={sorted.length}
                  onPageChange={setPage}
                  onPageSizeChange={setPageSize}
                  status={
                    <>
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
                    </>
                  }
                />
              ) : null
            }
          />
        )}
      </div>
    </div>
  )
}
