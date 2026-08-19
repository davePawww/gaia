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
  CircleDollarSign,
  Download,
  Plus,
  Trash2,
} from "lucide-react"
import { useCurrency } from "@wealth-compass/lib/use-currency"
import { formatCurrency, isCurrencyCode } from "@wealth-compass/lib/currency"
import { AllocateIncomeDialog } from "@wealth-compass/components/allocate-income-dialog"
import { WithdrawDialog } from "@wealth-compass/components/withdraw-dialog"
import { TransferDialog } from "@wealth-compass/components/transfer-dialog"
import { AddToJarDialog } from "@wealth-compass/components/add-to-jar-dialog"
import { ExportDialog } from "@wealth-compass/components/export-dialog"
import {
  filterAndSortTransactions,
  paginateTransactions,
  type TransactionSort,
} from "@wealth-compass/lib/transaction-list"
import { Button } from "@gaia/ui/components/button"
import { toast } from "sonner"
import { useState } from "react"

const TRANSACTIONS_PAGE_SIZE = 10

function TransactionsPage() {
  const { currency } = useCurrency()
  const transactions = useQuery(api.transactions.getUserTransactions)
  const jarBalances = useQuery(api.jars.getJarBalances)
  const categories = useQuery(api.categories.getUserCategories)
  const deleteTransaction = useMutation(api.transactions.deleteTransaction)
  const [deletingId, setDeletingId] = useState<Id<"transactions"> | null>(null)
  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterJar, setFilterJar] = useState("all")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [sort, setSort] = useState<TransactionSort>("newest")
  const [page, setPage] = useState(1)

  const isLoading =
    transactions === undefined ||
    jarBalances === undefined ||
    categories === undefined

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

  const resetFilters = () => {
    setSearch("")
    setFilterType("all")
    setFilterJar("all")
    setFilterCategory("all")
    setDateFrom("")
    setDateTo("")
    setSort("newest")
    setPage(1)
  }

  const filteredTransactions = filterAndSortTransactions(
    transactions ?? [],
    {
      search,
      type: filterType,
      jarId: filterJar,
      categoryId: filterCategory,
      dateFrom,
      dateTo,
    },
    sort
  )
  const paginatedTransactions = paginateTransactions(
    filteredTransactions,
    page,
    TRANSACTIONS_PAGE_SIZE
  )

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
          <AddToJarDialog currency={currency}>
            <Button size="sm" variant="outline">
              <CircleDollarSign className="mr-1 h-4 w-4" />
              Add to Jar
            </Button>
          </AddToJarDialog>
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
          <ExportDialog currency={currency}>
            <Button size="sm" variant="outline">
              <Download className="mr-1 h-4 w-4" />
              Export
            </Button>
          </ExportDialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-lg">All Transactions</CardTitle>
              <p className="text-xs text-muted-foreground">
                {paginatedTransactions.total} matching transaction
                {paginatedTransactions.total === 1 ? "" : "s"}
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <input
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                placeholder="Search notes..."
                aria-label="Search transactions"
                className="rounded-md border bg-background px-3 py-2 text-sm"
              />
              <select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value)
                  setPage(1)
                }}
                aria-label="Transaction type"
                className="rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="all">All Types</option>
                <option value="income">Income</option>
                <option value="withdrawal">Withdrawal</option>
                <option value="transfer">Transfer</option>
              </select>
              <select
                value={filterJar}
                onChange={(e) => {
                  setFilterJar(e.target.value)
                  setPage(1)
                }}
                aria-label="Jar"
                className="rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="all">All Jars</option>
                {jarBalances?.map((jarBalance) => (
                  <option key={jarBalance.jar._id} value={jarBalance.jar._id}>
                    {jarBalance.jar.name}
                  </option>
                ))}
              </select>
              <select
                value={filterCategory}
                onChange={(e) => {
                  setFilterCategory(e.target.value)
                  setPage(1)
                }}
                aria-label="Category"
                className="rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="all">All Categories</option>
                <option value="none">No Category</option>
                {categories &&
                  [...new Set(categories.map((c) => c.jarName))].map(
                    (jarName) => (
                      <optgroup key={jarName} label={jarName}>
                        {categories
                          .filter((c) => c.jarName === jarName)
                          .map((cat) => (
                            <option key={cat._id} value={cat._id}>
                              {cat.name}
                            </option>
                          ))}
                      </optgroup>
                    )
                  )}
              </select>
              <label className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm">
                <span className="text-xs text-muted-foreground">From</span>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value)
                    setPage(1)
                  }}
                  aria-label="From date"
                  className="min-w-0 flex-1 bg-transparent"
                />
              </label>
              <label className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm">
                <span className="text-xs text-muted-foreground">To</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => {
                    setDateTo(e.target.value)
                    setPage(1)
                  }}
                  aria-label="To date"
                  className="min-w-0 flex-1 bg-transparent"
                />
              </label>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value as TransactionSort)
                  setPage(1)
                }}
                aria-label="Sort transactions"
                className="rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="amount-high">Highest amount</option>
                <option value="amount-low">Lowest amount</option>
              </select>
              <Button type="button" variant="ghost" onClick={resetFilters}>
                Reset filters
              </Button>
            </div>
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
          ) : paginatedTransactions.items.length > 0 ? (
            <div className="space-y-4">
              {paginatedTransactions.items.map((t) => {
                const categoryName = getCategoryName(t.categoryId)
                const sourceCurrency =
                  t.sourceCurrency && isCurrencyCode(t.sourceCurrency)
                    ? t.sourceCurrency
                    : null
                const convertedCurrency =
                  t.convertedCurrency && isCurrencyCode(t.convertedCurrency)
                    ? t.convertedCurrency
                    : currency
                const hasConversion =
                  t.type === "income" &&
                  sourceCurrency !== null &&
                  sourceCurrency !== convertedCurrency &&
                  t.originalAmount !== undefined &&
                  t.exchangeRate !== undefined
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
                        <p className="text-sm font-medium capitalize">
                          {t.type}
                        </p>
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
                          <p className="truncate text-xs text-muted-foreground">
                            {t.note}
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(t.createdAt)}
                      </p>
                      {hasConversion && sourceCurrency && (
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(
                            t.originalAmount ?? 0,
                            sourceCurrency
                          )}
                          {" → "}
                          {formatCurrency(t.amount, convertedCurrency)} at 1{" "}
                          {sourceCurrency} = {t.exchangeRate?.toLocaleString()}{" "}
                          {convertedCurrency}
                          {t.exchangeRateDate ? ` (${t.exchangeRateDate})` : ""}
                        </p>
                      )}
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
                        {formatCurrency(t.amount, convertedCurrency)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive"
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
              {paginatedTransactions.hasMore && (
                <div className="flex justify-center pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPage((currentPage) => currentPage + 1)}
                  >
                    Load more transactions
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {transactions && transactions.length > 0
                  ? "No transactions match your filters."
                  : "No transactions yet. Allocate your first income to get started!"}
              </p>
              {transactions && transactions.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                >
                  Reset filters
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export const Route = createFileRoute("/_authenticated/transactions")({
  component: TransactionsPage,
})
