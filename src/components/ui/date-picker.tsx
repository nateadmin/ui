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
  disabled?: boolean
  className?: string
}

function DatePicker({ value, onChange, placeholder = "Pick a date", disabled, className }: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            disabled={disabled}
            data-slot="date-picker-trigger"
            className={cn("w-56 justify-start font-normal", !value && "text-muted-foreground", className)}
          />
        }
      >
        <CalendarIcon />
        {value ? formatDate(value) : placeholder}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          captionLayout="dropdown"
          defaultMonth={value}
          onSelect={(date) => {
            onChange?.(date)
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

export { DatePicker }
