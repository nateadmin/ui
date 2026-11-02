import { addons } from "storybook/manager-api"
import { create } from "storybook/theming"
import pkg from "../package.json"

const brandTitle = `@nateadmin/ui v${pkg.version}`
const themeFor = (mode: string) => create({ base: mode === "dark" ? "dark" : "light", brandTitle })
const systemMode = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"

addons.setConfig({ theme: themeFor(systemMode) })

addons.register("nateadmin/theme-sync", (api) => {
  const apply = (payload?: { globals?: { theme?: string } }) => {
    const mode = payload?.globals?.theme ?? api.getGlobals()?.theme
    if (mode === "dark" || mode === "light") api.setOptions({ theme: themeFor(mode) })
  }
  api.on("globalsUpdated", apply)
  api.on("setGlobals", apply)
})
