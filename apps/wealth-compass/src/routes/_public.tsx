import { createFileRoute, Outlet, Link } from "@tanstack/react-router"
import { useConvexAuth } from "@convex-dev/auth/react"
import { useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import {
  Header,
  HeaderLeft,
  HeaderNav,
  HeaderRight,
  HeaderMenuTrigger,
} from "@gaia/ui/components/header"
import { ThemeToggle, ThemeToggleFullWidth } from "@gaia/ui/components/theme-toggle"
import { Button } from "@gaia/ui/components/button"
import { Avatar, AvatarFallback, AvatarImage } from "@gaia/ui/components/avatar"
import { Skeleton } from "@gaia/ui/components/skeleton"
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
  const { isLoading, isAuthenticated } = useConvexAuth()
  const currentUser = useQuery(api.users.getCurrentUser)

  const userInitial = currentUser?.name
    ? currentUser.name.charAt(0).toUpperCase()
    : "U"

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
          {isLoading || (isAuthenticated && !currentUser) ? (
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-16 rounded-md" />
              <Skeleton className="h-8 w-20 rounded-md" />
            </div>
          ) : isAuthenticated && currentUser ? (
            <Link to="/dashboard">
              <Avatar className="h-8 w-8 cursor-pointer">
                <AvatarImage src={currentUser.image} alt={currentUser.name ?? "User"} />
                <AvatarFallback>{userInitial}</AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <>
              <Link to="/sign-in">
                <Button variant="secondary" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/sign-up">
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          )}
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
              {isLoading || (isAuthenticated && !currentUser) ? (
                <div className="flex flex-col gap-3">
                  <Skeleton className="h-10 w-full rounded-md" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
              ) : isAuthenticated && currentUser ? (
                <Link to="/dashboard" className="w-full">
                  <Button variant="secondary" className="w-full gap-2">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={currentUser.image} alt={currentUser.name ?? "User"} />
                      <AvatarFallback className="text-xs">{userInitial}</AvatarFallback>
                    </Avatar>
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/sign-in" className="w-full">
                    <Button variant="secondary" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/sign-up" className="w-full">
                    <Button className="w-full">Get Started</Button>
                  </Link>
                </>
              )}
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
