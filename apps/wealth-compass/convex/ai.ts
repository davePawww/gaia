import { action } from "./_generated/server"
import { v } from "convex/values"
import { GoogleGenerativeAI } from "@google/generative-ai"

declare const process: { env: { GEMINI_API_KEY?: string } }

type SpendingByJar = { jarName: string; total: number }
type SpendingByCategory = { categoryName: string; jarName: string; total: number }
type MonthlyTrend = { month: string; jarName: string; total: number }
type IncomeVsSpending = { month: string; income: number; spending: number }
type SummaryStats = { totalSpending: number; avgDaily: number; velocity?: number }
type MonthComparison = {
  current?: { income: number; spending: number }
  previous?: { income: number; spending: number }
}
type InsightInput = {
  spendingByJar?: SpendingByJar[]
  spendingByCategory?: SpendingByCategory[]
  monthlyTrends?: MonthlyTrend[]
  incomeVsSpending?: IncomeVsSpending[]
  summaryStats?: SummaryStats
  monthComparison?: MonthComparison
  currency: string
}

type Insight = {
  type: "spending_change" | "trend" | "positive" | "anomaly"
  title: string
  description: string
  severity: "info" | "warning" | "success" | "alert"
}

type InsightResult = { insights: Insight[] }

const INSIGHT_TYPES = new Set<Insight["type"]>([
  "spending_change",
  "trend",
  "positive",
  "anomaly",
])
const INSIGHT_SEVERITIES = new Set<Insight["severity"]>([
  "info",
  "warning",
  "success",
  "alert",
])

function isInsight(value: unknown): value is Insight {
  if (!value || typeof value !== "object") return false
  const insight = value as Partial<Insight>
  return (
    typeof insight.title === "string" &&
    typeof insight.description === "string" &&
    INSIGHT_TYPES.has(insight.type as Insight["type"]) &&
    INSIGHT_SEVERITIES.has(insight.severity as Insight["severity"])
  )
}

function parseInsightResult(text: string): InsightResult {
  let jsonStr = text.replace(/<\|.*?\|>/g, "").trim()
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1].trim()
  }

  const jsonMatch = jsonStr.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    jsonStr = jsonMatch[0]
  }

  const parsed = JSON.parse(jsonStr) as { insights?: unknown[] }
  const insights = Array.isArray(parsed.insights)
    ? parsed.insights.filter(isInsight)
    : []
  if (insights.length === 0) {
    throw new Error("AI returned no insights")
  }

  return { insights }
}

function buildFallbackInsights(body: InsightInput): InsightResult {
  const sym = body.currency
  const fmt = (value: number) => `${sym}${value.toFixed(2)}`
  const insights: Insight[] = []
  const topCategory = [...(body.spendingByCategory ?? [])].sort(
    (a, b) => b.total - a.total,
  )[0]
  const topJar = [...(body.spendingByJar ?? [])].sort(
    (a, b) => b.total - a.total,
  )[0]
  const velocity = body.summaryStats?.velocity ?? 0

  if (topCategory) {
    insights.push({
      type: "trend",
      title: "Top spending category",
      description: `${topCategory.categoryName} is your largest category at ${fmt(topCategory.total)} over the last 30 days.`,
      severity: "info",
    })
  }

  if (topJar) {
    insights.push({
      type: "trend",
      title: "Top spending jar",
      description: `${topJar.jarName} accounts for ${fmt(topJar.total)} of recent spending.`,
      severity: "info",
    })
  }

  if (velocity > 10) {
    insights.push({
      type: "spending_change",
      title: "Spending is trending up",
      description: `Your daily spending is ${velocity.toFixed(1)}% higher than the previous period.`,
      severity: "warning",
    })
  } else if (velocity < -10) {
    insights.push({
      type: "spending_change",
      title: "Spending is trending down",
      description: `Your daily spending is ${Math.abs(velocity).toFixed(1)}% lower than the previous period.`,
      severity: "success",
    })
  }

  const current = body.monthComparison?.current
  const previous = body.monthComparison?.previous
  if (current && previous && previous.spending > 0) {
    const monthChange =
      ((current.spending - previous.spending) / previous.spending) * 100
    if (Math.abs(monthChange) > 10) {
      insights.push({
        type: "spending_change",
        title: monthChange > 0 ? "Monthly spending increased" : "Monthly spending decreased",
        description: `This month is ${Math.abs(monthChange).toFixed(1)}% ${monthChange > 0 ? "higher" : "lower"} than last month (${fmt(current.spending)} vs ${fmt(previous.spending)}).`,
        severity: monthChange > 0 ? "warning" : "success",
      })
    }
  }

  if (insights.length === 0) {
    insights.push({
      type: "positive",
      title: "No spending patterns yet",
      description: "Add a few transactions and we’ll highlight your biggest trends and changes.",
      severity: "info",
    })
  }

  return { insights: insights.slice(0, 5) }
}

export const generateInsights = action({
  args: {
    spendingByJar: v.any(),
    spendingByCategory: v.any(),
    monthlyTrends: v.any(),
    incomeVsSpending: v.any(),
    summaryStats: v.any(),
    monthComparison: v.any(),
    currency: v.string(),
  },
  handler: async (_ctx, args): Promise<InsightResult> => {
    const body = args as unknown as InsightInput
    const sym = body.currency

    if (!process.env.GEMINI_API_KEY) {
      return buildFallbackInsights(body)
    }

    const fmt = (n: number) => `${sym}${n.toFixed(2)}`
    const summary = {
      spendingByJar: body.spendingByJar?.map((j) => `${j.jarName}: ${fmt(j.total)}`).join(", ") || "none",
      spendingByCategory: body.spendingByCategory?.slice(0, 10).map((c) => `${c.categoryName} (${c.jarName}): ${fmt(c.total)}`).join(", ") || "none",
      monthlyTrends: body.monthlyTrends?.map((t) => `${t.month} ${t.jarName}: ${fmt(t.total)}`).join(", ") || "none",
      incomeVsSpending: body.incomeVsSpending?.map((m) => `${m.month}: income ${fmt(m.income)}, spending ${fmt(m.spending)}`).join(", ") || "none",
      summaryStats: body.summaryStats ? `Total: ${fmt(body.summaryStats.totalSpending)}, Avg daily: ${fmt(body.summaryStats.avgDaily)}, Velocity: ${body.summaryStats.velocity?.toFixed(1)}%` : "none",
      monthComparison: body.monthComparison ? `Current: income ${fmt(body.monthComparison.current?.income ?? 0)}, spending ${fmt(body.monthComparison.current?.spending ?? 0)}. Previous: income ${fmt(body.monthComparison.previous?.income ?? 0)}, spending ${fmt(body.monthComparison.previous?.spending ?? 0)}` : "none",
    }

    const prompt = `Analyze this financial data and provide 3-5 actionable insights.

Spending by jar: ${summary.spendingByJar}
Top categories: ${summary.spendingByCategory}
Monthly trends: ${summary.monthlyTrends}
Income vs spending: ${summary.incomeVsSpending}
Summary: ${summary.summaryStats}
Month comparison: ${summary.monthComparison}

Return a JSON object matching this shape:
{"insights":[{"type":"spending_change|trend|positive|anomaly","title":"max 50 chars","description":"1-2 sentences","severity":"info|warning|success|alert"}]}

Focus on changes >10%, savings vs overspending, anomalies. Be specific with numbers.`

    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
      const model = genAI.getGenerativeModel(
        {
          // Gemma is the known-working free-tier model for this project. Keep
          // the request compatible with its hosted API format.
          model: "gemma-4-26b-a4b-it",
          generationConfig: { maxOutputTokens: 4_096 },
        },
        { timeout: 90_000 },
      )
      const result = await model.generateContent(prompt)
      return parseInsightResult(result.response.text())
    } catch (error) {
      console.warn("AI insights generation failed; using data fallback", error)
      return buildFallbackInsights(body)
    }
  },
})
