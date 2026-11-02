import type { Meta, StoryObj } from "@storybook/react-vite"
import { Button } from "@/components/ui/button"

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  args: { children: "Button" },
  argTypes: {
    variant: { control: "select", options: ["default", "outline", "secondary", "ghost", "destructive", "link"] },
    size: { control: "select", options: ["default", "xs", "sm", "lg"] },
  },
}
export default meta
type Story = StoryObj<typeof Button>

export const Default: Story = {}
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button>Default</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Delete</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
}
