import { useEffect } from "react"
import {
  createFileRoute,
  Outlet,
  Link,
  useNavigate,
} from "@tanstack/react-router"
import { useConvexAuth, useAuthActions } from "@convex-dev/auth/react"
import { Loader2 } from "lucide-react"
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarHeader,
  SidebarFooter,
} from "@gaia/ui/components/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@gaia/ui/components/avatar"
import { Button } from "@gaia/ui/components/button"
import {
  LayoutDashboard,
  ArrowLeftRight,
  Target,
  History,
  Settings,
  LogOut,
} from "lucide-react"
import { useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"

const mainNav = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Transactions", url: "/transactions", icon: ArrowLeftRight },
  { title: "Goals", url: "/goals", icon: Target },
  { title: "History", url: "/history", icon: History },
]

const secondaryNav = [{ title: "Settings", url: "/settings", icon: Settings }]

function AuthenticatedLayout() {
  const { isLoading, isAuthenticated } = useConvexAuth()
  const { signOut } = useAuthActions()
  const navigate = useNavigate()
  const convexUser = useQuery(api.users.getCurrentUser)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: "/sign-in" })
    }
  }, [isLoading, isAuthenticated, navigate])

  const userInitial = convexUser?.name
    ? convexUser.name.charAt(0).toUpperCase()
    : "U"

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <span className="font-logo text-lg font-black tracking-tighter">
            WealthCompass
          </span>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainNav.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton render={<Link to={item.url} />}>
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>submenu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {secondaryNav.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton render={<Link to={item.url} />}>
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={convexUser?.avatarUrl}
                alt={convexUser?.name ?? "User"}
              />
              <AvatarFallback>{userInitial}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-sm font-medium">
                {convexUser?.name ?? "Account"}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {convexUser?.email ?? "user@example.com"}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            className="mt-3 w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
            onClick={() => signOut()}
          >
            <LogOut className="h-4 w-4" />
            <span>Sign out</span>
          </Button>
        </SidebarFooter>
      </Sidebar>
      <main className="flex-1 p-6">
        <header className="mb-6 flex items-center justify-between">
          <SidebarTrigger />
          <div className="flex items-center gap-4">
            {/* User profile summary could go here if needed, but handled by sidebar footer now */}
          </div>
        </header>
        <Outlet />
      </main>
    </SidebarProvider>
  )
}

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    // Auth check will be verified during Task 4 step 7
    // For now, the ConvexAuthProvider handles auth state
  },
  component: AuthenticatedLayout,
})
