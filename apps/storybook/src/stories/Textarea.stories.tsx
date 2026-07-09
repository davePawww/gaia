import type { Meta, StoryObj } from "@storybook/react"
import { Textarea } from "@gaia/ui/components/textarea"

const meta: Meta<typeof Textarea> = {
  title: "Components/Textarea",
  component: Textarea,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    placeholder: {
      control: "text",
    },
    disabled: {
      control: "boolean",
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: "Type your message here...",
  },
}

export const WithValue: Story = {
  args: {
    defaultValue: "This is some text content in the textarea.",
    placeholder: "Type your message here...",
  },
}

export const Disabled: Story = {
  args: {
    placeholder: "Disabled textarea",
    disabled: true,
  },
}

export const WithError: Story = {
  args: {
    placeholder: "This field has an error",
    "aria-invalid": true,
  },
}
