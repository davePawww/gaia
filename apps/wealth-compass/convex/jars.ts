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
