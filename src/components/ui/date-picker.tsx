import * as React from "react"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

function formatDate(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  const dd = String(date.getDate()).padStart(2, "0")
  return `${mm}/${dd}/${date.getFullYear()}`
}

/** Reads a typed date: m/d/yyyy or mm/dd/yyyy (slashes, dashes or dots), or
    8 digits as mmddyyyy. Returns undefined unless it is a real calendar day. */
function parseDate(text: string): Date | undefined {
  const t = text.trim()
  const m = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/.exec(t) ?? /^(\d{2})(\d{2})(\d{4})$/.exec(t)
  if (!m) return undefined
  const [mm, dd, yyyy] = [Number(m[1]), Number(m[2]), Number(m[3])]
  const d = new Date(yyyy, mm - 1, dd)
  return d.getFullYear() === yyyy && d.getMonth() === mm - 1 && d.getDate() === dd ? d : undefined
}

const sameDate = (a?: Date, b?: Date) => (a && b ? a.getTime() === b.getTime() : a === b)

/*
 * A text field for one date, typed as mm/dd/yyyy. Slashes fill in as you type
 * the digits. A full, real date is taken as soon as it is typed; Enter or
 * leaving the field takes it too. Text that isn't a date shows in red and
 * goes back to the last date when you leave the field (Escape does it now).
 */
function DateInput({
  value,
  onValueChange,
  min,
  max,
  placeholder = "mm/dd/yyyy",
  className,
  inputRef,
  onEnter,
  ...props
}: Omit<React.ComponentProps<"input">, "value" | "onChange" | "min" | "max"> & {
  value?: Date
  /** Gets the typed date, or undefined when the field is emptied. */
  onValueChange: (date: Date | undefined) => void
  min?: Date
  max?: Date
  inputRef?: React.Ref<HTMLInputElement>
  /** Called after Enter takes a date. */
  onEnter?: () => void
}) {
  const [text, setText] = React.useState(value ? formatDate(value) : "")
  const [editing, setEditing] = React.useState(false)
  React.useEffect(() => {
    if (!editing) setText(value ? formatDate(value) : "")
  }, [value, editing])

  const inRange = (d: Date) => (!min || d >= min) && (!max || d <= max)
  const typed = text.trim() ? parseDate(text) : undefined
  const invalid = text.trim() !== "" && (!typed || !inRange(typed))

  const take = (next: string) => {
    if (!next.trim()) {
      if (value) onValueChange(undefined)
      return true
    }
    const d = parseDate(next)
    if (d && inRange(d)) {
      if (!sameDate(d, value)) onValueChange(d)
      return true
    }
    return false
  }

  return (
    <input
      {...props}
      ref={inputRef}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      placeholder={placeholder}
      value={text}
      aria-invalid={invalid || undefined}
      onFocus={(e) => {
        setEditing(true)
        props.onFocus?.(e)
      }}
      onChange={(e) => {
        let next = e.target.value.replace(/[^0-9/.-]/g, "").slice(0, 10)
        // Typing forward, add the slash after the month and after the day.
        if (next.length > text.length && (/^\d{2}$/.test(next) || /^\d{1,2}\/\d{2}$/.test(next))) next += "/"
        setText(next)
        if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(next) || /^\d{8}$/.test(next)) take(next)
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault()
          if (take(text)) onEnter?.()
        } else if (e.key === "Escape" && invalid) {
          e.stopPropagation()
          setText(value ? formatDate(value) : "")
        }
        props.onKeyDown?.(e)
      }}
      onBlur={(e) => {
        if (!take(text)) setText(value ? formatDate(value) : "")
        setEditing(false)
        props.onBlur?.(e)
      }}
      className={cn(
        "placeholder:text-muted-foreground aria-invalid:text-destructive w-full min-w-0 bg-transparent tabular-nums outline-none",
        className,
      )}
    />
  )
}

export type DatePickerProps = {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  /** Shown before the date, as "Label: 11/06/2026". Also names the button for screen readers. */
  label?: string
  /** Earliest and latest days that can be picked. */
  min?: Date
  max?: Date
  size?: "default" | "lg"
  disabled?: boolean
  className?: string
}

function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  label,
  min,
  max,
  size = "default",
  disabled,
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [month, setMonth] = React.useState<Date>(value ?? new Date())
  const typeRef = React.useRef<HTMLInputElement>(null)
  return (
    <Popover
      open={open}
      onOpenChange={(next: boolean) => {
        setOpen(next)
        if (next) setMonth(value ?? new Date())
      }}
    >
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            size={size}
            disabled={disabled}
            data-slot="date-picker-trigger"
            className={cn("w-56 justify-start font-normal", className)}
          />
        }
      >
        <CalendarIcon />
        <span>
          {label ? <span className="text-muted-foreground">{label}: </span> : null}
          <span className={cn("tabular-nums", !value && "text-muted-foreground")}>
            {value ? formatDate(value) : placeholder}
          </span>
        </span>
      </PopoverTrigger>
      <PopoverContent className="w-auto gap-0 p-0" align="start" initialFocus={typeRef}>
        {/* Type the date, or pick it below. */}
        <div className="border-b p-2">
          <label className="border-input focus-within:border-foreground/40 flex h-8 items-center gap-2 rounded-lg border px-2.5 text-sm">
            <span className="text-muted-foreground text-xs">{label ?? "Date"}</span>
            <DateInput
              inputRef={typeRef}
              aria-label={label ?? "Date"}
              value={value}
              min={min}
              max={max}
              onValueChange={(d) => {
                onChange?.(d)
                if (d) setMonth(d)
              }}
              onEnter={() => setOpen(false)}
            />
          </label>
        </div>
        <Calendar
          mode="single"
          selected={value}
          captionLayout="dropdown"
          month={month}
          onMonthChange={setMonth}
          disabled={[...(min ? [{ before: min }] : []), ...(max ? [{ after: max }] : [])]}
          onSelect={(date) => {
            onChange?.(date)
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

export { DateInput, DatePicker, formatDate, parseDate }
