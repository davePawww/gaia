import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    avatarUrl: v.optional(v.string()),
  }),

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
    createdAt: v.number(),
  }).index("by_userId", ["userId"])
    .index("by_userId_createdAt", ["userId", "createdAt"]),

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
  }).index("by_userId", ["userId"])
    .index("by_nextOccurrence", ["nextOccurrence"]),

  goals: defineTable({
    userId: v.id("users"),
    type: v.union(v.literal("jar"), v.literal("netWorth")),
    targetAmount: v.number(),
    jarId: v.optional(v.id("jars")),
    deadline: v.optional(v.number()),
  }).index("by_userId", ["userId"]),
})
