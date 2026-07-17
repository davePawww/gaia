import { query, mutation } from "./_generated/server"
import { v } from "convex/values"
import { getAuthUserId } from "@convex-dev/auth/server"

export const getUserJars = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return []

    const jars = await ctx.db
      .query("jars")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect()
    return jars
  },
})

export const getJarBalances = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return []

    const jars = await ctx.db
      .query("jars")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect()

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect()

    const balances: Record<string, number> = {}
    for (const jar of jars) {
      balances[jar._id] = 0
    }

    for (const tx of transactions) {
      if (tx.type === "income" && tx.toJarId && balances[tx.toJarId] !== undefined) {
        balances[tx.toJarId] += tx.amount
      } else if (tx.type === "withdrawal" && tx.fromJarId && balances[tx.fromJarId] !== undefined) {
        balances[tx.fromJarId] -= tx.amount
      } else if (tx.type === "transfer") {
        if (tx.fromJarId && balances[tx.fromJarId] !== undefined) {
          balances[tx.fromJarId] -= tx.amount
        }
        if (tx.toJarId && balances[tx.toJarId] !== undefined) {
          balances[tx.toJarId] += tx.amount
        }
      }
    }

    return jars.map((jar) => ({
      jar,
      balance: balances[jar._id] ?? 0,
    }))
  },
})

export const updateJar = mutation({
  args: {
    jarId: v.id("jars"),
    name: v.optional(v.string()),
    color: v.optional(v.string()),
    percentage: v.optional(v.number()),
    icon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { jarId, ...updates } = args
    await ctx.db.patch(jarId, updates)
  },
})
