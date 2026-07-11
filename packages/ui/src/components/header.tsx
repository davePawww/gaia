import * as React from "react"

import { Button, buttonVariants } from "@gaia/ui/components/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@gaia/ui/components/sheet"
import { cn } from "@gaia/ui/lib/utils"
import type { VariantProps } from "class-variance-authority"

interface NavItem {
  label: string
  href: string
}

interface Action {
  label: string
  variant?: VariantProps<typeof buttonVariants>["variant"]
  onClick?: () => void
}

interface ResponsiveHeaderProps {
  logo: React.ReactNode
  navItems?: NavItem[]
  actions?: Action[]
  className?: string
}

function Header({ className, ...props }: React.ComponentProps<"header">) {
  return (
    <header
      data-slot="header"
      className={cn(
        "flex h-16 w-full items-center gap-4 border-b border-border bg-muted/40 px-6",
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
      className={cn("ml-auto hidden items-center gap-3 md:flex", className)}
      {...props}
    />
  )
}

function HeaderMenuTrigger({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      data-slot="header-menu-trigger"
      variant="ghost"
      size="icon"
      className={cn("ml-auto md:hidden", className)}
      {...props}
    />
  )
}

function ResponsiveHeader({
  logo,
  navItems = [],
  actions = [],
  className,
}: ResponsiveHeaderProps) {
  return (
    <Header className={className}>
      <HeaderLeft>{logo}</HeaderLeft>
      <HeaderNav>
        {navItems.map((item) => (
          <a key={item.href} href={item.href}>
            {item.label}
          </a>
        ))}
      </HeaderNav>
      <HeaderRight>
        {actions.map((action) => (
          <Button
            key={action.label}
            variant={action.variant ?? "ghost"}
            size="sm"
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        ))}
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
            {actions.map((action) => (
              <Button
                key={action.label}
                variant={action.variant ?? "outline"}
                className="w-full"
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </Header>
  )
}

export {
  Header,
  HeaderLeft,
  HeaderNav,
  HeaderRight,
  HeaderMenuTrigger,
  ResponsiveHeader,
}
export type { NavItem, Action, ResponsiveHeaderProps }
