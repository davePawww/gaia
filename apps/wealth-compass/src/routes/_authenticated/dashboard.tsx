import { createFileRoute } from "@tanstack/react-router"
import { Card, CardContent, CardHeader, CardTitle } from "@gaia/ui/components/card"
import { Button } from "@gaia/ui/components/button"
import { Badge } from "@gaia/ui/components/badge"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@gaia/ui/components/chart"
import { PieChart, Pie, Cell } from "recharts"
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
import { useCurrency } from "@wealth-compass/lib/use-currency"
import { formatCurrency } from "@wealth-compass/lib/currency"
import type { Doc, Id } from "../../../convex/_generated/dataModel"

const JAR_COLORS: Record<string, string> = {
  NEC: "#EF4444",
  LTSS: "#3B82F6",
  EDU: "#EAB308",
  PLAY: "#A855F7",
  GIVE: "#22C55E",
  FFA: "#F59E0B",
}

// TODO: Remove mock data once real data is available
const MOCK_JARS: Doc<"jars">[] = [
  { _id: "mock-nec" as Id<"jars">, _creationTime: 0, name: "NEC", color: "#EF4444", percentage: 55, icon: "Home", userId: "mock" as Id<"users"> },
  { _id: "mock-ltss" as Id<"jars">, _creationTime: 0, name: "LTSS", color: "#3B82F6", percentage: 10, icon: "Shield", userId: "mock" as Id<"users"> },
  { _id: "mock-edu" as Id<"jars">, _creationTime: 0, name: "EDU", color: "#EAB308", percentage: 10, icon: "BookOpen", userId: "mock" as Id<"users"> },
  { _id: "mock-play" as Id<"jars">, _creationTime: 0, name: "PLAY", color: "#A855F7", percentage: 10, icon: "Gamepad2", userId: "mock" as Id<"users"> },
  { _id: "mock-give" as Id<"jars">, _creationTime: 0, name: "GIVE", color: "#22C55E", percentage: 10, icon: "Heart", userId: "mock" as Id<"users"> },
  { _id: "mock-ffa" as Id<"jars">, _creationTime: 0, name: "FFA", color: "#F59E0B", percentage: 5, icon: "TrendingUp", userId: "mock" as Id<"users"> },
]

const MOCK_BALANCES: Record<string, number> = {
  NEC: 2750,
  LTSS: 500,
  EDU: 320,
  PLAY: 480,
  GIVE: 250,
  FFA: 175,
}

const MOCK_TRANSACTIONS: Doc<"transactions">[] = [
  { _id: "t1" as Id<"transactions">, _creationTime: 0, type: "income", amount: 5000, toJarId: "mock-nec" as Id<"jars">, fromJarId: undefined, note: "Monthly salary", createdAt: Date.now() - 86400000 * 2, userId: "mock" as Id<"users"> },
  { _id: "t2" as Id<"transactions">, _creationTime: 0, type: "withdrawal", amount: 120, fromJarId: "mock-nec" as Id<"jars">, toJarId: undefined, note: "Groceries", createdAt: Date.now() - 86400000 * 3, userId: "mock" as Id<"users"> },
  { _id: "t3" as Id<"transactions">, _creationTime: 0, type: "transfer", amount: 50, fromJarId: "mock-play" as Id<"jars">, toJarId: "mock-edu" as Id<"jars">, note: "Online course", createdAt: Date.now() - 86400000 * 5, userId: "mock" as Id<"users"> },
  { _id: "t4" as Id<"transactions">, _creationTime: 0, type: "withdrawal", amount: 65, fromJarId: "mock-nec" as Id<"jars">, toJarId: undefined, note: "Electric bill", createdAt: Date.now() - 86400000 * 7, userId: "mock" as Id<"users"> },
  { _id: "t5" as Id<"transactions">, _creationTime: 0, type: "income", amount: 800, toJarId: "mock-ffa" as Id<"jars">, fromJarId: undefined, note: "Freelance project", createdAt: Date.now() - 86400000 * 10, userId: "mock" as Id<"users"> },
]

function DashboardPage() {
  const { currency } = useCurrency()

  // TODO: Replace with real Convex queries
  // const jars = useQuery(api.jars.getUserJars)
  // const transactions = useQuery(api.transactions.getUserTransactions)
  const jars = MOCK_JARS
  const transactions = MOCK_TRANSACTIONS

  const jarBalances = MOCK_JARS.map((jar) => ({
    jar,
    balance: MOCK_BALANCES[jar.name] ?? 0,
  }))

  const totalNetWorth =
    jarBalances.reduce((sum, jb) => sum + jb.balance, 0)

  const totalRecentIncome =
    jarBalances.reduce((sum, jb) => {
      const income =
        transactions
          .filter(
            (t) =>
              t.type === "income" && t.toJarId === jb.jar._id
          )
          .reduce((s, t) => s + t.amount, 0)
      return sum + income
    }, 0)

  const chartData =
    jarBalances.map((jb) => ({
      name: jb.jar.name,
      value: jb.balance,
      fill: JAR_COLORS[jb.jar.name] ?? jb.jar.color,
    }))

  const chartConfig: ChartConfig = Object.fromEntries(
    Object.entries(JAR_COLORS).map(([name, color]) => [
      name,
      { label: name, color },
    ])
  )

  const recentTransactions = transactions
    .slice()
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 5)

  const getJarName = (jarId?: string) =>
    jars.find((j) => j._id === jarId)?.name ?? "N/A"

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex flex-wrap items-center gap-2">
          <CurrencySelector />
          <Button size="sm">
            <Plus className="mr-1 h-4 w-4" />
            Allocate Income
          </Button>
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
              Across {jars.length} jars
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
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
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
            {jarBalances.length > 0 ? (
              <>
                <div className="text-2xl font-bold">
                  {
                    jarBalances.reduce((max, jb) =>
                      jb.balance > max.balance ? jb : max
                    ).jar.name
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(
                    jarBalances.reduce((max, jb) =>
                      jb.balance > max.balance ? jb : max
                    ).balance,
                    currency
                  )}
                </p>
              </>
            ) : (
              <div className="text-2xl font-bold">-</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Jars</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.some((d) => d.value > 0) ? (
                <ChartContainer config={chartConfig} className="h-[200px] w-full">
                  <PieChart>
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          nameKey="name"
                          formatter={(value) => formatCurrency(Number(value), currency)}
                        />
                      }
                    />
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      strokeWidth={2}
                      label={({ name, percent }: { name?: string; percent?: number }) =>
                        `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                    >
                      {chartData.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
              ) : (
                <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
                  No data yet
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {recentTransactions.length > 0 ? (
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
                              {getJarName(t.fromJarId)} →{" "}
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
