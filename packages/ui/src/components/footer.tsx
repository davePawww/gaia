import * as React from "react"

import { cn } from "@gaia/ui/lib/utils"

function Footer({ className, ...props }: React.ComponentProps<"footer">) {
  return (
    <footer
      data-slot="footer"
      className={cn(
        "w-full border-t border-border bg-background py-5",
        className
      )}
      {...props}
    />
  )
}

function FooterContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="footer-content"
      className={cn(
        "mx-auto mb-8 grid max-w-7xl grid-cols-2 gap-8 border-b pb-8 md:grid-cols-4",
        className
      )}
      {...props}
    />
  )
}

function FooterBottom({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="footer-bottom"
      className={cn("text-center text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export { Footer, FooterContent, FooterBottom }
