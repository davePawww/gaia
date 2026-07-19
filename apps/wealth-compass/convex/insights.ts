import { query } from "./_generated/server"
import { v } from "convex/values"
import { getAuthUserId } from "@convex-dev/auth/server"
import type { Id } from "./_generated/dataModel"

const MS_PER_DAY = 24 * 60 * 60 * 1000

function monthKey(timestamp: number): string {
  const d = new Date(timestamp)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

function startOfMonth(timestamp: number): number {
  const d = new Date(timestamp)
  return new Date(d.getFullYear(), d.getMonth(), 1).getTime()
}

export const getSpendingByJar = query({
  args: { days: v.number() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return []

    const cutoff = Date.now() - args.days * MS_PER_DAY

    const txs = await ctx.db
      .query("transactions")
      .withIndex("by_userId_createdAt", (q) =>
        q.eq("userId", userId).gte("createdAt", cutoff)
      )
      .collect()

    const spendingMap: Record<string, number> = {}

    for (const tx of txs) {
      if (tx.type === "withdrawal" && tx.fromJarId) {
        spendingMap[tx.fromJarId] = (spendingMap[tx.fromJarId] ?? 0) + tx.amount
      } else if (tx.type === "transfer" && tx.fromJarId) {
        spendingMap[tx.fromJarId] = (spendingMap[tx.fromJarId] ?? 0) + tx.amount
      }
    }

    const results: { jarId: string; jarName: string; color: string; total: number }[] = []

    for (const [jarId, total] of Object.entries(spendingMap)) {
      const jar = await ctx.db.get(jarId as Id<"jars">)
      if (jar) {
        results.push({ jarId, jarName: jar.name, color: jar.color, total })
      }
    }

    results.sort((a, b) => b.total - a.total)
    return results
  },
})

export const getSpendingByCategory = query({
  args: { days: v.number(), jarName: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return []

    const cutoff = Date.now() - args.days * MS_PER_DAY

    const txs = await ctx.db
      .query("transactions")
      .withIndex("by_userId_createdAt", (q) =>
        q.eq("userId", userId).gte("createdAt", cutoff)
      )
      .collect()

    const categoryMap: Record<
      string,
      { categoryId: string; total: number }
    > = {}

    for (const tx of txs) {
      if (
        (tx.type === "withdrawal" || tx.type === "transfer") &&
        tx.categoryId
      ) {
        const category = await ctx.db.get(tx.categoryId)
        if (!category) continue

        if (args.jarName && category.jarName !== args.jarName) continue

        const key = tx.categoryId
        if (!categoryMap[key]) {
          categoryMap[key] = { categoryId: tx.categoryId, total: 0 }
        }
        categoryMap[key].total += tx.amount
      }
    }

    const results: {
      categoryId: string
      categoryName: string
      jarName: string
      total: number
    }[] = []

    for (const entry of Object.values(categoryMap)) {
      const category = await ctx.db.get(entry.categoryId as Id<"categories">)
      if (category) {
        results.push({
          categoryId: entry.categoryId,
          categoryName: category.name,
          jarName: category.jarName,
          total: entry.total,
        })
      }
    }

    results.sort((a, b) => b.total - a.total)
    return results
  },
})

export const getMonthlyTrends = query({
  args: { months: v.number() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return []

    const now = Date.now()
    const firstOfMonth = startOfMonth(now)
    const cutoff = firstOfMonth - (args.months - 1) * 30 * MS_PER_DAY

    const txs = await ctx.db
      .query("transactions")
      .withIndex("by_userId_createdAt", (q) =>
        q.eq("userId", userId).gte("createdAt", cutoff)
      )
      .collect()

    const jarTotals: Record<string, Record<string, number>> = {}

    for (const tx of txs) {
      if (tx.type === "withdrawal" && tx.fromJarId) {
        const mk = monthKey(tx.createdAt)
        if (!jarTotals[mk]) jarTotals[mk] = {}
        jarTotals[mk][tx.fromJarId] = (jarTotals[mk][tx.fromJarId] ?? 0) + tx.amount
      } else if (tx.type === "transfer" && tx.fromJarId) {
        const mk = monthKey(tx.createdAt)
        if (!jarTotals[mk]) jarTotals[mk] = {}
        jarTotals[mk][tx.fromJarId] = (jarTotals[mk][tx.fromJarId] ?? 0) + tx.amount
      }
    }

    const results: {
      month: string
      jarName: string
      color: string
      total: number
    }[] = []

    for (const [month, jars] of Object.entries(jarTotals)) {
      for (const [jarId, total] of Object.entries(jars)) {
        const jar = await ctx.db.get(jarId as Id<"jars">)
        if (jar) {
          results.push({ month, jarName: jar.name, color: jar.color, total })
        }
      }
    }

    results.sort((a, b) => a.month.localeCompare(b.month) || b.total - a.total)
    return results
  },
})

export const getIncomeVsSpending = query({
  args: { months: v.number() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return []

    const now = Date.now()
    const firstOfMonth = startOfMonth(now)
    const cutoff = firstOfMonth - (args.months - 1) * 30 * MS_PER_DAY

    const txs = await ctx.db
      .query("transactions")
      .withIndex("by_userId_createdAt", (q) =>
        q.eq("userId", userId).gte("createdAt", cutoff)
      )
      .collect()

    const monthly: Record<string, { income: number; spending: number }> = {}

    for (const tx of txs) {
      const mk = monthKey(tx.createdAt)
      if (!monthly[mk]) monthly[mk] = { income: 0, spending: 0 }

      if (tx.type === "income") {
        monthly[mk].income += tx.amount
      } else if (tx.type === "withdrawal" || tx.type === "transfer") {
        monthly[mk].spending += tx.amount
      }
    }

    const results: { month: string; income: number; spending: number }[] =
      Object.entries(monthly).map(([month, data]) => ({ month, ...data }))

    results.sort((a, b) => a.month.localeCompare(b.month))
    return results
  },
})

export const getSummaryStats = query({
  args: { days: v.number() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      return {
        totalSpending: 0,
        avgDaily: 0,
        mostSpentJar: null,
        leastSpentJar: null,
        velocity: 0,
      }
    }

    const now = Date.now()
    const currentCutoff = now - args.days * MS_PER_DAY
    const previousCutoff = currentCutoff - args.days * MS_PER_DAY

    const txs = await ctx.db
      .query("transactions")
      .withIndex("by_userId_createdAt", (q) =>
        q.eq("userId", userId).gte("createdAt", previousCutoff)
      )
      .collect()

    const currentSpend: Record<string, number> = {}
    const previousSpend: Record<string, number> = {}
    let totalCurrent = 0
    let totalPrevious = 0

    for (const tx of txs) {
      if (tx.type !== "withdrawal" && tx.type !== "transfer") continue

      const jarId = tx.type === "withdrawal" ? tx.fromJarId : tx.fromJarId
      if (!jarId) continue

      if (tx.createdAt >= currentCutoff) {
        currentSpend[jarId] = (currentSpend[jarId] ?? 0) + tx.amount
        totalCurrent += tx.amount
      } else {
        previousSpend[jarId] = (previousSpend[jarId] ?? 0) + tx.amount
        totalPrevious += tx.amount
      }
    }

    let mostSpentJar: { name: string; color: string; total: number } | null =
      null
    let leastSpentJar: { name: string; color: string; total: number } | null =
      null

    const sortedCurrent = Object.entries(currentSpend).sort(
      ([, a], [, b]) => b - a
    )

    if (sortedCurrent.length > 0) {
      const [topId, topTotal] = sortedCurrent[0]!
      const topJar = await ctx.db.get(topId as Id<"jars">)
      if (topJar) {
        mostSpentJar = { name: topJar.name, color: topJar.color, total: topTotal }
      }

      const [bottomId, bottomTotal] = sortedCurrent[sortedCurrent.length - 1]!
      const bottomJar = await ctx.db.get(bottomId as Id<"jars">)
      if (bottomJar) {
        leastSpentJar = {
          name: bottomJar.name,
          color: bottomJar.color,
          total: bottomTotal,
        }
      }
    }

    const currentAvg = totalCurrent / args.days
    const previousAvg = totalPrevious / args.days

    const velocity =
      previousAvg > 0
        ? ((currentAvg - previousAvg) / previousAvg) * 100
        : 0

    return {
      totalSpending: totalCurrent,
      avgDaily: currentAvg,
      mostSpentJar,
      leastSpentJar,
      velocity,
    }
  },
})

export const getMonthComparison = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      return {
        current: { income: 0, spending: 0 },
        previous: { income: 0, spending: 0 },
      }
    }

    const now = Date.now()
    const currentMonthStart = startOfMonth(now)
    const previousMonthStart = startOfMonth(currentMonthStart - 1)
    const previousMonthEnd = currentMonthStart - 1

    const txs = await ctx.db
      .query("transactions")
      .withIndex("by_userId_createdAt", (q) =>
        q.eq("userId", userId).gte("createdAt", previousMonthStart)
      )
      .collect()

    let currentIncome = 0
    let currentSpending = 0
    let previousIncome = 0
    let previousSpending = 0

    for (const tx of txs) {
      const isCurrent = tx.createdAt >= currentMonthStart
      const isPrevious =
        tx.createdAt >= previousMonthStart && tx.createdAt <= previousMonthEnd

      if (isCurrent) {
        if (tx.type === "income") {
          currentIncome += tx.amount
        } else if (tx.type === "withdrawal" || tx.type === "transfer") {
          currentSpending += tx.amount
        }
      } else if (isPrevious) {
        if (tx.type === "income") {
          previousIncome += tx.amount
        } else if (tx.type === "withdrawal" || tx.type === "transfer") {
          previousSpending += tx.amount
        }
      }
    }

    return {
      current: { income: currentIncome, spending: currentSpending },
      previous: { income: previousIncome, spending: previousSpending },
    }
  },
})
