import { useMutation, useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@gaia/ui/components/card"
import { Button } from "@gaia/ui/components/button"
import { Badge } from "@gaia/ui/components/badge"
import { Progress } from "@gaia/ui/components/progress"
import { Pencil, Trash2, Target, Wallet } from "lucide-react"
import { toast } from "sonner"
import { formatCurrency, type CurrencyCode } from "@wealth-compass/lib/currency"
import {
  getGoalStatus,
  type DashboardGoal,
} from "@wealth-compass/lib/dashboard-data"
import type { Id } from "../../convex/_generated/dataModel"
import { GoalDetailDialog } from "@wealth-compass/components/goal-detail-dialog"

interface GoalCardProps {
  goal: {
    _id: Id<"goals">
    name: string
    type: "jar" | "netWorth"
    targetAmount: number
    jarId?: Id<"jars">
    deadline?: number
    status?: "active" | "completed" | "archived"
    completedAt?: number
    archivedAt?: number
  }
  currency: CurrencyCode
}

export function GoalCard({ goal, currency }: GoalCardProps) {
  const jarBalances = useQuery(api.jars.getJarBalances)
  const deleteGoal = useMutation(api.goals.deleteGoal)

  const currentAmount = (() => {
    if (goal.type === "netWorth") {
      return jarBalances?.reduce((sum, jb) => sum + jb.balance, 0) ?? 0
    }
    return jarBalances?.find((jb) => jb.jar._id === goal.jarId)?.balance ?? 0
  })()

  const progress =
    goal.targetAmount > 0
      ? Math.min((currentAmount / goal.targetAmount) * 100, 100)
      : 0

  const status = getGoalStatus(
    {
      id: goal._id,
      name: goal.name,
      type: goal.type,
      targetAmount: goal.targetAmount,
      jarId: goal.jarId,
      deadline: goal.deadline,
      status: goal.status,
      completedAt: goal.completedAt,
      archivedAt: goal.archivedAt,
    } satisfies DashboardGoal,
    { currentAmount, percentage: progress }
  )

  const jarName =
    goal.type === "jar"
      ? jarBalances?.find((jb) => jb.jar._id === goal.jarId)?.jar.name
      : null

  const daysRemaining =
    goal.deadline && status !== "archived"
      ? Math.max(
          0,
          Math.ceil((goal.deadline - Date.now()) / (1000 * 60 * 60 * 24))
        )
      : null

  const handleDelete = async () => {
    try {
      await deleteGoal({ goalId: goal._id })
      toast.success("Goal deleted")
    } catch {
      toast.error("Failed to delete goal")
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          {goal.type === "netWorth" ? (
            <Wallet className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Target className="h-4 w-4 text-muted-foreground" />
          )}
          <div>
            <CardTitle className="text-sm font-medium">{goal.name}</CardTitle>
            <Badge
              variant={
                status === "overdue"
                  ? "destructive"
                  : status === "archived"
                    ? "outline"
                    : status === "completed"
                      ? "default"
                      : "secondary"
              }
              className="mt-1 capitalize"
            >
              {status}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <GoalDetailDialog goal={goal} currency={currency}>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Edit ${goal.name}`}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </GoalDetailDialog>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleDelete}
            aria-label={`Delete ${goal.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold">
            {formatCurrency(currentAmount, currency)}
          </span>
          <span className="text-sm text-muted-foreground">
            of {formatCurrency(goal.targetAmount, currency)}
          </span>
        </div>

        <Progress value={progress} className="h-2" />

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{Math.round(progress)}% complete</span>
          {daysRemaining !== null && (
            <Badge
              variant={
                status === "overdue" || daysRemaining < 30
                  ? "destructive"
                  : "secondary"
              }
            >
              {status === "overdue"
                ? `${daysRemaining} days overdue`
                : `${daysRemaining} days left`}
            </Badge>
          )}
        </div>

        {jarName && (
          <p className="text-xs text-muted-foreground">Jar: {jarName}</p>
        )}
      </CardContent>
    </Card>
  )
}
