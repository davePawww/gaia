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
  },
  handler: async (_ctx, args) => {
    const body = args

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

    const summary = {
      spendingByJar: body.spendingByJar?.map((j: any) => `${j.jarName}: $${j.total.toFixed(2)}`).join(", ") || "none",
      spendingByCategory: body.spendingByCategory?.slice(0, 10).map((c: any) => `${c.categoryName} (${c.jarName}): $${c.total.toFixed(2)}`).join(", ") || "none",
      monthlyTrends: body.monthlyTrends?.map((t: any) => `${t.month} ${t.jarName}: $${t.total.toFixed(2)}`).join(", ") || "none",
      incomeVsSpending: body.incomeVsSpending?.map((m: any) => `${m.month}: income $${m.income.toFixed(2)}, spending $${m.spending.toFixed(2)}`).join(", ") || "none",
      summaryStats: body.summaryStats ? `Total: $${body.summaryStats.totalSpending?.toFixed(2)}, Avg daily: $${body.summaryStats.avgDaily?.toFixed(2)}, Velocity: ${body.summaryStats.velocity?.toFixed(1)}%` : "none",
      monthComparison: body.monthComparison ? `Current: income $${body.monthComparison.current?.income?.toFixed(2)}, spending $${body.monthComparison.current?.spending?.toFixed(2)}. Previous: income $${body.monthComparison.previous?.income?.toFixed(2)}, spending $${body.monthComparison.previous?.spending?.toFixed(2)}` : "none",
    }

    const prompt = `You are a financial advisor AI. Analyze this spending data and provide 3-5 actionable insights.

Spending by jar: ${summary.spendingByJar}
Top categories: ${summary.spendingByCategory}
Monthly trends: ${summary.monthlyTrends}
Income vs spending: ${summary.incomeVsSpending}
Summary: ${summary.summaryStats}
Month comparison: ${summary.monthComparison}

Return a JSON object with this exact structure:
{
  "insights": [
    {
      "type": "spending_change" | "trend" | "positive" | "anomaly",
      "title": "Short insight title (max 50 chars)",
      "description": "Detailed insight in 1-2 sentences",
      "severity": "info" | "warning" | "success" | "alert"
    }
  ]
}

Rules:
- Focus on significant changes (>10% difference)
- Highlight both positive trends (savings) and warnings (overspending)
- Compare current vs previous month
- Note any spending anomalies (spikes or unusual patterns)
- Be specific with numbers and percentages
- Keep titles concise, descriptions clear
- Only return the JSON object, no other text`

    try {
      const apiKey = process.env.GEMINI_API_KEY
      console.log("Gemini API key present:", !!apiKey)

      const genAI = new GoogleGenerativeAI(apiKey!)
      const model = genAI.getGenerativeModel({ model: "gemma-4-26b-a4b-it" })
      const result = await model.generateContent(prompt)
      const text = result.response.text()
      console.log("Gemini raw response:", text.slice(0, 500))

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
    } catch (error) {
      console.error("Gemini AI error:", error)
      const isQuotaError = String(error).includes("429") || String(error).includes("quota")
      return {
        insights: [
          {
            type: "info",
            title: isQuotaError ? "AI quota exceeded" : "Could not generate insights",
            description: isQuotaError
              ? "Free tier quota reached. Add billing at console.cloud.google.com for higher limits, or try again later."
              : "There was an error analyzing your spending data. Please try again later.",
            severity: "info",
          },
        ],
      }
    }
  },
})
