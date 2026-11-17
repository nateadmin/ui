import { useEffect, useState } from "react"
import { RefreshCw } from "lucide-react"
import { loadedBundle } from "./state"

/*
 * Shows a bar at the top of the catalog when a newer version has been
 * deployed. It compares the hashed script the page loaded with the one the
 * server's index.html points to now, checking every minute and whenever the
 * tab comes back into focus.
 *
 * Reload is a hard refresh. The host lets browsers cache pages for 10 minutes,
 * so a plain reload can show the old version again, and the example frames can
 * too. Reload opens the page at a new URL (a one-time "_r" value) that no cache
 * holds; the new page then carries the new build id in every frame's URL.
 * main.tsx removes "_r" from the address bar after loading.
 */

const CHECK_EVERY_MS = 60_000


async function latestBundle(): Promise<string | null> {
  const res = await fetch(`${location.pathname}?v=${Date.now()}`, { cache: "no-store" })
  if (!res.ok) return null
  const html = await res.text()
  const match = html.match(/\/assets\/index-[^"']+\.js/)
  return match ? match[0] : null
}

export function UpdateBar() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const current = loadedBundle()
    if (!current) return // dev server: no hashed bundle to compare
    let stopped = false
    const check = async () => {
      try {
        const latest = await latestBundle()
        if (!stopped && latest && latest !== current) setReady(true)
      } catch {
        // offline or blocked: try again on the next check
      }
    }
    const timer = window.setInterval(check, CHECK_EVERY_MS)
    const onFocus = () => document.visibilityState === "visible" && void check()
    window.addEventListener("focus", onFocus)
    document.addEventListener("visibilitychange", onFocus)
    void check()
    return () => {
      stopped = true
      window.clearInterval(timer)
      window.removeEventListener("focus", onFocus)
      document.removeEventListener("visibilitychange", onFocus)
    }
  }, [])

  if (!ready) return null

  const reload = () => {
    const url = new URL(location.href)
    url.searchParams.set("_r", String(Date.now()))
    location.replace(url.toString())
  }

  return (
    <div
      role="status"
      className="bg-primary text-primary-foreground flex shrink-0 flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2 text-sm"
    >
      <span>A new version of the catalog is ready.</span>
      <button
        type="button"
        onClick={reload}
        className="focus-visible:ring-primary-foreground/50 inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 font-medium underline underline-offset-2 outline-none hover:no-underline focus-visible:ring-2"
      >
        <RefreshCw aria-hidden="true" className="size-3.5" />
        Reload
      </button>
    </div>
  )
}
