"use client"

import * as React from "react"
import { ArrowRightIcon, CalendarIcon, ChevronDownIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DateInput, formatDate } from "@/components/ui/date-picker"

/*
 * One field for a start and end date that opens two months side by side,
 * like picking flights. The first click sets the start, the second sets the
 * end; while choosing the end, hovering previews the range. The header shows
 * both dates and highlights the one being picked; after the end is picked it
 * stays on End.
 *
 * Pass presets to add a Period dropdown at the top (Today, This month...).
 * Picking a period sets the range and closes the picker. The field then shows
 * the period's name; any other range shows its dates.
 */

type DateRange = { from?: Date; to?: Date }

type DateRangePreset = {
  id: string
  /** Text, or text worked out from today (for "Q2 2026"). */
  label: string | ((today: Date) => string)
  /** Gets today's date (in the picker's time zone) and returns the range. */
  range: (today: Date) => { from: Date; to: Date }
  /** Heading the period sits under in the Period menu, such as "Days". */
  group?: string
  /** Which column of the Period menu its group goes in, from 1. */
  column?: number
}

const presetLabel = (p: DateRangePreset, today: Date) => (typeof p.label === "function" ? p.label(today) : p.label)

const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
const startOfWeek = (d: Date) => addDays(d, -d.getDay())
const sameDay = (a?: Date, b?: Date) =>
  !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
/** The quarter n quarters before today's (0 is this quarter): its first and last day. */
const quarterOf = (t: Date, back: number) => {
  const first = new Date(t.getFullYear(), Math.floor(t.getMonth() / 3) * 3 - back * 3, 1)
  return { from: first, to: new Date(first.getFullYear(), first.getMonth() + 3, 0), q: Math.floor(first.getMonth() / 3) + 1 }
}
/** The last n days, today included. */
const lastDays = (t: Date, n: number) => ({ from: addDays(t, -(n - 1)), to: t })
/** From the same day n months back (plus one) to today. */
const lastMonths = (t: Date, n: number) => ({ from: addDays(new Date(t.getFullYear(), t.getMonth() - n, t.getDate()), 1), to: t })

/*
 * The standard periods, in three columns: Days | Weeks and Months | Quarters
 * and Years. "N days" and "N weeks" end today, and count today. Weeks start on
 * Sunday. "This ..." runs from the start of the period to today.
 */
const defaultDatePresets: DateRangePreset[] = [
  // Days
  ...([
    { id: "today", label: "Today", range: (t: Date) => ({ from: t, to: t }) },
    { id: "yesterday", label: "Yesterday", range: (t: Date) => ({ from: addDays(t, -1), to: addDays(t, -1) }) },
    { id: "24h", label: "24h", range: (t: Date) => ({ from: addDays(t, -1), to: t }) },
    ...[3, 7, 14, 30, 60, 90, 120].map((n) => ({
      id: `${n}-days`,
      label: `${n} days`,
      range: (t: Date) => lastDays(t, n),
    })),
  ] as DateRangePreset[]).map((p) => ({ ...p, group: "Days", column: 1 })),
  // Weeks
  ...([
    { id: "this-week", label: "This week", range: (t: Date) => ({ from: startOfWeek(t), to: t }) },
    {
      id: "last-week",
      label: "Last week",
      range: (t: Date) => ({ from: addDays(startOfWeek(t), -7), to: addDays(startOfWeek(t), -1) }),
    },
    ...[1, 2, 3, 4].map((n) => ({
      id: `${n}-weeks`,
      label: n === 1 ? "1 week" : `${n} weeks`,
      range: (t: Date) => lastDays(t, n * 7),
    })),
  ] as DateRangePreset[]).map((p) => ({ ...p, group: "Weeks", column: 2 })),
  // Months
  ...([
    {
      id: "this-month",
      label: "This month",
      range: (t: Date) => ({ from: new Date(t.getFullYear(), t.getMonth(), 1), to: t }),
    },
    {
      id: "last-month",
      label: "Last month",
      range: (t: Date) => ({
        from: new Date(t.getFullYear(), t.getMonth() - 1, 1),
        to: new Date(t.getFullYear(), t.getMonth(), 0),
      }),
    },
    ...[3, 6, 12].map((n) => ({ id: `${n}-months`, label: `${n} months`, range: (t: Date) => lastMonths(t, n) })),
  ] as DateRangePreset[]).map((p) => ({ ...p, group: "Months", column: 2 })),
  // Quarters
  ...([
    { id: "this-quarter", label: "This quarter", range: (t: Date) => ({ from: quarterOf(t, 0).from, to: t }) },
    { id: "last-quarter", label: "Last quarter", range: (t: Date) => quarterOf(t, 1) },
    ...[2, 3, 4, 5, 6, 7].map((n) => ({
      id: `quarter-${n}-back`,
      label: (t: Date) => {
        const q = quarterOf(t, n)
        return `Q${q.q} ${q.from.getFullYear()}`
      },
      range: (t: Date) => quarterOf(t, n),
    })),
  ] as DateRangePreset[]).map((p) => ({ ...p, group: "Quarters", column: 3 })),
  // Years
  ...([
    { id: "this-year", label: "This year", range: (t: Date) => ({ from: new Date(t.getFullYear(), 0, 1), to: t }) },
    {
      id: "last-year",
      label: "Last year",
      range: (t: Date) => ({ from: new Date(t.getFullYear() - 1, 0, 1), to: new Date(t.getFullYear() - 1, 11, 31) }),
    },
    ...[2, 3, 4].map((n) => ({
      id: `year-${n}-back`,
      label: (t: Date) => String(t.getFullYear() - n),
      range: (t: Date) => ({ from: new Date(t.getFullYear() - n, 0, 1), to: new Date(t.getFullYear() - n, 11, 31) }),
    })),
  ] as DateRangePreset[]).map((p) => ({ ...p, group: "Years", column: 3 })),
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

/** Lays the presets out as columns of groups, keeping their order. */
function periodColumns(presets: DateRangePreset[]) {
  const cols: Array<Array<{ name: string; items: DateRangePreset[] }>> = []
  for (const p of presets) {
    const ci = Math.max(1, p.column ?? 1) - 1
    while (cols.length <= ci) cols.push([])
    const col = cols[ci]!
    const name = p.group ?? ""
    let g = col.find((x) => x.name === name)
    if (!g) col.push((g = { name, items: [] }))
    g.items.push(p)
  }
  return cols.filter((c) => c.length > 0)
}

const DAY = 24 * 60 * 60 * 1000
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const daysBetween = (a: Date, b: Date) => Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / DAY) + 1

/** Two months on wide screens, one on phones. */
function useMonths() {
  const query = "(min-width: 640px)"
  const [wide, setWide] = React.useState(() => typeof window === "undefined" || window.matchMedia(query).matches)
  React.useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setWide(mq.matches)
    mq.addEventListener("change", on)
    return () => mq.removeEventListener("change", on)
  }, [])
  return wide ? 2 : 1
}

/* A Start or End box. Click it to pick that date on the calendar, or type the
   date straight into it. */
function DateSlot({
  label,
  date,
  active,
  onActivate,
  onType,
  inputRef,
  min,
  max,
}: {
  label: string
  date?: Date
  active: boolean
  onActivate: () => void
  onType: (date: Date | undefined) => void
  inputRef: React.Ref<HTMLInputElement>
  min?: Date
  max?: Date
}) {
  return (
    <label
      data-active={active || undefined}
      className={cn(
        "flex h-8 w-[5.75rem] grow cursor-text items-center rounded-lg border px-1.5 transition-colors sm:w-32 sm:grow-0 sm:px-2.5",
        active ? "border-foreground/40 bg-muted/40" : "border-border hover:bg-muted/40",
      )}
    >
      <DateInput
        inputRef={inputRef}
        aria-label={label}
        value={date}
        min={min}
        max={max}
        onFocus={onActivate}
        onValueChange={onType}
        className={cn("text-[13px] sm:text-sm", date && "font-medium")}
      />
    </label>
  )
}

function DateRangePicker({
  value,
  onChange,
  min,
  max,
  placeholder = "Select dates",
  presets,
  timeZone = "America/New_York",
  className,
}: {
  value: DateRange
  /** Called once both dates are chosen, and when the range is cleared. */
  onChange: (range: DateRange) => void
  min?: Date
  max?: Date
  placeholder?: string
  /** Quick ranges in a Period dropdown at the top. Leave out to hide it. */
  presets?: DateRangePreset[]
  /** Decides what "today" is for the presets. */
  timeZone?: string
  className?: string
}) {
  const [open, setOpen] = React.useState(false)
  const [draft, setDraft] = React.useState<DateRange>(value)
  const [picking, setPicking] = React.useState<"from" | "to">("from")
  const [hover, setHover] = React.useState<Date | undefined>()
  const [month, setMonth] = React.useState<Date>(value.from ?? new Date())
  const [pickedId, setPickedId] = React.useState<string>()
  const fromRef = React.useRef<HTMLInputElement>(null)
  const toRef = React.useRef<HTMLInputElement>(null)
  const months = useMonths()

  const openWith = (next: boolean) => {
    setOpen(next)
    if (next) {
      setDraft(value)
      setPicking("from")
      setHover(undefined)
      setMonth(value.from ?? new Date())
    }
  }

  /* Bring a typed date into view, leaving the calendar alone if it already shows. */
  const show = (d: Date) => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1)
    const after = new Date(month.getFullYear(), month.getMonth() + months, 1)
    if (d >= first && d < after) return
    setMonth(new Date(d.getFullYear(), d.getMonth() - (d < first ? 0 : months - 1), 1))
  }

  const typeFrom = (d: Date | undefined) => {
    if (!d) {
      setDraft({ from: undefined, to: draft.to })
      return
    }
    const keepEnd = draft.to && d <= draft.to ? draft.to : undefined
    const next = { from: d, to: keepEnd }
    setDraft(next)
    setPicking("to")
    show(d)
    if (keepEnd) onChange(next)
    // Typing goes on to the end date.
    requestAnimationFrame(() => toRef.current?.focus())
  }
  const typeTo = (d: Date | undefined) => {
    if (!d) {
      setDraft({ from: draft.from, to: undefined })
      return
    }
    show(d)
    if (!draft.from || d < draft.from) {
      // An end before the start starts over from that day.
      setDraft({ from: d, to: undefined })
      return
    }
    const range = { from: draft.from, to: d }
    setDraft(range)
    onChange(range)
  }

  /* Picking the start moves on to the end. Once the end is picked it stays the
     active box: another click changes the end (a day before the start begins
     a new range). Click the Start box to change the start instead. */
  const pick = (day: Date) => {
    if (picking === "from") {
      const keepEnd = draft.to && day <= draft.to ? draft.to : undefined
      const next = { from: day, to: keepEnd }
      setDraft(next)
      setPicking("to")
      if (keepEnd) onChange(next)
      return
    }
    if (!draft.from || day < draft.from) {
      setDraft({ from: day, to: undefined })
      return
    }
    const range = { from: draft.from, to: day }
    setDraft(range)
    setHover(undefined)
    onChange(range)
  }

  const preview =
    picking === "to" && draft.from && hover && hover > draft.from ? { from: draft.from, to: hover } : undefined

  const days = draft.from && draft.to ? daysBetween(draft.from, draft.to) : 0

  const today = presets?.length ? todayIn(timeZone) : undefined
  // Some periods cover the same days ("2 weeks", "14 days"): the one picked keeps its name.
  const covers = (p: DateRangePreset, r: DateRange) => {
    const x = p.range(today!)
    return sameDay(x.from, r.from) && sameDay(x.to, r.to)
  }
  const matchOf = (r: DateRange) =>
    today
      ? (presets?.find((p) => p.id === pickedId && covers(p, r)) ?? presets?.find((p) => covers(p, r)))
      : undefined
  const active = matchOf(value)
  const draftPeriod = matchOf(draft)

  return (
    <Popover open={open} onOpenChange={openWith}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            size="lg"
            data-slot="date-range-trigger"
            className={cn("justify-start gap-2 font-normal tabular-nums", className)}
          />
        }
      >
        <CalendarIcon aria-hidden="true" />
        {active ? (
          <span data-toolbar-label="">{presetLabel(active, today!)}</span>
        ) : value.from && value.to ? (
          <span data-toolbar-label="" className="inline-flex items-center gap-2">
            {formatDate(value.from)}
            <ArrowRightIcon aria-label="to" className="text-muted-foreground size-3.5" />
            {formatDate(value.to)}
          </span>
        ) : (
          <span data-toolbar-label="" className="text-muted-foreground">
            {placeholder}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto gap-0 p-0" initialFocus={fromRef}>
        {/* One row: start, end, then the Period menu. On a phone the date fields narrow to fit; on the
            narrowest phones Period wraps under them. */}
        <div className="flex max-w-[calc(100vw-2rem)] flex-wrap items-center gap-1.5 border-b p-3 sm:flex-nowrap sm:gap-2">
          <DateSlot
            label="Start date"
            date={draft.from}
            active={picking === "from"}
            onActivate={() => setPicking("from")}
            onType={typeFrom}
            inputRef={fromRef}
            min={min}
            max={max}
          />
          <ArrowRightIcon aria-hidden="true" className="text-muted-foreground size-3.5 shrink-0" />
          <DateSlot
            label="End date"
            date={draft.to}
            active={picking === "to"}
            onActivate={() => setPicking("to")}
            onType={typeTo}
            inputRef={toRef}
            min={min}
            max={max}
          />
          {presets?.length && today ? (
            <div className="ml-auto shrink-0 sm:pl-2">
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="outline"
                      size="sm"
                      aria-label="Period"
                      data-slot="date-range-period"
                      className="h-8 gap-1.5 font-normal"
                    />
                  }
                >
                  {draftPeriod ? presetLabel(draftPeriod, today) : "Custom"}
                  <ChevronDownIcon aria-hidden="true" className="text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="max-h-[min(30rem,var(--available-height))]">
                  <DropdownMenuRadioGroup
                    value={draftPeriod ? draftPeriod.id : ""}
                    onValueChange={(v: unknown) => {
                      const preset = presets.find((p) => p.id === v)
                      if (!preset) return
                      const range = preset.range(today)
                      setPickedId(preset.id)
                      setDraft(range)
                      setPicking("to")
                      onChange(range)
                      setOpen(false)
                    }}
                  >
                    {/* Columns of headed groups (Days, Weeks...). Presets without a group make one plain list. */}
                    <div className="flex flex-col gap-1 sm:flex-row sm:gap-2">
                      {periodColumns(presets).map((groups, ci) => (
                        <div key={ci} className="flex min-w-28 flex-col gap-1">
                          {groups.map((g) => (
                            <DropdownMenuGroup key={g.name || ci}>
                              {g.name ? <DropdownMenuLabel>{g.name}</DropdownMenuLabel> : null}
                              {g.items.map((p) => (
                                <DropdownMenuRadioItem key={p.id} value={p.id} closeOnClick className="tabular-nums">
                                  {presetLabel(p, today)}
                                </DropdownMenuRadioItem>
                              ))}
                            </DropdownMenuGroup>
                          ))}
                        </div>
                      ))}
                    </div>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : null}
        </div>
        <Calendar
          mode="range"
          numberOfMonths={months}
          captionLayout="dropdown"
          month={month}
          onMonthChange={setMonth}
          selected={draft.from ? { from: draft.from, to: draft.to } : undefined}
          onSelect={() => {}}
          onDayClick={(day, modifiers) => {
            if (!modifiers.disabled) pick(day)
          }}
          onDayMouseEnter={(day) => setHover(day)}
          onDayMouseLeave={() => setHover(undefined)}
          disabled={[...(min ? [{ before: min }] : []), ...(max ? [{ after: max }] : [])]}
          modifiers={preview ? { preview } : undefined}
          modifiersClassNames={{ preview: "bg-muted/60 [&>button]:bg-transparent" }}
          className="p-3"
        />
        <div className="flex items-center justify-between gap-3 border-t px-3 py-2">
          <span className="text-muted-foreground text-xs tabular-nums" aria-live="polite">
            {picking === "to" && draft.from && !draft.to
              ? "Now pick the end date"
              : days > 0
                ? `${days} ${days === 1 ? "day" : "days"} selected`
                : "Pick the start date"}
          </span>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={!draft.from}
              onClick={() => {
                setDraft({})
                setPicking("from")
                onChange({})
              }}
            >
              Clear
            </Button>
            <Button size="sm" onClick={() => setOpen(false)}>
              Done
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { DateRangePicker, defaultDatePresets, todayIn }
export type { DateRange, DateRangePreset }
