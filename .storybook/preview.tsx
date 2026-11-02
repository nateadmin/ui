import type { Preview } from "@storybook/react-vite"
import { addons } from "storybook/preview-api"
import "./preview.css"

const systemMode = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
const applyMode = (mode: unknown) => document.documentElement.classList.toggle("dark", mode === "dark")

addons.getChannel().on("globalsUpdated", ({ globals }: { globals: { theme?: string } }) => applyMode(globals.theme))
addons.getChannel().on("setGlobals", ({ globals }: { globals: { theme?: string } }) => applyMode(globals.theme))
applyMode(systemMode)

const preview: Preview = {
  globalTypes: {
    theme: {
      description: "Light or dark",
      toolbar: { title: "Theme", icon: "mirror", items: ["light", "dark"], dynamicTitle: true },
    },
  },
  initialGlobals: { theme: systemMode },
  decorators: [
    (Story, ctx) => {
      applyMode(ctx.globals.theme)
      return (
        <div className="bg-background text-foreground p-6">
          <Story />
        </div>
      )
    },
  ],
}
export default preview
