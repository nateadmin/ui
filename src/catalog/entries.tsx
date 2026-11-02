import { useState, type ReactNode } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DatePicker } from "@/components/ui/date-picker"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Toggle } from "@/components/ui/toggle"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export type CatalogExample = { name: string; render: () => ReactNode; minHeight?: number }
export type CatalogEntry = { id: string; name: string; examples: CatalogExample[] }

function ControlledDatePicker() {
  const [date, setDate] = useState<Date | undefined>()
  return <DatePicker value={date} onChange={setDate} />
}

function InlineCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  return <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-lg border" />
}

export const catalog: CatalogEntry[] = [
  {
    id: "badge",
    name: "Badge",
    examples: [
      {
        name: "Variants",
        render: () => (
          <div className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
          </div>
        ),
      },
    ],
  },
  {
    id: "button",
    name: "Button",
    examples: [
      {
        name: "Variants",
        render: () => (
          <div className="flex flex-wrap gap-3">
            <Button>Default</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Delete</Button>
            <Button variant="link">Link</Button>
          </div>
        ),
      },
      {
        name: "Sizes",
        render: () => (
          <div className="flex flex-wrap items-center gap-3">
            <Button size="xs">Extra small</Button>
            <Button size="sm">Small</Button>
            <Button>Default</Button>
            <Button size="lg">Large</Button>
          </div>
        ),
      },
    ],
  },
  {
    id: "calendar",
    name: "Calendar",
    examples: [{ name: "Single date", render: () => <InlineCalendar /> }],
  },
  {
    id: "card",
    name: "Card",
    examples: [
      {
        name: "Default",
        render: () => (
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>Card title</CardTitle>
              <CardDescription>Card description</CardDescription>
            </CardHeader>
            <CardContent>Card content</CardContent>
            <CardFooter>
              <Button>Action</Button>
            </CardFooter>
          </Card>
        ),
      },
    ],
  },
  {
    id: "date-picker",
    name: "Date Picker",
    examples: [{ name: "Default", render: () => <ControlledDatePicker />, minHeight: 440 }],
  },
  {
    id: "separator",
    name: "Separator",
    examples: [
      {
        name: "Horizontal and vertical",
        render: () => (
          <div className="w-full max-w-sm space-y-3 text-sm">
            <div>Above</div>
            <Separator />
            <div className="flex h-5 items-center gap-3">
              <span>Left</span>
              <Separator orientation="vertical" />
              <span>Right</span>
            </div>
          </div>
        ),
      },
    ],
  },
  {
    id: "switch",
    name: "Switch",
    examples: [
      {
        name: "Default",
        render: () => (
          <label className="flex items-center gap-3 text-sm">
            <Switch defaultChecked />
            Notifications
          </label>
        ),
      },
    ],
  },
  {
    id: "toggle",
    name: "Toggle",
    examples: [
      {
        name: "Single and group",
        render: () => (
          <div className="flex flex-wrap items-center gap-4">
            <Toggle aria-label="Bold">Bold</Toggle>
            <ToggleGroup defaultValue={["week"]}>
              <ToggleGroupItem value="day">Day</ToggleGroupItem>
              <ToggleGroupItem value="week">Week</ToggleGroupItem>
              <ToggleGroupItem value="month">Month</ToggleGroupItem>
            </ToggleGroup>
          </div>
        ),
      },
    ],
  },
]
