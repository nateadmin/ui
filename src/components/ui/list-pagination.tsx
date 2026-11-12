"use client"

import * as React from "react"
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

/*
 * The footer under a list: page size on the left, "Showing x–y of total" in the
 * middle, and page controls on the right. The page number is a field: type any
 * page and press Enter (or leave the field) to jump there; the buttons still work.
 *
 * Page size is a user preference. The app saves it to the user's profile
 * (not the browser) and passes it back in, so this component only reports changes.
 */

const DEFAULT_PAGE_SIZES = [50, 100, 250, 500, 1000, 2000]

const fmt = (n: number) => n.toLocaleString("en-US")

function PageSizeMenu({
  pageSize,
  pageSizes,
  onPageSizeChange,
}: {
  pageSize: number
  pageSizes: number[]
  onPageSizeChange: (size: number) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            aria-label={`Rows per page: ${fmt(pageSize)}`}
            className="h-8 gap-1.5 font-normal"
          />
        }
      >
        {/* Every size sits in one grid cell so the button never changes width. */}
        <span className="grid text-left">
          {pageSizes.map((size) => (
            <span
              key={size}
              aria-hidden="true"
              className={cn("col-start-1 row-start-1 tabular-nums", size !== pageSize && "invisible")}
            >
              {fmt(size)} per page
            </span>
          ))}
        </span>
        <ChevronDownIcon aria-hidden="true" className="text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="top">
        <DropdownMenuRadioGroup value={String(pageSize)} onValueChange={(v: unknown) => onPageSizeChange(Number(v))}>
          {pageSizes.map((size) => (
            <DropdownMenuRadioItem key={size} value={String(size)} closeOnClick className="tabular-nums">
              {fmt(size)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function PageField({
  page,
  pageCount,
  onPageChange,
}: {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
}) {
  const [draft, setDraft] = React.useState(String(page))
  const cancelled = React.useRef(false)
  React.useEffect(() => setDraft(String(page)), [page])

  const commit = () => {
    if (cancelled.current) {
      cancelled.current = false
      setDraft(String(page))
      return
    }
    const n = Number.parseInt(draft.replace(/[^0-9]/g, ""), 10)
    if (Number.isFinite(n)) {
      const next = Math.min(Math.max(n, 1), pageCount)
      setDraft(String(next))
      if (next !== page) onPageChange(next)
    } else {
      setDraft(String(page))
    }
  }

  const width = `${Math.max(String(pageCount).length, 1) + 2}ch`

  return (
    <span className="text-muted-foreground inline-flex items-center gap-1.5 text-[11px] tabular-nums">
      <input
        type="text"
        inputMode="numeric"
        aria-label={`Page, 1 to ${fmt(pageCount)}`}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onFocus={(e) => e.target.select()}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            commit()
          } else if (e.key === "Escape") {
            cancelled.current = true
            e.currentTarget.blur()
          }
        }}
        style={{ width }}
        className="border-input text-foreground focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 h-8 rounded-md border bg-transparent text-center text-[12px] outline-none focus-visible:ring-3"
      />
      <span>of {fmt(pageCount)}</span>
    </span>
  )
}

function ListPagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizes = DEFAULT_PAGE_SIZES,
  status,
  className,
}: {
  /** Current page, starting at 1. */
  page: number
  pageSize: number
  /** Total rows across all pages. */
  total: number
  onPageChange: (page: number) => void
  /** Save this to the user's profile, then pass the new size back in. */
  onPageSizeChange: (size: number) => void
  pageSizes?: number[]
  /** Optional text before "Showing…", such as "3 selected · Clear". */
  status?: React.ReactNode
  className?: string
}) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1
  const last = Math.min(page * pageSize, total)

  return (
    <div
      data-slot="list-pagination"
      className={cn(
        "flex flex-col items-center gap-2 pt-1 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center",
        className,
      )}
    >
      <div className="sm:justify-self-start">
        <PageSizeMenu
          pageSize={pageSize}
          pageSizes={pageSizes}
          onPageSizeChange={(size) => {
            onPageSizeChange(size)
            // Keep the first visible row in view after the page size changes.
            onPageChange(Math.floor((first - 1) / size) + 1)
          }}
        />
      </div>
      <p className="text-muted-foreground text-center text-[11px] tabular-nums" aria-live="polite">
        {status}
        Showing {fmt(first)}–{fmt(last)} of {fmt(total)}
      </p>
      <nav aria-label="Pages" className="flex items-center gap-2 sm:justify-self-end">
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeftIcon aria-hidden="true" />
          Previous
        </Button>
        <PageField page={page} pageCount={pageCount} onPageChange={onPageChange} />
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
        >
          Next
          <ChevronRightIcon aria-hidden="true" />
        </Button>
      </nav>
    </div>
  )
}

export { ListPagination, DEFAULT_PAGE_SIZES }
