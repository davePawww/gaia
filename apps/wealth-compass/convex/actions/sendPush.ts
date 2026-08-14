"use node";

import { internalAction } from "../_generated/server";
import { v } from "convex/values";
import webPush from "web-push";
import { internal } from "../_generated/api";

const subscriptionValidator = v.object({
  endpoint: v.string(),
  keys: v.object({
    p256dh: v.string(),
    auth: v.string(),
  }),
})

function parseTime(value: string): number | null {
  const match = /^(\d{2}):(\d{2})$/.exec(value)
  if (!match) return null

  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (hours > 23 || minutes > 59) return null
  return hours * 60 + minutes
}

function isWithinQuietHours(
  quietHours: {
    start: string
    end: string
    timezone: string
  } | null,
): boolean {
  if (!quietHours) return false

  const start = parseTime(quietHours.start)
  const end = parseTime(quietHours.end)
  if (start === null || end === null || start === end) return false

  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: quietHours.timezone,
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date())
    const hour = Number(parts.find((part) => part.type === "hour")?.value)
    const minute = Number(parts.find((part) => part.type === "minute")?.value)
    const current = hour * 60 + minute

    return start < end
      ? current >= start && current < end
      : current >= start || current < end
  } catch {
    return false
  }
}

export const sendPush = internalAction({
  args: {
    subscription: subscriptionValidator,
    title: v.string(),
    body: v.string(),
  },
  handler: async (_ctx, args) => {
    const publicKey = process.env.VAPID_PUBLIC_KEY
    const privateKey = process.env.VAPID_PRIVATE_KEY
    if (!publicKey || !privateKey) {
      return { success: false, expired: false }
    }

    webPush.setVapidDetails(
      "mailto:notifications@wealthcompass.app",
      publicKey,
      privateKey,
    );
    try {
      await webPush.sendNotification(
        args.subscription,
        JSON.stringify({
          title: args.title,
          body: args.body,
        })
      );
      return { success: true, expired: false };
    } catch (error: unknown) {
      // 404 = subscription expired, 410 = gone
      const statusCode =
        typeof error === "object" && error !== null && "statusCode" in error
          ? error.statusCode
          : undefined
      if (statusCode === 404 || statusCode === 410) {
        return { success: false, expired: true };
      }
      throw error;
    }
  },
});

export const sendNotificationPush = internalAction({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const pushContext = await ctx.runQuery(
      internal.notifications.getPushContext,
      { notificationId: args.notificationId },
    )
    if (!pushContext) return
    if (isWithinQuietHours(pushContext.quietHours)) return

    for (const subscription of pushContext.subscriptions) {
      const result = await ctx.runAction(internal.actions.sendPush.sendPush, {
        subscription,
        title: pushContext.notification.title,
        body: pushContext.notification.body,
      })

      if (result.expired) {
        await ctx.runMutation(
          internal.notifications.removeSubscriptionIfOwned,
          { subscriptionId: subscription._id, endpoint: subscription.endpoint },
        )
      }
    }
  },
})
