import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@gaia/ui/components/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@gaia/ui/components/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { formatCurrency, type CurrencyCode } from "@wealth-compass/lib/currency"

interface Transaction {
  _id: string
  type: "income" | "withdrawal" | "transfer"
  amount: number
  createdAt: number
  fromJarId?: string
  toJarId?: string
}

interface JarBalance {
  jar: { _id: string; name: string; color: string }
  balance: number
}

interface HistoryChartsProps {
  transactions: Transaction[]
  jarBalances: JarBalance[]
  currency: CurrencyCode
  period: "weekly" | "monthly" | "yearly"
}

const chartConfig = {
  income: { label: "Income", color: "#22C55E" },
  withdrawals: { label: "Withdrawals", color: "#EF4444" },
} satisfies ChartConfig

export function HistoryCharts({
  transactions,
  currency,
  period,
}: HistoryChartsProps) {
  const getChartData = () => {
    const now = Date.now()
    const dayMs = 24 * 60 * 60 * 1000

    if (period === "weekly") {
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      return Array.from({ length: 7 }, (_, i) => {
        const date = new Date(now - (6 - i) * dayMs)
        const dayStart = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
        ).getTime()
        const dayEnd = dayStart + dayMs
        const dayTx = transactions.filter(
          (t) => t.createdAt >= dayStart && t.createdAt < dayEnd,
        )
        return {
          name: days[date.getDay()],
          income: dayTx
            .filter((t) => t.type === "income")
            .reduce((s, t) => s + t.amount, 0),
          withdrawals: dayTx
            .filter((t) => t.type === "withdrawal")
            .reduce((s, t) => s + t.amount, 0),
        }
      })
    }

    if (period === "monthly") {
      const weeks = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"]
      return Array.from({ length: 5 }, (_, i) => {
        const weekStart = now - (4 - i) * 7 * dayMs
        const weekEnd = weekStart + 7 * dayMs
        const weekTx = transactions.filter(
          (t) => t.createdAt >= weekStart && t.createdAt < weekEnd,
        )
        return {
          name: weeks[i],
          income: weekTx
            .filter((t) => t.type === "income")
            .reduce((s, t) => s + t.amount, 0),
          withdrawals: weekTx
            .filter((t) => t.type === "withdrawal")
            .reduce((s, t) => s + t.amount, 0),
        }
      })
    }

    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ]
    return Array.from({ length: 12 }, (_, i) => {
      const date = new Date(now)
      date.setMonth(date.getMonth() - (11 - i))
      const monthStart = new Date(
        date.getFullYear(),
        date.getMonth(),
        1,
      ).getTime()
      const monthEnd = new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        1,
      ).getTime()
      const monthTx = transactions.filter(
        (t) => t.createdAt >= monthStart && t.createdAt < monthEnd,
      )
      return {
        name: months[date.getMonth()],
        income: monthTx
          .filter((t) => t.type === "income")
          .reduce((s, t) => s + t.amount, 0),
        withdrawals: monthTx
          .filter((t) => t.type === "withdrawal")
          .reduce((s, t) => s + t.amount, 0),
      }
    })
  }

  const data = getChartData()
  const hasData = data.some((d) => d.income > 0 || d.withdrawals > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Trends</CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) =>
                      formatCurrency(Number(value), currency)
                    }
                  />
                }
              />
              <Bar
                dataKey="income"
                fill="var(--color-income)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="withdrawals"
                fill="var(--color-withdrawals)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            No data for this period yet.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
