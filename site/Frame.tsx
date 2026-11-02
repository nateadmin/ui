import { useEffect, useRef } from "react"
import { catalog } from "@/catalog/entries"

export function Frame({ component, example }: { component: string; example: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const entry = catalog.find((c) => c.id === component)
  const ex = entry?.examples.at(example)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const send = () => window.parent.postMessage({ type: "ui-frame-height", component, example, height: el.scrollHeight }, "*")
    const ro = new ResizeObserver(send)
    ro.observe(el)
    send()
    return () => ro.disconnect()
  }, [component, example])

  return (
    <div ref={ref} className="bg-background text-foreground p-6">
      {ex ? ex.render() : <p className="text-muted-foreground text-sm">Not found</p>}
    </div>
  )
}
