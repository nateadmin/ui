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
