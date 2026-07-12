import { createFileRoute, Outlet, Link } from "@tanstack/react-router"
import {
  Header,
  HeaderLeft,
  HeaderNav,
  HeaderRight,
  HeaderMenuTrigger,
} from "@gaia/ui/components/header"
import { ThemeToggle, ThemeToggleFullWidth } from "@gaia/ui/components/theme-toggle"
import { Button } from "@gaia/ui/components/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@gaia/ui/components/sheet"

const navItems = [
  { label: "About", href: "/about" },
  { label: "How it Works", href: "/how-it-works" },
  { label: "FAQs", href: "/faqs" },
]

function PublicLayout() {
  return (
    <div className="min-h-screen">
      <Header>
        <HeaderLeft>
          <Link to="/" className="text-lg font-black tracking-tighter font-logo">
            WealthCompass
          </Link>
        </HeaderLeft>
        <HeaderNav>
          {navItems.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </HeaderNav>
        <HeaderRight>
          <ThemeToggle />
          <Link to="/sign-in">
            <Button variant="secondary" size="sm">
              Sign In
            </Button>
          </Link>
          <Link to="/sign-up">
            <Button size="sm">Get Started</Button>
          </Link>
        </HeaderRight>
        <Sheet>
          <SheetTrigger render={<HeaderMenuTrigger />}>
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
          </SheetTrigger>
          <SheetContent
            side="right"
            className="flex w-[300px] flex-col sm:w-[400px]"
          >
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-1 flex-col gap-4 p-4">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-lg font-medium"
                >
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="flex flex-col gap-3 border-t px-4 py-6">
              <ThemeToggleFullWidth />
              <Link to="/sign-in" className="w-full">
                <Button variant="secondary" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link to="/sign-up" className="w-full">
                <Button className="w-full">Get Started</Button>
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </Header>
      <main>
        <Outlet />
      </main>
      <footer className="w-full border-t border-border bg-background py-5">
        <div className="text-center text-sm text-muted-foreground">
          &copy; 2026 Dave Paurillo. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

export const Route = createFileRoute("/_public")({
  component: PublicLayout,
})
