import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@gaia/ui/components/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@gaia/ui/components/tabs"
import { Skeleton } from "@gaia/ui/components/skeleton"
import { useCurrency } from "@wealth-compass/lib/use-currency"
import { formatCurrency } from "@wealth-compass/lib/currency"
import { HistoryCharts } from "@wealth-compass/components/history-charts"

function HistoryPage() {
  const { currency } = useCurrency()
  const transactions = useQuery(api.transactions.getUserTransactions)
  const jarBalances = useQuery(api.jars.getJarBalances)

  const isLoading = transactions === undefined || jarBalances === undefined

  const getSummary = (days: number) => {
    if (!transactions) return { income: 0, withdrawals: 0, transfers: 0 }
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
    const recent = transactions.filter((t) => t.createdAt >= cutoff)
    return {
      income: recent
        .filter((t) => t.type === "income")
        .reduce((s, t) => s + t.amount, 0),
      withdrawals: recent
        .filter((t) => t.type === "withdrawal")
        .reduce((s, t) => s + t.amount, 0),
      transfers: recent
        .filter((t) => t.type === "transfer")
        .reduce((s, t) => s + t.amount, 0),
    }
  }

  const weekly = getSummary(7)
  const monthly = getSummary(30)
  const yearly = getSummary(365)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">History</h1>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <Tabs defaultValue="weekly">
          <TabsList>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">Yearly</TabsTrigger>
          </TabsList>

          <TabsContent value="weekly" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Income
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(weekly.income, currency)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Withdrawals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {formatCurrency(weekly.withdrawals, currency)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Transfers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(weekly.transfers, currency)}
                  </div>
                </CardContent>
              </Card>
            </div>
            <HistoryCharts
              transactions={transactions ?? []}
              jarBalances={jarBalances ?? []}
              currency={currency}
              period="weekly"
            />
          </TabsContent>

          <TabsContent value="monthly" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Income
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(monthly.income, currency)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Withdrawals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {formatCurrency(monthly.withdrawals, currency)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Transfers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(monthly.transfers, currency)}
                  </div>
                </CardContent>
              </Card>
            </div>
            <HistoryCharts
              transactions={transactions ?? []}
              jarBalances={jarBalances ?? []}
              currency={currency}
              period="monthly"
            />
          </TabsContent>

          <TabsContent value="yearly" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Income
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(yearly.income, currency)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Withdrawals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {formatCurrency(yearly.withdrawals, currency)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Transfers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(yearly.transfers, currency)}
                  </div>
                </CardContent>
              </Card>
            </div>
            <HistoryCharts
              transactions={transactions ?? []}
              jarBalances={jarBalances ?? []}
              currency={currency}
              period="yearly"
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

export const Route = createFileRoute("/_authenticated/history")({
  component: HistoryPage,
})
