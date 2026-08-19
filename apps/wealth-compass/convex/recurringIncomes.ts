import { internalMutation, mutation, query } from "./_generated/server"
import { v } from "convex/values"
import { getAuthUserId } from "@convex-dev/auth/server"
import type { GenericMutationCtx } from "convex/server"
import type { DataModel, Id } from "./_generated/dataModel"
import { getNextOccurrence } from "./recurring"
import { checkGoalCompletions } from "./transactions"

type MutationCtx = GenericMutationCtx<DataModel>
const frequencyValidator = v.union(
  v.literal("weekly"),
  v.literal("biweekly"),
  v.literal("monthly")
)

export const getUserRecurringIncomes = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return []
    return await ctx.db
      .query("recurringIncomes")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .take(100)
  },
})

export const createRecurringIncome = mutation({
  args: {
    amount: v.number(),
    frequency: frequencyValidator,
    nextOccurrence: v.number(),
    source: v.optional(v.string()),
    note: v.optional(v.string()),
  },
  returns: v.object({ recurringIncomeId: v.id("recurringIncomes") }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error("Not authenticated")
    validateRule(args)
    const recurringIncomeId = await ctx.db.insert("recurringIncomes", {
      userId,
      ...args,
      source: args.source?.trim() || undefined,
      note: args.note?.trim() || undefined,
      active: true,
    })
    return { recurringIncomeId }
  },
})

export const updateRecurringIncome = mutation({
  args: {
    recurringIncomeId: v.id("recurringIncomes"),
    amount: v.number(),
    frequency: frequencyValidator,
    nextOccurrence: v.number(),
    source: v.optional(v.string()),
    note: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error("Not authenticated")
    validateRule(args)
    const rule = await requireOwnedRule(ctx, args.recurringIncomeId, userId)
    await ctx.db.patch(rule._id, {
      amount: args.amount,
      frequency: args.frequency,
      nextOccurrence: args.nextOccurrence,
      source: args.source?.trim() || undefined,
      note: args.note?.trim() || undefined,
      lastError: undefined,
    })
    return null
  },
})

export const setRecurringIncomeActive = mutation({
  args: { recurringIncomeId: v.id("recurringIncomes"), active: v.boolean() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error("Not authenticated")
    const rule = await requireOwnedRule(ctx, args.recurringIncomeId, userId)
    await ctx.db.patch(rule._id, {
      active: args.active,
      lastError: args.active ? undefined : rule.lastError,
    })
    return null
  },
})

export const deleteRecurringIncome = mutation({
  args: { recurringIncomeId: v.id("recurringIncomes") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error("Not authenticated")
    const rule = await requireOwnedRule(ctx, args.recurringIncomeId, userId)
    await ctx.db.delete(rule._id)
    return null
  },
})

export const processDueRecurringIncomes = internalMutation({
  args: {},
  returns: v.object({ processed: v.number(), failed: v.number() }),
  handler: async (ctx) => {
    const now = Date.now()
    const due = await ctx.db
      .query("recurringIncomes")
      .withIndex("by_active_nextOccurrence", (q) =>
        q.eq("active", true).lte("nextOccurrence", now)
      )
      .take(100)
    let processed = 0
    let failed = 0
    for (const rule of due) {
      try {
        await allocateRule(ctx, rule.userId, rule)
        await ctx.db.patch(rule._id, {
          nextOccurrence: getNextOccurrence({
            frequency: rule.frequency,
            from: rule.nextOccurrence,
          }),
          lastAllocatedAt: now,
          lastAttemptAt: now,
          lastError: undefined,
        })
        processed += 1
      } catch (error) {
        await ctx.db.patch(rule._id, {
          active: false,
          lastAttemptAt: now,
          lastError:
            error instanceof Error ? error.message : "Allocation failed",
        })
        failed += 1
      }
    }
    return { processed, failed }
  },
})

async function allocateRule(
  ctx: MutationCtx,
  userId: Id<"users">,
  rule: { amount: number; source?: string; note?: string }
) {
  const jars = await ctx.db
    .query("jars")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .take(20)
  if (jars.length === 0) throw new Error("No jars found")
  const total = jars.reduce((sum, jar) => sum + jar.percentage, 0)
  if (Math.abs(total - 100) > 0.01)
    throw new Error("Jar percentages must sum to 100")
  const note = [rule.source, rule.note].filter(Boolean).join(" — ") || undefined
  for (const jar of jars)
    await ctx.db.insert("transactions", {
      userId,
      type: "income",
      amount: (rule.amount * jar.percentage) / 100,
      toJarId: jar._id,
      note,
      createdAt: Date.now(),
    })
  await checkGoalCompletions(ctx, userId)
}

function validateRule(rule: { amount: number; nextOccurrence: number }) {
  if (rule.amount <= 0) throw new Error("Amount must be positive")
  if (!Number.isFinite(rule.nextOccurrence))
    throw new Error("Next allocation date is required")
}
async function requireOwnedRule(
  ctx: MutationCtx,
  id: Id<"recurringIncomes">,
  userId: Id<"users">
) {
  const rule = await ctx.db.get(id)
  if (!rule || rule.userId !== userId)
    throw new Error("Recurring income not found")
  return rule
}
