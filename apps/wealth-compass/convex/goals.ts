import { query, mutation } from "./_generated/server"
import { v } from "convex/values"
import { getAuthUserId } from "@convex-dev/auth/server"
import { internal } from "./_generated/api"

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

    const name = args.name.trim()
    if (!name) throw new Error("Goal name is required")
    if (args.targetAmount <= 0) throw new Error("Target amount must be positive")
    if (args.deadline !== undefined && args.deadline <= Date.now()) {
      throw new Error("Goal deadline must be in the future")
    }

    if (args.type === "jar" && !args.jarId) {
      throw new Error("Jar ID is required for jar goals")
    }

    if (args.jarId) {
      const jar = await ctx.db.get(args.jarId)
      if (!jar || jar.userId !== userId) {
        throw new Error("Jar not found")
      }
    }

    const goalId = await ctx.db.insert("goals", {
      userId,
      name,
      type: args.type,
      targetAmount: args.targetAmount,
      jarId: args.jarId,
      deadline: args.deadline,
    })

    if (args.deadline) {
      const prefs = await ctx.db
        .query("notificationPreferences")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .unique()
      const daysBefore = prefs?.goalDeadlineDays ?? 7
      const reminderTime = args.deadline - daysBefore * 24 * 60 * 60 * 1000
      if (reminderTime > Date.now()) {
        const deadlineReminderId = await ctx.scheduler.runAt(
          reminderTime,
          internal.cronJobs.sendGoalDeadlineReminder,
          {
            userId,
            goalId,
            deadline: args.deadline,
          },
        )
        await ctx.db.patch(goalId, { deadlineReminderId })
      }
    }

    return { success: true }
  },
})

export const updateGoal = mutation({
  args: {
    goalId: v.id("goals"),
    name: v.optional(v.string()),
    targetAmount: v.optional(v.number()),
    deadline: v.optional(v.number()),
    clearDeadline: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error("Not authenticated")

    const goal = await ctx.db.get(args.goalId)
    if (!goal || goal.userId !== userId) {
      throw new Error("Goal not found")
    }

    const nextName = args.name?.trim()
    if (args.name !== undefined && !nextName) {
      throw new Error("Goal name is required")
    }
    if (args.targetAmount !== undefined && args.targetAmount <= 0) {
      throw new Error("Target amount must be positive")
    }

    const deadlineChanged =
      args.deadline !== undefined || args.clearDeadline === true
    const nextDeadline = args.clearDeadline ? undefined : args.deadline
    if (args.deadline !== undefined && args.deadline <= Date.now()) {
      throw new Error("Goal deadline must be in the future")
    }

    if (deadlineChanged && goal.deadlineReminderId) {
      await ctx.scheduler.cancel(goal.deadlineReminderId)
    }

    const updates = {
      ...(nextName !== undefined ? { name: nextName } : {}),
      ...(args.targetAmount !== undefined
        ? { targetAmount: args.targetAmount }
        : {}),
      ...(deadlineChanged ? { deadline: nextDeadline } : {}),
      ...(deadlineChanged ? { deadlineReminderId: undefined } : {}),
    }
    await ctx.db.patch(args.goalId, updates)

    if (deadlineChanged && nextDeadline !== undefined) {
      const prefs = await ctx.db
        .query("notificationPreferences")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .unique()
      const daysBefore = prefs?.goalDeadlineDays ?? 7
      const reminderTime = nextDeadline - daysBefore * 24 * 60 * 60 * 1000
      if (reminderTime > Date.now()) {
        const deadlineReminderId = await ctx.scheduler.runAt(
          reminderTime,
          internal.cronJobs.sendGoalDeadlineReminder,
          { userId, goalId: args.goalId, deadline: nextDeadline },
        )
        await ctx.db.patch(args.goalId, { deadlineReminderId })
      }
    }

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

    if (goal.deadlineReminderId) {
      await ctx.scheduler.cancel(goal.deadlineReminderId)
    }

    await ctx.db.delete(args.goalId)

    return { success: true }
  },
})
