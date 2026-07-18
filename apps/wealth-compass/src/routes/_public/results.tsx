import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { Button } from "@gaia/ui/components/button"
import { ArrowRight, ChevronLeft } from "lucide-react"
import {
  PERSONALITY_DESCRIPTIONS,
  type PersonalityType,
} from "@/lib/questionnaire-data"
import {
  Home,
  TrendingUp,
  Shield,
  BookOpen,
  Gamepad2,
  Heart,
} from "lucide-react"
import { cn } from "@gaia/ui/lib/utils"

const JAR_ALLOCATION: Record<
  PersonalityType,
  {
    name: string
    percentage: number
    color: string
    icon: typeof Home
  }[]
> = {
  balanced: [
    { name: "NEC", percentage: 55, color: "bg-red-500", icon: Home },
    { name: "FFA", percentage: 10, color: "bg-amber-500", icon: TrendingUp },
    { name: "LTSS", percentage: 10, color: "bg-blue-500", icon: Shield },
    { name: "EDU", percentage: 10, color: "bg-yellow-500", icon: BookOpen },
    { name: "PLAY", percentage: 10, color: "bg-purple-500", icon: Gamepad2 },
    { name: "GIVE", percentage: 5, color: "bg-green-500", icon: Heart },
  ],
  spender: [
    { name: "NEC", percentage: 55, color: "bg-red-500", icon: Home },
    { name: "FFA", percentage: 15, color: "bg-amber-500", icon: TrendingUp },
    { name: "LTSS", percentage: 10, color: "bg-blue-500", icon: Shield },
    { name: "EDU", percentage: 10, color: "bg-yellow-500", icon: BookOpen },
    { name: "PLAY", percentage: 5, color: "bg-purple-500", icon: Gamepad2 },
    { name: "GIVE", percentage: 5, color: "bg-green-500", icon: Heart },
  ],
  saver: [
    { name: "NEC", percentage: 45, color: "bg-red-500", icon: Home },
    { name: "FFA", percentage: 15, color: "bg-amber-500", icon: TrendingUp },
    { name: "LTSS", percentage: 10, color: "bg-blue-500", icon: Shield },
    { name: "EDU", percentage: 10, color: "bg-yellow-500", icon: BookOpen },
    { name: "PLAY", percentage: 15, color: "bg-purple-500", icon: Gamepad2 },
    { name: "GIVE", percentage: 5, color: "bg-green-500", icon: Heart },
  ],
  avoider: [
    { name: "NEC", percentage: 55, color: "bg-red-500", icon: Home },
    { name: "FFA", percentage: 10, color: "bg-amber-500", icon: TrendingUp },
    { name: "LTSS", percentage: 10, color: "bg-blue-500", icon: Shield },
    { name: "EDU", percentage: 10, color: "bg-yellow-500", icon: BookOpen },
    { name: "PLAY", percentage: 10, color: "bg-purple-500", icon: Gamepad2 },
    { name: "GIVE", percentage: 5, color: "bg-green-500", icon: Heart },
  ],
}

function ResultsPage() {
  const navigate = useNavigate()
  const [personality, setPersonality] = useState<PersonalityType | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem("wealth-compass-personality") as PersonalityType | null
    if (!stored) {
      navigate({ to: "/questionnaire" })
      return
    }
    setPersonality(stored)
  }, [navigate])

  if (!personality) {
    return null
  }

  const info = PERSONALITY_DESCRIPTIONS[personality]
  const allocation = JAR_ALLOCATION[personality]

  const handleRetake = () => {
    localStorage.removeItem("wealth-compass-personality")
    navigate({ to: "/questionnaire" })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-2xl items-center px-4">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="space-y-8">
          {/* Result */}
          <div className="text-center">
            <p className="text-sm font-medium uppercase tracking-wider text-primary">
              Your Money Personality
            </p>
            <h1 className="mt-2 text-4xl font-bold sm:text-5xl">
              {info.name}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              {info.description}
            </p>
          </div>

          {/* Allocation preview */}
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">
              Your Jar Allocation
            </h2>
            <div className="space-y-4">
              {allocation.map((jar) => (
                <div key={jar.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn("h-3 w-3 rounded-full", jar.color)} />
                      <span className="text-sm font-medium">{jar.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {jar.percentage}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-500", jar.color)}
                      style={{ width: `${jar.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="rounded-lg border bg-primary/5 p-6 text-center">
            <h3 className="text-lg font-semibold">How does this look?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              You can always adjust your jar percentages later in Settings.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                to="/sign-up"
                search={{ personality }}
              >
                <Button size="lg" className="w-full sm:w-auto">
                  Create Account to Start
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                onClick={handleRetake}
                className="w-full sm:w-auto"
              >
                Retake Quiz
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute("/_public/results")({
  component: ResultsPage,
})
