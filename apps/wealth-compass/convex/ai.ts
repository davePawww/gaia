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
  handler: async (_ctx, args) => {
    const body = args as unknown as InsightInput
    const sym = body.currency

    if (!process.env.GEMINI_API_KEY) {
      return {
        insights: [
          {
            type: "info",
            title: "AI insights unavailable",
            description:
              "Configure GEMINI_API_KEY to enable AI-powered insights.",
            severity: "info",
          },
        ],
      }
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

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({
      // This is a small, structured-analysis task. Flash-Lite avoids the long
      // inference time of the previous 26B Gemma model.
      model: "gemini-2.5-flash-lite",
      generationConfig: {
        responseMimeType: "application/json",
        maxOutputTokens: 750,
      },
    })
    const result = await model.generateContent(prompt)
    const text = result.response.text()

    let jsonStr = text
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1].trim()
    }
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      jsonStr = jsonMatch[0]
    }

    return JSON.parse(jsonStr)
  },
})
