"use client"

import * as React from "react"
import { ChevronDownIcon, SearchIcon, SlidersHorizontalIcon, XIcon } from "lucide-react"
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
import { DatePicker } from "@/components/ui/date-picker"
import { Input } from "@/components/ui/input"
import { MultiSelect } from "@/components/ui/multi-select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

/*
 * The bar that sits on top of a list, table, or board.
 * One component, built from parts. A page includes only the parts it needs:
 *
 *   <Toolbar>
 *     <ToolbarViews />         Board / List. Four or more views become a dropdown.
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

function Toolbar({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="toolbar"
      data-slot="toolbar"
      className={cn(
        "bg-card text-card-foreground flex w-full flex-wrap items-center gap-2 rounded-xl border p-2",
        className,
      )}
      {...props}
    />
  )
}

/* Lays every possible text in one grid cell and shows only the active one,
   so the box is always as wide as the longest text. */
function StableLabel({ items, active }: { items: Array<{ key: string; node: React.ReactNode }>; active: string }) {
  return (
    <span className="grid text-left">
      {items.map((item) => (
        <span
          key={item.key}
          aria-hidden={item.key === active ? undefined : true}
          className={cn("col-start-1 row-start-1 flex items-center gap-2", item.key !== active && "invisible")}
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

const triggerClass = "shrink-0 gap-2 font-normal"

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
          <ChevronDownIcon aria-hidden="true" className="text-muted-foreground" />
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
          className="text-muted-foreground aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:hover:bg-primary h-8 px-3"
        >
          {view.icon}
          {view.label}
          <Count value={view.count} />
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
      className={cn("max-w-full min-w-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", stretch ? "flex-[999_1_24rem]" : "shrink-0", className)}
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
    <div data-slot="toolbar-date-range" className={cn("flex flex-wrap items-center gap-2", className)}>
      <DatePicker
        label="From"
        placeholder="Any"
        size="lg"
        className="w-44"
        value={value.from}
        max={value.to}
        onChange={(from) => onValueChange({ ...value, from })}
      />
      <DatePicker
        label="To"
        placeholder="Any"
        size="lg"
        className="w-40"
        value={value.to}
        min={value.from}
        onChange={(to) => onValueChange({ ...value, to })}
      />
      {presets.length > 0 ? (
        <ToggleGroup
          value={active ? [active.id] : []}
          onValueChange={(next: unknown[]) => {
            const preset = presets.find((p) => p.id === next.at(-1))
            if (preset) onValueChange(preset.range(today))
          }}
          spacing={1}
          aria-label="Date presets"
          className="flex-wrap"
        >
          {presets.map((p) => (
            <ToggleGroupItem
              key={p.id}
              value={p.id}
              variant="outline"
              className="aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:border-primary aria-pressed:hover:bg-primary h-8 px-2.5"
            >
              {p.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      ) : null}
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
    <div data-slot="toolbar-search" className={cn("relative min-w-48 flex-[1_1_16rem]", className)}>
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
    <span>
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
            {icon}
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
        {icon}
        <StableLabel items={items} active={active} />
        <ChevronDownIcon aria-hidden="true" className="text-muted-foreground" />
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
  const count = filters.reduce((n, f) => n + (values[f.id]?.length ?? 0), 0)

  const toggle = (group: ToolbarFilterGroup, option: string) => {
    const current = values[group.id] ?? []
    const on = current.includes(option)
    const next =
      group.multiple === false ? (on ? [] : [option]) : on ? current.filter((v) => v !== option) : [...current, option]
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
        Filters
        {/* Always takes its space, so the button keeps one width with or without a count. */}
        <span
          aria-hidden={count === 0 ? true : undefined}
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
        <div className="-mx-4 max-h-[60vh] space-y-5 overflow-y-auto px-4 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {filters.map((group) => (
            <fieldset key={group.id} className="space-y-2">
              <legend className="text-sm font-medium">{group.label}</legend>
              {group.multiple !== false && group.options.length > pillLimit ? (
                <MultiSelect
                  options={group.options}
                  values={values[group.id] ?? []}
                  onValuesChange={(next) => onValuesChange({ ...values, [group.id]: next })}
                  placeholder={`Any ${group.label.toLowerCase()}`}
                  searchPlaceholder={`Search ${group.label.toLowerCase()}`}
                  aria-label={group.label}
                  className="w-full"
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
                        className="aria-pressed:border-primary aria-pressed:bg-primary/10 aria-pressed:text-foreground dark:aria-pressed:bg-primary/20 h-8 gap-2 rounded-full px-3 font-normal"
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
          <Button variant="ghost" disabled={count === 0} onClick={() => onValuesChange({})}>
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
  ToolbarActions,
  ToolbarActiveFilters,
  ToolbarCount,
  ToolbarDateRange,
  ToolbarFilter,
  ToolbarFilterDialog,
  ToolbarSearch,
  ToolbarTabs,
  ToolbarViews,
  activeFilterItems,
  defaultDatePresets,
}
export type {
  ToolbarActiveFilter,
  ToolbarDatePreset,
  ToolbarDateRangeValue,
  ToolbarTab,
  ToolbarFilterGroup,
  ToolbarFilterOption,
  ToolbarFilterProps,
  ToolbarFilterValues,
  ToolbarView,
}
