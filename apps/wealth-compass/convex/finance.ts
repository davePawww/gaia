export type BalanceTransaction = {
  type: "income" | "withdrawal" | "transfer"
  amount: number
  fromJarId?: string
  toJarId?: string
}

export type GoalCompletionCandidate = {
  type: "jar" | "netWorth"
  targetAmount: number
  jarId?: string
  status?: "active" | "completed" | "archived"
}

/**
 * Calculates the balance for one jar from the immutable transaction ledger.
 * Keeping this logic in one place prevents queries and mutations from drifting
 * apart as new transaction types are added.
 */
export function calculateJarBalance(
  jarId: string,
  transactions: readonly BalanceTransaction[]
): number {
  let balance = 0

  for (const transaction of transactions) {
    if (transaction.type === "income" && transaction.toJarId === jarId) {
      balance += transaction.amount
    } else if (
      transaction.type === "withdrawal" &&
      transaction.fromJarId === jarId
    ) {
      balance -= transaction.amount
    } else if (transaction.type === "transfer") {
      if (transaction.fromJarId === jarId) balance -= transaction.amount
      if (transaction.toJarId === jarId) balance += transaction.amount
    }
  }

  return balance
}

export function calculateJarBalances(
  jarIds: readonly string[],
  transactions: readonly BalanceTransaction[]
): Record<string, number> {
  return Object.fromEntries(
    jarIds.map((jarId) => [jarId, calculateJarBalance(jarId, transactions)])
  )
}

export function sumBalances(
  balances: Readonly<Record<string, number>>
): number {
  return Object.values(balances).reduce((total, balance) => total + balance, 0)
}

export function shouldMarkGoalComplete(
  goal: GoalCompletionCandidate,
  jarBalances: Readonly<Record<string, number>>
): boolean {
  if (goal.status === "archived" || goal.status === "completed") {
    return false
  }

  const currentValue =
    goal.type === "netWorth"
      ? sumBalances(jarBalances)
      : ((goal.jarId ? jarBalances[goal.jarId] : undefined) ?? 0)

  return currentValue >= goal.targetAmount
}
