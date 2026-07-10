import * as React from "react"

import { cn } from "@gaia/ui/lib/utils"

function Footer({ className, ...props }: React.ComponentProps<"footer">) {
  return (
    <footer
      data-slot="footer"
      className={cn(
        "w-full border-t bg-background px-6 py-8",
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
        "mx-auto grid max-w-7xl grid-cols-2 gap-8 md:grid-cols-4",
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
      className={cn(
        "mt-8 border-t pt-4 text-center text-sm text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

export { Footer, FooterContent, FooterBottom }
