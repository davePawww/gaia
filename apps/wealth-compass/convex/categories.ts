import { query, mutation } from "./_generated/server"
import { v } from "convex/values"
import { getAuthUserId } from "@convex-dev/auth/server"
import { DEFAULT_CATEGORIES } from "./constants"

export const getUserCategories = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return []

    return await ctx.db
      .query("categories")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect()
  },
})

export const getCategoriesByJar = query({
  args: { jarName: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return []

    return await ctx.db
      .query("categories")
      .withIndex("by_userId_jarName", (q) =>
        q.eq("userId", userId).eq("jarName", args.jarName)
      )
      .collect()
  },
})

export const addCategory = mutation({
  args: {
    jarName: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error("Not authenticated")

    if (!args.name.trim()) throw new Error("Category name is required")

    const existing = await ctx.db
      .query("categories")
      .withIndex("by_userId_jarName", (q) =>
        q.eq("userId", userId).eq("jarName", args.jarName)
      )
      .filter((q) => q.eq(q.field("name"), args.name.trim()))
      .first()

    if (existing) throw new Error("Category already exists")

    await ctx.db.insert("categories", {
      userId,
      jarName: args.jarName,
      name: args.name.trim(),
    })

    return { success: true }
  },
})

export const renameCategory = mutation({
  args: {
    categoryId: v.id("categories"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error("Not authenticated")

    const category = await ctx.db.get(args.categoryId)
    if (!category || category.userId !== userId) throw new Error("Category not found")

    if (!args.name.trim()) throw new Error("Category name is required")

    await ctx.db.patch(args.categoryId, { name: args.name.trim() })
    return { success: true }
  },
})

export const deleteCategory = mutation({
  args: {
    categoryId: v.id("categories"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error("Not authenticated")

    const category = await ctx.db.get(args.categoryId)
    if (!category || category.userId !== userId) throw new Error("Category not found")

    await ctx.db.delete(args.categoryId)
    return { success: true }
  },
})

export const resetToDefaults = mutation({
  args: {
    jarName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error("Not authenticated")

    const jarsToDelete = args.jarName ? [args.jarName] : Object.keys(DEFAULT_CATEGORIES)

    for (const jarName of jarsToDelete) {
      const existing = await ctx.db
        .query("categories")
        .withIndex("by_userId_jarName", (q) =>
          q.eq("userId", userId).eq("jarName", jarName)
        )
        .collect()

      for (const cat of existing) {
        await ctx.db.delete(cat._id)
      }

      const defaults = DEFAULT_CATEGORIES[jarName] ?? []
      for (const name of defaults) {
        await ctx.db.insert("categories", {
          userId,
          jarName,
          name,
        })
      }
    }

    return { success: true }
  },
})
