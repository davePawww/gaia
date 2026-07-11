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

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId")
      .unique()
    return user
  },
})

export const createUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_userId")
      .unique()
    if (existingUser) return existingUser._id

    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
    })

    // Create default jars for new user
    for (const jar of DEFAULT_JARS) {
      await ctx.db.insert("jars", {
        userId,
        ...jar,
      })
    }

    return userId
  },
})
