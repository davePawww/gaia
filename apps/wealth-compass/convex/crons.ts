import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Check daily at 9 AM UTC if users need income allocation reminders
crons.daily(
  "income allocation reminder",
  { hourUTC: 9, minuteUTC: 0 },
  internal.cronJobs.checkIncomeAllocationReminder
);

// Monthly spending summary on the 1st at 8 AM UTC
crons.monthly(
  "monthly spending summary",
  { day: 1, hourUTC: 8, minuteUTC: 0 },
  internal.cronJobs.sendMonthlySpendingSummary
);

export default crons;
