import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useAuthActions } from "@convex-dev/auth/react"
import { useState } from "react"
import { Button } from "@gaia/ui/components/button"
import { Input } from "@gaia/ui/components/input"
import { Label } from "@gaia/ui/components/label"
import { Link } from "@tanstack/react-router"
import { ChevronLeft } from "lucide-react"
import { toast } from "sonner"

function SignInPage() {
  const navigate = useNavigate()
  const { signIn } = useAuthActions()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await signIn("password", { email, password, flow: "signIn" })
      toast.success("Signed in successfully!")
      navigate({ to: "/dashboard" })
    } catch (error) {
      console.error(error)
      toast.error("Invalid email or password.")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      await signIn("google")
    } catch (error) {
      console.error(error)
      toast.error("Failed to sign in with Google.")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <Link 
          to="/" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Home
        </Link>
        <div className="text-center">
          <h1 className="text-2xl font-bold">Sign In</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Welcome back to Wealth Compass
          </p>
        </div>
        <form onSubmit={handleEmailSignIn} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignIn}
        >
          Sign in with Google
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link to="/sign-up" className="text-primary underline-offset-4 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

export const Route = createFileRoute("/sign-in")({
  component: SignInPage,
})
