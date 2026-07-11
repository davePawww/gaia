import { createFileRoute } from "@tanstack/react-router"

function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <h1 className="text-4xl font-bold">Wealth Compass</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Build wealth with the Money Jar System
      </p>
    </div>
  )
}

export const Route = createFileRoute("/_public/")({
  component: LandingPage,
})
