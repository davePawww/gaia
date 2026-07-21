import { GenericQueryCtx } from "convex/server";
import { DataModel } from "../_generated/dataModel";
import { internal } from "../_generated/api";

type NotificationType =
  | "income_allocation_reminder"
  | "goal_deadline_approaching"
  | "goal_completed"
  | "spending_limit_warning"
  | "monthly_spending_summary";

type Ctx = GenericQueryCtx<DataModel> | any;

export async function sendNotification(
  ctx: Ctx,
  userId: string,
  type: NotificationType,
  title: string,
  body: string
) {
  // Check preferences
  const prefs = await ctx.db
    .query("notificationPreferences")
    .withIndex("by_userId", (q: any) => q.eq("userId", userId))
    .unique();

  const prefKey = {
    income_allocation_reminder: "incomeAllocationReminder",
    goal_deadline_approaching: "goalDeadlineApproaching",
    goal_completed: "goalCompleted",
    spending_limit_warning: "spendingLimitWarning",
    monthly_spending_summary: "monthlySpendingSummary",
  }[type] as keyof typeof prefs;

  if (!prefs || !prefs[prefKey]) return;

  // Record notification in DB
  await ctx.db.insert("notifications", {
    userId,
    type,
    title,
    body,
    read: false,
    createdAt: Date.now(),
  });

  // Get push subscription
  const sub = await ctx.db
    .query("pushSubscriptions")
    .withIndex("by_userId", (q: any) => q.eq("userId", userId))
    .first();

  if (!sub) return;

  // Send push via action
  const result = await ctx.scheduler.runAfter(0, internal.actions.sendPush.sendPush, {
    subscription: { endpoint: sub.endpoint, keys: sub.keys },
    title,
    body,
  });

  return result;
}
