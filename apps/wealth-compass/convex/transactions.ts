import { mutation, query } from "./_generated/server"
import { v } from "convex/values"
import { getAuthUserId } from "@convex-dev/auth/server"

export const allocateIncome = mutation({
  args: {
    amount: v.number(),
    overrides: v.optional(v.record(v.string(), v.number())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error("Not authenticated")

    if (args.amount <= 0) throw new Error("Amount must be positive")

    const jars = await ctx.db
      .query("jars")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect()

    if (jars.length === 0) throw new Error("No jars found")

    if (args.overrides) {
      const totalOverride = Object.values(args.overrides).reduce((sum, pct) => sum + pct, 0)
      if (Math.abs(totalOverride - 100) > 0.01) {
        throw new Error("Override percentages must sum to 100")
      }
    }

    const now = Date.now()

    for (const jar of jars) {
      const percentage = args.overrides?.[jar.name] ?? jar.percentage
      const amount = (args.amount * percentage) / 100

      await ctx.db.insert("transactions", {
        userId,
        type: "income",
        amount,
        toJarId: jar._id,
        createdAt: now,
      })
    }

    return { success: true }
  },
})

export const getUserTransactions = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return []

    return await ctx.db
      .query("transactions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect()
  },
})
