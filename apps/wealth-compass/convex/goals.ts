import { getAuthUserId } from "@convex-dev/auth/server"
import type { GenericMutationCtx } from "convex/server"
import { v } from "convex/values"
import { internal } from "./_generated/api"
import type { DataModel, Id } from "./_generated/dataModel"
import { mutation, query } from "./_generated/server"

type MutationCtx = GenericMutationCtx<DataModel>

const goalTypeValidator = v.union(v.literal("jar"), v.literal("netWorth"))
const persistedGoalStatusValidator = v.union(
  v.literal("active"),
  v.literal("completed"),
  v.literal("archived")
)

const goalValidator = v.object({
  _id: v.id("goals"),
  _creationTime: v.number(),
  userId: v.id("users"),
  name: v.string(),
  type: goalTypeValidator,
  targetAmount: v.number(),
  jarId: v.optional(v.id("jars")),
  deadline: v.optional(v.number()),
  deadlineReminderId: v.optional(v.id("_scheduled_functions")),
  status: v.optional(persistedGoalStatusValidator),
  completedAt: v.optional(v.number()),
  archivedAt: v.optional(v.number()),
})

const goalMilestoneValidator = v.object({
  _id: v.id("goalMilestones"),
  _creationTime: v.number(),
  userId: v.id("users"),
  goalId: v.id("goals"),
  name: v.string(),
  targetAmount: v.number(),
  completedAt: v.optional(v.number()),
  createdAt: v.number(),
})

async function scheduleDeadlineReminder(
  ctx: MutationCtx,
  args: { userId: Id<"users">; goalId: Id<"goals">; deadline: number }
) {
  const prefs = await ctx.db
    .query("notificationPreferences")
    .withIndex("by_userId", (q) => q.eq("userId", args.userId))
    .unique()
  const daysBefore = prefs?.goalDeadlineDays ?? 7
  const reminderTime = args.deadline - daysBefore * 24 * 60 * 60 * 1000

  if (reminderTime <= Date.now()) return null

  return await ctx.scheduler.runAt(
    reminderTime,
    internal.cronJobs.sendGoalDeadlineReminder,
    args
  )
}

async function requireOwnedGoal(
  ctx: MutationCtx,
  goalId: Id<"goals">,
  userId: Id<"users">
) {
  const goal = await ctx.db.get(goalId)
  if (!goal || goal.userId !== userId) throw new Error("Goal not found")
  return goal
}

async function requireOwnedJar(
  ctx: MutationCtx,
  jarId: Id<"jars">,
  userId: Id<"users">
) {
  const jar = await ctx.db.get(jarId)
  if (!jar || jar.userId !== userId) throw new Error("Jar not found")
  return jar
}

export const getUserGoals = query({
  args: {},
  returns: v.array(goalValidator),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return []

    return await ctx.db
      .query("goals")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .take(100)
  },
})

export const getGoalMilestones = query({
  args: { goalId: v.id("goals") },
  returns: v.array(goalMilestoneValidator),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return []

    const goal = await ctx.db.get(args.goalId)
    if (!goal || goal.userId !== userId) return []

    return await ctx.db
      .query("goalMilestones")
      .withIndex("by_goalId", (q) => q.eq("goalId", args.goalId))
      .order("asc")
      .take(100)
  },
})

export const createGoal = mutation({
  args: {
    name: v.string(),
    type: goalTypeValidator,
    targetAmount: v.number(),
    jarId: v.optional(v.id("jars")),
    deadline: v.optional(v.number()),
  },
  returns: v.object({ goalId: v.id("goals") }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error("Not authenticated")

    const name = args.name.trim()
    if (!name) throw new Error("Goal name is required")
    if (args.targetAmount <= 0)
      throw new Error("Target amount must be positive")
    if (args.deadline !== undefined && args.deadline <= Date.now()) {
      throw new Error("Goal deadline must be in the future")
    }
    if (args.type === "jar" && !args.jarId) {
      throw new Error("Jar ID is required for jar goals")
    }
    if (args.jarId) await requireOwnedJar(ctx, args.jarId, userId)

    const goalId = await ctx.db.insert("goals", {
      userId,
      name,
      type: args.type,
      targetAmount: args.targetAmount,
      jarId: args.type === "jar" ? args.jarId : undefined,
      deadline: args.deadline,
      status: "active",
    })

    if (args.deadline) {
      const deadlineReminderId = await scheduleDeadlineReminder(ctx, {
        userId,
        goalId,
        deadline: args.deadline,
      })
      if (deadlineReminderId) await ctx.db.patch(goalId, { deadlineReminderId })
    }

    return { goalId }
  },
})

export const updateGoal = mutation({
  args: {
    goalId: v.id("goals"),
    name: v.optional(v.string()),
    type: v.optional(goalTypeValidator),
    targetAmount: v.optional(v.number()),
    jarId: v.optional(v.id("jars")),
    deadline: v.optional(v.number()),
    clearDeadline: v.optional(v.boolean()),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error("Not authenticated")

    const goal = await requireOwnedGoal(ctx, args.goalId, userId)
    if (goal.status === "archived")
      throw new Error("Restore this goal before editing it")

    const nextName = args.name?.trim()
    if (args.name !== undefined && !nextName) {
      throw new Error("Goal name is required")
    }
    if (args.targetAmount !== undefined && args.targetAmount <= 0) {
      throw new Error("Target amount must be positive")
    }

    const nextType = args.type ?? goal.type
    const nextJarId =
      nextType === "jar" ? (args.jarId ?? goal.jarId) : undefined
    if (nextType === "jar" && !nextJarId) {
      throw new Error("Jar ID is required for jar goals")
    }
    if (nextJarId) await requireOwnedJar(ctx, nextJarId, userId)

    const deadlineChanged =
      args.deadline !== undefined || args.clearDeadline === true
    const nextDeadline = args.clearDeadline ? undefined : args.deadline
    if (args.deadline !== undefined && args.deadline <= Date.now()) {
      throw new Error("Goal deadline must be in the future")
    }
    if (deadlineChanged && goal.deadlineReminderId) {
      await ctx.scheduler.cancel(goal.deadlineReminderId)
    }

    await ctx.db.patch(args.goalId, {
      ...(nextName !== undefined ? { name: nextName } : {}),
      ...(args.type !== undefined ? { type: nextType } : {}),
      ...(args.targetAmount !== undefined
        ? { targetAmount: args.targetAmount }
        : {}),
      ...(args.type !== undefined || args.jarId !== undefined
        ? { jarId: nextJarId }
        : {}),
      ...(deadlineChanged
        ? { deadline: nextDeadline, deadlineReminderId: undefined }
        : {}),
      ...(goal.status === "completed" &&
      (args.targetAmount !== undefined ||
        args.type !== undefined ||
        args.jarId !== undefined)
        ? { status: "active", completedAt: undefined }
        : {}),
    })

    if (deadlineChanged && nextDeadline !== undefined) {
      const deadlineReminderId = await scheduleDeadlineReminder(ctx, {
        userId,
        goalId: args.goalId,
        deadline: nextDeadline,
      })
      if (deadlineReminderId) {
        await ctx.db.patch(args.goalId, { deadlineReminderId })
      }
    }

    return { success: true }
  },
})

export const archiveGoal = mutation({
  args: { goalId: v.id("goals") },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error("Not authenticated")

    const goal = await requireOwnedGoal(ctx, args.goalId, userId)
    if (goal.deadlineReminderId)
      await ctx.scheduler.cancel(goal.deadlineReminderId)
    await ctx.db.patch(args.goalId, {
      status: "archived",
      archivedAt: Date.now(),
      deadlineReminderId: undefined,
    })
    return { success: true }
  },
})

export const restoreGoal = mutation({
  args: { goalId: v.id("goals") },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error("Not authenticated")

    const goal = await requireOwnedGoal(ctx, args.goalId, userId)
    if (goal.status !== "archived") throw new Error("Goal is not archived")

    await ctx.db.patch(args.goalId, {
      status: goal.completedAt ? "completed" : "active",
      archivedAt: undefined,
    })

    if (goal.deadline && goal.deadline > Date.now()) {
      const deadlineReminderId = await scheduleDeadlineReminder(ctx, {
        userId,
        goalId: args.goalId,
        deadline: goal.deadline,
      })
      if (deadlineReminderId) {
        await ctx.db.patch(args.goalId, { deadlineReminderId })
      }
    }

    return { success: true }
  },
})

export const createGoalMilestone = mutation({
  args: {
    goalId: v.id("goals"),
    name: v.string(),
    targetAmount: v.number(),
  },
  returns: v.object({ milestoneId: v.id("goalMilestones") }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error("Not authenticated")
    await requireOwnedGoal(ctx, args.goalId, userId)

    const name = args.name.trim()
    if (!name) throw new Error("Milestone name is required")
    if (args.targetAmount <= 0) {
      throw new Error("Milestone target must be positive")
    }

    const milestoneId = await ctx.db.insert("goalMilestones", {
      userId,
      goalId: args.goalId,
      name,
      targetAmount: args.targetAmount,
      createdAt: Date.now(),
    })
    return { milestoneId }
  },
})

export const deleteGoalMilestone = mutation({
  args: { milestoneId: v.id("goalMilestones") },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error("Not authenticated")

    const milestone = await ctx.db.get(args.milestoneId)
    if (!milestone || milestone.userId !== userId) {
      throw new Error("Milestone not found")
    }
    await ctx.db.delete(args.milestoneId)
    return { success: true }
  },
})

export const deleteGoal = mutation({
  args: { goalId: v.id("goals") },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error("Not authenticated")

    const goal = await requireOwnedGoal(ctx, args.goalId, userId)
    if (goal.deadlineReminderId)
      await ctx.scheduler.cancel(goal.deadlineReminderId)

    const milestones = await ctx.db
      .query("goalMilestones")
      .withIndex("by_goalId", (q) => q.eq("goalId", args.goalId))
      .take(100)
    for (const milestone of milestones) await ctx.db.delete(milestone._id)
    await ctx.db.delete(args.goalId)

    return { success: true }
  },
})
