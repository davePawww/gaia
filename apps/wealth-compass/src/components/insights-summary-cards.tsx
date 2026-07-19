import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@gaia/ui/components/card"
import { Skeleton } from "@gaia/ui/components/skeleton"
import { TrendingUp, TrendingDown, DollarSign, Clock } from "lucide-react"
import { useCurrency } from "@wealth-compass/lib/use-currency"
import { formatCurrency } from "@wealth-compass/lib/currency"

interface SummaryStats {
  totalSpending: number
  avgDaily: number
  mostSpentJar: { name: string; color: string; total: number } | null
  leastSpentJar: { name: string; color: string; total: number } | null
  velocity: number
}

export function InsightsSummaryCards({
  stats,
  isLoading,
}: {
  stats: SummaryStats | undefined
  isLoading: boolean
}) {
  const { currency } = useCurrency()

  if (isLoading || stats === undefined) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20" />
              <Skeleton className="mt-2 h-3 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const velocityUp = stats.velocity >= 0

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Spending</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(stats.totalSpending, currency)}
          </div>
          <p className="text-xs text-muted-foreground">Last 30 days</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(stats.avgDaily, currency)}
          </div>
          <p className="text-xs text-muted-foreground">Per day</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Most Spent On</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {stats.mostSpentJar ? (
            <>
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: stats.mostSpentJar.color }}
                />
                <span className="text-2xl font-bold">
                  {stats.mostSpentJar.name}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(stats.mostSpentJar.total, currency)}
              </p>
            </>
          ) : (
            <div className="text-2xl font-bold">-</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Spending Velocity
          </CardTitle>
          {velocityUp ? (
            <TrendingUp className="h-4 w-4 text-red-500 dark:text-red-400" />
          ) : (
            <TrendingDown className="h-4 w-4 text-green-500 dark:text-green-400" />
          )}
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${
              velocityUp
                ? "text-red-600 dark:text-red-400"
                : "text-green-600 dark:text-green-400"
            }`}
          >
            {velocityUp ? "+" : ""}
            {stats.velocity.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">vs last month</p>
        </CardContent>
      </Card>
    </div>
  )
}
