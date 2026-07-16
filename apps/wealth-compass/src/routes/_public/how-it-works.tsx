import { createFileRoute, Link } from "@tanstack/react-router"
import { Button } from "@gaia/ui/components/button"
import {
  ArrowRight,
  Wallet,
  PieChart,
  ArrowLeftRight,
  Target,
} from "lucide-react"

const steps = [
  {
    number: "1",
    title: "Set Up Your Jars",
    icon: Wallet,
    description:
      "When you create an account, six jars are automatically set up with the default percentages. You can customize the names, colors, and percentages to match your life.",
    details: [
      "NEC (Necessities): 55% - bills, rent, food",
      "LTSS (Long-term Savings): 10% - emergency fund, retirement",
      "EDU (Education): 10% - courses, books, growth",
      "PLAY (Play): 10% - fun, guilt-free spending",
      "GIVE (Give): 10% - charity, gifts, generosity",
      "FFA (Financial Freedom): 5% - investments, passive income",
    ],
  },
  {
    number: "2",
    title: "Allocate Your Income",
    icon: PieChart,
    description:
      "When money comes in, allocate it with one click. Enter the total amount, and Wealth Compass automatically splits it across your jars based on your percentages.",
    details: [
      "One-time allocations for irregular income",
      "Set up recurring income for automatic splitting",
      "Override percentages for special occasions",
      "Every allocation is recorded as a transaction",
    ],
  },
  {
    number: "3",
    title: "Track and Withdraw",
    icon: ArrowLeftRight,
    description:
      "Use money from specific jars for their intended purpose. Withdraw for expenses, transfer between jars when needed, and watch your balances update in real time.",
    details: [
      "Withdraw from any jar with a note",
      "Transfer between jars instantly",
      "Full transaction history with filters",
      "See exactly where your money goes",
    ],
  },
  {
    number: "4",
    title: "Set Goals and Grow",
    icon: Target,
    description:
      "Set financial goals for individual jars or your total net worth. Track progress with visual indicators and stay motivated as you build wealth over time.",
    details: [
      "Jar-specific goals (e.g., build emergency fund)",
      "Net worth goals for overall wealth tracking",
      "Progress bars and milestone celebrations",
      "Weekly, monthly, and yearly history views",
    ],
  },
]

function HowItWorksPage() {
  return (
    <div>
      {/* Hero */}
      <section className="px-6 py-24 text-center">
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
          How It Works
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Four simple steps to take control of your finances and start building
          wealth intentionally.
        </p>
      </section>

      {/* Steps */}
      <section className="bg-muted/40 px-6 py-20">
        <div className="mx-auto max-w-3xl">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {index < steps.length - 1 && (
                <div className="absolute left-6 top-14 h-[calc(100%-2rem)] w-px bg-border" />
              )}
              <div className="flex gap-6 pb-12">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">
                  {step.number}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <step.icon className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-bold">{step.title}</h2>
                  </div>
                  <p className="mt-3 text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                  <ul className="mt-4 space-y-2">
                    {step.details.map((detail) => (
                      <li
                        key={detail}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center">
        <h2 className="text-3xl font-bold">Ready to Start?</h2>
        <p className="mt-4 text-muted-foreground">
          Create your free account and set up your jars in under a minute.
        </p>
        <Link to="/sign-up">
          <Button size="lg" className="mt-8">
            Get Started Free
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </section>
    </div>
  )
}

export const Route = createFileRoute("/_public/how-it-works")({
  component: HowItWorksPage,
})
