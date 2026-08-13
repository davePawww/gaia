import { mutation, query } from "./_generated/server"
import { v } from "convex/values"
import { getAuthUserId } from "@convex-dev/auth/server"
import { JAR_FULL_NAMES } from "./constants"
import { internal } from "./_generated/api"

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
      if (Object.values(args.overrides).some((percentage) => percentage < 0)) {
        throw new Error("Override percentages cannot be negative")
      }
      const totalOverride = Object.values(args.overrides).reduce(
        (sum, pct) => sum + pct,
        0,
      )
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

    await checkGoalCompletions(ctx, userId)

    return { success: true }
  },
})

export const withdraw = mutation({
  args: {
    jarId: v.id("jars"),
    amount: v.number(),
    note: v.optional(v.string()),
    categoryId: v.optional(v.id("categories")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error("Not authenticated")

    if (args.amount <= 0) throw new Error("Amount must be positive")

    const jar = await ctx.db.get(args.jarId)
    if (!jar || jar.userId !== userId) throw new Error("Jar not found")

    await validateCategory(ctx, args.categoryId, userId, jar.name)

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect()

    let balance = 0
    for (const tx of transactions) {
      if (tx.type === "income" && tx.toJarId === args.jarId) {
        balance += tx.amount
      } else if (tx.type === "withdrawal" && tx.fromJarId === args.jarId) {
        balance -= tx.amount
      } else if (tx.type === "transfer") {
        if (tx.fromJarId === args.jarId) balance -= tx.amount
        if (tx.toJarId === args.jarId) balance += tx.amount
      }
    }

    if (balance < args.amount) {
      throw new Error(
        `Insufficient balance. Available: ${balance}, requested: ${args.amount}`,
      )
    }

    const prefs = await ctx.db
      .query("notificationPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique()

    if (prefs?.spendingLimitWarning) {
      const remainingBalance = balance - args.amount
      if (remainingBalance < prefs.spendingLimitThreshold) {
        const jarName = JAR_FULL_NAMES[jar.name] ?? jar.name
        const notificationId = await ctx.db.insert("notifications", {
          userId,
          type: "spending_limit_warning",
          title: "Spending Limit Warning",
          body: `Your ${jarName} balance ($${remainingBalance.toFixed(2)}) is below your $${prefs.spendingLimitThreshold} threshold.`,
          read: false,
          createdAt: Date.now(),
        })
        await ctx.scheduler.runAfter(
          0,
          internal.actions.sendPush.sendNotificationPush,
          { notificationId },
        )
      }
    }

    await ctx.db.insert("transactions", {
      userId,
      type: "withdrawal",
      amount: args.amount,
      fromJarId: args.jarId,
      note: args.note,
      categoryId: args.categoryId,
      createdAt: Date.now(),
    })

    return { success: true }
  },
})

export const transfer = mutation({
  args: {
    fromJarId: v.id("jars"),
    toJarId: v.id("jars"),
    amount: v.number(),
    note: v.optional(v.string()),
    categoryId: v.optional(v.id("categories")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error("Not authenticated")

    if (args.amount <= 0) throw new Error("Amount must be positive")
    if (args.fromJarId === args.toJarId)
      throw new Error("Cannot transfer to the same jar")

    const fromJar = await ctx.db.get(args.fromJarId)
    const toJar = await ctx.db.get(args.toJarId)
    if (!fromJar || fromJar.userId !== userId)
      throw new Error("Source jar not found")
    if (!toJar || toJar.userId !== userId)
      throw new Error("Destination jar not found")

    await validateCategory(ctx, args.categoryId, userId, fromJar.name)

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect()

    let balance = 0
    for (const tx of transactions) {
      if (tx.type === "income" && tx.toJarId === args.fromJarId) {
        balance += tx.amount
      } else if (tx.type === "withdrawal" && tx.fromJarId === args.fromJarId) {
        balance -= tx.amount
      } else if (tx.type === "transfer") {
        if (tx.fromJarId === args.fromJarId) balance -= tx.amount
        if (tx.toJarId === args.fromJarId) balance += tx.amount
      }
    }

    if (balance < args.amount) {
      throw new Error(
        `Insufficient balance in source jar. Available: ${balance}, requested: ${args.amount}`,
      )
    }

    await ctx.db.insert("transactions", {
      userId,
      type: "transfer",
      amount: args.amount,
      fromJarId: args.fromJarId,
      toJarId: args.toJarId,
      note: args.note,
      categoryId: args.categoryId,
      createdAt: Date.now(),
    })

    return { success: true }
  },
})

export const addToJar = mutation({
  args: {
    jarId: v.id("jars"),
    amount: v.number(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error("Not authenticated")

    if (args.amount <= 0) throw new Error("Amount must be positive")

    const jar = await ctx.db.get(args.jarId)
    if (!jar || jar.userId !== userId) throw new Error("Jar not found")

    await ctx.db.insert("transactions", {
      userId,
      type: "income",
      amount: args.amount,
      toJarId: args.jarId,
      note: args.note,
      createdAt: Date.now(),
    })

    await checkGoalCompletions(ctx, userId)

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

export const deleteTransaction = mutation({
  args: {
    transactionId: v.id("transactions"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error("Not authenticated")

    const tx = await ctx.db.get(args.transactionId)
    if (!tx || tx.userId !== userId) throw new Error("Transaction not found")

    await ctx.db.delete(args.transactionId)
    return { success: true }
  },
})

async function checkGoalCompletions(ctx: any, userId: string) {
  const goals = await ctx.db
    .query("goals")
    .withIndex("by_userId", (q: any) => q.eq("userId", userId))
    .collect()

  const prefs = await ctx.db
    .query("notificationPreferences")
    .withIndex("by_userId", (q: any) => q.eq("userId", userId))
    .unique()

  if (!prefs?.goalCompleted) return

  const transactions = await ctx.db
    .query("transactions")
    .withIndex("by_userId", (q: any) => q.eq("userId", userId))
    .collect()

  const jarBalances: Record<string, number> = {}
  for (const transaction of transactions) {
    if (transaction.type === "income" && transaction.toJarId) {
      jarBalances[transaction.toJarId] =
        (jarBalances[transaction.toJarId] ?? 0) + transaction.amount
    } else if (transaction.type === "withdrawal" && transaction.fromJarId) {
      jarBalances[transaction.fromJarId] =
        (jarBalances[transaction.fromJarId] ?? 0) - transaction.amount
    } else if (transaction.type === "transfer") {
      if (transaction.fromJarId) {
        jarBalances[transaction.fromJarId] =
          (jarBalances[transaction.fromJarId] ?? 0) - transaction.amount
      }
      if (transaction.toJarId) {
        jarBalances[transaction.toJarId] =
          (jarBalances[transaction.toJarId] ?? 0) + transaction.amount
      }
    }
  }

  const netWorth = Object.values(jarBalances).reduce(
    (total, balance) => total + balance,
    0,
  )

  const existingNotifications = await ctx.db
    .query("notifications")
    .withIndex("by_userId", (q: any) => q.eq("userId", userId))
    .collect()

  for (const goal of goals) {
    const currentValue =
      goal.type === "netWorth"
        ? netWorth
        : goal.jarId
          ? jarBalances[goal.jarId] ?? 0
          : 0

    if (currentValue >= goal.targetAmount) {
      const alreadyNotified = existingNotifications.some(
        (n: any) => n.type === "goal_completed" && n.goalId === goal._id
      )
      if (!alreadyNotified) {
        const notificationId = await ctx.db.insert("notifications", {
          userId,
          type: "goal_completed",
          title: "Goal Completed!",
          body: `You've reached your goal "${goal.name}"!`,
          goalId: goal._id,
          read: false,
          createdAt: Date.now(),
        })
        await ctx.scheduler.runAfter(
          0,
          internal.actions.sendPush.sendNotificationPush,
          { notificationId },
        )
      }
    }
  }
}

async function validateCategory(
  ctx: any,
  categoryId: string | undefined,
  userId: string,
  jarName: string,
) {
  if (!categoryId) return

  const category = await ctx.db.get(categoryId)
  if (!category || category.userId !== userId || category.jarName !== jarName) {
    throw new Error("Category not found")
  }
}
