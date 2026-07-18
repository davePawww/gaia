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
import { ArrowRightLeft } from "lucide-react"
import { formatCurrency, type CurrencyCode } from "@wealth-compass/lib/currency"

interface TransferDialogProps {
  currency: CurrencyCode
  children: React.ReactNode
}

export function TransferDialog({ currency, children }: TransferDialogProps) {
  const [open, setOpen] = useState(false)
  const [fromJarId, setFromJarId] = useState<string>("")
  const [toJarId, setToJarId] = useState<string>("")
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const jarBalances = useQuery(api.jars.getJarBalances)
  const transfer = useMutation(api.transactions.transfer)

  const totalAmount = parseFloat(amount) || 0
  const fromJar = jarBalances?.find((jb) => jb.jar._id === fromJarId)
  const toJar = jarBalances?.find((jb) => jb.jar._id === toJarId)

  const handleSubmit = async () => {
    if (!fromJarId || !toJarId) {
      toast.error("Please select both jars")
      return
    }
    if (fromJarId === toJarId) {
      toast.error("Cannot transfer to the same jar")
      return
    }
    if (totalAmount <= 0) {
      toast.error("Please enter a valid amount")
      return
    }
    if (fromJar && totalAmount > fromJar.balance) {
      toast.error("Insufficient balance in source jar")
      return
    }

    setLoading(true)
    try {
      await transfer({
        fromJarId: fromJarId as any,
        toJarId: toJarId as any,
        amount: totalAmount,
      })
      toast.success(
        `Transferred ${formatCurrency(totalAmount, currency)} from ${fromJar?.jar.name} to ${toJar?.jar.name}`,
      )
      setOpen(false)
      setFromJarId("")
      setToJarId("")
      setAmount("")
    } catch (error) {
      console.error(error)
      toast.error("Failed to transfer. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={children} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Transfer Between Jars</DialogTitle>
          <DialogDescription>
            Move money from one jar to another.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>From Jar</Label>
            <Select value={fromJarId} onValueChange={setFromJarId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select source jar">
                  {fromJarId && jarBalances
                    ? (JAR_FULL_NAMES[jarBalances.find(jb => jb.jar._id === fromJarId)?.jar.name ?? ""] ?? "Select source jar")
                    : "Select source jar"}
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

          <div className="flex justify-center">
            <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="space-y-2">
            <Label>To Jar</Label>
            <Select value={toJarId} onValueChange={setToJarId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select destination jar">
                  {toJarId && jarBalances
                    ? (JAR_FULL_NAMES[jarBalances.find(jb => jb.jar._id === toJarId)?.jar.name ?? ""] ?? "Select destination jar")
                    : "Select destination jar"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {jarBalances
                  ?.filter((jb) => jb.jar._id !== fromJarId)
                  .map((jb) => (
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
            <Label htmlFor="transfer-amount">Amount</Label>
            <Input
              id="transfer-amount"
              type="number"
              placeholder="0.00"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            {fromJar && (
              <p className="text-xs text-muted-foreground">
                Available in {fromJar.jar.name}:{" "}
                {formatCurrency(fromJar.balance, currency)}
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
            disabled={loading || !fromJarId || !toJarId || totalAmount <= 0}
          >
            {loading ? "Transferring..." : "Transfer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
