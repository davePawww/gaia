import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider, createRouter } from "@tanstack/react-router"
import { ConvexProvider, ConvexReactClient } from "convex/react"
import { ThemeProvider } from "@gaia/ui/lib/theme-provider"
import { routeTree } from "./routeTree.gen"
import "./index.css"

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL)

const router = createRouter({ routeTree })

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system">
      <ConvexProvider client={convex}>
        <RouterProvider router={router} />
      </ConvexProvider>
    </ThemeProvider>
  </StrictMode>
)
