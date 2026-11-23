import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./site.css"
import { Catalog } from "./Catalog"
import { Frame } from "./Frame"
import { applyTheme, readParams } from "./state"

// Drop the one-time "_r" value the update bar adds for a hard refresh.
const url = new URL(location.href)
if (url.searchParams.has("_r")) {
  url.searchParams.delete("_r")
  history.replaceState(history.state, "", url.toString())
}

const params = readParams()
applyTheme(params.theme)

/* Each example runs in its own frame, which is a separate page, so a click on
   the catalog around it never reaches it and its open menus and dialogs stay
   open. Pass every press on the catalog into each frame as a press on that
   frame's page, so clicking anywhere closes them, as in a real app. */
if (!params.frame) {
  document.addEventListener(
    "pointerdown",
    (e) => {
      for (const frame of Array.from(document.querySelectorAll("iframe"))) {
        const win = frame.contentWindow as (Window & typeof globalThis) | null
        const doc = frame.contentDocument
        if (!win || !doc?.body) continue
        const init = { bubbles: true, cancelable: true, composed: true, clientX: -1, clientY: -1, button: e.button }
        const pointer = { ...init, pointerId: 1, pointerType: "mouse", isPrimary: true }
        doc.body.dispatchEvent(new win.PointerEvent("pointerdown", pointer))
        doc.body.dispatchEvent(new win.MouseEvent("mousedown", init))
        doc.body.dispatchEvent(new win.PointerEvent("pointerup", pointer))
        doc.body.dispatchEvent(new win.MouseEvent("mouseup", init))
        doc.body.dispatchEvent(new win.MouseEvent("click", init))
      }
    },
    true,
  )
}

/* A frame is as tall as its example, often taller than the screen, so a dialog
   centered in the frame can sit off screen. Tell each frame which part of it is
   on screen; site.css centers dialogs in that part. */
if (!params.frame) {
  const share = () => {
    for (const frame of Array.from(document.querySelectorAll("iframe"))) {
      const root = frame.contentDocument?.documentElement
      if (!root) continue
      const r = frame.getBoundingClientRect()
      const top = Math.max(r.top + frame.clientTop, 0)
      const bottom = Math.min(r.bottom - frame.clientTop, window.innerHeight)
      if (bottom <= top) continue
      root.style.setProperty("--frame-visible-top", `${top - (r.top + frame.clientTop)}px`)
      root.style.setProperty("--frame-visible-height", `${bottom - top}px`)
    }
  }
  document.addEventListener("scroll", share, { capture: true, passive: true })
  window.addEventListener("resize", share)
  // Frames load and change size on their own; keep them current.
  setInterval(share, 500)
}

const root = document.getElementById("root")
if (root) {
  createRoot(root).render(
    <StrictMode>
      {params.frame ? (
        <Frame component={params.component} example={params.example} />
      ) : (
        <Catalog initialComponent={params.component} initialDevice={params.device} initialTheme={params.theme} />
      )}
    </StrictMode>,
  )
}
