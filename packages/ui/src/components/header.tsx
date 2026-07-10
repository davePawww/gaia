import * as React from "react"

import { cn } from "@gaia/ui/lib/utils"

function Header({ className, ...props }: React.ComponentProps<"header">) {
  return (
    <header
      data-slot="header"
      className={cn(
        "flex h-16 w-full items-center gap-4 border-b bg-background px-6",
        className
      )}
      {...props}
    />
  )
}

function HeaderLeft({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="header-left"
      className={cn("flex items-center gap-3", className)}
      {...props}
    />
  )
}

function HeaderNav({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      data-slot="header-nav"
      className={cn(
        "ml-8 hidden items-center gap-6 text-sm font-medium md:flex",
        className
      )}
      {...props}
    />
  )
}

function HeaderRight({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="header-right"
      className={cn("ml-auto hidden items-center gap-3 sm:flex", className)}
      {...props}
    />
  )
}

function HeaderMenuTrigger({ className, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      data-slot="header-menu-trigger"
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 lg:hidden",
        className
      )}
      {...props}
    />
  )
}

export { Header, HeaderLeft, HeaderNav, HeaderRight, HeaderMenuTrigger }
