import {
  query,
  mutation,
  internalQuery,
  internalMutation,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getPreferences = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const prefs = await ctx.db
      .query("notificationPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!prefs) return null;

    return {
      ...prefs,
      incomeAllocationFrequency: prefs.incomeAllocationFrequency ?? "daily",
      incomeAllocationCustomDay: prefs.incomeAllocationCustomDay ?? 1,
      quietHoursEnabled: prefs.quietHoursEnabled ?? false,
      quietHoursStart: prefs.quietHoursStart ?? "22:00",
      quietHoursEnd: prefs.quietHoursEnd ?? "07:00",
      quietHoursTimezone: prefs.quietHoursTimezone ?? "UTC",
    };
  },
});

export const getPushContext = internalQuery({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const notification = await ctx.db.get(args.notificationId)
    if (!notification) return null

    const subscriptions = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", notification.userId))
      .collect()

    const prefs = await ctx.db
      .query("notificationPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", notification.userId))
      .unique()

    return {
      notification,
      subscriptions,
      quietHours: prefs?.quietHoursEnabled
        ? {
            start: prefs.quietHoursStart ?? "22:00",
            end: prefs.quietHoursEnd ?? "07:00",
            timezone: prefs.quietHoursTimezone ?? "UTC",
          }
        : null,
    }
  },
})

export const removeSubscriptionIfOwned = internalMutation({
  args: {
    subscriptionId: v.id("pushSubscriptions"),
    endpoint: v.string(),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db.get(args.subscriptionId)
    if (subscription?.endpoint === args.endpoint) {
      await ctx.db.delete(args.subscriptionId)
    }
  },
})

export const upsertPreferences = mutation({
  args: {
    incomeAllocationReminder: v.boolean(),
    goalDeadlineApproaching: v.boolean(),
    goalCompleted: v.boolean(),
    spendingLimitWarning: v.boolean(),
    monthlySpendingSummary: v.boolean(),
    spendingLimitThreshold: v.number(),
    goalDeadlineDays: v.number(),
    incomeAllocationFrequency: v.union(
      v.literal("daily"),
      v.literal("weekly"),
      v.literal("custom")
    ),
    incomeAllocationCustomDay: v.number(),
    quietHoursEnabled: v.boolean(),
    quietHoursStart: v.string(),
    quietHoursEnd: v.string(),
    quietHoursTimezone: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const existing = await ctx.db
      .query("notificationPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, args);
    } else {
      await ctx.db.insert("notificationPreferences", { userId, ...args });
    }
    return { success: true };
  },
});

export const getSubscription = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const sub = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    return sub ?? null;
  },
});

export const saveSubscription = mutation({
  args: {
    endpoint: v.string(),
    keys: v.object({
      p256dh: v.string(),
      auth: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const existing = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_endpoint", (q) => q.eq("endpoint", args.endpoint))
      .unique();
    if (existing) {
      if (existing.userId !== userId) {
        throw new Error("Push subscription is already associated with another account");
      }
      await ctx.db.patch(existing._id, { keys: args.keys });
      return { success: true };
    }
    await ctx.db.insert("pushSubscriptions", { userId, ...args });
    return { success: true };
  },
});

export const removeSubscription = mutation({
  args: { endpoint: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const existing = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_endpoint", (q) => q.eq("endpoint", args.endpoint))
      .unique();
    if (existing?.userId === userId) {
      await ctx.db.delete(existing._id);
    }
    return { success: true };
  },
});

export const getNotifications = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("notifications")
      .withIndex("by_userId_createdAt", (q) => q.eq("userId", userId))
      .order("desc")
      .take(50);
  },
});

export const getUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return 0;
    const all = await ctx.db
      .query("notifications")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    return all.filter((n) => !n.read).length;
  },
});

export const markAsRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const doc = await ctx.db.get(args.notificationId);
    if (!doc || doc.userId !== userId) throw new Error("Not found");
    await ctx.db.patch(args.notificationId, { read: true });
    return { success: true };
  },
});

export const markAllAsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect()
      .then((docs) => docs.filter((d) => !d.read));
    for (const doc of unread) {
      await ctx.db.patch(doc._id, { read: true });
    }
    return { success: true };
  },
});

export const sendTestNotification = mutation({
  args: {},
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const notificationId = await ctx.db.insert("notifications", {
      userId,
      type: "test",
      title: "Test notification",
      body: "Your Wealth Compass notifications are working.",
      read: false,
      createdAt: Date.now(),
    });

    await ctx.scheduler.runAfter(
      0,
      internal.actions.sendPush.sendNotificationPush,
      { notificationId },
    );

    return { success: true };
  },
});

export const clearAllNotifications = mutation({
  args: {},
  returns: v.object({ success: v.boolean(), deleted: v.number() }),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    let deleted = 0;
    while (true) {
      const notifications = await ctx.db
        .query("notifications")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .take(500);

      if (notifications.length === 0) break;

      for (const notification of notifications) {
        await ctx.db.delete(notification._id);
      }
      deleted += notifications.length;

      if (notifications.length < 500) break;
    }

    return { success: true, deleted };
  },
});
