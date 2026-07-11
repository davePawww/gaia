import type { Meta, StoryObj } from "@storybook/react"
import { Switch } from "@gaia/ui/components/switch"

const meta: Meta<typeof Switch> = {
  title: "Components/Switch",
  component: Switch,
  args: {
    "aria-label": "Toggle setting",
  },
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "default"],
    },
    disabled: {
      control: "boolean",
    },
    defaultChecked: {
      control: "boolean",
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Off: Story = {
  args: {},
}

export const On: Story = {
  args: {
    defaultChecked: true,
  },
}

export const Small: Story = {
  args: {
    size: "sm",
    defaultChecked: true,
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}

export const DisabledOn: Story = {
  args: {
    disabled: true,
    defaultChecked: true,
  },
}
