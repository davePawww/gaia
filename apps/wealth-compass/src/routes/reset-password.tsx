import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { useAuthActions } from "@convex-dev/auth/react"
import { useState } from "react"
import { Button } from "@gaia/ui/components/button"
import { Input } from "@gaia/ui/components/input"
import { Label } from "@gaia/ui/components/label"
import { ChevronLeft } from "lucide-react"
import { toast } from "sonner"
import { resolveVerificationCode } from "../lib/auth-code"

function ResetPasswordPage() {
  const navigate = useNavigate()
  const { signIn } = useAuthActions()
  const { code: routeCode } = Route.useSearch()
  const code = resolveVerificationCode(
    routeCode,
    typeof window === "undefined" ? "" : window.location.search,
    typeof window === "undefined" ? "" : window.location.hash,
  )
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmation, setConfirmation] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError("")

    if (!code) {
      setError("This reset link is missing its verification code.")
      return
    }
    if (password !== confirmation) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)
    try {
      await signIn("password", {
        email,
        code,
        newPassword: password,
        flow: "reset-verification",
      })
      toast.success("Your password has been reset.")
      navigate({ to: "/dashboard" })
    } catch {
      setError("This reset link is invalid, expired, or has already been used.")
    } finally {
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
          <h1 className="text-2xl font-bold">Set a new password</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Use the email address that received the reset link.
          </p>
        </div>
        {!code ? (
          <div className="rounded-lg border bg-muted/40 p-4 text-center text-sm text-muted-foreground">
            This reset link is missing its verification code. Request a new one
            from the{" "}
            <Link
              to="/forgot-password"
              className="text-primary underline-offset-4 hover:underline"
            >
              password recovery page
            </Link>
            .
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                type="password"
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmation">Confirm new password</Label>
              <Input
                id="confirmation"
                type="password"
                minLength={8}
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Resetting password..." : "Reset password"}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search: Record<string, unknown>) => ({
    code: typeof search.code === "string" ? search.code : undefined,
  }),
  component: ResetPasswordPage,
})
