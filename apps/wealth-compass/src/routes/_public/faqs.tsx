import { createFileRoute } from "@tanstack/react-router"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@gaia/ui/components/collapsible"
import { ChevronDown } from "lucide-react"

const faqs = [
  {
    question: "What is the Money Jar System?",
    answer:
      "The Money Jar System was developed by T. Harv Eker in his book Secrets of the Millionaire Mind. It's a wealth management strategy where you divide every dollar you earn into six purpose-driven jars with fixed percentages. This eliminates emotional spending decisions and makes every dollar intentional.",
  },
  {
    question: "How do I set up my jars?",
    answer:
      "When you create a Wealth Compass account, six jars are automatically set up with the default percentages (NEC 55%, LTSS 10%, EDU 10%, PLAY 10%, GIVE 10%, FFA 5%). You can customize the names, colors, and percentages from the Settings page to match your life and goals.",
  },
  {
    question: "Can I change my jar percentages?",
    answer:
      "Yes. Go to Settings and adjust any jar's percentage. The only rule is that all percentages must add up to 100%. Changes take effect on your next income allocation.",
  },
  {
    question: "What happens if I overspend in a jar?",
    answer:
      "You can withdraw from any jar as needed. If you overspend in one jar, you'll need to transfer funds from another jar to cover it. The app tracks all withdrawals and transfers so you can see exactly where your money went.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes. Your data is stored securely in Convex, an enterprise-grade backend platform. Authentication is handled by Convex Auth with support for email/password and Google OAuth. Your financial data is encrypted and only accessible by you.",
  },
  {
    question: "Can I use this with a partner?",
    answer:
      "Currently, Wealth Compass is designed for individual use. Each account has its own set of jars and transactions. We may add shared accounts or household features in the future.",
  },
  {
    question: "What is the FFA jar for?",
    answer:
      "The Financial Freedom Account (FFA) is your wealth-building engine. This money goes toward investments, stocks, real estate, or any passive income opportunities. Even at just 5%, this jar compounds over time and builds real wealth.",
  },
  {
    question: "Do I have to use the default percentages?",
    answer:
      "Not at all. The defaults are based on Eker's original system, but you should adjust them to fit your situation. Some people prefer higher savings rates, others need more for necessities. The system is flexible.",
  },
  {
    question: "Can I set up automatic income allocation?",
    answer:
      "Yes. If you have recurring income (salary, freelance payments, etc.), you can set up recurring allocations in Settings. Wealth Compass will automatically split the amount across your jars on the schedule you choose.",
  },
  {
    question: "Is Wealth Compass free?",
    answer:
      "Yes. Wealth Compass is free to use with no hidden fees. Create an account, set up your jars, and start building wealth.",
  },
]

function FaqsPage() {
  return (
    <div>
      {/* Hero */}
      <section className="px-6 py-24 text-center">
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
          Frequently Asked Questions
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Everything you need to know about Wealth Compass and the Money Jar
          System.
        </p>
      </section>

      {/* FAQs */}
      <section className="bg-muted/40 px-6 py-20">
        <div className="mx-auto max-w-2xl space-y-4">
          {faqs.map((faq) => (
            <Collapsible key={faq.question}>
              <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border bg-background p-4 text-left font-medium shadow-sm hover:bg-accent transition-colors">
                {faq.question}
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform [&[data-state=open]]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="rounded-b-lg border border-t-0 bg-background px-4 pb-4 text-sm text-muted-foreground leading-relaxed">
                {faq.answer}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </section>

      {/* Still have questions */}
      <section className="px-6 py-20 text-center">
        <h2 className="text-2xl font-bold">Still Have Questions?</h2>
        <p className="mt-4 text-muted-foreground">
          We're here to help. Reach out and we'll get back to you.
        </p>
      </section>
    </div>
  )
}

export const Route = createFileRoute("/_public/faqs")({
  component: FaqsPage,
})
