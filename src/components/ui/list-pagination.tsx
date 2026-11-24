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
 * The footer under a list, always one row: page size on the left, "Showing x-y of total" in the
 * middle, and page controls on the right. The page number is a field: type any
 * page and press Enter (or leave the field) to jump there; the buttons still work.
 *
 * A list that can only step (it loads the next page from where the last one ended) sets
 * `stepOnly`: the page number shows as text, and Previous and Next do the moving. `allSize`
 * names the page size that means "every row" and shows it as "All".
 *
 * Page size is a user preference. The app saves it to the user's profile
 * (not the browser) and passes it back in, so this component only reports changes.
 */

const DEFAULT_PAGE_SIZES = [50, 100, 250, 500, 1000, 2000]

const fmt = (n: number) => n.toLocaleString("en-US")

function PageSizeMenu({
  pageSize,
  pageSizes,
  allSize,
  onPageSizeChange,
}: {
  pageSize: number
  pageSizes: number[]
  allSize?: number
  onPageSizeChange: (size: number) => void
}) {
  const name = (size: number) => (size === allSize ? "All" : fmt(size))
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            aria-label={`Rows per page: ${name(pageSize)}`}
            className="h-8 gap-1.5 font-normal"
          />
        }
      >
        {/* As wide as the size in use, no wider. */}
        <span className="tabular-nums">
          {name(pageSize)}
          <span className="max-sm:hidden">{pageSize === allSize ? " rows" : " per page"}</span>
        </span>
        <ChevronDownIcon aria-hidden="true" className="text-muted-foreground" />
      </DropdownMenuTrigger>
      {/* The menu is exactly as wide as the field. */}
      <DropdownMenuContent align="start" side="top" className="w-(--anchor-width) min-w-(--anchor-width)">
        <DropdownMenuRadioGroup value={String(pageSize)} onValueChange={(v: unknown) => onPageSizeChange(Number(v))}>
          {pageSizes.map((size) => (
            <DropdownMenuRadioItem key={size} value={String(size)} closeOnClick className="tabular-nums">
              {name(size)}
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
      {/* On the narrowest phones the page total gives way so the footer stays on one row. */}
      <span className="max-[359px]:hidden">of {fmt(pageCount)}</span>
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
  stepOnly = false,
  hasPrevious,
  hasNext,
  allSize,
  range,
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
  /** The list can only go one page back or forward. The page number shows as text, not a field. */
  stepOnly?: boolean
  /** Override whether Previous and Next work, for a list that knows better than the page math. */
  hasPrevious?: boolean
  hasNext?: boolean
  /** The page size that means "every row". Shown as "All". */
  allSize?: number
  /** The rows on screen, when that is not the page math (for example a list that loads more as you scroll). */
  range?: { first: number; last: number }
  className?: string
}) {
  const all = allSize != null && pageSize === allSize
  const pageCount = all ? 1 : Math.max(1, Math.ceil(total / pageSize))
  const first = range ? range.first : total === 0 ? 0 : (page - 1) * pageSize + 1
  const last = range ? range.last : all ? total : Math.min(page * pageSize, total)
  const canPrevious = hasPrevious ?? page > 1
  const canNext = hasNext ?? page < pageCount

  return (
    <div
      data-slot="list-pagination"
      className={cn(
        // One row at every width. On phones the labels shorten so it fits.
        "grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 pt-1 sm:grid-cols-[1fr_auto_1fr]",
        className,
      )}
    >
      <div className="sm:justify-self-start">
        <PageSizeMenu
          pageSize={pageSize}
          pageSizes={pageSizes}
          allSize={allSize}
          onPageSizeChange={(size) => {
            onPageSizeChange(size)
            // Keep the first visible row in view after the page size changes. A step-only list starts over.
            if (!stepOnly) onPageChange(size === allSize ? 1 : Math.floor((first - 1) / size) + 1)
          }}
        />
      </div>
      <p className="text-muted-foreground min-w-0 truncate text-center text-[11px] tabular-nums" aria-live="polite">
        {status}
        <span className="max-sm:sr-only">Showing </span>
        {fmt(first)}-{fmt(last)} of {fmt(total)}
      </p>
      <nav aria-label="Pages" className="flex items-center gap-1.5 sm:gap-2 sm:justify-self-end">
        <Button
          variant="outline"
          size="sm"
          aria-label="Previous page"
          className="h-8 gap-1 max-sm:w-8 max-sm:px-0"
          disabled={!canPrevious}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeftIcon aria-hidden="true" />
          <span className="max-sm:hidden">Previous</span>
        </Button>
        {stepOnly ? (
          <span className="text-muted-foreground text-[11px] tabular-nums">
            <span className="max-sm:sr-only">Page </span>
            {fmt(page)}
            <span className="max-[359px]:hidden"> of {fmt(pageCount)}</span>
          </span>
        ) : (
          <PageField page={page} pageCount={pageCount} onPageChange={onPageChange} />
        )}
        <Button
          variant="outline"
          size="sm"
          aria-label="Next page"
          className="h-8 gap-1 max-sm:w-8 max-sm:px-0"
          disabled={!canNext}
          onClick={() => onPageChange(page + 1)}
        >
          <span className="max-sm:hidden">Next</span>
          <ChevronRightIcon aria-hidden="true" />
        </Button>
      </nav>
    </div>
  )
}

export { ListPagination, DEFAULT_PAGE_SIZES }
