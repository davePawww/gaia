import { useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import { JAR_FULL_NAMES } from "../../convex/constants"
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
import { formatCurrency, type CurrencyCode } from "@wealth-compass/lib/currency"

interface WithdrawDialogProps {
  currency: CurrencyCode
  children: React.ReactNode
}

export function WithdrawDialog({ currency, children }: WithdrawDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedJarId, setSelectedJarId] = useState<string>("")
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const jarBalances = useQuery(api.jars.getJarBalances)
  const withdraw = useMutation(api.transactions.withdraw)

  const totalAmount = parseFloat(amount) || 0
  const selectedJar = jarBalances?.find((jb) => jb.jar._id === selectedJarId)

  const handleSubmit = async () => {
    if (!selectedJarId) {
      toast.error("Please select a jar")
      return
    }
    if (totalAmount <= 0) {
      toast.error("Please enter a valid amount")
      return
    }
    if (selectedJar && totalAmount > selectedJar.balance) {
      toast.error("Insufficient balance")
      return
    }

    setLoading(true)
    try {
      await withdraw({ jarId: selectedJarId as any, amount: totalAmount })
      toast.success(
        `Withdrew ${formatCurrency(totalAmount, currency)} from ${selectedJar?.jar.name}`,
      )
      setOpen(false)
      setSelectedJarId("")
      setAmount("")
    } catch (error) {
      console.error(error)
      toast.error("Failed to withdraw. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={children} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Withdraw from Jar</DialogTitle>
          <DialogDescription>
            Withdraw money from one of your jars.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Select Jar</Label>
            <Select value={selectedJarId} onValueChange={setSelectedJarId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a jar">
                  {selectedJarId && jarBalances
                    ? (JAR_FULL_NAMES[jarBalances.find(jb => jb.jar._id === selectedJarId)?.jar.name ?? ""] ?? "Choose a jar")
                    : "Choose a jar"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {jarBalances?.map((jb) => (
                  <SelectItem key={jb.jar._id} value={jb.jar._id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: jb.jar.color }}
                      />
                      <span>{JAR_FULL_NAMES[jb.jar.name] ?? jb.jar.name}</span>
                      <span className="text-muted-foreground">
                        ({formatCurrency(jb.balance, currency)})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="withdraw-amount">Amount</Label>
            <Input
              id="withdraw-amount"
              type="number"
              placeholder="0.00"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            {selectedJar && (
              <p className="text-xs text-muted-foreground">
                Available: {formatCurrency(selectedJar.balance, currency)}
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !selectedJarId || totalAmount <= 0}
          >
            {loading ? "Withdrawing..." : "Withdraw"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
