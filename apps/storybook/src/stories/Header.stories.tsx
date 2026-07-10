import type { Meta, StoryObj } from "@storybook/react"
import {
  Header,
  HeaderLeft,
  HeaderNav,
  HeaderRight,
  ResponsiveHeader,
} from "@gaia/ui/components/header"
import { Button } from "@gaia/ui/components/button"

const meta: Meta<typeof Header> = {
  title: "Components/Layout/Header",
  component: Header,
  parameters: {
    layout: "fullscreen",
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div style={{ width: "100vw" }}>
      <Header>
        <HeaderLeft>
          <span className="text-lg font-bold tracking-tight">Gaia</span>
        </HeaderLeft>
        <HeaderNav>
          <a href="#">Home</a>
          <a href="#">Features</a>
          <a href="#">Pricing</a>
          <a href="#">About</a>
        </HeaderNav>
        <HeaderRight>
          <Button variant="ghost" size="sm">
            Sign In
          </Button>
          <Button size="sm">Get Started</Button>
        </HeaderRight>
      </Header>
    </div>
  ),
}

export const Simple: Story = {
  parameters: {
    layout: "fullscreen",
  },
  render: () => (
    <div style={{ width: "100vw" }}>
      <Header>
        <HeaderLeft>
          <span className="text-lg font-bold tracking-tight">Gaia</span>
        </HeaderLeft>
      </Header>
    </div>
  ),
}

export const Responsive: Story = {
  render: () => (
    <div style={{ width: "100vw" }}>
      <ResponsiveHeader
        logo={<span className="text-lg font-bold tracking-tight">Gaia</span>}
        navItems={[
          { label: "Home", href: "#" },
          { label: "Features", href: "#" },
          { label: "Pricing", href: "#" },
          { label: "About", href: "#" },
        ]}
        actions={[
          { label: "Sign In", variant: "ghost" },
          { label: "Get Started", variant: "default" },
        ]}
      />
    </div>
  ),
}
