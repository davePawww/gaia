import { createFileRoute, Link } from "@tanstack/react-router"
import { useAuthActions } from "@convex-dev/auth/react"
import { useState } from "react"
import { Button } from "@gaia/ui/components/button"
import { Input } from "@gaia/ui/components/input"
import { Label } from "@gaia/ui/components/label"
import { ChevronLeft } from "lucide-react"

function ForgotPasswordPage() {
  const { signIn } = useAuthActions()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)

    try {
      await signIn("password", {
        email,
        flow: "reset",
        redirectTo: "/reset-password",
      })
    } catch {
      // Keep the response generic so this page does not reveal whether an
      // account exists for a particular email address.
    } finally {
      setSubmitted(true)
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <Link
          to="/sign-in"
          className="inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Sign In
        </Link>
        <div className="text-center">
          <h1 className="text-2xl font-bold">Forgot your password?</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your email and we&apos;ll send reset instructions if an account
            exists.
          </p>
        </div>
        {submitted ? (
          <div className="rounded-lg border bg-muted/40 p-4 text-center text-sm text-muted-foreground">
            Check your inbox for a password reset link. The link expires in one
            hour and can only be used once.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending..." : "Send reset link"}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
})
