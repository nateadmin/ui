"use client"

import * as React from "react"

/**
 * Measures text the way the page draws it, for settling column widths before anything is laid out.
 * The first measurement can run before the page's web font has loaded, with the fallback font's
 * narrower metrics; once the fonts are in, the callback changes identity so every width built from it
 * is measured again (a list sized from the fallback font cut its names short, 11/27/2026).
 */
export function useTextWidth() {
  const ctx = React.useMemo(
    () => (typeof document === "undefined" ? null : document.createElement("canvas").getContext("2d")),
    [],
  )
  const family = React.useMemo(
    () => (typeof document === "undefined" ? "sans-serif" : getComputedStyle(document.body).fontFamily || "sans-serif"),
    [],
  )
  const [fontsReady, setFontsReady] = React.useState(false)
  React.useEffect(() => {
    const fonts = typeof document === "undefined" ? undefined : document.fonts
    if (!fonts) return
    let cancelled = false
    const done = () => {
      if (!cancelled) setFontsReady(true)
    }
    if (fonts.status === "loaded") done()
    else void fonts.ready.then(done)
    // A font that starts loading later (a weight first used by this list) lands the same way.
    fonts.addEventListener("loadingdone", done)
    return () => {
      cancelled = true
      fonts.removeEventListener("loadingdone", done)
    }
  }, [])
  return React.useCallback(
    (text: string, weight: number, size: number, spacing = 0) => {
      if (!ctx) return text.length * size * 0.6
      ctx.font = `${weight} ${size}px ${family}`
      return ctx.measureText(text).width + spacing * text.length
    },
    // fontsReady is a dependency on purpose: it makes the callback new, so widths are measured again.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ctx, family, fontsReady],
  )
}
