import { createFileRoute } from "@tanstack/react-router"
import { Button } from "@gaia/ui/components/button"
import {
  Home,
  Shield,
  BookOpen,
  Gamepad2,
  Heart,
  TrendingUp,
  ArrowRight,
  Wallet,
  Target,
  BarChart3,
} from "lucide-react"

const jars = [
  {
    name: "NEC",
    percentage: 55,
    icon: Home,
    color: "text-red-500",
    desc: "Necessities",
  },
  {
    name: "LTSS",
    percentage: 10,
    icon: Shield,
    color: "text-blue-500",
    desc: "Long-term Savings",
  },
  {
    name: "EDU",
    percentage: 10,
    icon: BookOpen,
    color: "text-yellow-500",
    desc: "Education",
  },
  {
    name: "PLAY",
    percentage: 10,
    icon: Gamepad2,
    color: "text-purple-500",
    desc: "Play",
  },
  {
    name: "GIVE",
    percentage: 10,
    icon: Heart,
    color: "text-green-500",
    desc: "Give",
  },
  {
    name: "FFA",
    percentage: 5,
    icon: TrendingUp,
    color: "text-amber-500",
    desc: "Financial Freedom",
  },
]

const features = [
  {
    icon: Wallet,
    title: "Smart Allocation",
    desc: "Automatically split your income into six purposeful jars based on your custom percentages.",
  },
  {
    icon: Target,
    title: "Goal Tracking",
    desc: "Set targets for individual jars or your total net worth and watch your progress grow.",
  },
  {
    icon: BarChart3,
    title: "Visual Insights",
    desc: "See where your money goes with charts and history views across daily, weekly, and monthly periods.",
  },
]

function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-6 py-24 text-center">
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
          Build Wealth,
          <br />
          One Jar at a Time
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          The Money Jar System helps you take control of your finances by
          dividing every dollar into purposeful categories. Stop guessing where
          your money goes - start directing it.
        </p>
        <div className="mt-8 flex gap-4">
          <Button size="lg">
            Get Started Free
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline">
            See How it Works
          </Button>
        </div>
      </section>

      {/* Jar Overview */}
      <section className="bg-muted/40 px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold">Six Jars. Total Control.</h2>
          <p className="mt-4 text-muted-foreground">
            Every dollar you earn gets divided into these six jars. Adjust the
            percentages to match your life.
          </p>
        </div>
        <div className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-3">
          {jars.map((jar) => (
            <div
              key={jar.name}
              className="flex flex-col items-center rounded-lg border bg-background p-6 shadow-sm"
            >
              <jar.icon className={`h-8 w-8 ${jar.color}`} />
              <span className="mt-3 text-2xl font-bold">{jar.percentage}%</span>
              <span className="mt-1 text-sm font-medium">{jar.name}</span>
              <span className="text-xs text-muted-foreground">{jar.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold">Everything You Need</h2>
          <p className="mt-4 text-muted-foreground">
            Simple tools to help you build lasting financial habits.
          </p>
        </div>
        <div className="mx-auto mt-12 grid max-w-3xl gap-8 sm:grid-cols-3">
          {features.map((feat) => (
            <div
              key={feat.title}
              className="flex flex-col items-center text-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <feat.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{feat.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-muted/40 px-6 py-20 text-center">
        <h2 className="text-3xl font-bold">Ready to Take Control?</h2>
        <p className="mt-4 text-muted-foreground">
          Start building wealth today with the Money Jar System.
        </p>
        <Button size="lg" className="mt-8">
          Get Started Free
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </section>
    </div>
  )
}

export const Route = createFileRoute("/_public/")({
  component: LandingPage,
})
