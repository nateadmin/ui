import { useState } from "react"
import { Check as CheckIcon, CheckCircle2, ChevronLeft, ChevronRight, Minus, Paperclip, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

/*
 * The applications list layout as it ships in Simply Funding (underwriting):
 * search and count on top, a
 * wide table that scrolls sideways with the Scorecard column pinned right,
 * cards on mobile, and Previous / Next under it. This is the starting point
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

const decisionClass = {
  APPROVE: "text-emerald-600 dark:text-emerald-400",
  DECLINE: "text-red-600 dark:text-red-400",
  REVIEW: "text-amber-600 dark:text-amber-400",
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
    <span className={`text-[11px] font-medium ${decisionClass[row.decision]}`}>{row.decision}</span>
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
  onChange: () => void
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
        onChange()
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

const th = "text-muted-foreground h-8 text-[11px] font-medium select-none"
const pinned = "sticky right-0 z-10 min-w-[5.5rem] px-3 text-right shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.25)]"

export function SimplyFundingList() {
  const [q, setQ] = useState("")
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<string[]>([])
  const toggle = (id: string) => setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]))
  const shown = rows.filter((r) => `${r.from} ${r.subject} ${r.agent}`.toLowerCase().includes(q.trim().toLowerCase()))

  const shownIds = shown.map((r) => r.id)
  const pickedShown = shownIds.filter((id) => selected.includes(id)).length
  const allPicked = shown.length > 0 && pickedShown === shown.length
  const toggleAll = () =>
    setSelected((cur) => (allPicked ? cur.filter((id) => !shownIds.includes(id)) : [...new Set([...cur, ...shownIds])]))

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-md flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search subject, sender, agent…"
            aria-label="Search applications"
            className="h-9 pr-9 pl-9"
          />
        </div>
        <p className="text-muted-foreground shrink-0 text-[11px]" aria-live="polite">
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
            </>
          ) : (
            <>{TOTAL.toLocaleString("en-US")} applications</>
          )}
        </p>
      </div>

      {shown.length === 0 ? (
        <div className="bg-card rounded-lg border p-12 text-center">
          <p className="text-muted-foreground text-[13px]">No applications match your search.</p>
        </div>
      ) : (
        <>
          <ul className="m-0 grid list-none gap-2 p-0 md:hidden">
            {shown.map((r) => (
              <li key={r.id}>
                <div role="button" tabIndex={0} className="bg-card w-full rounded-lg border p-3 text-left">
                  <div className="flex items-start justify-between gap-3">
                    <div className="pt-0.5">
                      <SelectCircle
                        checked={selected.includes(r.id)}
                        onChange={() => toggle(r.id)}
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
                  <Button type="button" className="mt-3 min-h-9 w-full">
                    Scorecard
                  </Button>
                </div>
              </li>
            ))}
          </ul>

          <div className="bg-card hidden overflow-x-auto rounded-lg border md:block">
            <table className="w-max min-w-full caption-bottom text-[13px]">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="h-8 w-9 pr-0 pl-3">
                    <SelectCircle
                      checked={allPicked}
                      indeterminate={pickedShown > 0 && !allPicked}
                      onChange={toggleAll}
                      label="Select all"
                    />
                  </TableHead>
                  <TableHead className={th}>From</TableHead>
                  <TableHead className={th}>Files</TableHead>
                  <TableHead className={`${th} w-[20rem] max-w-[20rem]`}>Subject</TableHead>
                  <TableHead className={th}>Agent</TableHead>
                  <TableHead className={th}>Underwriter</TableHead>
                  <TableHead className={th}>Forml</TableHead>
                  <TableHead className={th}>Underwriting</TableHead>
                  <TableHead className={th}>ONYX</TableHead>
                  <TableHead className={`${th} text-right`}>Received</TableHead>
                  <TableHead className={`${pinned} bg-card text-muted-foreground h-8 text-[11px] font-medium`}>
                    Scorecard
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shown.map((r) => (
                  <TableRow
                    key={r.id}
                    data-state={selected.includes(r.id) ? "selected" : undefined}
                    className="group hover:bg-muted/30 data-[state=selected]:bg-primary/5 cursor-pointer"
                  >
                    <TableCell className="w-9 py-1.5 pr-0 pl-3">
                      <SelectCircle
                        checked={selected.includes(r.id)}
                        onChange={() => toggle(r.id)}
                        label={`Select ${r.subject}`}
                      />
                    </TableCell>
                    <TableCell className="py-1.5 w-[14rem] max-w-[14rem] min-w-[10rem] overflow-hidden">
                      <p className="truncate text-[13px]" title={r.from}>
                        {r.from}
                      </p>
                    </TableCell>
                    <TableCell className="py-1.5">
                      <Files count={r.files} />
                    </TableCell>
                    <TableCell className="py-1.5 w-[20rem] max-w-[20rem] overflow-hidden">
                      <p className="truncate text-[13px] font-medium" title={r.subject}>
                        {r.subject}
                      </p>
                    </TableCell>
                    <TableCell className="py-1.5">
                      <span className="inline-block max-w-35 truncate text-[13px]">{r.agent}</span>
                    </TableCell>
                    <TableCell className="py-1.5 whitespace-nowrap">
                      <span className="text-[13px]">{r.underwriter}</span>
                    </TableCell>
                    <TableCell className="py-1.5">
                      <Check row={r} />
                    </TableCell>
                    <TableCell className="py-1.5">
                      <Decision row={r} />
                    </TableCell>
                    <TableCell className="py-1.5 whitespace-nowrap">
                      <Onyx row={r} />
                    </TableCell>
                    <TableCell className="py-1.5 text-right whitespace-nowrap">
                      <span className="text-muted-foreground text-[11px]">{r.received}</span>
                    </TableCell>
                    <TableCell className={`py-1.5 ${pinned} bg-card group-hover:bg-[color-mix(in_oklch,var(--muted)_30%,var(--card))] group-data-[state=selected]:bg-[color-mix(in_oklch,var(--primary)_5%,var(--card))] whitespace-nowrap`}>
                      <Button type="button" size="xs" className="shrink-0" onClick={(e) => e.stopPropagation()}>
                        Scorecard
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </table>
          </div>

          <div className="flex flex-col items-stretch justify-between gap-2 pt-1 sm:flex-row sm:items-center">
            <p className="text-muted-foreground text-center text-[11px] sm:text-left">
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
