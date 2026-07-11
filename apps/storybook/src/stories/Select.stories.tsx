import type { Meta, StoryObj } from "@storybook/react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@gaia/ui/components/select"

function BasicSelect() {
  return (
    <Select defaultValue="apple">
      <SelectTrigger className="w-48" aria-label="Select a fruit">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="orange">Orange</SelectItem>
      </SelectContent>
    </Select>
  )
}

function SelectWithGroups() {
  return (
    <Select defaultValue="react">
      <SelectTrigger className="w-48" aria-label="Select a technology">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Frameworks</SelectLabel>
          <SelectItem value="react">React</SelectItem>
          <SelectItem value="vue">Vue</SelectItem>
          <SelectItem value="svelte">Svelte</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Tools</SelectLabel>
          <SelectItem value="vite">Vite</SelectItem>
          <SelectItem value="webpack">Webpack</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

const meta: Meta<typeof Select> = {
  title: "Components/Select",
  component: BasicSelect,
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <BasicSelect />,
}

export const WithGroups: Story = {
  render: () => <SelectWithGroups />,
}

export const Small: Story = {
  render: () => (
    <Select defaultValue="react">
      <SelectTrigger
        size="sm"
        className="w-48"
        aria-label="Select a technology"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="react">React</SelectItem>
        <SelectItem value="vue">Vue</SelectItem>
        <SelectItem value="svelte">Svelte</SelectItem>
      </SelectContent>
    </Select>
  ),
}

export const Open: Story = {
  parameters: {
    a11y: {
      config: {
        rules: [
          // False positive from floating-ui focus guards (aria-hidden + tabindex=0
          // on same element for focus trapping). Known framework-level conflict.
          { id: "aria-hidden-focus", enabled: false },
          // Portal-rendered popup lives outside axe-core's story-root scope,
          // so aria-controls on the trigger can't find the list element's ID.
          { id: "aria-valid-attr-value", enabled: false },
        ],
      },
    },
  },
  render: () => (
    <Select defaultOpen defaultValue="apple">
      <SelectTrigger className="w-48" aria-label="Select a fruit">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="orange">Orange</SelectItem>
        <SelectItem value="grape">Grape</SelectItem>
        <SelectItem value="kiwi">Kiwi</SelectItem>
        <SelectItem value="mango">Mango</SelectItem>
      </SelectContent>
    </Select>
  ),
}
