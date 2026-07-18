import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { Button } from "@gaia/ui/components/button"
import { Skeleton } from "@gaia/ui/components/skeleton"
import { Plus } from "lucide-react"
import { GoalCard } from "@wealth-compass/components/goal-card"
import { CreateGoalDialog } from "@wealth-compass/components/create-goal-dialog"
import { CurrencySelector } from "@wealth-compass/components/currency-selector"
import { useCurrency } from "@wealth-compass/lib/use-currency"

function GoalsPage() {
  const { currency } = useCurrency()
  const goals = useQuery(api.goals.getUserGoals)

  const isLoading = goals === undefined

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Goals</h1>
        <div className="flex flex-wrap items-center gap-2">
          <CurrencySelector />
          <CreateGoalDialog currency={currency}>
            <Button size="sm">
              <Plus className="mr-1 h-4 w-4" />
              New Goal
            </Button>
          </CreateGoalDialog>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : goals && goals.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => (
            <GoalCard key={goal._id} goal={goal} currency={currency} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">
            No goals yet. Create your first goal to start tracking!
          </p>
        </div>
      )}
    </div>
  )
}

export const Route = createFileRoute("/_authenticated/goals")({
  component: GoalsPage,
})
