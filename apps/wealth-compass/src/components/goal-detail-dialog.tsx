import { type ReactElement, useEffect, useMemo, useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { api } from "../../convex/_generated/api"
import type { Id } from "../../convex/_generated/dataModel"
import { JAR_FULL_NAMES } from "../../convex/constants"
import { Button } from "@gaia/ui/components/button"
import { Badge } from "@gaia/ui/components/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@gaia/ui/components/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@gaia/ui/components/chart"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@gaia/ui/components/dialog"
import { Input } from "@gaia/ui/components/input"
import { Label } from "@gaia/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@gaia/ui/components/select"
import { Progress } from "@gaia/ui/components/progress"
import { Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import {
  buildGoalProgressHistory,
  formatDashboardMonth,
  getGoalProgress,
  getGoalStatus,
  type DashboardGoal,
} from "@wealth-compass/lib/dashboard-data"
import { formatCurrency, type CurrencyCode } from "@wealth-compass/lib/currency"

type GoalType = "jar" | "netWorth"

interface GoalDetail {
  _id: Id<"goals">
  name: string
  type: GoalType
  targetAmount: number
  jarId?: Id<"jars">
  deadline?: number
  status?: "active" | "completed" | "archived"
  completedAt?: number
  archivedAt?: number
}

interface GoalDetailDialogProps {
  goal: GoalDetail
  currency: CurrencyCode
  children: ReactElement
}

const statusStyles = {
  active: "secondary",
  completed: "default",
  overdue: "destructive",
  archived: "outline",
} as const

function toDateInputValue(timestamp: number | undefined) {
  if (!timestamp) return ""
  return new Date(timestamp).toISOString().slice(0, 10)
}

function asDashboardGoal(goal: GoalDetail): DashboardGoal {
  return {
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
}

export function GoalDetailDialog({
  goal,
  currency,
  children,
}: GoalDetailDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(goal.name)
  const [type, setType] = useState<GoalType>(goal.type)
  const [jarId, setJarId] = useState<string>(goal.jarId ?? "")
  const [targetAmount, setTargetAmount] = useState(String(goal.targetAmount))
  const [deadline, setDeadline] = useState(toDateInputValue(goal.deadline))
  const [milestoneName, setMilestoneName] = useState("")
  const [milestoneAmount, setMilestoneAmount] = useState("")
  const [saving, setSaving] = useState(false)

  const jarBalances = useQuery(api.jars.getJarBalances)
  const jars = useQuery(api.jars.getUserJars)
  const transactions = useQuery(api.transactions.getUserTransactions)
  const milestones = useQuery(api.goals.getGoalMilestones, { goalId: goal._id })
  const updateGoal = useMutation(api.goals.updateGoal)
  const archiveGoal = useMutation(api.goals.archiveGoal)
  const restoreGoal = useMutation(api.goals.restoreGoal)
  const createMilestone = useMutation(api.goals.createGoalMilestone)
  const deleteMilestone = useMutation(api.goals.deleteGoalMilestone)

  useEffect(() => {
    if (!open) return
    setName(goal.name)
    setType(goal.type)
    setJarId(goal.jarId ?? "")
    setTargetAmount(String(goal.targetAmount))
    setDeadline(toDateInputValue(goal.deadline))
  }, [goal, open])

  const dashboardGoal = asDashboardGoal(goal)
  const progress = getGoalProgress(
    dashboardGoal,
    jarBalances?.map((item) => ({
      jarId: item.jar._id,
      balance: item.balance,
    })) ?? []
  )
  const status = getGoalStatus(dashboardGoal, progress)
  const history = useMemo(
    () =>
      transactions && jarBalances
        ? buildGoalProgressHistory(
            dashboardGoal,
            transactions,
            jarBalances.map((item) => ({
              id: item.jar._id,
              name: item.jar.name,
              color: item.jar.color,
            }))
          )
        : [],
    [dashboardGoal, jarBalances, transactions]
  )
  const chartConfig: ChartConfig = {
    progress: { label: "Progress", color: "#A855F7" },
  }

  const selectedJar = jars?.find((jar) => jar._id === jarId)
  const canSave =
    !saving &&
    name.trim().length > 0 &&
    Number(targetAmount) > 0 &&
    (type === "netWorth" || selectedJar !== undefined)

  const handleSave = async () => {
    if (!canSave) return
    setSaving(true)
    try {
      await updateGoal({
        goalId: goal._id,
        name: name.trim(),
        type,
        targetAmount: Number(targetAmount),
        jarId: type === "jar" ? selectedJar?._id : undefined,
        deadline: deadline ? new Date(deadline).getTime() : undefined,
        clearDeadline: deadline.length === 0,
      })
      toast.success("Goal updated")
    } catch {
      toast.error("Failed to update goal")
    } finally {
      setSaving(false)
    }
  }

  const handleArchiveToggle = async () => {
    try {
      if (status === "archived") {
        await restoreGoal({ goalId: goal._id })
        toast.success("Goal restored")
      } else {
        await archiveGoal({ goalId: goal._id })
        toast.success("Goal archived")
      }
    } catch {
      toast.error("Unable to update goal status")
    }
  }

  const handleCreateMilestone = async () => {
    const amount = Number(milestoneAmount)
    if (!milestoneName.trim() || amount <= 0) {
      toast.error("Enter a milestone name and positive amount")
      return
    }
    try {
      await createMilestone({
        goalId: goal._id,
        name: milestoneName.trim(),
        targetAmount: amount,
      })
      setMilestoneName("")
      setMilestoneAmount("")
      toast.success("Milestone added")
    } catch {
      toast.error("Failed to add milestone")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={children} />
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>{goal.name}</DialogTitle>
            <Badge variant={statusStyles[status]}>{status}</Badge>
          </div>
          <DialogDescription>
            Edit the target, inspect progress history, and manage milestones.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Current progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-2xl font-bold">
                  {formatCurrency(progress.currentAmount, currency)}
                </span>
                <span className="text-sm text-muted-foreground">
                  of {formatCurrency(goal.targetAmount, currency)}
                </span>
              </div>
              <Progress
                value={progress.percentage}
                aria-label={`${goal.name} progress`}
              />
              <p className="text-sm text-muted-foreground">
                {Math.round(progress.percentage)}% complete
              </p>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`goal-name-${goal._id}`}>Goal name</Label>
              <Input
                id={`goal-name-${goal._id}`}
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Goal type</Label>
              <Select
                value={type}
                onValueChange={(value) =>
                  setType(value === "jar" ? "jar" : "netWorth")
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {type === "jar" ? "Jar savings target" : "Net worth target"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="netWorth">Net worth target</SelectItem>
                  <SelectItem value="jar">Jar savings target</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {type === "jar" && (
              <div className="space-y-2">
                <Label>Jar</Label>
                <Select
                  value={jarId}
                  onValueChange={(value) => setJarId(value ?? "")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {selectedJar
                        ? (JAR_FULL_NAMES[selectedJar.name] ?? selectedJar.name)
                        : "Choose a jar"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {jars?.map((jar) => (
                      <SelectItem key={jar._id} value={jar._id}>
                        {JAR_FULL_NAMES[jar.name] ?? jar.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor={`goal-target-${goal._id}`}>Target amount</Label>
              <Input
                id={`goal-target-${goal._id}`}
                type="number"
                min="0"
                step="0.01"
                value={targetAmount}
                onChange={(event) => setTargetAmount(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`goal-deadline-${goal._id}`}>Deadline</Label>
              <Input
                id={`goal-deadline-${goal._id}`}
                type="date"
                value={deadline}
                onChange={(event) => setDeadline(event.target.value)}
              />
            </div>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Progress history</CardTitle>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Progress history appears after transactions are recorded.
                </p>
              ) : (
                <ChartContainer
                  config={chartConfig}
                  className="h-56 w-full"
                  aria-label={`${goal.name} progress history`}
                >
                  <LineChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="month"
                      tickFormatter={formatDashboardMonth}
                    />
                    <YAxis />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          labelFormatter={(value) =>
                            formatDashboardMonth(String(value))
                          }
                          formatter={(value) =>
                            formatCurrency(Number(value), currency)
                          }
                        />
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="currentAmount"
                      stroke="var(--color-progress)"
                      strokeWidth={2}
                      dot
                    />
                  </LineChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Milestones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {milestones?.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Add optional milestones to celebrate progress before the final
                  target.
                </p>
              )}
              {milestones?.map((milestone) => {
                const isComplete =
                  milestone.completedAt !== undefined ||
                  progress.currentAmount >= milestone.targetAmount
                return (
                  <div
                    key={milestone._id}
                    className="flex items-center justify-between gap-3 rounded-md border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{milestone.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(milestone.targetAmount, currency)} ·{" "}
                        {isComplete ? "Completed" : "In progress"}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Delete ${milestone.name}`}
                      onClick={() =>
                        deleteMilestone({ milestoneId: milestone._id })
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )
              })}
              <div className="grid gap-2 sm:grid-cols-[1fr_9rem_auto]">
                <Input
                  placeholder="Milestone name"
                  value={milestoneName}
                  onChange={(event) => setMilestoneName(event.target.value)}
                />
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Amount"
                  value={milestoneAmount}
                  onChange={(event) => setMilestoneAmount(event.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCreateMilestone}
                >
                  <Plus className="mr-1 h-4 w-4" /> Add
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <Button type="button" variant="outline" onClick={handleArchiveToggle}>
            {status === "archived" ? "Restore goal" : "Archive goal"}
          </Button>
          <Button type="button" onClick={handleSave} disabled={!canSave}>
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
