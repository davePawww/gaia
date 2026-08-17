export interface DashboardTransaction {
  type: "income" | "withdrawal" | "transfer"
  amount: number
  createdAt: number
  fromJarId?: string
  toJarId?: string
}

export interface DashboardJar {
  id: string
  name: string
  color: string
}

export interface MonthlyBalancePoint {
  month: string
  jarId: string
  jarName: string
  color: string
  balance: number
}

export interface MonthlySpendingPoint {
  month: string
  jarId: string
  jarName: string
  color: string
  total: number
}

export interface DashboardMonthlyData {
  balances: MonthlyBalancePoint[]
  spending: MonthlySpendingPoint[]
}

export interface DashboardGoal {
  id?: string
  name: string
  type: "jar" | "netWorth"
  targetAmount: number
  jarId?: string
  deadline?: number
}

export interface DashboardJarBalance {
  jarId: string
  balance: number
}

export interface GoalProgress {
  currentAmount: number
  percentage: number
}

function startOfMonth(timestamp: number): number {
  const date = new Date(timestamp)
  return new Date(date.getFullYear(), date.getMonth(), 1).getTime()
}

function addMonths(timestamp: number, offset: number): number {
  const date = new Date(timestamp)
  return new Date(date.getFullYear(), date.getMonth() + offset, 1).getTime()
}

function monthKey(timestamp: number): string {
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

function applyTransaction(
  balances: Map<string, number>,
  transaction: DashboardTransaction
) {
  if (transaction.type === "income" && transaction.toJarId) {
    balances.set(
      transaction.toJarId,
      (balances.get(transaction.toJarId) ?? 0) + transaction.amount
    )
    return
  }

  if (transaction.type === "withdrawal" && transaction.fromJarId) {
    balances.set(
      transaction.fromJarId,
      (balances.get(transaction.fromJarId) ?? 0) - transaction.amount
    )
    return
  }

  if (transaction.type === "transfer") {
    if (transaction.fromJarId) {
      balances.set(
        transaction.fromJarId,
        (balances.get(transaction.fromJarId) ?? 0) - transaction.amount
      )
    }
    if (transaction.toJarId) {
      balances.set(
        transaction.toJarId,
        (balances.get(transaction.toJarId) ?? 0) + transaction.amount
      )
    }
  }
}

export function buildDashboardMonthlyData(
  transactions: readonly DashboardTransaction[],
  jars: readonly DashboardJar[],
  now: number = Date.now(),
  monthCount = 6
): DashboardMonthlyData {
  if (monthCount <= 0) {
    return { balances: [], spending: [] }
  }

  const currentMonth = startOfMonth(now)
  const firstMonth = addMonths(currentMonth, -(monthCount - 1))
  const monthStarts = Array.from({ length: monthCount }, (_, index) =>
    addMonths(firstMonth, index)
  )
  const sortedTransactions = [...transactions].sort(
    (a, b) => a.createdAt - b.createdAt
  )
  const spendingByMonth = new Map<string, Map<string, number>>()
  let transactionIndex = 0

  for (const monthStart of monthStarts) {
    const monthEnd = addMonths(monthStart, 1)
    const key = monthKey(monthStart)
    const monthSpending = new Map<string, number>()
    spendingByMonth.set(key, monthSpending)

    while (
      transactionIndex < sortedTransactions.length &&
      sortedTransactions[transactionIndex]!.createdAt < monthEnd
    ) {
      const transaction = sortedTransactions[transactionIndex]!

      if (
        transaction.createdAt >= monthStart &&
        (transaction.type === "withdrawal" ||
          transaction.type === "transfer") &&
        transaction.fromJarId
      ) {
        monthSpending.set(
          transaction.fromJarId,
          (monthSpending.get(transaction.fromJarId) ?? 0) + transaction.amount
        )
      }

      transactionIndex += 1
    }
  }

  const balancePoints: MonthlyBalancePoint[] = []
  const spendingPoints: MonthlySpendingPoint[] = []

  // Rebuild the ledger once for historical snapshots. The first pass above
  // collects each month's spending while the second pass keeps balance
  // snapshots independent of transaction ordering within a month.
  const historicalBalances = new Map(jars.map((jar) => [jar.id, 0]))
  let historicalIndex = 0

  for (const monthStart of monthStarts) {
    const monthEnd = addMonths(monthStart, 1)

    while (
      historicalIndex < sortedTransactions.length &&
      sortedTransactions[historicalIndex]!.createdAt < monthEnd
    ) {
      applyTransaction(historicalBalances, sortedTransactions[historicalIndex]!)
      historicalIndex += 1
    }

    const key = monthKey(monthStart)
    const monthSpending = spendingByMonth.get(key) ?? new Map()

    for (const jar of jars) {
      balancePoints.push({
        month: key,
        jarId: jar.id,
        jarName: jar.name,
        color: jar.color,
        balance: historicalBalances.get(jar.id) ?? 0,
      })
      spendingPoints.push({
        month: key,
        jarId: jar.id,
        jarName: jar.name,
        color: jar.color,
        total: monthSpending.get(jar.id) ?? 0,
      })
    }
  }

  return { balances: balancePoints, spending: spendingPoints }
}

export function getGoalProgress(
  goal: DashboardGoal,
  jarBalances: readonly DashboardJarBalance[]
): GoalProgress {
  const currentAmount =
    goal.type === "netWorth"
      ? jarBalances.reduce((sum, jar) => sum + jar.balance, 0)
      : (jarBalances.find((jar) => jar.jarId === goal.jarId)?.balance ?? 0)

  return {
    currentAmount,
    percentage:
      goal.targetAmount > 0
        ? Math.min((currentAmount / goal.targetAmount) * 100, 100)
        : 0,
  }
}

// Keep this export local to the dashboard data module so callers do not need
// to duplicate the calendar conversion logic used by the chart components.
export function formatDashboardMonth(month: string): string {
  const [year, monthNumber] = month.split("-").map(Number)
  if (!year || !monthNumber) return month

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    year: "numeric",
  }).format(new Date(year, monthNumber - 1, 1))
}
