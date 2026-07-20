import { useEffect, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useQuery, useAction } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { Skeleton } from "@gaia/ui/components/skeleton"
import { getStoredCurrency, getCurrencySymbol } from "@wealth-compass/lib/currency"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@gaia/ui/components/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@gaia/ui/components/tabs"
import { InsightsSummaryCards } from "@wealth-compass/components/insights-summary-cards"
import { AiInsightsSection } from "@wealth-compass/components/ai-insights"
import {
  SpendingByJarBarChart,
  SpendingTrendLineChart,
  IncomeVsSpendingLineChart,
  CategoryBreakdownPieChart,
  MonthComparisonCard,
  TopCategoriesList,
} from "@wealth-compass/components/insights-charts"

interface Insight {
  type: "spending_change" | "trend" | "positive" | "anomaly"
  title: string
  description: string
  severity: "info" | "warning" | "success" | "alert"
}

function InsightsPage() {
  const [selectedJar, setSelectedJar] = useState<string>("all")
  const [aiInsights, setAiInsights] = useState<Insight[] | undefined>(
    undefined,
  )
  const [aiLoading, setAiLoading] = useState(true)

  const spendingByJar = useQuery(api.insights.getSpendingByJar, { days: 30 })
  const spendingByCategory = useQuery(api.insights.getSpendingByCategory, {
    days: 30,
  })
  const monthlyTrends = useQuery(api.insights.getMonthlyTrends, { months: 6 })
  const incomeVsSpending = useQuery(api.insights.getIncomeVsSpending, {
    months: 6,
  })
  const summaryStats = useQuery(api.insights.getSummaryStats, { days: 30 })
  const monthComparison = useQuery(api.insights.getMonthComparison)

  const generateInsights = useAction(api.ai.generateInsights)

  const isLoading =
    spendingByJar === undefined ||
    spendingByCategory === undefined ||
    monthlyTrends === undefined ||
    incomeVsSpending === undefined ||
    summaryStats === undefined ||
    monthComparison === undefined

  useEffect(() => {
    if (isLoading) return

    const cacheKey = "wealth-compass-ai-insights"
    const cached = localStorage.getItem(cacheKey)
    if (cached) {
      try {
        const { insights, timestamp } = JSON.parse(cached)
        if (Date.now() - timestamp < 60 * 60 * 1000) {
          setAiInsights(insights)
          setAiLoading(false)
          return
        }
      } catch {
        localStorage.removeItem(cacheKey)
      }
    }

    let cancelled = false

    async function run() {
      try {
        const result = await generateInsights({
          spendingByJar,
          spendingByCategory,
          monthlyTrends,
          incomeVsSpending,
          summaryStats,
          monthComparison,
          currency: getCurrencySymbol(getStoredCurrency()),
        })
        if (!cancelled) {
          setAiInsights(result.insights)
          const isError = result.insights?.some(
            (i) =>
              i.title === "Could not generate insights" ||
              i.title === "AI quota exceeded" ||
              i.title === "AI insights unavailable",
          )
          if (!isError) {
            localStorage.setItem(
              cacheKey,
              JSON.stringify({ insights: result.insights, timestamp: Date.now() }),
            )
          }
        }
      } catch {
        if (!cancelled) {
          setAiInsights(undefined)
        }
      } finally {
        if (!cancelled) {
          setAiLoading(false)
        }
      }
    }

    run()

    return () => {
      cancelled = true
    }
  }, [
    isLoading,
    spendingByJar,
    spendingByCategory,
    monthlyTrends,
    incomeVsSpending,
    summaryStats,
    monthComparison,
    generateInsights,
  ])

  const filteredCategoryData =
    spendingByCategory?.filter(
      (item) => selectedJar === "all" || item.jarName === selectedJar,
    ) ?? []

  const jarNames = [...new Set(spendingByJar?.map((j) => j.jarName) ?? [])]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Spending Insights</h1>
        <Select value={selectedJar} onValueChange={setSelectedJar}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by jar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Jars</SelectItem>
            {jarNames.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <InsightsSummaryCards stats={summaryStats} isLoading={isLoading} />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">AI Insights</h2>
        <AiInsightsSection insights={aiInsights} isLoading={aiLoading} />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
      ) : (
        <Tabs defaultValue="breakdown">
          <TabsList>
            <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          <TabsContent value="breakdown" className="space-y-6 pt-4">
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                  Spending by Jar
                </h3>
                {spendingByJar && spendingByJar.length > 0 ? (
                  <SpendingByJarBarChart data={spendingByJar} />
                ) : (
                  <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                    No spending data yet.
                  </div>
                )}
              </div>
              <div>
                <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                  This Month vs Last Month
                </h3>
                {monthComparison ? (
                  <MonthComparisonCard data={monthComparison} />
                ) : (
                  <Skeleton className="h-[300px] w-full rounded-xl" />
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6 pt-4">
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                  Spending Trends
                </h3>
                {monthlyTrends && monthlyTrends.length > 0 ? (
                  <SpendingTrendLineChart data={monthlyTrends} />
                ) : (
                  <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                    No trend data yet.
                  </div>
                )}
              </div>
              <div>
                <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                  Income vs Spending
                </h3>
                {incomeVsSpending && incomeVsSpending.length > 0 ? (
                  <IncomeVsSpendingLineChart data={incomeVsSpending} />
                ) : (
                  <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                    No income/spending data yet.
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6 pt-4">
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                  Category Breakdown
                </h3>
                {filteredCategoryData.length > 0 ? (
                  <CategoryBreakdownPieChart data={filteredCategoryData} />
                ) : (
                  <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                    No category data yet.
                  </div>
                )}
              </div>
              <div>
                <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                  Top Categories
                </h3>
                {filteredCategoryData.length > 0 ? (
                  <TopCategoriesList data={filteredCategoryData} />
                ) : (
                  <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                    No category data yet.
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

export const Route = createFileRoute("/_authenticated/insights")({
  component: InsightsPage,
})
