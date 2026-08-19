export type RecurringFrequency = "weekly" | "biweekly" | "monthly"

export function getNextOccurrence({
  frequency,
  from,
}: {
  frequency: RecurringFrequency
  from: number
}) {
  const next = new Date(from)
  if (frequency === "weekly") next.setUTCDate(next.getUTCDate() + 7)
  if (frequency === "biweekly") next.setUTCDate(next.getUTCDate() + 14)
  if (frequency === "monthly") next.setUTCMonth(next.getUTCMonth() + 1)
  return next.getTime()
}
