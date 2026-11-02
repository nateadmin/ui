import type { Meta, StoryObj } from "@storybook/react-vite"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

const meta: Meta<typeof Card> = { title: "Components/Card", component: Card }
export default meta

export const Default: StoryObj<typeof Card> = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Card title</CardTitle>
        <CardDescription>Card description</CardDescription>
      </CardHeader>
      <CardContent>Card content</CardContent>
      <CardFooter>
        <Button>Action</Button>
      </CardFooter>
    </Card>
  ),
}
