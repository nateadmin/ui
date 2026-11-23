"use client"

import * as React from "react"
import {
  BookmarkIcon,
  CalendarRangeIcon,
  ChevronDownIcon,
  DownloadIcon,
  EllipsisVerticalIcon,
  FolderOpenIcon,
  ListFilterIcon,
  MailIcon,
  PlusIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  SaveIcon,
  SearchIcon,
  Trash2Icon,
  SlidersHorizontalIcon,
  XIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { EmailInput, isEmail } from "@/components/ui/email-input"
import { Input } from "@/components/ui/input"
import { MultiSelect } from "@/components/ui/multi-select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

/*
 * The bar that sits on top of a list, table, or board.
 * One component, built from parts. A page includes only the parts it needs:
 *
 *   <Toolbar>
 *     <ToolbarViews />         Board / List. Four or more views become a dropdown.
 *     <ToolbarReportLibrary /> saved reports in categories, Save as report, Update (reports pages)
 *     <ToolbarSearch />        fills the free space
 *     <ToolbarTabs />          status tabs with counts (Active 12, Monitor 3)
 *     <ToolbarDateRange />     From / To pickers plus presets (Today, 7 days, ...)
 *     <ToolbarCount />         "6,113 rows"
 *     <ToolbarFilter />        one per filter, single or multi-select
 *     <ToolbarFilterDialog />  "Filters" button that opens every filter in a dialog
 *     <ToolbarActions>         pushed to the right edge
 *       <Button>New project</Button>
 *     </ToolbarActions>
 *   </Toolbar>
 *   <ToolbarActiveFilters />   applied filters as removable chips, under the bar
 *
 * Every control is the same height, so any mix lines up. Dropdown buttons are
 * sized to their longest possible text, so they never change width when the
 * selection changes. On narrow screens the parts wrap onto new rows.
 */

/*
 * labels: "show" (default) shows every part's text. "icons" shows icons only,
 * so the bar takes fewer rows; the text stays readable by screen readers.
 * "icons-on-phones" does that below 640px only. Wrap your own text in
 * <ToolbarLabel> (for example a "New project" button) so it follows along.
 *
 * When the parts wrap onto more than one row, every part on every row
 * stretches so each row fills the full width.
 */
/* Below 640px. */
function usePhone() {
  const query = "(max-width: 639px)"
  const [phone, setPhone] = React.useState(() => typeof window !== "undefined" && window.matchMedia(query).matches)
  React.useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setPhone(mq.matches)
    on()
    mq.addEventListener("change", on)
    return () => mq.removeEventListener("change", on)
  }, [])
  return phone
}

function Toolbar({
  className,
  labels = "show",
  ...props
}: React.ComponentProps<"div"> & { labels?: "show" | "icons" | "icons-on-phones" }) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [wrapped, setWrapped] = React.useState(false)
  const phone = usePhone()
  const icons = labels === "icons" || (labels === "icons-on-phones" && phone)

  // Wrapped when the visible parts don't all sit on the same line.
  const measure = React.useCallback(() => {
    const el = ref.current
    if (!el) return
    const tops = new Set<number>()
    for (const child of Array.from(el.children) as HTMLElement[]) {
      if (child.offsetWidth === 0 && child.offsetHeight === 0) continue
      tops.add(Math.round((child.offsetTop + child.offsetHeight / 2) / 8))
    }
    setWrapped(tops.size > 1)
  }, [])
  React.useLayoutEffect(measure)
  React.useLayoutEffect(measure, [icons])
  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [measure])

  return (
    <div
      ref={ref}
      role="toolbar"
      data-slot="toolbar"
      data-labels={labels}
      data-icons={icons ? "true" : undefined}
      data-wrapped={wrapped ? "true" : undefined}
      className={cn(
        "bg-card text-card-foreground flex w-full flex-wrap items-center gap-2 rounded-xl border p-2",
        // Wrapped: every part grows so each row is full. Spacers (aria-hidden) stay put.
        "[&[data-wrapped]:not([data-icons])>*:not([aria-hidden=true])]:grow",
        // Icons only: hide text and dropdown arrows, show the stand-in icons.
        "[&[data-icons]_[data-toolbar-label]]:sr-only [&[data-icons]_[data-toolbar-chevron]]:hidden [&[data-icons]_[data-toolbar-icon]]:block",
        // Icons only: every button with a label starts as a 36px square.
        "[&[data-icons]_button:has([data-toolbar-label])]:relative [&[data-icons]_button:has([data-toolbar-label])]:h-9! [&[data-icons]_button:has([data-toolbar-label])]:w-9! [&[data-icons]_button:has([data-toolbar-label])]:min-w-0! [&[data-icons]_button:has([data-toolbar-label])]:max-w-none! [&[data-icons]_button:has([data-toolbar-label])]:shrink-0 [&[data-icons]_button:has([data-toolbar-label])]:justify-center! [&[data-icons]_button:has([data-toolbar-label])]:gap-0! [&[data-icons]_button:has([data-toolbar-label])]:p-0!",
        "[&[data-icons]_[data-slot=toolbar-views]_button]:h-8! [&[data-icons]_[data-slot=toolbar-views]_button]:w-8! [&[data-icons]_[data-slot=toolbar-views]_button]:grow",
        // Icons only: search asks for less room before it wraps, so it can share a row with the icons.
        "[&[data-icons]>[data-slot=toolbar-search]]:basis-48",
        // Icons only: the Filters count sits on the icon's corner.
        "[&[data-icons]_[data-toolbar-badge]]:absolute [&[data-icons]_[data-toolbar-badge]]:-top-1.5 [&[data-icons]_[data-toolbar-badge]]:-right-1.5 [&[data-icons]_[data-toolbar-badge]]:h-4 [&[data-icons]_[data-toolbar-badge]]:min-w-4 [&[data-icons]_[data-toolbar-badge]]:text-[10px]",
        // Icons only: the bar never leaves empty space. Fields (search, tabs) take
        // nearly all the free room on their row, so icons beside them stay square;
        // on a row of icons alone, the icons widen evenly to fill it.
        "[&[data-icons]>*:not([aria-hidden=true])]:grow [&[data-icons]>[data-toolbar-fill]]:grow-[100000]",
        className,
      )}
      {...props}
    />
  )
}

/** Text inside a toolbar part that hides when the toolbar shows icons only. */
function ToolbarLabel({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-toolbar-label="" className={cn("truncate", className)} {...props} />
}

/* Dropdown arrow: hidden in icons-only mode, and pushed to the right edge when the part stretches. */
function Chevron() {
  return <ChevronDownIcon aria-hidden="true" data-toolbar-chevron="" className="text-muted-foreground ml-auto" />
}

/* An icon that only shows in icons-only mode, for parts that have no icon of their own. */
function StandInIcon({ children }: { children: React.ReactNode }) {
  return (
    <span aria-hidden="true" data-toolbar-icon="" className="hidden [&_svg]:size-4">
      {children}
    </span>
  )
}

/* Lays every possible text in one grid cell and shows only the active one,
   so the box is always as wide as the longest text. */
function StableLabel({ items, active }: { items: Array<{ key: string; node: React.ReactNode }>; active: string }) {
  return (
    <span data-toolbar-label="" className="grid min-w-0 text-left">
      {items.map((item) => (
        <span
          key={item.key}
          aria-hidden={item.key === active ? undefined : true}
          className={cn(
            "col-start-1 row-start-1 flex min-w-0 items-center gap-2 overflow-hidden",
            item.key !== active && "invisible",
          )}
        >
          {item.node}
        </span>
      ))}
    </span>
  )
}

function Dot({ color }: { color?: string }) {
  if (!color) return null
  return <span aria-hidden="true" className="size-2 shrink-0 rounded-full" style={{ background: color }} />
}

/* Every dropdown trigger on the toolbar follows one rule: same height, sized to
   its longest possible text so it never jumps when the selection changes, and
   never wider than 15rem (no cap when the toolbar wraps and each row is
   stretched to full width). Longer text is cut with "…". */
const triggerClass = "min-w-0 max-w-60 shrink-0 gap-2 font-normal in-data-wrapped:max-w-none"

/* ---------- Views ---------- */

type ToolbarView = {
  value: string
  label: string
  icon?: React.ReactNode
  /** Optional number shown after the label, for example how many items the view holds. */
  count?: number
}

function Count({ value }: { value?: number }) {
  if (value == null) return null
  return <span className="text-xs tabular-nums opacity-70">{value.toLocaleString("en-US")}</span>
}

/** Up to three views show as a segmented switch. Four or more show as a dropdown. */
const MAX_TOGGLE_VIEWS = 3

function ToolbarViews({
  views,
  value,
  onValueChange,
  className,
  "aria-label": ariaLabel = "View",
}: {
  views: ToolbarView[]
  value: string
  onValueChange: (value: string) => void
  className?: string
  "aria-label"?: string
}) {
  if (views.length > MAX_TOGGLE_VIEWS) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="outline"
              size="lg"
              data-slot="toolbar-views"
              aria-label={ariaLabel}
              className={cn(triggerClass, className)}
            />
          }
        >
          <StandInIcon>{views.find((v) => v.value === value)?.icon}</StandInIcon>
          <StableLabel
            active={value}
            items={views.map((v) => ({
              key: v.value,
              node: (
                <>
                  <span className="[&_svg:not([class*='size-'])]:size-4 flex">{v.icon}</span>
                  {v.label}
                  <Count value={v.count} />
                </>
              ),
            }))}
          />
          <Chevron />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuRadioGroup value={value} onValueChange={(v: unknown) => onValueChange(String(v))}>
            {views.map((v) => (
              <DropdownMenuRadioItem key={v.value} value={v.value} closeOnClick>
                {v.icon}
                {v.label}
                <Count value={v.count} />
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <ToggleGroup
      data-slot="toolbar-views"
      value={[value]}
      onValueChange={(next: unknown[]) => {
        const picked = next.at(-1)
        if (typeof picked === "string") onValueChange(picked)
      }}
      spacing={1}
      aria-label={ariaLabel}
      className={cn("bg-muted shrink-0 rounded-lg p-0.5", className)}
    >
      {views.map((view) => (
        <ToggleGroupItem
          key={view.value}
          value={view.value}
          className="text-muted-foreground aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:hover:bg-primary in-data-wrapped:grow h-8 px-3"
        >
          {view.icon}
          <ToolbarLabel>
            {view.label}
            {view.count != null ? (
              <>
                {" "}
                <Count value={view.count} />
              </>
            ) : null}
          </ToolbarLabel>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

/* ---------- Tabs (status tabs that filter the list) ---------- */

type ToolbarTab = { value: string; label: string; count?: number }

/** Tabs that filter the list by status, like Active, Monitor, Defaulted. Unlike views,
    they stay tabs at any number and scroll sideways when they do not fit. */
function ToolbarTabs({
  tabs,
  value,
  onValueChange,
  stretch = false,
  className,
  "aria-label": ariaLabel = "Status",
}: {
  tabs: ToolbarTab[]
  value: string
  onValueChange: (value: string) => void
  /** Fill the free space on the row, with tabs sharing it evenly. */
  stretch?: boolean
  className?: string
  "aria-label"?: string
}) {
  return (
    <div
      data-slot="toolbar-tabs"
      data-toolbar-fill=""
      className={cn(
        "max-w-full min-w-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        stretch ? "flex-[999_1_24rem]" : "shrink-0",
        className,
      )}
    >
      <ToggleGroup
        value={[value]}
        onValueChange={(next: unknown[]) => {
          const picked = next.at(-1)
          if (typeof picked === "string") onValueChange(picked)
        }}
        spacing={1}
        aria-label={ariaLabel}
        className={cn("bg-muted min-w-max rounded-lg p-0.5", stretch && "w-full")}
      >
        {tabs.map((tab) => (
          <ToggleGroupItem
            key={tab.value}
            value={tab.value}
            className={cn(
              "text-muted-foreground aria-pressed:bg-background aria-pressed:text-foreground aria-pressed:hover:bg-background dark:aria-pressed:bg-input/50 h-8 gap-1.5 px-3 aria-pressed:shadow-sm",
              stretch && "flex-[1_0_auto]",
            )}
          >
            {tab.label}
            <Count value={tab.count} />
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}

/* ---------- Count ---------- */

/** Result count text, for example "6,113 rows". Announced to screen readers when it changes. */
function ToolbarCount({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="toolbar-count"
      aria-live="polite"
      data-toolbar-label=""
      className={cn("text-muted-foreground shrink-0 px-1 text-sm whitespace-nowrap tabular-nums", className)}
      {...props}
    />
  )
}

/* ---------- Date range ---------- */

type ToolbarDateRangeValue = { from?: Date; to?: Date }

type ToolbarDatePreset = {
  id: string
  label: string
  /** Gets today's date (in the toolbar's time zone) and returns the range. */
  range: (today: Date) => { from: Date; to: Date }
}

const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
const startOfWeek = (d: Date) => addDays(d, -d.getDay())
const sameDay = (a?: Date, b?: Date) =>
  !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

/** Weeks start on Sunday. */
const defaultDatePresets: ToolbarDatePreset[] = [
  { id: "today", label: "Today", range: (t) => ({ from: t, to: t }) },
  { id: "yesterday", label: "Yesterday", range: (t) => ({ from: addDays(t, -1), to: addDays(t, -1) }) },
  { id: "this-week", label: "This week", range: (t) => ({ from: startOfWeek(t), to: t }) },
  {
    id: "last-week",
    label: "Last week",
    range: (t) => ({ from: addDays(startOfWeek(t), -7), to: addDays(startOfWeek(t), -1) }),
  },
  { id: "7-days", label: "7 days", range: (t) => ({ from: addDays(t, -6), to: t }) },
  {
    id: "this-month",
    label: "This month",
    range: (t) => ({ from: new Date(t.getFullYear(), t.getMonth(), 1), to: t }),
  },
  {
    id: "last-month",
    label: "Last month",
    range: (t) => ({
      from: new Date(t.getFullYear(), t.getMonth() - 1, 1),
      to: new Date(t.getFullYear(), t.getMonth(), 0),
    }),
  },
  { id: "30-days", label: "30 days", range: (t) => ({ from: addDays(t, -29), to: t }) },
]

/** Today's calendar date in an IANA time zone, as a local-midnight Date. */
function todayIn(timeZone: string): Date {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(new Date())
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value)
  return new Date(get("year"), get("month") - 1, get("day"))
}

function ToolbarDateRange({
  value,
  onValueChange,
  presets = defaultDatePresets,
  timeZone = "America/New_York",
  className,
}: {
  value: ToolbarDateRangeValue
  onValueChange: (value: ToolbarDateRangeValue) => void
  /** Quick ranges shown after the pickers. Pass [] to hide them. */
  presets?: ToolbarDatePreset[]
  /** Decides what "today" is for the presets. */
  timeZone?: string
  className?: string
}) {
  const today = todayIn(timeZone)
  const active = presets.find((p) => {
    const r = p.range(today)
    return sameDay(r.from, value.from) && sameDay(r.to, value.to)
  })
  return (
    <div
      data-slot="toolbar-date-range"
      className={cn("in-data-wrapped:*:grow flex flex-wrap items-center gap-2", className)}
    >
      {presets.length > 0 ? (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="outline"
                size="lg"
                aria-label="Date range presets"
                data-slot="toolbar-date-presets"
                className={triggerClass}
              />
            }
          >
            <CalendarRangeIcon aria-hidden="true" />
            <StableLabel
              active={active ? active.id : "__custom"}
              items={[...presets.map((p) => ({ key: p.id, node: p.label })), { key: "__custom", node: "Custom range" }]}
            />
            <Chevron />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuRadioGroup
              value={active ? active.id : ""}
              onValueChange={(v: unknown) => {
                const preset = presets.find((p) => p.id === v)
                if (preset) onValueChange(preset.range(today))
              }}
            >
              {presets.map((p) => (
                <DropdownMenuRadioItem key={p.id} value={p.id} closeOnClick>
                  {p.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
      <DateRangePicker value={value} onChange={onValueChange} />
    </div>
  )
}

/* ---------- Search ---------- */

function ToolbarSearch({
  className,
  placeholder = "Search",
  "aria-label": ariaLabel,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <div
      data-slot="toolbar-search"
      data-toolbar-fill=""
      className={cn("relative min-w-48 flex-[1_1_16rem]", className)}
    >
      <SearchIcon
        aria-hidden="true"
        className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
      />
      <Input
        type="search"
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        className="h-9 pl-9"
        {...props}
      />
    </div>
  )
}

/* ---------- Filter (dropdown) ---------- */

type ToolbarFilterOption = {
  value: string
  label: string
  /** Optional status color, shown as a dot before the label. Any CSS color or gradient. */
  color?: string
}

type FilterBase = {
  /** Shown before the value, as "Label: Value". Leave out to show the value alone. */
  label?: string
  options: ToolbarFilterOption[]
  icon?: React.ReactNode
  className?: string
}

type SingleFilterProps = FilterBase & {
  multiple?: false
  value: string
  onValueChange: (value: string) => void
}

type MultiFilterProps = FilterBase & {
  multiple: true
  values: string[]
  onValuesChange: (values: string[]) => void
  /** Shown when nothing is selected, for example "All statuses". */
  placeholder: string
}

type ToolbarFilterProps = SingleFilterProps | MultiFilterProps

function withLabel(label: string | undefined, text: React.ReactNode) {
  return (
    <span className="truncate">
      {label ? <span className="text-muted-foreground">{label}: </span> : null}
      {text}
    </span>
  )
}

/** A multi-select filter with more options than this gets a search box. */
const MENU_OPTION_LIMIT = 10

function ToolbarFilter(props: ToolbarFilterProps) {
  const { label, options, icon, className } = props

  let items: Array<{ key: string; node: React.ReactNode }>
  let active: string
  if (props.multiple) {
    const picked = options.filter((o) => props.values.includes(o.value))
    items = [
      { key: "__none", node: withLabel(label, props.placeholder) },
      ...options.map((o) => ({
        key: o.value,
        node: (
          <>
            <Dot color={o.color} />
            {withLabel(label, o.label)}
          </>
        ),
      })),
      ...options.slice(1).map((_, i) => ({ key: `__${i + 2}`, node: withLabel(label, `${i + 2} selected`) })),
    ]
    active =
      picked.length === 0 ? "__none" : picked.length === 1 ? (picked[0]?.value ?? "__none") : `__${picked.length}`
  } else {
    items = options.map((o) => ({
      key: o.value,
      node: (
        <>
          <Dot color={o.color} />
          {withLabel(label, o.label)}
        </>
      ),
    }))
    active = options.some((o) => o.value === props.value) ? props.value : (options[0]?.value ?? "")
  }

  // Long lists get a search box instead of a plain menu.
  if (props.multiple && options.length > MENU_OPTION_LIMIT) {
    return (
      <MultiSelect
        options={options}
        values={props.values}
        onValuesChange={props.onValuesChange}
        placeholder={props.placeholder}
        searchPlaceholder={label ? `Search ${label.toLowerCase()}` : "Search"}
        aria-label={label}
        className={cn(triggerClass, className)}
        trigger={
          <>
            {icon ?? (
              <StandInIcon>
                <ListFilterIcon />
              </StandInIcon>
            )}
            <StableLabel items={items} active={active} />
          </>
        }
      />
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="lg" data-slot="toolbar-filter" className={cn(triggerClass, className)} />
        }
      >
        {icon ?? (
          <StandInIcon>
            <ListFilterIcon />
          </StandInIcon>
        )}
        <StableLabel items={items} active={active} />
        <Chevron />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {props.multiple ? (
          <>
            {options.map((o) => (
              <DropdownMenuCheckboxItem
                key={o.value}
                className="gap-2"
                closeOnClick={false}
                checked={props.values.includes(o.value)}
                onCheckedChange={(on: boolean) =>
                  props.onValuesChange(on ? [...props.values, o.value] : props.values.filter((v) => v !== o.value))
                }
              >
                <Dot color={o.color} />
                {o.label}
              </DropdownMenuCheckboxItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled={props.values.length === 0}
              closeOnClick={false}
              onClick={() => props.onValuesChange([])}
              className="text-muted-foreground"
            >
              Clear selection
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuRadioGroup value={props.value} onValueChange={(v: unknown) => props.onValueChange(String(v))}>
            {options.map((o) => (
              <DropdownMenuRadioItem key={o.value} value={o.value} closeOnClick className="gap-2">
                <Dot color={o.color} />
                {o.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/* ---------- Filters dialog ---------- */

type ToolbarFilterGroup = {
  id: string
  label: string
  options: ToolbarFilterOption[]
  /** Allow more than one option. Default true. */
  multiple?: boolean
  /** Always keeps at least one option, like which data a report reads. No Clear, not counted on the
      Filters button, left as is by Clear all, and its last selected option can't be turned off. */
  required?: boolean
}

type ToolbarFilterValues = Record<string, string[]>

function ToolbarFilterDialog({
  filters,
  values,
  onValuesChange,
  title = "Filters",
  pillLimit = 8,
  description,
  className,
}: {
  filters: ToolbarFilterGroup[]
  values: ToolbarFilterValues
  onValuesChange: (values: ToolbarFilterValues) => void
  title?: string
  /** Groups with more options than this show a searchable dropdown instead of pills. */
  pillLimit?: number
  description?: string
  className?: string
}) {
  const count = filters.reduce((n, f) => n + (f.required ? 0 : (values[f.id]?.length ?? 0)), 0)

  const toggle = (group: ToolbarFilterGroup, option: string) => {
    const current = values[group.id] ?? []
    const on = current.includes(option)
    const next =
      group.multiple === false ? (on ? [] : [option]) : on ? current.filter((v) => v !== option) : [...current, option]
    if (group.required && next.length === 0) return
    onValuesChange({ ...values, [group.id]: next })
  }

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="lg"
            data-slot="toolbar-filter-dialog"
            className={cn(triggerClass, className)}
          />
        }
      >
        <SlidersHorizontalIcon aria-hidden="true" />
        <ToolbarLabel>Filters</ToolbarLabel>
        {/* Always takes its space, so the button keeps one width with or without a count. */}
        <span
          aria-hidden={count === 0 ? true : undefined}
          data-toolbar-badge=""
          className={cn(
            "bg-primary text-primary-foreground inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-medium tabular-nums",
            count === 0 && "invisible",
          )}
        >
          {count}
          <span className="sr-only"> active</span>
        </span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <div className="-mx-4 max-h-[60vh] flex flex-col gap-5 overflow-y-auto px-4 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {filters.map((group) => (
            <fieldset key={group.id} className="flex flex-col gap-2">
              {/* A legend is not a flex item, so the gap above does not reach it; it gets its own margin. */}
              <legend className="mb-2 flex w-full items-center justify-between gap-3 text-sm font-medium">
                <span>{group.label}</span>
                {/* Clear for this category only; shown while anything in it is selected. */}
                {!group.required && (values[group.id]?.length ?? 0) > 0 ? (
                  <button
                    type="button"
                    onClick={() => onValuesChange({ ...values, [group.id]: [] })}
                    className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 cursor-pointer rounded px-1 text-xs font-normal outline-none focus-visible:ring-2"
                    aria-label={`Clear ${group.label}`}
                  >
                    Clear
                  </button>
                ) : null}
              </legend>
              {group.multiple !== false && group.options.length > pillLimit ? (
                <MultiSelect
                  options={group.options}
                  values={values[group.id] ?? []}
                  onValuesChange={(next) => onValuesChange({ ...values, [group.id]: next })}
                  placeholder={`Any ${group.label.toLowerCase()}`}
                  searchPlaceholder={`Search ${group.label.toLowerCase()}`}
                  aria-label={group.label}
                  className="w-64 max-w-full"
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {group.options.map((o) => {
                    const on = (values[group.id] ?? []).includes(o.value)
                    return (
                      <Button
                        key={o.value}
                        type="button"
                        variant="outline"
                        aria-pressed={on}
                        onClick={() => toggle(group, o.value)}
                        className="aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-background aria-pressed:hover:bg-foreground/90 aria-pressed:hover:text-background dark:aria-pressed:border-foreground dark:aria-pressed:bg-foreground dark:aria-pressed:hover:bg-foreground/90 h-8 gap-2 rounded-full px-3 font-normal"
                      >
                        <Dot color={o.color} />
                        {o.label}
                      </Button>
                    )
                  })}
                </div>
              )}
            </fieldset>
          ))}
        </div>
        <DialogFooter>
          <Button
            variant="ghost"
            disabled={count === 0}
            onClick={() =>
              // Clear every category except the required ones, which keep their choice.
              onValuesChange(
                Object.fromEntries(filters.filter((f) => f.required).map((f) => [f.id, values[f.id] ?? []])),
              )
            }
          >
            Clear all
          </Button>
          <DialogClose render={<Button />}>Done</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ---------- Active filters (chips under the bar) ---------- */

type ToolbarActiveFilter = {
  /** Unique key, for example "status:active". */
  id: string
  /** The filter's name, for example "Status". */
  label: string
  /** The applied value, for example "Working". */
  value: string
  onRemove: () => void
}

/** Shows each applied filter as a chip with a remove button, plus "Clear all".
    Renders nothing when no filter is applied. */
function ToolbarActiveFilters({
  items,
  onClearAll,
  className,
}: {
  items: ToolbarActiveFilter[]
  onClearAll: () => void
  className?: string
}) {
  if (items.length === 0) return null
  return (
    <div
      data-slot="toolbar-active-filters"
      aria-label="Applied filters"
      role="group"
      className={cn("mt-2 flex flex-wrap items-center gap-2", className)}
    >
      {items.map((item) => (
        <span
          key={item.id}
          className="bg-primary/5 dark:bg-primary/10 border-primary/15 inline-flex h-7 items-center gap-1.5 rounded-md border pr-1 pl-2.5 text-sm"
        >
          <span className="text-muted-foreground">{item.label}</span>
          <span className="font-medium">{item.value}</span>
          <button
            type="button"
            onClick={item.onRemove}
            aria-label={`Remove ${item.label} ${item.value}`}
            className="text-muted-foreground hover:bg-foreground/10 hover:text-foreground focus-visible:ring-ring/50 inline-flex size-5 items-center justify-center rounded outline-none focus-visible:ring-2"
          >
            <XIcon aria-hidden="true" className="size-3.5" />
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 h-7 rounded-md px-1.5 text-sm outline-none hover:underline focus-visible:ring-2"
      >
        Clear all
      </button>
    </div>
  )
}

/** Builds chips from filter groups and one values record (the same shape ToolbarFilterDialog uses). */
function activeFilterItems(
  filters: ToolbarFilterGroup[],
  values: ToolbarFilterValues,
  onValuesChange: (values: ToolbarFilterValues) => void,
): ToolbarActiveFilter[] {
  return filters.flatMap((group) =>
    (values[group.id] ?? []).map((v) => ({
      id: `${group.id}:${v}`,
      label: group.label,
      value: group.options.find((o) => o.value === v)?.label ?? v,
      onRemove: () => onValuesChange({ ...values, [group.id]: (values[group.id] ?? []).filter((x) => x !== v) }),
    })),
  )
}

/* ---------- Saved views ---------- */

type ToolbarSavedView = { id: string; name: string }

/*
 * Named snapshots of a list's filters, search and sort, for interactive
 * viewing. (Saving a report on a reports page is a different feature.)
 * The app stores views on the user's profile; this only shows them and
 * reports what the user picked, saved, updated or deleted.
 */
function ToolbarSavedViews({
  views,
  activeId,
  modified = false,
  defaultLabel = "Default",
  onSelect,
  onSave,
  onUpdate,
  onDelete,
  className,
}: {
  views: ToolbarSavedView[]
  /** The view in use, or null for the default unfiltered list. */
  activeId: string | null
  /** The filters changed since the active view was opened. */
  modified?: boolean
  defaultLabel?: string
  onSelect: (id: string | null) => void
  onSave: (name: string) => void
  onUpdate?: (id: string) => void
  onDelete?: (id: string) => void
  className?: string
}) {
  const [saving, setSaving] = React.useState(false)
  const [name, setName] = React.useState("")
  const active = views.find((v) => v.id === activeId)
  const taken = views.some((v) => v.name.trim().toLowerCase() === name.trim().toLowerCase())
  const canSave = name.trim().length > 0 && !taken

  const save = () => {
    if (!canSave) return
    onSave(name.trim())
    setName("")
    setSaving(false)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="outline"
              size="lg"
              data-slot="toolbar-saved-views"
              className={cn(triggerClass, className)}
            />
          }
        >
          <BookmarkIcon aria-hidden="true" />
          {/* Saved view names are typed by people and can be any length, so the
              trigger is sized to the default name only; longer names are cut
              with "..." and shown in full on hover. */}
          <span
            data-toolbar-label=""
            className="relative flex min-w-0 text-left"
            title={activeId ? views.find((v) => v.id === activeId)?.name : undefined}
          >
            <span aria-hidden="true" className="invisible flex">
              {withLabel("View", defaultLabel)}
            </span>
            <span className="absolute inset-0 flex min-w-0 overflow-hidden">
              {withLabel("View", (activeId && views.find((v) => v.id === activeId)?.name) || defaultLabel)}
            </span>
          </span>
          <Chevron />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="max-w-72">
          <DropdownMenuRadioGroup
            value={activeId ?? "__default"}
            onValueChange={(v: unknown) => onSelect(v === "__default" ? null : String(v))}
          >
            <DropdownMenuRadioItem value="__default" closeOnClick>
              {defaultLabel}
            </DropdownMenuRadioItem>
            {views.map((v) => (
              <DropdownMenuRadioItem key={v.id} value={v.id} closeOnClick className="group/view pr-14">
                <span className="truncate">{v.name}</span>
                {onDelete ? (
                  <button
                    type="button"
                    aria-label={`Delete view ${v.name}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(v.id)
                    }}
                    className="text-muted-foreground hover:text-destructive absolute right-7 flex size-6 items-center justify-center rounded opacity-0 group-hover/view:opacity-100 focus-visible:opacity-100"
                  >
                    <Trash2Icon className="size-3.5" />
                  </button>
                ) : null}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          {active && modified && onUpdate ? (
            <DropdownMenuItem onClick={() => onUpdate(active.id)}>
              <SaveIcon />
              Update "{active.name}"
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem onClick={() => setSaving(true)}>
            <BookmarkIcon />
            Save current view as...
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={saving} onOpenChange={setSaving}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Save view</DialogTitle>
            <DialogDescription>
              Saves the current filters, search and sort under a name you can pick later.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              save()
            }}
            className="flex flex-col gap-2"
          >
            <label htmlFor="toolbar-view-name" className="text-sm font-medium">
              Name
            </label>
            <Input
              id="toolbar-view-name"
              autoFocus
              value={name}
              maxLength={60}
              placeholder="For example: My open deals"
              onChange={(e) => setName(e.target.value)}
              aria-invalid={taken || undefined}
            />
            {taken ? <p className="text-destructive text-xs">A view with this name already exists.</p> : null}
          </form>
          <DialogFooter>
            <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
            <Button disabled={!canSave} onClick={save}>
              Save view
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

/* ---------- Report library ---------- */

type ToolbarReportCategory = { id: string; name: string }
type ToolbarReport = { id: string; name: string; categoryId?: string | null }

const UNCATEGORIZED = "__uncategorized"

/*
 * A reports page's saved reports, grouped in categories: the Reports menu
 * (categories on the left, the category's reports as tiles on the right),
 * Save as report with a name and a category, Update report and Save as new
 * once the open report has unsaved changes (all inside the menu), and rename and delete for both
 * reports and categories. Reports whose category was deleted show under
 * Uncategorized. On phones the two sides of the menu stack.
 *
 * The app stores reports and categories and passes them back in; this only
 * shows them and reports what the user did. Leave out a handler to hide that
 * action (for example no onDeleteCategory for people who can't delete).
 */
function ToolbarReportLibrary({
  reports,
  categories,
  activeId,
  modified = false,
  canSave = true,
  noneLabel = "None",
  onSelect,
  onSave,
  onUpdate,
  onRename,
  onDelete,
  onCreateCategory,
  onRenameCategory,
  onDeleteCategory,
  className,
}: {
  reports: ToolbarReport[]
  categories: ToolbarReportCategory[]
  /** The open report, or null when none is open. */
  activeId: string | null
  /** The open report was changed since it was opened. Shows Update report and Save as new. */
  modified?: boolean
  /** There is something worth saving (filters or columns differ from the plain page). */
  canSave?: boolean
  /** Trigger text when no report is open. */
  noneLabel?: string
  onSelect: (id: string | null) => void
  onSave: (report: { name: string; categoryId: string | null }) => void
  onUpdate?: (id: string) => void
  onRename?: (id: string, name: string) => void
  onDelete?: (id: string) => void
  onCreateCategory?: (name: string) => void
  onRenameCategory?: (id: string, name: string) => void
  onDeleteCategory?: (id: string) => void
  className?: string
}) {
  const [open, setOpen] = React.useState(false)
  const active = reports.find((r) => r.id === activeId) ?? null
  const hasLoose = reports.some((r) => !r.categoryId || !categories.some((c) => c.id === r.categoryId))
  const allCategories = hasLoose ? [...categories, { id: UNCATEGORIZED, name: "Uncategorized" }] : categories
  const categoryOf = (r: ToolbarReport) =>
    r.categoryId && categories.some((c) => c.id === r.categoryId) ? r.categoryId : UNCATEGORIZED
  const [category, setCategory] = React.useState<string>(
    (active && categoryOf(active)) || allCategories[0]?.id || UNCATEGORIZED,
  )
  // Opening the menu shows the open report's category.
  React.useEffect(() => {
    if (open && active) setCategory(categoryOf(active))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])
  const inCategory = reports.filter((r) => categoryOf(r) === category)

  // Dialogs
  type Pending =
    | { kind: "save"; asNew: boolean }
    | { kind: "update"; id: string }
    | { kind: "rename"; id: string }
    | { kind: "delete"; id: string }
    | { kind: "newCategory" }
    | { kind: "renameCategory"; id: string }
    | { kind: "deleteCategory"; id: string }
    | null
  const [pending, setPending] = React.useState<Pending>(null)
  const [name, setName] = React.useState("")
  const [saveCategory, setSaveCategory] = React.useState<string | null>(null)
  const ask = (p: NonNullable<Pending>, initialName = "") => {
    setName(initialName)
    setSaveCategory(category === UNCATEGORIZED ? (categories[0]?.id ?? null) : category)
    setOpen(false)
    setPending(p)
  }
  const close = () => setPending(null)
  const nameOf = (id: string) => reports.find((r) => r.id === id)?.name ?? ""
  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? ""
  const trimmed = name.trim()
  const reportTaken = (exceptId?: string) =>
    reports.some((r) => r.id !== exceptId && r.name.trim().toLowerCase() === trimmed.toLowerCase())
  const categoryTaken = (exceptId?: string) =>
    categories.some((c) => c.id !== exceptId && c.name.trim().toLowerCase() === trimmed.toLowerCase())

  const saveActions =
    active && modified ? (
      <>
        {onUpdate ? (
          <Button size="sm" onClick={() => ask({ kind: "update", id: active.id })}>
            Update report
          </Button>
        ) : null}
        <Button size="sm" variant="outline" onClick={() => ask({ kind: "save", asNew: true })}>
          Save as new
        </Button>
      </>
    ) : canSave && !active ? (
      <Button size="sm" onClick={() => ask({ kind: "save", asNew: false })}>
        Save as report
      </Button>
    ) : null

  const tile = (on: boolean) =>
    cn(
      "border-border bg-background hover:bg-muted focus-visible:ring-ring/50 relative flex min-h-12 w-full cursor-pointer items-center rounded-lg border px-2.5 py-2 text-left text-sm font-medium transition-colors outline-none focus-visible:ring-3",
      on && "border-foreground bg-foreground text-background hover:bg-foreground/90",
    )

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              size="lg"
              data-slot="toolbar-report-library"
              className={cn(triggerClass, className)}
            />
          }
        >
          <FolderOpenIcon aria-hidden="true" />
          {/* Sized to "Report: None"; longer report names are cut with "..." and shown in full on hover. */}
          <span data-toolbar-label="" className="relative flex min-w-0 text-left" title={active?.name}>
            <span aria-hidden="true" className="invisible flex">
              {withLabel("Report", noneLabel)}
            </span>
            <span className="absolute inset-0 flex min-w-0 overflow-hidden">
              {withLabel("Report", active?.name ?? noneLabel)}
            </span>
          </span>
          <Chevron />
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[min(52rem,calc(100vw-2rem))] max-w-[min(52rem,calc(100vw-2rem))] gap-0 p-0"
        >
          <div className="flex min-h-56 flex-col sm:flex-row">
            <div className="flex shrink-0 flex-col border-b p-2 sm:w-52 sm:border-r sm:border-b-0">
              <div className="mb-2 flex items-center gap-1 px-1">
                <p className="text-muted-foreground min-w-0 flex-1 text-xs font-medium tracking-wide uppercase">
                  Categories
                </p>
                {onCreateCategory ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label="New category"
                    onClick={() => ask({ kind: "newCategory" })}
                  >
                    <PlusIcon />
                  </Button>
                ) : null}
              </div>
              <div className="flex flex-col gap-1">
                {allCategories.map((c) => (
                  <div key={c.id} className="flex items-center gap-1">
                    <button
                      type="button"
                      onMouseEnter={() => setCategory(c.id)}
                      onFocus={() => setCategory(c.id)}
                      onClick={() => setCategory(c.id)}
                      className={cn(
                        "hover:bg-muted focus-visible:ring-ring/50 min-w-0 flex-1 cursor-pointer truncate rounded-md px-2 py-1.5 text-left text-sm outline-none focus-visible:ring-3",
                        c.id === category && "bg-muted text-foreground font-medium",
                      )}
                    >
                      {c.name}
                    </button>
                    {c.id !== UNCATEGORIZED && (onRenameCategory || onDeleteCategory) ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          aria-label={`${c.name} options`}
                          className="text-muted-foreground hover:bg-muted inline-flex size-6 cursor-pointer items-center justify-center rounded-md"
                        >
                          <EllipsisVerticalIcon className="size-3.5" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          {onRenameCategory ? (
                            <DropdownMenuItem onClick={() => ask({ kind: "renameCategory", id: c.id }, c.name)}>
                              Rename
                            </DropdownMenuItem>
                          ) : null}
                          {onDeleteCategory ? (
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => ask({ kind: "deleteCategory", id: c.id })}
                            >
                              Delete
                            </DropdownMenuItem>
                          ) : null}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : null}
                  </div>
                ))}
                {allCategories.length === 0 ? (
                  <p className="text-muted-foreground px-2 py-1.5 text-sm">No categories yet</p>
                ) : null}
              </div>
            </div>
            <div className="min-w-0 flex-1 p-2">
              {inCategory.length === 0 ? (
                <p className="text-muted-foreground px-2 py-6 text-center text-sm">No reports in this category</p>
              ) : (
                <div className="grid grid-cols-1 items-stretch gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {inCategory.map((r) => (
                    <div key={r.id} className="flex items-stretch gap-1">
                      <button
                        type="button"
                        className={tile(r.id === activeId)}
                        onClick={() => {
                          onSelect(r.id === activeId ? null : r.id)
                          setOpen(false)
                        }}
                      >
                        <span className="min-w-0 break-words">{r.name}</span>
                      </button>
                      {onRename || onDelete ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            aria-label={`${r.name} options`}
                            className="text-muted-foreground hover:bg-muted inline-flex size-6 shrink-0 cursor-pointer items-center justify-center self-center rounded-md"
                          >
                            <EllipsisVerticalIcon className="size-3.5" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {onRename ? (
                              <DropdownMenuItem onClick={() => ask({ kind: "rename", id: r.id }, r.name)}>
                                Rename
                              </DropdownMenuItem>
                            ) : null}
                            {onDelete ? (
                              <DropdownMenuItem variant="destructive" onClick={() => ask({ kind: "delete", id: r.id })}>
                                Delete
                              </DropdownMenuItem>
                            ) : null}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 border-t p-2">
            {saveActions}
            {active ? (
              <Button
                size="sm"
                variant="ghost"
                className="ml-auto"
                onClick={() => {
                  onSelect(null)
                  setOpen(false)
                }}
              >
                Close report
              </Button>
            ) : null}
          </div>
        </PopoverContent>
      </Popover>

      {/* Name dialogs: save, rename, new category, rename category */}
      <Dialog
        open={
          pending?.kind === "save" ||
          pending?.kind === "rename" ||
          pending?.kind === "newCategory" ||
          pending?.kind === "renameCategory"
        }
        onOpenChange={(o: boolean) => !o && close()}
      >
        <DialogContent className="sm:max-w-sm">
          {(() => {
            if (!pending) return null
            const isCategory = pending.kind === "newCategory" || pending.kind === "renameCategory"
            const taken = isCategory
              ? categoryTaken(pending.kind === "renameCategory" ? pending.id : undefined)
              : reportTaken(pending.kind === "rename" ? pending.id : undefined)
            const ok = trimmed.length > 0 && !taken
            const title =
              pending.kind === "save"
                ? pending.asNew
                  ? "Save as new report"
                  : "Save as report"
                : pending.kind === "rename"
                  ? "Rename report"
                  : pending.kind === "newCategory"
                    ? "New category"
                    : "Rename category"
            const submit = () => {
              if (!ok) return
              if (pending.kind === "save") onSave({ name: trimmed, categoryId: saveCategory })
              if (pending.kind === "rename") onRename?.(pending.id, trimmed)
              if (pending.kind === "newCategory") onCreateCategory?.(trimmed)
              if (pending.kind === "renameCategory") onRenameCategory?.(pending.id, trimmed)
              close()
            }
            return (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  submit()
                }}
                className="flex flex-col gap-4"
              >
                <DialogHeader>
                  <DialogTitle>{title}</DialogTitle>
                  {pending.kind === "save" ? (
                    <DialogDescription>Saves the data, filters, dates, search, columns and sort.</DialogDescription>
                  ) : null}
                </DialogHeader>
                <div className="flex flex-col gap-2">
                  <label htmlFor="toolbar-report-name" className="text-sm font-medium">
                    Name
                  </label>
                  <Input
                    id="toolbar-report-name"
                    autoFocus
                    value={name}
                    maxLength={80}
                    onChange={(e) => setName(e.target.value)}
                    aria-invalid={taken || undefined}
                  />
                  {taken ? (
                    <p className="text-destructive text-xs">
                      {isCategory ? "A category" : "A report"} with this name already exists.
                    </p>
                  ) : null}
                </div>
                {pending.kind === "save" && categories.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium">Category</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full justify-between font-normal"
                            aria-label="Category"
                          />
                        }
                      >
                        <span className="truncate">{saveCategory ? categoryName(saveCategory) : "Uncategorized"}</span>
                        <ChevronDownIcon aria-hidden="true" className="text-muted-foreground" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuRadioGroup
                          value={saveCategory ?? UNCATEGORIZED}
                          onValueChange={(v: unknown) => setSaveCategory(v === UNCATEGORIZED ? null : String(v))}
                        >
                          {categories.map((c) => (
                            <DropdownMenuRadioItem key={c.id} value={c.id} closeOnClick>
                              {c.name}
                            </DropdownMenuRadioItem>
                          ))}
                          <DropdownMenuRadioItem value={UNCATEGORIZED} closeOnClick>
                            Uncategorized
                          </DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ) : null}
                <DialogFooter>
                  <DialogClose render={<Button type="button" variant="ghost" />}>Cancel</DialogClose>
                  <Button type="submit" disabled={!ok}>
                    Save
                  </Button>
                </DialogFooter>
              </form>
            )
          })()}
        </DialogContent>
      </Dialog>

      {/* Confirm dialogs: update, delete report, delete category */}
      <Dialog
        open={pending?.kind === "update" || pending?.kind === "delete" || pending?.kind === "deleteCategory"}
        onOpenChange={(o: boolean) => !o && close()}
      >
        <DialogContent className="sm:max-w-sm">
          {pending?.kind === "update" ? (
            <>
              <DialogHeader>
                <DialogTitle>Update report</DialogTitle>
                <DialogDescription>
                  Replace "{nameOf(pending.id)}" with the current data, filters, dates, search, columns and sort?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
                <Button
                  onClick={() => {
                    onUpdate?.(pending.id)
                    close()
                  }}
                >
                  Update
                </Button>
              </DialogFooter>
            </>
          ) : pending?.kind === "delete" ? (
            <>
              <DialogHeader>
                <DialogTitle>Delete report</DialogTitle>
                <DialogDescription>Delete "{nameOf(pending.id)}"? This can't be undone.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
                <Button
                  variant="destructive"
                  onClick={() => {
                    onDelete?.(pending.id)
                    close()
                  }}
                >
                  Delete
                </Button>
              </DialogFooter>
            </>
          ) : pending?.kind === "deleteCategory" ? (
            <>
              <DialogHeader>
                <DialogTitle>Delete category</DialogTitle>
                <DialogDescription>
                  Delete "{categoryName(pending.id)}"? Its reports are kept and move to Uncategorized.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
                <Button
                  variant="destructive"
                  onClick={() => {
                    onDeleteCategory?.(pending.id)
                    if (category === pending.id) setCategory(UNCATEGORIZED)
                    close()
                  }}
                >
                  Delete
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}

/* ---------- Export ---------- */

type ToolbarExportFormat = { value: string; label: string; description?: string }

const DEFAULT_EXPORT_FORMATS: ToolbarExportFormat[] = [
  { value: "csv", label: "CSV", description: "Spreadsheet for Excel or Sheets" },
  { value: "pdf", label: "PDF", description: "Printable document" },
]

type ToolbarExportEmail = { to: string[]; format: string; message: string }

/**
 * Export button that asks which format before exporting. With onEmail, the menu
 * also has Email: it opens a dialog to send the file to one or more people.
 */
function ToolbarExport({
  onExport,
  onEmail,
  formats = DEFAULT_EXPORT_FORMATS,
  label = "Export",
  className,
}: {
  onExport: (format: string) => void
  /** Sends the export by email. Return a promise to show "Sending..." until it settles. */
  onEmail?: (email: ToolbarExportEmail) => void | Promise<void>
  formats?: ToolbarExportFormat[]
  label?: string
  className?: string
}) {
  const [emailOpen, setEmailOpen] = React.useState(false)
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button size="lg" data-slot="toolbar-export" className={cn("shrink-0 gap-2", className)} />}
        >
          <DownloadIcon aria-hidden="true" />
          <ToolbarLabel>{label}</ToolbarLabel>
          <ChevronDownIcon aria-hidden="true" data-toolbar-chevron="" className="ml-auto opacity-70" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-auto">
          {formats.map((f) => (
            <DropdownMenuItem key={f.value} onClick={() => onExport(f.value)} className="items-start py-1.5">
              {f.value === "pdf" ? <FileTextIcon className="mt-0.5" /> : <FileSpreadsheetIcon className="mt-0.5" />}
              <span className="flex flex-col">
                <span className="font-medium">{f.label}</span>
                {f.description ? <span className="text-muted-foreground text-xs">{f.description}</span> : null}
              </span>
            </DropdownMenuItem>
          ))}
          {onEmail ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setEmailOpen(true)} className="items-start py-1.5">
                <MailIcon className="mt-0.5" />
                <span className="flex flex-col">
                  <span className="font-medium">Email</span>
                  <span className="text-muted-foreground text-xs">Send the file to people</span>
                </span>
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
      {onEmail ? (
        <ExportEmailDialog open={emailOpen} onOpenChange={setEmailOpen} formats={formats} onSend={onEmail} />
      ) : null}
    </>
  )
}

function ExportEmailDialog({
  open,
  onOpenChange,
  formats,
  onSend,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  formats: ToolbarExportFormat[]
  onSend: (email: ToolbarExportEmail) => void | Promise<void>
}) {
  const [to, setTo] = React.useState<string[]>([])
  const [format, setFormat] = React.useState(formats[0]?.value ?? "")
  const [message, setMessage] = React.useState("")
  const [sending, setSending] = React.useState(false)
  const [error, setError] = React.useState("")
  const ids = React.useId()

  // Start fresh each time the dialog opens.
  React.useEffect(() => {
    if (open) {
      setTo([])
      setFormat(formats[0]?.value ?? "")
      setMessage("")
      setError("")
      setSending(false)
    }
  }, [open, formats])

  const bad = to.filter((e) => !isEmail(e))
  const canSend = to.length > 0 && bad.length === 0 && !sending

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSend) return
    setSending(true)
    setError("")
    try {
      await onSend({ to, format, message: message.trim() })
      onOpenChange(false)
    } catch {
      setError("Couldn't send the email. Try again.")
      setSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={submit} className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle>Email this export</DialogTitle>
            <DialogDescription>Send the file to one or more people.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <label htmlFor={`${ids}-to`} className="text-sm font-medium">
              To
            </label>
            <EmailInput id={`${ids}-to`} value={to} onValueChange={setTo} aria-describedby={`${ids}-to-help`} />
            <p
              id={`${ids}-to-help`}
              className={cn("text-xs", bad.length ? "text-destructive" : "text-muted-foreground")}
            >
              {bad.length
                ? `Fix or remove ${bad.length === 1 ? "the address" : "the addresses"} in red.`
                : "Separate addresses with Enter, a comma or a space."}
            </p>
          </div>
          {formats.length > 1 ? (
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-sm font-medium">Format</legend>
              <div role="radiogroup" aria-label="Format" className="bg-muted flex w-fit rounded-md p-0.5">
                {formats.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    role="radio"
                    aria-checked={format === f.value}
                    onClick={() => setFormat(f.value)}
                    className="text-muted-foreground aria-checked:bg-background aria-checked:text-foreground focus-visible:ring-ring/50 h-7 cursor-pointer rounded px-3 text-sm outline-none focus-visible:ring-2 aria-checked:shadow-sm"
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </fieldset>
          ) : null}
          <div className="flex flex-col gap-2">
            <label htmlFor={`${ids}-msg`} className="text-sm font-medium">
              Message <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <textarea
              id={`${ids}-msg`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="border-input dark:bg-input/30 placeholder:text-muted-foreground min-h-20 w-full resize-y rounded-lg border bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:shadow-[0_0_0_2px_color-mix(in_oklch,var(--foreground)_8%,transparent),0_0_5px_color-mix(in_oklch,var(--foreground)_12%,transparent)]"
            />
          </div>
          {error ? (
            <p role="alert" className="text-destructive text-sm">
              {error}
            </p>
          ) : null}
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="ghost" />}>Cancel</DialogClose>
            <Button type="submit" disabled={!canSend}>
              <MailIcon aria-hidden="true" />
              {sending ? "Sending..." : to.length > 1 ? `Send to ${to.length} people` : "Send"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/* ---------- Actions ---------- */

function ToolbarActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="toolbar-actions"
      className={cn("ml-auto flex shrink-0 flex-wrap items-center gap-2", className)}
      {...props}
    />
  )
}

export {
  Toolbar,
  ToolbarReportLibrary,
  ToolbarLabel,
  ToolbarActions,
  ToolbarActiveFilters,
  ToolbarCount,
  ToolbarDateRange,
  ToolbarExport,
  ToolbarFilter,
  ToolbarFilterDialog,
  ToolbarSavedViews,
  ToolbarSearch,
  ToolbarTabs,
  ToolbarViews,
  activeFilterItems,
  defaultDatePresets,
}
export type {
  ToolbarReport,
  ToolbarReportCategory,
  ToolbarActiveFilter,
  ToolbarSavedView,
  ToolbarExportFormat,
  ToolbarDatePreset,
  ToolbarExportEmail,
  ToolbarDateRangeValue,
  ToolbarTab,
  ToolbarFilterGroup,
  ToolbarFilterOption,
  ToolbarFilterProps,
  ToolbarFilterValues,
  ToolbarView,
}
