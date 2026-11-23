import { useState, type ReactNode } from "react"
import { ListCheckbox } from "@/components/ui/data-list"
import { SplashCheckbox } from "@/components/ui/splash-checkbox"

/* Checkbox styles side by side. Each shows: off, on, and a few rows to tick. */

function Cell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex h-10 items-center justify-center">{children}</div>
      <span className="text-muted-foreground text-xs">{label}</span>
    </div>
  )
}

const rows = ["Sample Bakery LLC", "Northwind Auto Repair", "Bluebird Dental Group", "Maple Street Diner"]

function Rows({ render }: { render: (on: boolean, toggle: () => void, name: string) => ReactNode }) {
  const [picked, setPicked] = useState<string[]>(["Northwind Auto Repair"])
  return (
    <div className="bg-card border-border/40 divide-border/40 w-full max-w-sm divide-y rounded-lg border">
      {rows.map((name) => {
        const on = picked.includes(name)
        const toggle = () => setPicked((cur) => (on ? cur.filter((x) => x !== name) : [...cur, name]))
        return (
          <div
            key={name}
            className="hover:bg-muted/30 flex h-10 cursor-pointer items-center gap-3 px-3 text-[13px]"
            onClick={toggle}
          >
            {render(on, toggle, name)}
            <span>{name}</span>
          </div>
        )
      })}
    </div>
  )
}

export function SimpleCheckboxDemo() {
  const [a, setA] = useState(false)
  const [b, setB] = useState(true)
  return (
    <div className="flex flex-wrap items-start gap-10">
      <div className="flex gap-8">
        <Cell label="Off">
          <ListCheckbox checked={a} onToggle={() => setA(!a)} label="Off example" />
        </Cell>
        <Cell label="On">
          <ListCheckbox checked={b} onToggle={() => setB(!b)} label="On example" />
        </Cell>
        <Cell label="Some selected">
          <ListCheckbox checked={false} indeterminate onToggle={() => {}} label="Some selected example" />
        </Cell>
      </div>
      <Rows render={(on, toggle, name) => <ListCheckbox checked={on} onToggle={toggle} label={`Select ${name}`} />} />
    </div>
  )
}

export function SplashCheckboxDemo() {
  const [a, setA] = useState(false)
  const [b, setB] = useState(true)
  return (
    <div className="flex flex-wrap items-start gap-10">
      <div className="flex gap-8">
        <Cell label="Off">
          <SplashCheckbox checked={a} onChange={setA} label="Off example" />
        </Cell>
        <Cell label="On (loaded on, no splash)">
          <SplashCheckbox checked={b} onChange={setB} label="On example" />
        </Cell>
        <Cell label="Disabled">
          <SplashCheckbox checked disabled onChange={() => {}} label="Disabled example" />
        </Cell>
      </div>
      <Rows render={(on, toggle, name) => <SplashCheckbox checked={on} onChange={toggle} label={`Select ${name}`} />} />
    </div>
  )
}
