import { createFileRoute } from "@tanstack/react-router"
import {
  Home,
  Shield,
  BookOpen,
  Gamepad2,
  Heart,
  TrendingUp,
} from "lucide-react"

const jars = [
  {
    name: "NEC",
    fullName: "Necessities",
    percentage: 55,
    icon: Home,
    color: "text-red-500",
    description:
      "Covers your essential living expenses - rent, utilities, groceries, transportation, and insurance. This is your foundation.",
  },
  {
    name: "LTSS",
    fullName: "Long-term Savings & Security",
    percentage: 10,
    icon: Shield,
    color: "text-blue-500",
    description:
      "Builds your safety net. Emergency fund, retirement contributions, and long-term investments that protect your future.",
  },
  {
    name: "EDU",
    fullName: "Education",
    percentage: 10,
    icon: BookOpen,
    color: "text-yellow-500",
    description:
      "Invests in your growth. Courses, books, coaching, and anything that expands your skills and knowledge.",
  },
  {
    name: "PLAY",
    fullName: "Play",
    percentage: 10,
    icon: Gamepad2,
    color: "text-purple-500",
    description:
      "Your guilt-free fun money. Dining out, entertainment, hobbies, and experiences that bring you joy.",
  },
  {
    name: "GIVE",
    fullName: "Give",
    percentage: 10,
    icon: Heart,
    color: "text-green-500",
    description:
      "Your generosity fund. Donations, gifts, tithing, and acts of kindness that make a difference.",
  },
  {
    name: "FFA",
    fullName: "Financial Freedom Account",
    percentage: 5,
    icon: TrendingUp,
    color: "text-amber-500",
    description:
      "Your wealth-building engine. Investments, stocks, real estate, and passive income opportunities.",
  },
]

function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="px-6 py-24 text-center">
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
          About Wealth Compass
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Built on T. Harv Eker's Money Jar System from{" "}
          <em>Secrets of the Millionaire Mind</em>, Wealth Compass makes
          intentional wealth-building simple and automatic.
        </p>
      </section>

      {/* Origin Story */}
      <section className="bg-muted/40 px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold">The Origin</h2>
          <p className="mt-6 text-muted-foreground leading-relaxed">
            T. Harv Eker developed the Money Jar System after discovering that
            wealthy people think about money differently than everyone else. His
            insight was simple: instead of deciding where every dollar goes in
            the moment, you set up a system that handles it for you.
          </p>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            By allocating income into six purpose-driven jars with fixed
            percentages, you eliminate emotional spending decisions. Every dollar
            has a job before it even arrives. No more guessing, no more guilt, no
            more wondering where your paycheck went.
          </p>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Wealth Compass brings this system to life as a digital tool. We handle
            the tracking, the splitting, and the math - so you can focus on
            building the life you want.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="px-6 py-20 text-center">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold">Our Mission</h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Make wealth-building accessible to everyone. Not through get-rich-quick
            schemes, but through a proven system that turns good intentions into
            automatic habits.
          </p>
        </div>
      </section>

      {/* The Six Jars */}
      <section className="bg-muted/40 px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold">The Six Jars</h2>
          <p className="mt-4 text-muted-foreground">
            Every dollar you earn gets divided into these six categories.
          </p>
        </div>
        <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {jars.map((jar) => (
            <div
              key={jar.name}
              className="rounded-lg border bg-background p-6 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <jar.icon className={`h-6 w-6 ${jar.color}`} />
                <div>
                  <span className="text-lg font-bold">{jar.name}</span>
                  <span className="ml-2 text-sm text-muted-foreground">
                    {jar.percentage}%
                  </span>
                </div>
              </div>
              <p className="mt-1 text-sm font-medium">{jar.fullName}</p>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                {jar.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Why It Works */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold">Why It Works</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            <div>
              <h3 className="text-lg font-semibold">Removes Decision Fatigue</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                You decide the percentages once. Every future allocation happens
                automatically.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Forces Intentionality</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Every dollar has a purpose. You know exactly where your money
                goes and why.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Builds Wealth Slowly</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                The FFA jar grows your investments automatically. Small
                percentages compound over time.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export const Route = createFileRoute("/_public/about")({
  component: AboutPage,
})
