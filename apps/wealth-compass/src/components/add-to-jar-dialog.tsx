import { useState, type ReactElement } from "react"
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
import type { Id } from "../../convex/_generated/dataModel"
import { useCurrency } from "@wealth-compass/lib/use-currency"

interface AddToJarDialogProps {
  currency: CurrencyCode
  children: React.ReactNode
}

export function AddToJarDialog({ currency, children }: AddToJarDialogProps) {
  const { formatDisplayAmount, toCanonicalAmount } = useCurrency()
  const [open, setOpen] = useState(false)
  const [selectedJarId, setSelectedJarId] = useState<string>("")
  const [amount, setAmount] = useState("")
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(false)
  const jarBalances = useQuery(api.jars.getJarBalances)
  const addToJar = useMutation(api.transactions.addToJar)

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

    setLoading(true)
    try {
      await addToJar({
        jarId: selectedJarId as Id<"jars">,
        amount: toCanonicalAmount(totalAmount),
        note: note.trim() || undefined,
      })
      toast.success(
        `Added ${formatCurrency(totalAmount, currency)} to ${selectedJar?.jar.name}`
      )
      setOpen(false)
      setSelectedJarId("")
      setAmount("")
      setNote("")
    } catch (error) {
      console.error(error)
      toast.error("Failed to add to jar. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={children as ReactElement} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add to Jar</DialogTitle>
          <DialogDescription>
            Add money directly to one of your jars.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Select Jar</Label>
            <Select
              value={selectedJarId}
              onValueChange={(v) => setSelectedJarId(v ?? "")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a Jar">
                  {selectedJarId && jarBalances
                    ? (JAR_FULL_NAMES[
                        jarBalances.find((jb) => jb.jar._id === selectedJarId)
                          ?.jar.name ?? ""
                      ] ?? "Choose a Jar")
                    : "Choose a Jar"}
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
                        ({formatDisplayAmount(jb.balance)})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-amount">Amount</Label>
            <Input
              id="add-amount"
              type="number"
              placeholder="0.00"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-note">Note (optional)</Label>
            <Input
              id="add-note"
              placeholder="e.g., Freelance payment, Gift..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
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
            {loading ? "Adding..." : "Add to Jar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
