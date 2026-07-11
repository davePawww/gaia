import { query, mutation } from "./_generated/server"
import { v } from "convex/values"

const DEFAULT_JARS = [
  { name: "NEC", color: "#EF4444", percentage: 55, icon: "Home" },
  { name: "LTSS", color: "#3B82F6", percentage: 10, icon: "Shield" },
  { name: "EDU", color: "#EAB308", percentage: 10, icon: "BookOpen" },
  { name: "PLAY", color: "#A855F7", percentage: 10, icon: "Gamepad2" },
  { name: "GIVE", color: "#22C55E", percentage: 10, icon: "Heart" },
  { name: "FFA", color: "#F59E0B", percentage: 5, icon: "TrendingUp" },
]

export const getUserJars = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique()
    if (!user) return []

    const jars = await ctx.db
      .query("jars")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect()
    return jars
  },
})

export const createDefaultJars = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    for (const jar of DEFAULT_JARS) {
      await ctx.db.insert("jars", {
        userId: args.userId,
        ...jar,
      })
    }
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
