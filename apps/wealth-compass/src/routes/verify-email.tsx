import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { useAuthActions } from "@convex-dev/auth/react"
import { useState } from "react"
import { Button } from "@gaia/ui/components/button"
import { Input } from "@gaia/ui/components/input"
import { Label } from "@gaia/ui/components/label"
import { ChevronLeft } from "lucide-react"
import { toast } from "sonner"

function VerifyEmailPage() {
  const navigate = useNavigate()
  const { signIn } = useAuthActions()
  const { code = "" } = Route.useSearch()
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError("")

    if (!code) {
      setError("This verification link is missing its code.")
      return
    }

    setLoading(true)
    try {
      await signIn("password", {
        email,
        code,
        flow: "email-verification",
      })
      toast.success("Your email is verified.")
      navigate({ to: "/dashboard" })
    } catch {
      setError("This verification link is invalid, expired, or has already been used.")
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
          <h1 className="text-2xl font-bold">Verify your email</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter the email address used to create your account and the code
            from your verification link.
          </p>
        </div>
        {!code ? (
          <div className="rounded-lg border bg-muted/40 p-4 text-center text-sm text-muted-foreground">
            This verification link is missing its code. Return to sign up and
            request a new verification email.
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
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Verifying..." : "Verify email"}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}

export const Route = createFileRoute("/verify-email")({
  validateSearch: (search: Record<string, unknown>) => ({
    code: typeof search.code === "string" ? search.code : undefined,
  }),
  component: VerifyEmailPage,
})
