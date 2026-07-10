import type { Meta, StoryObj } from "@storybook/react"
import { Footer, FooterContent, FooterBottom } from "@gaia/ui/components/footer"

const meta: Meta<typeof Footer> = {
  title: "Components/Layout/Footer",
  component: Footer,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="w-screen">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Footer>
      <FooterContent>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Product</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#">Features</a></li>
            <li><a href="#">Pricing</a></li>
            <li><a href="#">Changelog</a></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Company</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#">About</a></li>
            <li><a href="#">Blog</a></li>
            <li><a href="#">Careers</a></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Resources</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#">Docs</a></li>
            <li><a href="#">API</a></li>
            <li><a href="#">Support</a></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Legal</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#">Privacy</a></li>
            <li><a href="#">Terms</a></li>
          </ul>
        </div>
      </FooterContent>
      <FooterBottom>
        &copy; 2026 Gaia. All rights reserved.
      </FooterBottom>
    </Footer>
  ),
}

export const Simple: Story = {
  render: () => (
    <Footer>
      <FooterBottom>
        &copy; 2026 Gaia. All rights reserved.
      </FooterBottom>
    </Footer>
  ),
}
