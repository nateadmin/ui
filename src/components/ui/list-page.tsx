"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DataList, sortRows, type DataListProps, type ListSort } from "@/components/ui/data-list"
import { DEFAULT_PAGE_SIZES, ListPagination } from "@/components/ui/list-pagination"
import {
  Toolbar,
  ToolbarExport,
  ToolbarFilter,
  ToolbarFilterDialog,
  ToolbarLabel,
  ToolbarSearch,
} from "@/components/ui/toolbar"

/*
 * ListPage: a whole list page as one component (users, applications, anything
 * that is a list of things you open). An app plugs its rows in and gets every
 * rule of the page from here, the same on every page and in every app:
 *
 *   - the bar, always in this order: Search, the filters, Filters (when there
 *     are more than fit), Export, then the page's actions with the main one
 *     last; icons only on a phone
 *   - the list: column titles that sort (up, down, then back to the list's own
 *     order), rows that open, bulk select, cards on a phone
 *   - the footer: page size, "Showing x-y of total", Previous, a page number
 *     you can type, Next
 *
 * Two ways to feed it:
 *   - hand it every row (`rows`): the page sorts and pages them itself
 *   - hand it one page of rows with `total`, and `page`, `sort` and their
 *     change handlers: for a list the server sorts and pages
 *
 * The app owns the data and nothing else: the rows, what a cell shows, what
 * the filters are, and what happens on a click. It never styles, sizes, orders
 * or wires any of the above.
 */

type ListPageAction = {
  label: string
  /** An icon element, shown before the label and alone on a phone. */
  icon?: React.ReactNode
  onClick: () => void
  /** The page's main action (one per page, drawn filled). Others are outlined. */
  primary?: boolean
  disabled?: boolean
}

type ListPageProps<T> = {
  /** Search field. Any input props; leave out to hide it. */
  search?: React.ComponentProps<typeof ToolbarSearch>
  /** Filters shown on the bar, each a dropdown ("Status: Active"). Keep it to the few people use most. */
  filters?: Array<React.ComponentProps<typeof ToolbarFilter> & { key: string }>
  /** Every other filter, behind one Filters button. */
  filterDialog?: React.ComponentProps<typeof ToolbarFilterDialog>
  /** Export: formats, download and email. */
  exportMenu?: React.ComponentProps<typeof ToolbarExport>
  /** Buttons at the end of the bar, for example "Add user". */
  actions?: ListPageAction[]

  /** The rows: all of them, or one page of them when `total` is given. */
  rows: T[]
  /** Everything else the list takes: columns, row click, select, row menu, what dims a row... */
  list: Omit<DataListProps<T>, "rows" | "sort" | "onSortChange" | "footer" | "scrollKey">

  /** Set these when the server pages and sorts. Leave them out and the page does it over `rows`. */
  total?: number
  page?: number
  onPageChange?: (page: number) => void
  sort?: ListSort
  onSortChange?: (sort: ListSort) => void

  /** Rows per page: a preference the app saves to the person's profile and passes back in. */
  pageSize?: number
  onPageSizeChange?: (size: number) => void
  pageSizes?: number[]

  /** Shown above the bar, for example an error. */
  notice?: React.ReactNode
  /** Shown in place of the list, for example a loader on first load. */
  placeholder?: React.ReactNode
  className?: string
}

function ListPage<T>({
  search,
  filters,
  filterDialog,
  exportMenu,
  actions,
  rows,
  list,
  total,
  page,
  onPageChange,
  sort,
  onSortChange,
  pageSize,
  onPageSizeChange,
  pageSizes = DEFAULT_PAGE_SIZES,
  notice,
  placeholder,
  className,
}: ListPageProps<T>) {
  const served = total != null // the server pages and sorts
  const [ownPage, setOwnPage] = React.useState(1)
  const [ownSort, setOwnSort] = React.useState<ListSort>(null)
  const [ownSize, setOwnSize] = React.useState(pageSizes[0] ?? 50)

  const size = pageSize ?? ownSize
  const activeSort = sort !== undefined ? sort : ownSort
  const count = served ? total : rows.length
  const pageCount = Math.max(1, Math.ceil(count / size))
  const current = Math.min(Math.max(1, page ?? ownPage), pageCount)

  const shown = React.useMemo(() => {
    if (served) return rows
    const sorted = sortRows(rows, list.columns, activeSort)
    return sorted.slice((current - 1) * size, current * size)
  }, [served, rows, list.columns, activeSort, current, size])

  // A search or filter changes how many rows there are: start again from the first page.
  const rowCount = rows.length
  React.useEffect(() => {
    if (!served) setOwnPage(1)
  }, [served, rowCount])

  const setPage = (next: number) => (onPageChange ? onPageChange(next) : setOwnPage(next))
  const setSort = (next: ListSort) => {
    if (onSortChange) onSortChange(next)
    else setOwnSort(next)
    setPage(1)
  }

  return (
    <div data-slot="list-page" className={cn("flex h-full min-h-0 min-w-0 flex-col gap-2", className)}>
      {notice}
      <Toolbar labels="icons-on-phones">
        {search ? <ToolbarSearch {...search} /> : null}
        {filters?.map(({ key, ...filter }) => <ToolbarFilter key={key} {...(filter as React.ComponentProps<typeof ToolbarFilter>)} />)}
        {filterDialog ? <ToolbarFilterDialog {...filterDialog} /> : null}
        {exportMenu ? <ToolbarExport {...exportMenu} /> : null}
        {actions?.map((action) => (
          <Button
            key={action.label}
            type="button"
            size="lg"
            variant={action.primary ? "default" : "outline"}
            className={cn("shrink-0 gap-2", !action.primary && "font-normal")}
            aria-label={action.label}
            disabled={action.disabled}
            onClick={action.onClick}
          >
            {action.icon}
            {action.icon ? <ToolbarLabel>{action.label}</ToolbarLabel> : action.label}
          </Button>
        ))}
      </Toolbar>
      <div className="min-h-0 flex-1">
        {placeholder ?? (
          <DataList<T>
            {...list}
            rows={shown}
            sort={activeSort}
            onSortChange={setSort}
            scrollKey={`${current}:${activeSort?.column ?? ""}:${activeSort?.dir ?? ""}`}
            footer={
              <ListPagination
                page={current}
                pageSize={size}
                total={count}
                pageSizes={pageSizes}
                onPageChange={setPage}
                onPageSizeChange={(next) => (onPageSizeChange ? onPageSizeChange(next) : setOwnSize(next))}
              />
            }
          />
        )}
      </div>
    </div>
  )
}

export { ListPage }
export type { ListPageProps, ListPageAction }
