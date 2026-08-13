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
    } catch (error: any) {
      // 404 = subscription expired, 410 = gone
      if (error.statusCode === 404 || error.statusCode === 410) {
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
