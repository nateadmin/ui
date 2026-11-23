"use client"

import * as React from "react"
import { ArrowRightIcon, CalendarIcon, ChevronDownIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  DropdownMenu,
  DropdownMenuContent,
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
  label: string
  /** Gets today's date (in the picker's time zone) and returns the range. */
  range: (today: Date) => { from: Date; to: Date }
}

const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
const startOfWeek = (d: Date) => addDays(d, -d.getDay())
const sameDay = (a?: Date, b?: Date) =>
  !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

/** Weeks start on Sunday. */
const defaultDatePresets: DateRangePreset[] = [
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
        "flex min-w-36 flex-1 cursor-text flex-col items-start rounded-lg border px-3 py-2 text-left transition-colors",
        active ? "border-foreground/40 bg-muted/40" : "border-border hover:bg-muted/40",
      )}
    >
      <span className="text-muted-foreground text-[11px]">{label}</span>
      <DateInput
        inputRef={inputRef}
        aria-label={label}
        value={date}
        min={min}
        max={max}
        onFocus={onActivate}
        onValueChange={onType}
        className={cn("text-sm", date && "font-medium")}
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
  const matchOf = (r: DateRange) =>
    today
      ? presets?.find((p) => {
          const x = p.range(today)
          return sameDay(x.from, r.from) && sameDay(x.to, r.to)
        })
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
          <span data-toolbar-label="">{active.label}</span>
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
        {presets?.length && today ? (
          <div className="flex items-center justify-between gap-3 px-3 pt-3">
            <span className="text-muted-foreground text-xs font-medium">Period</span>
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
                {draftPeriod ? draftPeriod.label : "Custom"}
                <ChevronDownIcon aria-hidden="true" className="text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuRadioGroup
                  value={draftPeriod ? draftPeriod.id : ""}
                  onValueChange={(v: unknown) => {
                    const preset = presets.find((p) => p.id === v)
                    if (!preset) return
                    const range = preset.range(today)
                    setDraft(range)
                    setPicking("to")
                    onChange(range)
                    setOpen(false)
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
          </div>
        ) : null}
        <div className="flex gap-2 border-b p-3">
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
