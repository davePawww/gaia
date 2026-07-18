import { useState, type ReactElement } from "react"
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
import { toast } from "sonner"
import { formatCurrency, type CurrencyCode } from "@wealth-compass/lib/currency"

interface AllocateIncomeDialogProps {
  currency: CurrencyCode
  children: React.ReactNode
}

export function AllocateIncomeDialog({
  currency,
  children,
}: AllocateIncomeDialogProps) {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const jars = useQuery(api.jars.getUserJars)
  const allocateIncome = useMutation(api.transactions.allocateIncome)

  const totalAmount = parseFloat(amount) || 0

  const splits =
    jars?.map((jar) => ({
      ...jar,
      splitAmount: (totalAmount * jar.percentage) / 100,
    })) ?? []

  const handleSubmit = async () => {
    if (totalAmount <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    setLoading(true)
    try {
      await allocateIncome({ amount: totalAmount })
      toast.success(
        `Allocated ${formatCurrency(totalAmount, currency)} across ${jars?.length ?? 0} jars`,
      )
      setOpen(false)
      setAmount("")
    } catch (error) {
      console.error(error)
      toast.error("Failed to allocate income. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={children as ReactElement} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Allocate Income</DialogTitle>
          <DialogDescription>
            Enter your total income amount to split across your jars.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="income-amount">Total Income</Label>
            <Input
              id="income-amount"
              type="number"
              placeholder="0.00"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          {totalAmount > 0 && (
            <div className="space-y-2 rounded-lg border bg-muted/50 p-3">
              <p className="text-xs font-medium text-muted-foreground">
                Allocation Preview
              </p>
              <div className="space-y-1">
                {splits.map((split) => (
                  <div
                    key={split._id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: split.color }}
                      />
                      <span>{split.name}</span>
                      <span className="text-muted-foreground">
                        ({split.percentage}%)
                      </span>
                    </div>
                    <span className="font-medium">
                      {formatCurrency(split.splitAmount, currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || totalAmount <= 0}
          >
            {loading ? "Allocating..." : "Allocate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
