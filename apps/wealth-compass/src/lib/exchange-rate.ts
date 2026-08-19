export function convertCurrency(amount: number, rate: number): number {
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("Amount must be a non-negative number")
  }
  if (!Number.isFinite(rate) || rate <= 0) {
    throw new Error("Exchange rate must be positive")
  }
  return amount * rate
}

export function describeRateAge(fetchedAt: number, now = Date.now()): string {
  const elapsedMinutes = Math.max(0, Math.floor((now - fetchedAt) / 60_000))
  if (elapsedMinutes < 1) return "just now"
  if (elapsedMinutes === 1) return "1 minute ago"
  if (elapsedMinutes < 60) return `${elapsedMinutes} minutes ago`
  const elapsedHours = Math.floor(elapsedMinutes / 60)
  return elapsedHours === 1 ? "1 hour ago" : `${elapsedHours} hours ago`
}
