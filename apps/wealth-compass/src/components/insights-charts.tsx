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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, TrendingDown } from "lucide-react"
import { useCurrency } from "@wealth-compass/lib/use-currency"
import { formatCurrency } from "@wealth-compass/lib/currency"

interface SpendingByJarItem {
  jarId: string
  jarName: string
  color: string
  total: number
}

interface MonthlyTrendItem {
  month: string
  jarName: string
  color: string
  total: number
}

interface IncomeVsSpendingItem {
  month: string
  income: number
  spending: number
}

interface CategoryItem {
  categoryId: string
  categoryName: string
  jarName: string
  total: number
}

interface MonthComparisonData {
  current: { income: number; spending: number }
  previous: { income: number; spending: number }
}

export function SpendingByJarBarChart({ data }: { data: SpendingByJarItem[] }) {
  const { currency } = useCurrency()

  const chartConfig: ChartConfig = Object.fromEntries(
    data.map((item) => [
      item.jarName,
      { label: item.jarName, color: item.color },
    ]),
  )

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="jarName" />
        <YAxis />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => formatCurrency(Number(value), currency)}
            />
          }
        />
        {data.map((item) => (
          <Bar
            key={item.jarId}
            dataKey={item.jarName}
            fill={`var(--color-${item.jarName})`}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    </ChartContainer>
  )
}

export function SpendingTrendLineChart({ data }: { data: MonthlyTrendItem[] }) {
  const { currency } = useCurrency()

  const jarNames = [...new Set(data.map((d) => d.jarName))]
  const months = [...new Set(data.map((d) => d.month))]

  const chartData = months.map((month) => {
    const row: Record<string, string | number> = { month }
    for (const item of data.filter((d) => d.month === month)) {
      row[item.jarName] = item.total
    }
    return row
  })

  const chartConfig: ChartConfig = Object.fromEntries(
    jarNames.map((name) => {
      const item = data.find((d) => d.jarName === name)
      return [name, { label: name, color: item?.color ?? "#888" }]
    }),
  )

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => formatCurrency(Number(value), currency)}
            />
          }
        />
        {jarNames.map((name) => (
          <Line
            key={name}
            type="monotone"
            dataKey={name}
            stroke={`var(--color-${name})`}
            strokeWidth={2}
            dot={false}
          />
        ))}
      </LineChart>
    </ChartContainer>
  )
}

export function IncomeVsSpendingLineChart({
  data,
}: { data: IncomeVsSpendingItem[] }) {
  const { currency } = useCurrency()

  const chartConfig: ChartConfig = {
    income: { label: "Income", color: "#22C55E" },
    spending: { label: "Spending", color: "#EF4444" },
  }

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => formatCurrency(Number(value), currency)}
            />
          }
        />
        <Area
          type="monotone"
          dataKey="income"
          stroke="var(--color-income)"
          fill="var(--color-income)"
          fillOpacity={0.1}
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="spending"
          stroke="var(--color-spending)"
          fill="var(--color-spending)"
          fillOpacity={0.1}
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  )
}

export function CategoryBreakdownPieChart({
  data,
}: { data: CategoryItem[] }) {
  const { currency } = useCurrency()

  const aggregated = Object.values(
    data.reduce(
      (acc, item) => {
        if (!acc[item.categoryName]) {
          acc[item.categoryName] = {
            name: item.categoryName,
            value: 0,
          }
        }
        acc[item.categoryName].value += item.total
        return acc
      },
      {} as Record<string, { name: string; value: number }>,
    ),
  )

  const COLORS = [
    "#EF4444",
    "#3B82F6",
    "#EAB308",
    "#A855F7",
    "#22C55E",
    "#F59E0B",
    "#EC4899",
    "#14B8A6",
    "#F97316",
    "#6366F1",
  ]

  const chartConfig: ChartConfig = Object.fromEntries(
    aggregated.map((item, i) => [
      item.name,
      { label: item.name, color: COLORS[i % COLORS.length] },
    ]),
  )

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
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
          data={aggregated}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
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
          {aggregated.map((entry) => {
            const idx = aggregated.indexOf(entry)
            return (
              <Cell key={entry.name} fill={COLORS[idx % COLORS.length]} />
            )
          })}
        </Pie>
      </PieChart>
    </ChartContainer>
  )
}

export function MonthComparisonCard({
  data,
}: { data: MonthComparisonData }) {
  const { currency } = useCurrency()

  const spendingDelta = data.current.spending - data.previous.spending
  const spendingPct =
    data.previous.spending > 0
      ? ((spendingDelta / data.previous.spending) * 100).toFixed(1)
      : "0"
  const spendingUp = spendingDelta > 0

  const incomeDelta = data.current.income - data.previous.income
  const incomePct =
    data.previous.income > 0
      ? ((incomeDelta / data.previous.income) * 100).toFixed(1)
      : "0"
  const incomeUp = incomeDelta > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Month Comparison</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Spending</div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-bold">
                {formatCurrency(data.current.spending, currency)}
              </div>
              <div className="text-xs text-muted-foreground">
                vs {formatCurrency(data.previous.spending, currency)} last month
              </div>
            </div>
            <div
              className={`flex items-center gap-1 text-sm font-medium ${
                spendingUp
                  ? "text-red-600 dark:text-red-400"
                  : "text-green-600 dark:text-green-400"
              }`}
            >
              {spendingUp ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              {spendingPct}%
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Income</div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-bold">
                {formatCurrency(data.current.income, currency)}
              </div>
              <div className="text-xs text-muted-foreground">
                vs {formatCurrency(data.previous.income, currency)} last month
              </div>
            </div>
            <div
              className={`flex items-center gap-1 text-sm font-medium ${
                incomeUp
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {incomeUp ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              {incomePct}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function TopCategoriesList({ data }: { data: CategoryItem[] }) {
  const { currency } = useCurrency()

  const aggregated = Object.values(
    data.reduce(
      (acc, item) => {
        if (!acc[item.categoryName]) {
          acc[item.categoryName] = {
            categoryName: item.categoryName,
            total: 0,
          }
        }
        acc[item.categoryName].total += item.total
        return acc
      },
      {} as Record<string, { categoryName: string; total: number }>,
    ),
  ).sort((a, b) => b.total - a.total)

  const maxTotal = aggregated[0]?.total ?? 1

  return (
    <div className="space-y-3">
      {aggregated.map((item) => (
        <div key={item.categoryName} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{item.categoryName}</span>
            <span className="text-muted-foreground">
              {formatCurrency(item.total, currency)}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${(item.total / maxTotal) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
