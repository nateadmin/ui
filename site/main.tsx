import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./site.css"
import { Catalog } from "./Catalog"
import { Frame } from "./Frame"
import { applyTheme, readParams } from "./state"

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
