import { action } from "./_generated/server"
import { v } from "convex/values"
import { GoogleGenerativeAI } from "@google/generative-ai"

declare const process: { env: { GEMINI_API_KEY?: string } }

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
    const body = args
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
      spendingByJar: body.spendingByJar?.map((j: any) => `${j.jarName}: ${fmt(j.total)}`).join(", ") || "none",
      spendingByCategory: body.spendingByCategory?.slice(0, 10).map((c: any) => `${c.categoryName} (${c.jarName}): ${fmt(c.total)}`).join(", ") || "none",
      monthlyTrends: body.monthlyTrends?.map((t: any) => `${t.month} ${t.jarName}: ${fmt(t.total)}`).join(", ") || "none",
      incomeVsSpending: body.incomeVsSpending?.map((m: any) => `${m.month}: income ${fmt(m.income)}, spending ${fmt(m.spending)}`).join(", ") || "none",
      summaryStats: body.summaryStats ? `Total: ${fmt(body.summaryStats.totalSpending)}, Avg daily: ${fmt(body.summaryStats.avgDaily)}, Velocity: ${body.summaryStats.velocity?.toFixed(1)}%` : "none",
      monthComparison: body.monthComparison ? `Current: income ${fmt(body.monthComparison.current?.income)}, spending ${fmt(body.monthComparison.current?.spending)}. Previous: income ${fmt(body.monthComparison.previous?.income)}, spending ${fmt(body.monthComparison.previous?.spending)}` : "none",
    }

    const prompt = `Analyze this financial data and provide 3-5 actionable insights.

Spending by jar: ${summary.spendingByJar}
Top categories: ${summary.spendingByCategory}
Monthly trends: ${summary.monthlyTrends}
Income vs spending: ${summary.incomeVsSpending}
Summary: ${summary.summaryStats}
Month comparison: ${summary.monthComparison}

Return ONLY a JSON object (no markdown, no explanation):
{"insights":[{"type":"spending_change|trend|positive|anomaly","title":"max 50 chars","description":"1-2 sentences","severity":"info|warning|success|alert"}]}

Focus on changes >10%, savings vs overspending, anomalies. Be specific with numbers.`

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: "gemma-4-26b-a4b-it" })
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