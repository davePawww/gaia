import { useState, type ReactElement } from "react"
import { useQuery } from "convex/react"
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
import { Label } from "@gaia/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@gaia/ui/components/select"
import { toast } from "sonner"
import type { CurrencyCode } from "@wealth-compass/lib/currency"
import {
  buildCsvExport,
  buildJsonExport,
  filterTransactions,
  type ExportTransaction,
} from "@wealth-compass/lib/transaction-export"

interface ExportDialogProps {
  currency: CurrencyCode
  children: React.ReactNode
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

const TYPE_LABELS: Record<string, string> = {
  all: "All Types",
  income: "Income",
  withdrawal: "Withdrawal",
  transfer: "Transfer",
}

const FORMAT_LABELS: Record<string, string> = {
  csv: "CSV (.csv)",
  json: "JSON (.json)",
}

export function ExportDialog({ currency, children }: ExportDialogProps) {
  const [open, setOpen] = useState(false)
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [jarFilter, setJarFilter] = useState<string>("all")
  const [format, setFormat] = useState<string>("csv")
  const transactions = useQuery(api.transactions.getUserTransactions)
  const jarBalances = useQuery(api.jars.getJarBalances)

  const handleExport = () => {
    if (!transactions) return

    const filtered = filterTransactions(transactions, {
      dateFrom,
      dateTo,
      type: typeFilter,
      jarId: jarFilter,
    })

    if (filtered.length === 0) {
      toast.error("No transactions match the selected filters")
      return
    }

    const today = new Date().toISOString().slice(0, 10)
    const exportTransactions = filtered as ExportTransaction[]
    const exportJars = jarBalances ?? []

    if (format === "csv") {
      const exported = buildCsvExport(exportTransactions, exportJars, currency, today)
      downloadFile(exported.content, exported.filename, exported.mimeType)
    } else {
      const exported = buildJsonExport(exportTransactions, exportJars, currency, today)
      downloadFile(exported.content, exported.filename, exported.mimeType)
    }

    toast.success(`Exported ${filtered.length} transactions`)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={children as ReactElement} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Transactions</DialogTitle>
          <DialogDescription>
            Download your transaction data as CSV or JSON.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="export-from">From</Label>
              <input
                id="export-from"
                type="date"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="export-to">To</Label>
              <input
                id="export-to"
                type="date"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Transaction Type</Label>
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v ?? "all")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Types">
                  {TYPE_LABELS[typeFilter] ?? "All Types"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="withdrawal">Withdrawal</SelectItem>
                <SelectItem value="transfer">Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Jar</Label>
            <Select value={jarFilter} onValueChange={(v) => setJarFilter(v ?? "all")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Jars">
                  {jarFilter === "all"
                    ? "All Jars"
                    : (JAR_FULL_NAMES[jarBalances?.find((jb) => jb.jar._id === jarFilter)?.jar.name ?? ""] ?? "All Jars")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Jars</SelectItem>
                {jarBalances?.map((jb) => (
                  <SelectItem key={jb.jar._id} value={jb.jar._id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: jb.jar.color }}
                      />
                      <span>{JAR_FULL_NAMES[jb.jar.name] ?? jb.jar.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Format</Label>
            <Select value={format} onValueChange={(v) => setFormat(v ?? "csv")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="CSV (.csv)">
                  {FORMAT_LABELS[format] ?? "CSV (.csv)"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV (.csv)</SelectItem>
                <SelectItem value="json">JSON (.json)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={!transactions}>
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
