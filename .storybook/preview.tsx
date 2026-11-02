import type { Preview } from "@storybook/react-vite"
import "./preview.css"

const preview: Preview = {
  globalTypes: {
    theme: {
      description: "Light or dark",
      toolbar: { title: "Theme", icon: "mirror", items: ["light", "dark"], dynamicTitle: true },
    },
  },
  initialGlobals: { theme: "light" },
  decorators: [
    (Story, ctx) => {
      document.documentElement.classList.toggle("dark", ctx.globals.theme === "dark")
      return (
        <div className="bg-background text-foreground p-6">
          <Story />
        </div>
      )
    },
  ],
}
export default preview
