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
import { ArrowRightLeft } from "lucide-react"
import { formatCurrency, type CurrencyCode } from "@wealth-compass/lib/currency"
import type { Id } from "../../convex/_generated/dataModel"

interface TransferDialogProps {
  currency: CurrencyCode
  children: React.ReactNode
}

export function TransferDialog({ currency, children }: TransferDialogProps) {
  const [open, setOpen] = useState(false)
  const [fromJarId, setFromJarId] = useState<string>("")
  const [toJarId, setToJarId] = useState<string>("")
  const [categoryId, setCategoryId] = useState<string>("")
  const [amount, setAmount] = useState("")
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(false)
  const jarBalances = useQuery(api.jars.getJarBalances)
  const categories = useQuery(
    api.categories.getCategoriesByJar,
    fromJarId && jarBalances
      ? {
          jarName:
            jarBalances.find((jb) => jb.jar._id === fromJarId)?.jar.name ?? "",
        }
      : "skip"
  )
  const transfer = useMutation(api.transactions.transfer)

  const totalAmount = parseFloat(amount) || 0
  const fromJar = jarBalances?.find((jb) => jb.jar._id === fromJarId)
  const toJar = jarBalances?.find((jb) => jb.jar._id === toJarId)
  const selectedCategory = categories?.find((cat) => cat._id === categoryId)

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
        fromJarId: fromJarId as Id<"jars">,
        toJarId: toJarId as Id<"jars">,
        amount: totalAmount,
        note: note.trim() || undefined,
        categoryId: categoryId ? (categoryId as Id<"categories">) : undefined,
      })
      toast.success(
        `Transferred ${formatCurrency(totalAmount, currency)} from ${fromJar?.jar.name} to ${toJar?.jar.name}`
      )
      setOpen(false)
      setFromJarId("")
      setToJarId("")
      setCategoryId("")
      setAmount("")
      setNote("")
    } catch (error) {
      console.error(error)
      toast.error("Failed to transfer. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={children as ReactElement} />
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
            <Select
              value={fromJarId}
              onValueChange={(v) => {
                setFromJarId(v ?? "")
                setCategoryId("")
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Source Jar">
                  {fromJarId && jarBalances
                    ? (JAR_FULL_NAMES[
                        jarBalances.find((jb) => jb.jar._id === fromJarId)?.jar
                          .name ?? ""
                      ] ?? "Select Source Jar")
                    : "Select Source Jar"}
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
            <Select value={toJarId} onValueChange={(v) => setToJarId(v ?? "")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Destination Jar">
                  {toJarId && jarBalances
                    ? (JAR_FULL_NAMES[
                        jarBalances.find((jb) => jb.jar._id === toJarId)?.jar
                          .name ?? ""
                      ] ?? "Select Destination Jar")
                    : "Select Destination Jar"}
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
                        <span>
                          {JAR_FULL_NAMES[jb.jar.name] ?? jb.jar.name}
                        </span>
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
          <div className="space-y-2">
            <Label htmlFor="transfer-note">Note (optional)</Label>
            <Input
              id="transfer-note"
              placeholder="e.g., Move savings to emergency fund..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          {categories && categories.length > 0 && (
            <div className="space-y-2">
              <Label>Category (optional)</Label>
              <Select
                value={categoryId}
                onValueChange={(v) => setCategoryId(v ?? "")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a Category">
                    {selectedCategory?.name ?? "Choose a Category"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
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
