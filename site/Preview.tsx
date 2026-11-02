import { useEffect, useState } from "react"
import { catalog } from "@/catalog/entries"
import { deviceWidth, type Device, type Mode } from "./state"

type Props = { component: string; example: number; device: Device; theme: Mode }

export function Preview({ component, example, device, theme }: Props) {
  const minHeight = catalog.find((c) => c.id === component)?.examples.at(example)?.minHeight ?? 96
  const [height, setHeight] = useState(minHeight)
  const src = `?frame=1&c=${component}&e=${example}&theme=${theme}`

  useEffect(() => {
    const onMessage = (ev: MessageEvent) => {
      const d = ev.data as { type?: string; component?: string; example?: number; height?: number }
      if (d.type === "ui-frame-height" && d.component === component && d.example === example && d.height) {
        setHeight(Math.max(minHeight, d.height + 2))
      }
    }
    window.addEventListener("message", onMessage)
    return () => window.removeEventListener("message", onMessage)
  }, [component, example, minHeight])

  return (
    <div className="bg-muted/40 flex justify-center rounded-lg border p-4">
      <iframe
        title={`${component} example ${example + 1}`}
        src={src}
        style={{ width: deviceWidth[device], height }}
        className="bg-background max-w-full rounded-md border transition-[width] duration-200"
      />
    </div>
  )
}
