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
        "ml-8 flex items-center gap-6 text-sm font-medium",
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
      className={cn("ml-auto flex items-center gap-3", className)}
      {...props}
    />
  )
}

export { Header, HeaderLeft, HeaderNav, HeaderRight }
