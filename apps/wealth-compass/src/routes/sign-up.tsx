import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useAuthActions, useConvexAuth } from "@convex-dev/auth/react"
import { useEffect, useState } from "react"
import { useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import { Button } from "@gaia/ui/components/button"
import { Input } from "@gaia/ui/components/input"
import { Label } from "@gaia/ui/components/label"
import { Link } from "@tanstack/react-router"
import { ChevronLeft, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { PERSONALITY_PRESETS, type PersonalityPresetName } from "../../convex/constants"

function SignUpPage() {
  const navigate = useNavigate()
  const { signIn } = useAuthActions()
  const { isLoading, isAuthenticated } = useConvexAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const updateAllJarPercentages = useMutation(api.jars.updateAllJarPercentages)

  // Get personality from localStorage (set by results page)
  const personality = localStorage.getItem("wealth-compass-personality") as PersonalityPresetName | null

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // Apply personality preset after sign-up if available
      if (personality) {
        const preset = PERSONALITY_PRESETS.find(
          (p) => p.name.toLowerCase() === personality.toLowerCase()
        )
        if (preset) {
          updateAllJarPercentages({
            percentages: preset.percentages,
          }).catch(console.error)
        }
        localStorage.removeItem("wealth-compass-personality")
      }
      navigate({ to: "/dashboard" })
    }
  }, [isLoading, isAuthenticated, navigate, personality, updateAllJarPercentages])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isAuthenticated) {
    return null
  }

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await signIn("password", { email, password, name, flow: "signUp" })
      toast.success("Account created successfully!")
      navigate({ to: "/dashboard" })
    } catch (error) {
      console.error(error)
      toast.error("Failed to create account. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    try {
      await signIn("google")
    } catch (error) {
      console.error(error)
      toast.error("Failed to sign up with Google.")
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
          <h1 className="text-2xl font-bold">Create Account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Start building wealth with the Money Jar System
          </p>
          {personality && (
            <p className="mt-2 text-xs text-primary">
              Your personality: {personality.charAt(0).toUpperCase() + personality.slice(1)}
            </p>
          )}
        </div>
        <form onSubmit={handleEmailSignUp} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
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
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
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
          onClick={handleGoogleSignUp}
        >
          Sign up with Google
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/sign-in" className="text-primary underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export const Route = createFileRoute("/sign-up")({
  component: SignUpPage,
})
