import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { DatePicker } from "@/components/ui/date-picker"

const meta: Meta<typeof DatePicker> = { title: "Components/Date Picker", component: DatePicker }
export default meta

function Controlled() {
  const [date, setDate] = useState<Date | undefined>()
  return <DatePicker value={date} onChange={setDate} />
}

export const Default: StoryObj<typeof DatePicker> = { render: () => <Controlled /> }

function InlineCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  return <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-lg border" />
}

export const CalendarOnly: StoryObj<typeof Calendar> = { render: () => <InlineCalendar /> }
