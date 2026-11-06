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
  return (
    <Popover open={open} onOpenChange={setOpen}>
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
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          captionLayout="dropdown"
          defaultMonth={value}
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

export { DatePicker, formatDate }
