import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@gaia/ui/components/card"
import { Button } from "@gaia/ui/components/button"
import { Badge } from "@gaia/ui/components/badge"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@gaia/ui/components/chart"
import { PieChart, Pie, Cell } from "recharts"
import { Skeleton } from "@gaia/ui/components/skeleton"
import {
  Wallet,
  ArrowLeftRight,
  TrendingUp,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRightLeft,
} from "lucide-react"
import { JarCard } from "@wealth-compass/components/jar-card"
import { CurrencySelector } from "@wealth-compass/components/currency-selector"
import { AllocateIncomeDialog } from "@wealth-compass/components/allocate-income-dialog"
import { useCurrency } from "@wealth-compass/lib/use-currency"
import { formatCurrency } from "@wealth-compass/lib/currency"

const JAR_COLORS: Record<string, string> = {
  NEC: "#EF4444",
  LTSS: "#3B82F6",
  EDU: "#EAB308",
  PLAY: "#A855F7",
  GIVE: "#22C55E",
  FFA: "#F59E0B",
}

function DashboardPage() {
  const { currency } = useCurrency()
  const jarBalances = useQuery(api.jars.getJarBalances)
  const transactions = useQuery(api.transactions.getUserTransactions)

  const isLoading = jarBalances === undefined || transactions === undefined

  const totalNetWorth =
    jarBalances?.reduce((sum, jb) => sum + jb.balance, 0) ?? 0

  const totalRecentIncome =
    jarBalances?.reduce((sum, jb) => {
      const income =
        transactions
          ?.filter((t) => t.type === "income" && t.toJarId === jb.jar._id)
          .reduce((s, t) => s + t.amount, 0) ?? 0
      return sum + income
    }, 0) ?? 0

  const chartData =
    jarBalances?.map((jb) => ({
      name: jb.jar.name,
      value: jb.balance,
      fill: JAR_COLORS[jb.jar.name] ?? jb.jar.color,
    })) ?? []

  const chartConfig: ChartConfig = Object.fromEntries(
    Object.entries(JAR_COLORS).map(([name, color]) => [
      name,
      { label: name, color },
    ]),
  )

  const recentTransactions =
    transactions
      ?.slice()
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5) ?? []

  const getJarName = (jarId?: string) =>
    jarBalances?.find((jb) => jb.jar._id === jarId)?.jar.name ?? "N/A"

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex flex-wrap items-center gap-2">
          <CurrencySelector />
          <AllocateIncomeDialog currency={currency}>
            <Button size="sm">
              <Plus className="mr-1 h-4 w-4" />
              Allocate Income
            </Button>
          </AllocateIncomeDialog>
          <Button size="sm" variant="outline">
            <ArrowRightLeft className="mr-1 h-4 w-4" />
            Transfer
          </Button>
          <Button size="sm" variant="outline">
            <ArrowUpRight className="mr-1 h-4 w-4" />
            Withdraw
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(totalNetWorth, currency)}
              </div>
              <p className="text-xs text-muted-foreground">
                Across {jarBalances?.length ?? 0} jars
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Allocated
              </CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(totalRecentIncome, currency)}
              </div>
              <p className="text-xs text-muted-foreground">Lifetime income</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Transactions
              </CardTitle>
              <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {transactions?.length ?? 0}
              </div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Largest Jar
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {jarBalances && jarBalances.length > 0 ? (
                <>
                  <div className="text-2xl font-bold">
                    {
                      jarBalances.reduce((max, jb) =>
                        jb.balance > max.balance ? jb : max,
                      ).jar.name
                    }
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(
                      jarBalances.reduce((max, jb) =>
                        jb.balance > max.balance ? jb : max,
                      ).balance,
                      currency,
                    )}
                  </p>
                </>
              ) : (
                <div className="text-2xl font-bold">-</div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Jars</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-32 rounded-xl" />
                  ))}
                </div>
              ) : jarBalances && jarBalances.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {jarBalances.map((jb) => (
                    <JarCard
                      key={jb.jar._id}
                      jar={jb.jar}
                      balance={jb.balance}
                      recentIncome={totalRecentIncome}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No jars found. Allocate your first income to get started.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[250px] w-full rounded-xl" />
              ) : chartData.some((d) => d.value > 0) ? (
                <ChartContainer
                  config={chartConfig}
                  className="h-[250px] w-full"
                >
                  <PieChart>
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          nameKey="name"
                          formatter={(value) =>
                            formatCurrency(Number(value), currency)
                          }
                        />
                      }
                    />
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={65}
                      strokeWidth={2}
                      label={({
                        name,
                        percent,
                      }: {
                        name?: string
                        percent?: number
                      }) => `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {chartData.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
              ) : (
                <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
                  No data yet. Allocate your first income!
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                  ))}
                </div>
              ) : recentTransactions.length > 0 ? (
                <div className="space-y-3">
                  {recentTransactions.map((t) => (
                    <div
                      key={t._id}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        {t.type === "income" && (
                          <ArrowDownRight className="h-4 w-4 text-green-500" />
                        )}
                        {t.type === "withdrawal" && (
                          <ArrowUpRight className="h-4 w-4 text-red-500" />
                        )}
                        {t.type === "transfer" && (
                          <ArrowRightLeft className="h-4 w-4 text-blue-500" />
                        )}
                        <div>
                          <span className="capitalize">{t.type}</span>
                          {t.type === "income" && t.toJarId && (
                            <span className="ml-1 text-muted-foreground">
                              to {getJarName(t.toJarId)}
                            </span>
                          )}
                          {t.type === "withdrawal" && t.fromJarId && (
                            <span className="ml-1 text-muted-foreground">
                              from {getJarName(t.fromJarId)}
                            </span>
                          )}
                          {t.type === "transfer" && (
                            <span className="ml-1 text-muted-foreground">
                              {getJarName(t.fromJarId)} &rarr;{" "}
                              {getJarName(t.toJarId)}
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge
                        variant={
                          t.type === "income"
                            ? "default"
                            : t.type === "withdrawal"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {t.type === "income" ? "+" : "-"}
                        {formatCurrency(t.amount, currency)}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No transactions yet. Allocate your first income!
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
})
