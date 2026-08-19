import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"
import { authTables } from "@convex-dev/auth/server"

export default defineSchema({
  ...authTables,
  users: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    image: v.optional(v.string()),
  })
    .index("email", ["email"])
    .index("phone", ["phone"]),

  jars: defineTable({
    userId: v.id("users"),
    name: v.string(),
    color: v.string(),
    percentage: v.number(),
    icon: v.string(),
  }).index("by_userId", ["userId"]),

  transactions: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("income"),
      v.literal("withdrawal"),
      v.literal("transfer")
    ),
    amount: v.number(),
    fromJarId: v.optional(v.id("jars")),
    toJarId: v.optional(v.id("jars")),
    note: v.optional(v.string()),
    categoryId: v.optional(v.id("categories")),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_createdAt", ["userId", "createdAt"]),

  categories: defineTable({
    userId: v.id("users"),
    jarName: v.string(),
    name: v.string(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_jarName", ["userId", "jarName"]),

  recurringIncomes: defineTable({
    userId: v.id("users"),
    amount: v.number(),
    frequency: v.union(
      v.literal("weekly"),
      v.literal("biweekly"),
      v.literal("monthly")
    ),
    nextOccurrence: v.number(),
    active: v.boolean(),
  })
    .index("by_userId", ["userId"])
    .index("by_nextOccurrence", ["nextOccurrence"]),

  goals: defineTable({
    userId: v.id("users"),
    name: v.string(),
    type: v.union(v.literal("jar"), v.literal("netWorth")),
    targetAmount: v.number(),
    jarId: v.optional(v.id("jars")),
    deadline: v.optional(v.number()),
    deadlineReminderId: v.optional(v.id("_scheduled_functions")),
    status: v.optional(
      v.union(
        v.literal("active"),
        v.literal("completed"),
        v.literal("archived")
      )
    ),
    completedAt: v.optional(v.number()),
    archivedAt: v.optional(v.number()),
  }).index("by_userId", ["userId"]),

  goalMilestones: defineTable({
    userId: v.id("users"),
    goalId: v.id("goals"),
    name: v.string(),
    targetAmount: v.number(),
    completedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_goalId", ["goalId"])
    .index("by_userId", ["userId"])
    .index("by_userId_goalId", ["userId", "goalId"]),

  pushSubscriptions: defineTable({
    userId: v.id("users"),
    endpoint: v.string(),
    keys: v.object({
      p256dh: v.string(),
      auth: v.string(),
    }),
  })
    .index("by_userId", ["userId"])
    .index("by_endpoint", ["endpoint"]),

  notificationPreferences: defineTable({
    userId: v.id("users"),
    incomeAllocationReminder: v.boolean(),
    goalDeadlineApproaching: v.boolean(),
    goalCompleted: v.boolean(),
    spendingLimitWarning: v.boolean(),
    monthlySpendingSummary: v.boolean(),
    spendingLimitThreshold: v.number(),
    goalDeadlineDays: v.number(),
    incomeAllocationFrequency: v.optional(
      v.union(v.literal("daily"), v.literal("weekly"), v.literal("custom"))
    ),
    incomeAllocationCustomDay: v.optional(v.number()),
    quietHoursEnabled: v.optional(v.boolean()),
    quietHoursStart: v.optional(v.string()),
    quietHoursEnd: v.optional(v.string()),
    quietHoursTimezone: v.optional(v.string()),
  }).index("by_userId", ["userId"]),

  notifications: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("income_allocation_reminder"),
      v.literal("goal_deadline_approaching"),
      v.literal("goal_completed"),
      v.literal("spending_limit_warning"),
      v.literal("monthly_spending_summary"),
      v.literal("test")
    ),
    title: v.string(),
    body: v.string(),
    goalId: v.optional(v.id("goals")),
    read: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_createdAt", ["userId", "createdAt"]),
})
