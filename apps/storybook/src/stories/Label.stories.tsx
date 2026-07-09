import type { Meta, StoryObj } from "@storybook/react"
import { Label } from "@gaia/ui/components/label"

const meta: Meta<typeof Label> = {
  title: "Components/Label",
  component: Label,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    children: {
      control: "text",
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: "Email Address",
  },
}

export const WithInput: Story = {
  render: () => (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="email">Email Address</Label>
      <input
        id="email"
        className="h-8 w-64 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm"
        placeholder="you@example.com"
      />
    </div>
  ),
}

export const Required: Story = {
  render: () => (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="name">
        Full Name <span className="text-destructive">*</span>
      </Label>
      <input
        id="name"
        className="h-8 w-64 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm"
        placeholder="John Smith"
      />
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-1.5" data-disabled>
      <Label htmlFor="disabled-field">Disabled Field</Label>
      <input
        id="disabled-field"
        className="h-8 w-64 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm opacity-50"
        placeholder="Can't edit this"
        disabled
      />
    </div>
  ),
}
