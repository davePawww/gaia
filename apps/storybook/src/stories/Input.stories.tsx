import type { Meta, StoryObj } from "@storybook/react"
import { Input } from "@gaia/ui/components/input"

const meta: Meta<typeof Input> = {
  title: "Components/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    type: {
      control: "select",
      options: ["text", "email", "password", "number", "tel", "url", "file", "search"],
    },
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
    placeholder: "Enter text...",
  },
}

export const WithValue: Story = {
  args: {
    defaultValue: "Some value",
    placeholder: "Enter text...",
  },
}

export const Email: Story = {
  args: {
    type: "email",
    placeholder: "you@example.com",
  },
}

export const Password: Story = {
  args: {
    type: "password",
    defaultValue: "supersecret",
    placeholder: "Enter password",
  },
}

export const File: Story = {
  args: {
    type: "file",
    "aria-label": "Choose a file",
  },
}

export const Disabled: Story = {
  args: {
    placeholder: "Disabled input",
    disabled: true,
  },
}

export const WithError: Story = {
  args: {
    placeholder: "Enter your name",
    defaultValue: "",
    "aria-invalid": true,
  },
}
