export type Device = "desktop" | "tablet" | "mobile"
export type Mode = "light" | "dark"

/** The hashed script this page loaded, such as "/assets/index-AbC123.js". Null on the dev server. */
export function loadedBundle(): string | null {
  const el = document.querySelector<HTMLScriptElement>('script[type="module"][src*="/assets/index-"]')
  return el ? new URL(el.src).pathname : null
}

/** A short build id taken from the bundle name. Example frames add it to their URL, so a new deploy never shows a cached old frame. */
export const buildId = loadedBundle()?.match(/index-([^.]+)\.js/)?.[1] ?? "dev"

export const deviceWidth: Record<Device, string> = { desktop: "100%", tablet: "768px", mobile: "390px" }

export function readParams() {
  const q = new URLSearchParams(window.location.search)
  const system: Mode = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  const theme = q.get("theme")
  const device = q.get("device")
  return {
    frame: q.get("frame") === "1",
    component: q.get("c") ?? "",
    example: Number(q.get("e") ?? "0"),
    theme: (theme === "dark" || theme === "light" ? theme : system) as Mode,
    device: (device === "tablet" || device === "mobile" ? device : "desktop") as Device,
  }
}

export function applyTheme(mode: Mode) {
  document.documentElement.classList.toggle("dark", mode === "dark")
}
