import { useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import { Button } from "@gaia/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@gaia/ui/components/card"
import { Input } from "@gaia/ui/components/input"
import { Label } from "@gaia/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@gaia/ui/components/select"
import { Badge } from "@gaia/ui/components/badge"
import { Pause, Pencil, Play, Plus, Trash2 } from "lucide-react"
import type { Id } from "../../convex/_generated/dataModel"
import { toast } from "sonner"
import { formatCurrency, type CurrencyCode } from "@wealth-compass/lib/currency"

type Frequency = "weekly" | "biweekly" | "monthly"

function dateValue(timestamp: number) {
  return new Date(timestamp).toISOString().slice(0, 10)
}

export function RecurringIncomeSettings({
  currency,
}: {
  currency: CurrencyCode
}) {
  const rules = useQuery(api.recurringIncomes.getUserRecurringIncomes)
  const create = useMutation(api.recurringIncomes.createRecurringIncome)
  const update = useMutation(api.recurringIncomes.updateRecurringIncome)
  const setActive = useMutation(api.recurringIncomes.setRecurringIncomeActive)
  const deleteRule = useMutation(api.recurringIncomes.deleteRecurringIncome)
  const [amount, setAmount] = useState("")
  const [frequency, setFrequency] = useState<Frequency>("monthly")
  const [nextOccurrence, setNextOccurrence] = useState(dateValue(Date.now()))
  const [source, setSource] = useState("")
  const [note, setNote] = useState("")
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<Id<"recurringIncomes"> | null>(
    null
  )

  const createRule = async () => {
    const parsedAmount = Number(amount)
    const timestamp = new Date(nextOccurrence).getTime()
    if (parsedAmount <= 0 || !Number.isFinite(timestamp)) {
      toast.error("Enter a positive amount and next allocation date")
      return
    }
    setSaving(true)
    try {
      const args = {
        amount: parsedAmount,
        frequency,
        nextOccurrence: timestamp,
        source: source.trim() || undefined,
        note: note.trim() || undefined,
      }
      if (editingId) await update({ recurringIncomeId: editingId, ...args })
      else await create(args)
      setAmount("")
      setSource("")
      setNote("")
      setEditingId(null)
      toast.success(
        editingId ? "Recurring income updated" : "Recurring income created"
      )
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create recurring income"
      )
    } finally {
      setSaving(false)
    }
  }

  const beginEdit = (rule: NonNullable<typeof rules>[number]) => {
    setEditingId(rule._id)
    setAmount(String(rule.amount))
    setFrequency(rule.frequency)
    setNextOccurrence(dateValue(rule.nextOccurrence))
    setSource(rule.source ?? "")
    setNote(rule.note ?? "")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recurring income</CardTitle>
        <CardDescription>
          Schedule automatic income allocations using your current jar
          percentages.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-1">
            <Label htmlFor="recurring-amount">Amount</Label>
            <Input
              id="recurring-amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>Frequency</Label>
            <Select
              value={frequency}
              onValueChange={(value) =>
                setFrequency(
                  value === "weekly" || value === "biweekly" ? value : "monthly"
                )
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue>{frequency}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="biweekly">Every two weeks</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="recurring-next">First allocation</Label>
            <Input
              id="recurring-next"
              type="date"
              value={nextOccurrence}
              onChange={(event) => setNextOccurrence(event.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="recurring-source">Source</Label>
            <Input
              id="recurring-source"
              placeholder="Salary"
              value={source}
              onChange={(event) => setSource(event.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button className="w-full" onClick={createRule} disabled={saving}>
              <Plus className="mr-1 h-4 w-4" />
              {saving
                ? "Saving..."
                : editingId
                  ? "Save schedule"
                  : "Add schedule"}
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="recurring-note">Note (optional)</Label>
          <Input
            id="recurring-note"
            placeholder="Included in the allocation record"
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </div>
        {editingId && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditingId(null)
              setAmount("")
              setSource("")
              setNote("")
            }}
          >
            Cancel edit
          </Button>
        )}
        {rules?.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No recurring income schedules yet.
          </p>
        )}
        {rules?.map((rule) => (
          <div
            key={rule._id}
            className="flex flex-col gap-3 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {formatCurrency(rule.amount, currency)} · {rule.frequency}
                </span>
                <Badge variant={rule.active ? "secondary" : "outline"}>
                  {rule.active ? "Active" : "Paused"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Next: {new Date(rule.nextOccurrence).toLocaleDateString()}
                {rule.source ? ` · ${rule.source}` : ""}
                {rule.lastError ? ` · Paused: ${rule.lastError}` : ""}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => beginEdit(rule)}>
                <Pencil className="mr-1 h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  setActive({
                    recurringIncomeId: rule._id,
                    active: !rule.active,
                  })
                    .then(() =>
                      toast.success(
                        rule.active ? "Schedule paused" : "Schedule resumed"
                      )
                    )
                    .catch(() => toast.error("Failed to update schedule"))
                }
              >
                {rule.active ? (
                  <Pause className="mr-1 h-4 w-4" />
                ) : (
                  <Play className="mr-1 h-4 w-4" />
                )}
                {rule.active ? "Pause" : "Resume"}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Delete ${rule.source ?? "recurring income"}`}
                onClick={() =>
                  deleteRule({ recurringIncomeId: rule._id })
                    .then(() => toast.success("Recurring income deleted"))
                    .catch(() => toast.error("Failed to delete schedule"))
                }
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
