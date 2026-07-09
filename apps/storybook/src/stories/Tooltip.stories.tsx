import type { Meta, StoryObj } from "@storybook/react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@gaia/ui/components/tooltip"

function SimpleTooltip() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="rounded-md border border-input bg-background px-3 py-1.5 text-sm">
          Hover me
        </TooltipTrigger>
        <TooltipContent>
          <p>Hello there!</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function TooltipOnIcon() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="inline-flex size-8 items-center justify-center rounded-md border border-input bg-background text-sm">
          ?
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Helpful information</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

const meta: Meta<typeof Tooltip> = {
  title: "Components/Tooltip",
  component: SimpleTooltip,
  parameters: {
    layout: "centered",
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <SimpleTooltip />,
}

export const OnIcon: Story = {
  render: () => <TooltipOnIcon />,
}

export const Bottom: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="rounded-md border border-input bg-background px-3 py-1.5 text-sm">
          Bottom tooltip
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>I appear below</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
}

export const Visible: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip defaultOpen>
        <TooltipTrigger className="rounded-md border border-input bg-background px-3 py-1.5 text-sm">
          Hover me
        </TooltipTrigger>
        <TooltipContent>
          <p>Hello there!</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
}
