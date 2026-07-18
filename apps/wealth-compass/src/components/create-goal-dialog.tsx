import { useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@gaia/ui/components/dialog"
import { Button } from "@gaia/ui/components/button"
import { Input } from "@gaia/ui/components/input"
import { Label } from "@gaia/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@gaia/ui/components/select"
import { toast } from "sonner"
import { JAR_FULL_NAMES } from "../../convex/constants"
import type { CurrencyCode } from "@wealth-compass/lib/currency"

const GOAL_TYPE_LABELS: Record<string, string> = {
  netWorth: "Net Worth Target",
  jar: "Jar Savings Target",
}

interface CreateGoalDialogProps {
  currency: CurrencyCode
  children: React.ReactNode
}

export function CreateGoalDialog({ currency: _currency, children }: CreateGoalDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [type, setType] = useState<"jar" | "netWorth">("netWorth")
  const [jarId, setJarId] = useState<string>("")
  const [targetAmount, setTargetAmount] = useState("")
  const [deadline, setDeadline] = useState("")
  const [loading, setLoading] = useState(false)
  const jars = useQuery(api.jars.getUserJars)
  const createGoal = useMutation(api.goals.createGoal)

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Please enter a goal name")
      return
    }
    if (!targetAmount || parseFloat(targetAmount) <= 0) {
      toast.error("Please enter a valid target amount")
      return
    }
    if (type === "jar" && !jarId) {
      toast.error("Please select a jar")
      return
    }

    setLoading(true)
    try {
      await createGoal({
        name: name.trim(),
        type,
        targetAmount: parseFloat(targetAmount),
        jarId: type === "jar" ? (jarId as any) : undefined,
        deadline: deadline ? new Date(deadline).getTime() : undefined,
      })
      toast.success("Goal created!")
      setOpen(false)
      resetForm()
    } catch (error) {
      console.error(error)
      toast.error("Failed to create goal")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setName("")
    setType("netWorth")
    setJarId("")
    setTargetAmount("")
    setDeadline("")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={children} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Goal</DialogTitle>
          <DialogDescription>
            Set a financial goal to track your progress.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="goal-name">Goal Name</Label>
            <Input
              id="goal-name"
              placeholder="e.g., Emergency Fund"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Goal Type</Label>
            <Select
              value={type}
              onValueChange={(v) => setType(v as "jar" | "netWorth")}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {GOAL_TYPE_LABELS[type] ?? "Select type"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="netWorth">Net Worth Target</SelectItem>
                <SelectItem value="jar">Jar Savings Target</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {type === "jar" && (
            <div className="space-y-2">
              <Label>Select Jar</Label>
              <Select value={jarId} onValueChange={setJarId}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {jarId ? (JAR_FULL_NAMES[jars?.find((j) => j._id === jarId)?.name ?? ""] ?? "Select jar") : "Choose a jar"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {jars?.map((jar) => (
                    <SelectItem key={jar._id} value={jar._id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: jar.color }}
                        />
                        {JAR_FULL_NAMES[jar.name] ?? jar.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="target-amount">Target Amount</Label>
            <Input
              id="target-amount"
              type="number"
              placeholder="0.00"
              min="0"
              step="0.01"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline (optional)</Label>
            <Input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !name.trim() || !targetAmount}
          >
            {loading ? "Creating..." : "Create Goal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
