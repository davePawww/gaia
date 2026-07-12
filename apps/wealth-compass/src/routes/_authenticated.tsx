import { createFileRoute, Outlet, Link } from "@tanstack/react-router"
import { useAuthActions } from "@convex-dev/auth/react"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@gaia/ui/components/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@gaia/ui/components/avatar"
import {
  LayoutDashboard,
  ArrowLeftRight,
  Target,
  History,
  Settings,
  LogOut,
  User,
} from "lucide-react"
import { useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"

const mainNav = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Transactions", url: "/transactions", icon: ArrowLeftRight },
  { title: "Goals", url: "/goals", icon: Target },
  { title: "History", url: "/history", icon: History },
]

const secondaryNav = [
  { title: "Settings", url: "/settings", icon: Settings },
]

function AuthenticatedLayout() {
  const { signOut } = useAuthActions()
  const convexUser = useQuery(api.users.getCurrentUser)

  const userInitial = convexUser?.name
    ? convexUser.name.charAt(0).toUpperCase()
    : "U"

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <span className="text-lg font-logo font-black tracking-tighter">
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
        <SidebarFooter className="p-4 border-t border-sidebar-border">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger render={<SidebarMenuButton />}>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={undefined} alt="User" />
                    <AvatarFallback>{userInitial}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-left overflow-hidden">
                    <span className="text-sm font-medium truncate">
                      {convexUser?.name ?? "Account"}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      {convexUser?.email ?? "user@example.com"}
                    </span>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="start" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {convexUser?.name ?? "User"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {convexUser?.email ?? "user@example.com"}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem render={<Link to="/settings" />}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <main className="flex-1 p-6">
        <header className="flex items-center justify-between mb-6">
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
