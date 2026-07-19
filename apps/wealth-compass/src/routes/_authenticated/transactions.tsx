import { createFileRoute } from "@tanstack/react-router"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"
import type { Id } from "../../../convex/_generated/dataModel"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@gaia/ui/components/card"
import { Skeleton } from "@gaia/ui/components/skeleton"
import {
  ArrowDownRight,
  ArrowUpRight,
  ArrowRightLeft,
  Plus,
  Trash2,
} from "lucide-react"
import { useCurrency } from "@wealth-compass/lib/use-currency"
import { formatCurrency } from "@wealth-compass/lib/currency"
import { AllocateIncomeDialog } from "@wealth-compass/components/allocate-income-dialog"
import { WithdrawDialog } from "@wealth-compass/components/withdraw-dialog"
import { TransferDialog } from "@wealth-compass/components/transfer-dialog"
import { Button } from "@gaia/ui/components/button"
import { toast } from "sonner"
import { useState } from "react"

function TransactionsPage() {
  const { currency } = useCurrency()
  const transactions = useQuery(api.transactions.getUserTransactions)
  const jarBalances = useQuery(api.jars.getJarBalances)
  const categories = useQuery(api.categories.getUserCategories)
  const deleteTransaction = useMutation(api.transactions.deleteTransaction)
  const [deletingId, setDeletingId] = useState<Id<"transactions"> | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>("all")

  const isLoading = transactions === undefined || jarBalances === undefined || categories === undefined

  const handleDelete = async (transactionId: Id<"transactions">) => {
    setDeletingId(transactionId)
    try {
      await deleteTransaction({ transactionId })
      toast.success("Transaction deleted")
    } catch {
      toast.error("Failed to delete transaction")
    } finally {
      setDeletingId(null)
    }
  }

  const getJarName = (jarId?: string) =>
    jarBalances?.find((jb) => jb.jar._id === jarId)?.jar.name ?? "N/A"

  const getCategoryName = (categoryId?: string) =>
    categories?.find((c) => c._id === categoryId)?.name ?? null

  const filteredTransactions = transactions?.filter((t) => {
    if (filterCategory === "all") return true
    if (filterCategory === "none") return !t.categoryId
    return t.categoryId === filterCategory
  })

  const formatDate = (timestamp: number) =>
    new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <div className="flex flex-wrap items-center gap-2">
          <AllocateIncomeDialog currency={currency}>
            <Button size="sm">
              <Plus className="mr-1 h-4 w-4" />
              Allocate Income
            </Button>
          </AllocateIncomeDialog>
          <TransferDialog currency={currency}>
            <Button size="sm" variant="outline">
              <ArrowRightLeft className="mr-1 h-4 w-4" />
              Transfer
            </Button>
          </TransferDialog>
          <WithdrawDialog currency={currency}>
            <Button size="sm" variant="outline">
              <ArrowUpRight className="mr-1 h-4 w-4" />
              Withdraw
            </Button>
          </WithdrawDialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-lg">All Transactions</CardTitle>
            {categories && categories.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Filter:</span>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="rounded-md border bg-background px-2 py-1 text-xs"
                >
                  <option value="all">All categories</option>
                  <option value="none">No category</option>
                  {[...new Set(categories.map((c) => c.jarName))].map((jarName) => (
                    <optgroup key={jarName} label={jarName}>
                      {categories
                        .filter((c) => c.jarName === jarName)
                        .map((cat) => (
                          <option key={cat._id} value={cat._id}>
                            {cat.name}
                          </option>
                        ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-20" />
                </div>
              ))}
            </div>
          ) : filteredTransactions && filteredTransactions.length > 0 ? (
            <div className="space-y-4">
              {filteredTransactions.map((t) => {
                const categoryName = getCategoryName(t.categoryId)
                return (
                  <div
                    key={t._id}
                    className="group flex items-center gap-3 rounded-lg border p-3"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                      {t.type === "income" && (
                        <ArrowDownRight className="h-4 w-4 text-green-500 dark:text-green-400" />
                      )}
                      {t.type === "withdrawal" && (
                        <ArrowUpRight className="h-4 w-4 text-red-500 dark:text-red-400" />
                      )}
                      {t.type === "transfer" && (
                        <ArrowRightLeft className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium capitalize">{t.type}</p>
                        <span className="text-xs text-muted-foreground">
                          {t.type === "income" &&
                            t.toJarId &&
                            `to ${getJarName(t.toJarId)}`}
                          {t.type === "withdrawal" &&
                            t.fromJarId &&
                            `from ${getJarName(t.fromJarId)}`}
                          {t.type === "transfer" &&
                            `${getJarName(t.fromJarId)} → ${getJarName(t.toJarId)}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {categoryName && (
                          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium">
                            {categoryName}
                          </span>
                        )}
                        {t.note && (
                          <p className="text-xs text-muted-foreground truncate">{t.note}</p>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(t.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-medium ${
                          t.type === "income"
                            ? "text-green-600 dark:text-green-400"
                            : t.type === "withdrawal"
                              ? "text-red-600 dark:text-red-400"
                              : "text-muted-foreground"
                        }`}
                      >
                        {t.type === "income" ? "+" : "-"}
                        {formatCurrency(t.amount, currency)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(t._id)}
                        disabled={deletingId === t._id}
                        aria-label="Delete transaction"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {filterCategory !== "all"
                ? "No transactions match this filter."
                : "No transactions yet. Allocate your first income to get started!"}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export const Route = createFileRoute("/_authenticated/transactions")({
  component: TransactionsPage,
})
