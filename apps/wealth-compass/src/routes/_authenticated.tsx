import { createFileRoute, Outlet } from "@tanstack/react-router"
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
import { Button } from "@gaia/ui/components/button"
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

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Transactions", url: "/transactions", icon: ArrowLeftRight },
  { title: "Goals", url: "/goals", icon: Target },
  { title: "History", url: "/history", icon: History },
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
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Wealth Compass</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <main className="flex-1 p-6">
        <header className="flex items-center justify-between mb-6">
          <SidebarTrigger />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={undefined} alt="User" />
                  <AvatarFallback>{userInitial}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
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
              <DropdownMenuItem asChild>
                <a href="/settings">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
