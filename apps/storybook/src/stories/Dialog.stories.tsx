import type { Meta, StoryObj } from "@storybook/react"
import { Button } from "@gaia/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@gaia/ui/components/dialog"

function SimpleDialog() {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" />}>Open Dialog</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Action</DialogTitle>
          <DialogDescription>
            Are you sure you want to proceed? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter showCloseButton>
          <p className="py-2 text-xs text-muted-foreground">
            This dialog will close when you click Close.
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const meta: Meta<typeof Dialog> = {
  title: "Components/Dialog",
  component: SimpleDialog,
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <SimpleDialog />,
}

export const Open: Story = {
  parameters: {
    a11y: {
      config: {
        rules: [
          // False positive from floating-ui focus guards (aria-hidden + tabindex=0
          // on same element for focus trapping). Known framework-level conflict.
          { id: "aria-hidden-focus", enabled: false },
        ],
      },
    },
  },
  render: () => (
    <Dialog defaultOpen>
      <DialogContent aria-label="Dialog">
        <DialogHeader>
          <DialogTitle>Confirm Action</DialogTitle>
          <DialogDescription>
            Are you sure you want to proceed? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter showCloseButton>
          <p className="py-2 text-xs text-muted-foreground">
            This dialog will close when you click Close.
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}
