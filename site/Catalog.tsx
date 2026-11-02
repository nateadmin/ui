import { useEffect, useState } from "react"
import { Monitor, Moon, Smartphone, Sun, Tablet } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { catalog } from "@/catalog/entries"
import pkg from "../package.json"
import { Changelog } from "./Changelog"
import { Preview } from "./Preview"
import { applyTheme, type Device, type Mode } from "./state"

type Props = { initialComponent: string; initialDevice: Device; initialTheme: Mode }

export function Catalog({ initialComponent, initialDevice, initialTheme }: Props) {
  const [component, setComponent] = useState(initialComponent)
  const [device, setDevice] = useState<Device>(initialDevice)
  const [theme, setTheme] = useState<Mode>(initialTheme)
  const entry = catalog.find((c) => c.id === component)

  useEffect(() => {
    applyTheme(theme)
    const q = new URLSearchParams()
    if (component) q.set("c", component)
    if (device !== "desktop") q.set("device", device)
    q.set("theme", theme)
    window.history.replaceState(null, "", `?${q.toString()}`)
  }, [component, device, theme])

  return (
    <div className="bg-background text-foreground flex h-screen flex-col">
      <header className="flex h-14 shrink-0 items-center gap-4 border-b px-4">
        <button type="button" onClick={() => setComponent("")} className="flex items-center gap-2 font-semibold">
          @nateadmin/ui
          <Badge variant="secondary">v{pkg.version}</Badge>
        </button>
        <div className="flex flex-1 justify-center">
          <ToggleGroup
            value={[device]}
            onValueChange={(v: unknown[]) => {
              const next = v.at(-1)
              if (next === "desktop" || next === "tablet" || next === "mobile") setDevice(next)
            }}
            aria-label="Preview size"
          >
            <ToggleGroupItem value="desktop" aria-label="Desktop">
              <Monitor />
              <span className="hidden sm:inline">Desktop</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="tablet" aria-label="Tablet">
              <Tablet />
              <span className="hidden sm:inline">Tablet</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="mobile" aria-label="Mobile">
              <Smartphone />
              <span className="hidden sm:inline">Mobile</span>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <label className="flex items-center gap-2">
          <Sun className="text-muted-foreground size-4" />
          <Switch
            checked={theme === "dark"}
            onCheckedChange={(on: boolean) => setTheme(on ? "dark" : "light")}
            aria-label="Dark mode"
          />
          <Moon className="text-muted-foreground size-4" />
        </label>
      </header>

      <div className="flex min-h-0 flex-1">
        <nav className="w-52 shrink-0 space-y-1 overflow-y-auto border-r p-3">
          <Button
            variant={component === "" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => setComponent("")}
          >
            Introduction
          </Button>
          <Separator className="my-2" />
          <p className="text-muted-foreground px-2 pb-1 text-xs font-medium uppercase">Components</p>
          {catalog.map((c) => (
            <Button
              key={c.id}
              variant={component === c.id ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setComponent(c.id)}
            >
              {c.name}
            </Button>
          ))}
        </nav>

        <main className="min-w-0 flex-1 overflow-y-auto p-6">
          {entry ? (
            <div className="space-y-8">
              <h1 className="text-2xl font-semibold">{entry.name}</h1>
              {entry.examples.map((ex, i) => (
                <section key={ex.name} className="space-y-3">
                  <h2 className="text-muted-foreground text-sm font-medium">{ex.name}</h2>
                  <Preview component={entry.id} example={i} device={device} theme={theme} />
                </section>
              ))}
            </div>
          ) : (
            <div className="max-w-2xl space-y-6">
              <h1 className="text-2xl font-semibold">@nateadmin/ui v{pkg.version}</h1>
              <p className="text-muted-foreground">
                Shared UI library for every app. shadcn base-nova style, Tailwind v4, light and dark mode.
              </p>
              <div className="space-y-2">
                <p className="text-sm">
                  Install in an app: <code className="bg-muted rounded px-1.5 py-0.5">npm i @nateadmin/ui</code>, then in
                  the app's global CSS:
                </p>
                <pre className="bg-muted rounded-lg border p-4 text-sm">
                  {`@import "tailwindcss";\n@import "@nateadmin/ui/styles.css";`}
                </pre>
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-semibold">Changelog</h2>
                <Changelog />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
