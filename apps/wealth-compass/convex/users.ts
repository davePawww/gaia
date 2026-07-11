import { query, mutation } from "./_generated/server"
import { v } from "convex/values"

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
    return userId
  },
})
