import type { Meta, StoryObj } from "@storybook/react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@gaia/ui/components/card"

function DefaultCard() {
  return (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This is the card content area. You can put any content here.</p>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">Card footer</p>
      </CardFooter>
    </Card>
  )
}

function SmallCard() {
  return (
    <Card size="sm" className="w-80">
      <CardHeader>
        <CardTitle>Small Card</CardTitle>
        <CardDescription>A compact card variant.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Small card with less padding.</p>
      </CardContent>
    </Card>
  )
}

const meta: Meta<typeof Card> = {
  title: "Components/Card",
  component: DefaultCard,
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <DefaultCard />,
}

export const Small: Story = {
  render: () => <SmallCard />,
}

export const ImageHeader: Story = {
  render: () => (
    <Card className="w-80 overflow-hidden">
      <img
        src="https://placehold.co/600x400/8b5cf6/ffffff?text=Card+Image"
        alt="Card image"
        className="aspect-video w-full object-cover"
      />
      <CardHeader>
        <CardTitle>Card with Image</CardTitle>
      </CardHeader>
      <CardContent>
        <p>This card has an image at the top.</p>
      </CardContent>
    </Card>
  ),
}
