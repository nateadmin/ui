import * as React from "react"

/**
 * Measures text the way the page draws it (its real font family), without laying it out. Column
 * widths are worked out from every value a list or grid can show, so nothing moves when a page
 * turns or a sort changes (owner rule, 11/25/2026).
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
  return React.useCallback(
    (text: string, weight: number, size: number, spacing = 0) => {
      if (!ctx) return text.length * size * 0.6
      ctx.font = `${weight} ${size}px ${family}`
      return ctx.measureText(text).width + spacing * text.length
    },
    [ctx, family],
  )
}
