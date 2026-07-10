import type { Meta, StoryObj } from "@storybook/react"
import { Header, HeaderLeft, HeaderNav, HeaderRight, HeaderMenuTrigger } from "@gaia/ui/components/header"
import { Button } from "@gaia/ui/components/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@gaia/ui/components/sheet"

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
          <Button variant="ghost" size="sm">Sign In</Button>
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
          <Button variant="ghost" size="sm">Sign In</Button>
          <Button size="sm">Get Started</Button>
        </HeaderRight>
        <Sheet>
          <SheetTrigger asChild>
            <HeaderMenuTrigger>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
              <span className="sr-only">Toggle menu</span>
            </HeaderMenuTrigger>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-4">
              <a href="#" className="text-lg">Home</a>
              <a href="#" className="text-lg">Features</a>
              <a href="#" className="text-lg">Pricing</a>
              <a href="#" className="text-lg">About</a>
            </nav>
            <div className="mt-8 flex flex-col gap-3">
              <Button variant="outline" className="w-full">Sign In</Button>
              <Button className="w-full">Get Started</Button>
            </div>
          </SheetContent>
        </Sheet>
      </Header>
    </div>
  ),
}
