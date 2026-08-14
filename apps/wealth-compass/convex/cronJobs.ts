import { internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { JAR_FULL_NAMES } from "./constants";
import { internal } from "./_generated/api";

export const checkIncomeAllocationReminder = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Find all users with income allocation reminder enabled
    const allPrefs = await ctx.db.query("notificationPreferences").collect();
    const enabledPrefs = allPrefs.filter((p) => p.incomeAllocationReminder);

    for (const prefs of enabledPrefs) {
      const now = Date.now();
      const today = new Date(now);
      const frequency = prefs.incomeAllocationFrequency ?? "daily";
      const customDay = Math.min(
        Math.max(prefs.incomeAllocationCustomDay ?? 1, 1),
        28,
      );
      const shouldRun =
        frequency === "daily" ||
        (frequency === "weekly" && today.getUTCDay() === 1) ||
        (frequency === "custom" && today.getUTCDate() === customDay);

      if (!shouldRun) continue;

      // Check if user has any income this month
      const monthStart = new Date(now);
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const transactions = await ctx.db
        .query("transactions")
        .withIndex("by_userId", (q) => q.eq("userId", prefs.userId))
        .collect();

      const hasIncomeThisMonth = transactions.some(
        (t) => t.type === "income" && t.createdAt >= monthStart.getTime()
      );

      if (!hasIncomeThisMonth) {
        // Check if we already sent a reminder today
        const existingToday = await ctx.db
          .query("notifications")
          .withIndex("by_userId", (q) => q.eq("userId", prefs.userId))
          .collect();

        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);

        const alreadyReminded = existingToday.some(
          (n) =>
            n.type === "income_allocation_reminder" &&
            n.createdAt >= todayStart.getTime()
        );

        if (!alreadyReminded) {
          const notificationId = await ctx.db.insert("notifications", {
            userId: prefs.userId,
            type: "income_allocation_reminder",
            title: "Income Allocation Reminder",
            body: "You haven't allocated income this month. Tap to add your income.",
            read: false,
            createdAt: now,
          });
          await ctx.scheduler.runAfter(
            0,
            internal.actions.sendPush.sendNotificationPush,
            { notificationId },
          );
        }
      }
    }
  },
});

export const sendMonthlySpendingSummary = internalMutation({
  args: {},
  handler: async (ctx) => {
    const allPrefs = await ctx.db.query("notificationPreferences").collect();
    const enabledPrefs = allPrefs.filter((p) => p.monthlySpendingSummary);

    const now = Date.now();
    const lastMonth = new Date(now);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthStart = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
    const nowDate = new Date(now);
    const thisMonthStart = new Date(nowDate.getFullYear(), nowDate.getMonth(), 1);

    for (const prefs of enabledPrefs) {
      const transactions = await ctx.db
        .query("transactions")
        .withIndex("by_userId", (q) => q.eq("userId", prefs.userId))
        .collect();

      const lastMonthWithdrawals = transactions.filter(
        (t) =>
          t.type === "withdrawal" &&
          t.createdAt >= lastMonthStart.getTime() &&
          t.createdAt < thisMonthStart.getTime()
      );

      const totalSpent = lastMonthWithdrawals.reduce((sum, t) => sum + t.amount, 0);

      const byJar: Record<string, number> = {};
      for (const t of lastMonthWithdrawals) {
        if (t.fromJarId) {
          const jar = await ctx.db.get(t.fromJarId);
          if (jar) {
            byJar[jar.name] = (byJar[jar.name] ?? 0) + t.amount;
          }
        }
      }

      const jarBreakdown = Object.entries(byJar)
        .map(([name, amount]) => `${JAR_FULL_NAMES[name] ?? name}: $${amount.toFixed(2)}`)
        .join(", ");

      const monthName = lastMonth.toLocaleString("en-US", { month: "long" });

      const notificationId = await ctx.db.insert("notifications", {
        userId: prefs.userId,
        type: "monthly_spending_summary",
        title: `${monthName} Spending Summary`,
        body: totalSpent > 0
          ? `Total: $${totalSpent.toFixed(2)}${jarBreakdown ? ` (${jarBreakdown})` : ""}`
          : `No spending recorded in ${monthName}.`,
        read: false,
        createdAt: now,
      });
      await ctx.scheduler.runAfter(
        0,
        internal.actions.sendPush.sendNotificationPush,
        { notificationId },
      );
    }
  },
});

export const sendGoalDeadlineReminder = internalMutation({
  args: {
    userId: v.id("users"),
    goalId: v.id("goals"),
    deadline: v.number(),
  },
  handler: async (ctx, args) => {
    const goal = await ctx.db.get(args.goalId)
    if (
      !goal ||
      goal.userId !== args.userId ||
      goal.deadline !== args.deadline
    ) {
      return
    }

    const prefs = await ctx.db
      .query("notificationPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (!prefs?.goalDeadlineApproaching) return;

    const deadlineDate = new Date(args.deadline).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    const notificationId = await ctx.db.insert("notifications", {
      userId: args.userId,
      type: "goal_deadline_approaching",
      title: "Goal Deadline Approaching",
      body: `"${goal.name}" is due on ${deadlineDate}.`,
      goalId: args.goalId,
      read: false,
      createdAt: Date.now(),
    });
    await ctx.scheduler.runAfter(
      0,
      internal.actions.sendPush.sendNotificationPush,
      { notificationId },
    );
  },
});
