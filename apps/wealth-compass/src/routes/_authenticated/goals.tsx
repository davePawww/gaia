import { useMemo, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { Button } from "@gaia/ui/components/button"
import { Skeleton } from "@gaia/ui/components/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@gaia/ui/components/select"
import { Plus } from "lucide-react"
import { GoalCard } from "@wealth-compass/components/goal-card"
import { CreateGoalDialog } from "@wealth-compass/components/create-goal-dialog"
import {
  getGoalProgress,
  getGoalStatus,
  type GoalStatus,
} from "@wealth-compass/lib/dashboard-data"

type GoalFilter = "all" | GoalStatus
type GoalSort = "dueDate" | "progress" | "target" | "name"

function isGoalFilter(value: string | null): value is GoalFilter {
  return (
    value === "all" ||
    value === "active" ||
    value === "completed" ||
    value === "overdue" ||
    value === "archived"
  )
}

function isGoalSort(value: string | null): value is GoalSort {
  return (
    value === "dueDate" ||
    value === "progress" ||
    value === "target" ||
    value === "name"
  )
}

function GoalsPage() {
  const goals = useQuery(api.goals.getUserGoals)
  const jarBalances = useQuery(api.jars.getJarBalances)
  const [filter, setFilter] = useState<GoalFilter>("all")
  const [sort, setSort] = useState<GoalSort>("dueDate")

  const isLoading = goals === undefined
  const goalRows = useMemo(() => {
    if (!goals) return []
    const balances =
      jarBalances?.map((item) => ({
        jarId: item.jar._id,
        balance: item.balance,
      })) ?? []

    return goals
      .map((goal) => {
        const dashboardGoal = {
          id: goal._id,
          name: goal.name,
          type: goal.type,
          targetAmount: goal.targetAmount,
          jarId: goal.jarId,
          deadline: goal.deadline,
          status: goal.status,
          completedAt: goal.completedAt,
          archivedAt: goal.archivedAt,
        }
        const progress = getGoalProgress(dashboardGoal, balances)
        return {
          goal,
          progress,
          status: getGoalStatus(dashboardGoal, progress),
        }
      })
      .filter((item) => filter === "all" || item.status === filter)
      .sort((left, right) => {
        if (sort === "progress") {
          return right.progress.percentage - left.progress.percentage
        }
        if (sort === "target") {
          return right.goal.targetAmount - left.goal.targetAmount
        }
        if (sort === "name")
          return left.goal.name.localeCompare(right.goal.name)

        const leftDeadline = left.goal.deadline ?? Number.MAX_SAFE_INTEGER
        const rightDeadline = right.goal.deadline ?? Number.MAX_SAFE_INTEGER
        return leftDeadline - rightDeadline
      })
  }, [filter, goals, jarBalances, sort])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Goals</h1>
        <div className="flex flex-wrap items-center gap-2">
          <CreateGoalDialog>
            <Button size="sm">
              <Plus className="mr-1 h-4 w-4" />
              New Goal
            </Button>
          </CreateGoalDialog>
        </div>
      </div>

      {!isLoading && goals && goals.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {goalRows.length} {goalRows.length === 1 ? "goal" : "goals"} shown
          </p>
          <div className="flex flex-wrap gap-2">
            <Select
              value={filter}
              onValueChange={(value) => {
                if (isGoalFilter(value)) setFilter(value)
              }}
            >
              <SelectTrigger className="w-36">
                <SelectValue>
                  {filter === "all" ? "All statuses" : filter}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={sort}
              onValueChange={(value) => {
                if (isGoalSort(value)) setSort(value)
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue>
                  {sort === "dueDate"
                    ? "Sort: due date"
                    : sort === "progress"
                      ? "Sort: progress"
                      : sort === "target"
                        ? "Sort: target"
                        : "Sort: name"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dueDate">Sort: due date</SelectItem>
                <SelectItem value="progress">Sort: progress</SelectItem>
                <SelectItem value="target">Sort: target</SelectItem>
                <SelectItem value="name">Sort: name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : goalRows.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {goalRows.map(({ goal }) => (
            <GoalCard key={goal._id} goal={goal} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">
            {goals?.length
              ? "No goals match the selected filters."
              : "No goals yet. Create your first goal to start tracking!"}
          </p>
        </div>
      )}
    </div>
  )
}

export const Route = createFileRoute("/_authenticated/goals")({
  component: GoalsPage,
})
