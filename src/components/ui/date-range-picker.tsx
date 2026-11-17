"use client"

import * as React from "react"
import { ArrowRightIcon, CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { formatDate } from "@/components/ui/date-picker"

/*
 * One field for a start and end date that opens two months side by side,
 * like picking flights. The first click sets the start, the second sets the
 * end; while choosing the end, hovering previews the range. The header shows
 * both dates and highlights the one being picked next.
 */

type DateRange = { from?: Date; to?: Date }

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

function DateSlot({
  label,
  date,
  active,
  onClick,
}: {
  label: string
  date?: Date
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex min-w-36 flex-1 flex-col items-start rounded-lg border px-3 py-2 text-left transition-colors outline-none",
        active ? "border-foreground/40 bg-muted/40" : "border-border hover:bg-muted/40",
      )}
    >
      <span className="text-muted-foreground text-[11px]">{label}</span>
      <span className={cn("text-sm tabular-nums", date ? "font-medium" : "text-muted-foreground")}>
        {date ? formatDate(date) : "Select a date"}
      </span>
    </button>
  )
}

function DateRangePicker({
  value,
  onChange,
  min,
  max,
  placeholder = "Select dates",
  className,
}: {
  value: DateRange
  /** Called once both dates are chosen, and when the range is cleared. */
  onChange: (range: DateRange) => void
  min?: Date
  max?: Date
  placeholder?: string
  className?: string
}) {
  const [open, setOpen] = React.useState(false)
  const [draft, setDraft] = React.useState<DateRange>(value)
  const [picking, setPicking] = React.useState<"from" | "to">("from")
  const [hover, setHover] = React.useState<Date | undefined>()
  const months = useMonths()

  const openWith = (next: boolean) => {
    setOpen(next)
    if (next) {
      setDraft(value)
      setPicking("from")
      setHover(undefined)
    }
  }

  const pick = (day: Date) => {
    if (picking === "from" || !draft.from || day < draft.from) {
      setDraft({ from: day, to: undefined })
      setPicking("to")
      return
    }
    const range = { from: draft.from, to: day }
    setDraft(range)
    setPicking("from")
    setHover(undefined)
    onChange(range)
  }

  const preview =
    picking === "to" && draft.from && hover && hover > draft.from ? { from: draft.from, to: hover } : undefined

  const days = draft.from && draft.to ? daysBetween(draft.from, draft.to) : 0

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
        {value.from && value.to ? (
          <span className="inline-flex items-center gap-2">
            {formatDate(value.from)}
            <ArrowRightIcon aria-label="to" className="text-muted-foreground size-3.5" />
            {formatDate(value.to)}
          </span>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto gap-0 p-0">
        <div className="flex gap-2 border-b p-3">
          <DateSlot
            label="Start date"
            date={draft.from}
            active={picking === "from"}
            onClick={() => setPicking("from")}
          />
          <DateSlot
            label="End date"
            date={draft.to}
            active={picking === "to"}
            onClick={() => draft.from && setPicking("to")}
          />
        </div>
        <Calendar
          mode="range"
          numberOfMonths={months}
          captionLayout="label"
          defaultMonth={draft.from ?? value.from}
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

export { DateRangePicker }
export type { DateRange }
