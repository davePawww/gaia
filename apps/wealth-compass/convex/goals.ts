import { query, mutation } from "./_generated/server"
import { v } from "convex/values"
import { getAuthUserId } from "@convex-dev/auth/server"

export const getUserGoals = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return []

    const goals = await ctx.db
      .query("goals")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect()

    return goals
  },
})

export const createGoal = mutation({
  args: {
    name: v.string(),
    type: v.union(v.literal("jar"), v.literal("netWorth")),
    targetAmount: v.number(),
    jarId: v.optional(v.id("jars")),
    deadline: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error("Not authenticated")

    if (args.type === "jar" && !args.jarId) {
      throw new Error("Jar ID is required for jar goals")
    }

    if (args.jarId) {
      const jar = await ctx.db.get(args.jarId)
      if (!jar || jar.userId !== userId) {
        throw new Error("Jar not found")
      }
    }

    await ctx.db.insert("goals", {
      userId,
      name: args.name,
      type: args.type,
      targetAmount: args.targetAmount,
      jarId: args.jarId,
      deadline: args.deadline,
    })

    return { success: true }
  },
})

export const updateGoal = mutation({
  args: {
    goalId: v.id("goals"),
    name: v.optional(v.string()),
    targetAmount: v.optional(v.number()),
    deadline: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error("Not authenticated")

    const goal = await ctx.db.get(args.goalId)
    if (!goal || goal.userId !== userId) {
      throw new Error("Goal not found")
    }

    const { goalId, ...updates } = args
    await ctx.db.patch(goalId, updates)

    return { success: true }
  },
})

export const deleteGoal = mutation({
  args: {
    goalId: v.id("goals"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error("Not authenticated")

    const goal = await ctx.db.get(args.goalId)
    if (!goal || goal.userId !== userId) {
      throw new Error("Goal not found")
    }

    await ctx.db.delete(args.goalId)

    return { success: true }
  },
})
