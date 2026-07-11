import { createFileRoute, Outlet } from "@tanstack/react-router"
import { ResponsiveHeader } from "@gaia/ui/components/header"

const navItems = [
  { label: "About", href: "/about" },
  { label: "How it Works", href: "/how-it-works" },
  { label: "FAQs", href: "/faqs" },
]

const actions = [
  { label: "Sign In", variant: "ghost" as const, onClick: () => {} },
  { label: "Sign Up", variant: "default" as const, onClick: () => {} },
]

function PublicLayout() {
  return (
    <div className="min-h-screen">
      <ResponsiveHeader
        logo={<span className="text-lg font-bold">Wealth Compass</span>}
        navItems={navItems}
        actions={actions}
      />
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export const Route = createFileRoute("/_public")({
  component: PublicLayout,
})
