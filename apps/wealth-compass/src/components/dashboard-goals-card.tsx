import { Link } from "@tanstack/react-router"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@gaia/ui/components/card"
import { Badge } from "@gaia/ui/components/badge"
import { Progress } from "@gaia/ui/components/progress"
import { Skeleton } from "@gaia/ui/components/skeleton"
import { Target, Wallet } from "lucide-react"
import { formatCurrency, type CurrencyCode } from "@wealth-compass/lib/currency"
import {
  getGoalProgress,
  type DashboardGoal,
  type DashboardJarBalance,
} from "@wealth-compass/lib/dashboard-data"

interface DashboardGoalsCardProps {
  goals: DashboardGoal[] | undefined
  jarBalances: DashboardJarBalance[] | undefined
  currency: CurrencyCode
}

function daysRemaining(deadline: number | undefined): number | null {
  if (!deadline) return null
  return Math.max(0, Math.ceil((deadline - Date.now()) / (1000 * 60 * 60 * 24)))
}

export function DashboardGoalsCard({
  goals,
  jarBalances,
  currency,
}: DashboardGoalsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Goals Progress</CardTitle>
        <Link
          to="/goals"
          className="text-sm font-medium text-primary hover:underline"
        >
          View all
        </Link>
      </CardHeader>
      <CardContent>
        {goals === undefined || jarBalances === undefined ? (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
        ) : goals.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-4 text-center">
            <Target className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No goals yet. Create one to track your progress.
            </p>
            <Link
              to="/goals"
              className="text-sm font-medium text-primary hover:underline"
            >
              Create a goal &rarr;
            </Link>
          </div>
        ) : (
          <div className="space-y-5" aria-label="Goals progress">
            {goals.slice(0, 3).map((goal) => {
              const progress = getGoalProgress(goal, jarBalances)
              const remaining = daysRemaining(goal.deadline)

              return (
                <div
                  key={goal.id ?? `${goal.name}-${goal.type}`}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      {goal.type === "netWorth" ? (
                        <Wallet className="h-4 w-4 shrink-0 text-muted-foreground" />
                      ) : (
                        <Target className="h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                      <span className="truncate text-sm font-medium">
                        {goal.name}
                      </span>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {Math.round(progress.percentage)}%
                    </span>
                  </div>
                  <Progress
                    value={progress.percentage}
                    aria-label={`${goal.name} progress`}
                  />
                  <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span>
                      {formatCurrency(progress.currentAmount, currency)} of{" "}
                      {formatCurrency(goal.targetAmount, currency)}
                    </span>
                    {remaining !== null && (
                      <Badge
                        variant={remaining < 30 ? "destructive" : "secondary"}
                      >
                        {remaining} days left
                      </Badge>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
