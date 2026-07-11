import { createFileRoute, Outlet } from "@tanstack/react-router"

function PublicLayout() {
  return (
    <div className="min-h-screen">
      <header className="border-b p-4">
        <nav className="flex gap-4">
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/how-it-works">How it Works</a>
          <a href="/faqs">FAQs</a>
          <a href="/sign-in">Sign In</a>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export const Route = createFileRoute("/_public")({
  component: PublicLayout,
})
