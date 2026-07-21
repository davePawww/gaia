"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import webPush from "web-push";

export const sendPush = action({
  args: {
    subscription: v.object({
      endpoint: v.string(),
      keys: v.object({
        p256dh: v.string(),
        auth: v.string(),
      }),
    }),
    title: v.string(),
    body: v.string(),
  },
  handler: async (_ctx, args) => {
    webPush.setVapidDetails(
      "mailto:notifications@wealthcompass.app",
      process.env.VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!
    );
    try {
      await webPush.sendNotification(
        args.subscription,
        JSON.stringify({
          title: args.title,
          body: args.body,
        })
      );
      return { success: true };
    } catch (error: any) {
      // 404 = subscription expired, 410 = gone
      if (error.statusCode === 404 || error.statusCode === 410) {
        return { expired: true };
      }
      throw error;
    }
  },
});
