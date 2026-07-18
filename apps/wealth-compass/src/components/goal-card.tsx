import { useMutation, useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import { Card, CardContent, CardHeader, CardTitle } from "@gaia/ui/components/card"
import { Button } from "@gaia/ui/components/button"
import { Badge } from "@gaia/ui/components/badge"
import { Progress } from "@gaia/ui/components/progress"
import { Trash2, Target, Wallet } from "lucide-react"
import { toast } from "sonner"
import { formatCurrency, type CurrencyCode } from "@wealth-compass/lib/currency"

interface GoalCardProps {
  goal: {
    _id: string
    name: string
    type: "jar" | "netWorth"
    targetAmount: number
    jarId?: string
    deadline?: number
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

  const jarName =
    goal.type === "jar"
      ? jarBalances?.find((jb) => jb.jar._id === goal.jarId)?.jar.name
      : null

  const daysRemaining = goal.deadline
    ? Math.max(
        0,
        Math.ceil((goal.deadline - Date.now()) / (1000 * 60 * 60 * 24)),
      )
    : null

  const handleDelete = async () => {
    try {
      await deleteGoal({ goalId: goal._id as any })
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
          <CardTitle className="text-sm font-medium">{goal.name}</CardTitle>
        </div>
        <Button variant="ghost" size="sm" onClick={handleDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
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
            <Badge variant={daysRemaining < 30 ? "destructive" : "secondary"}>
              {daysRemaining} days left
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
