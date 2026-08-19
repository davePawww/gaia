import assert from "node:assert/strict"
import test from "node:test"
import {
  buildDashboardMonthlyData,
  buildGoalProgressHistory,
  getGoalProgress,
  getGoalStatus,
  type DashboardJar,
  type DashboardGoal,
  type DashboardTransaction,
} from "../src/lib/dashboard-data.ts"

const jars: DashboardJar[] = [
  { id: "nec", name: "NEC", color: "#ef4444" },
  { id: "ffa", name: "FFA", color: "#f59e0b" },
]

const timestamp = (month: number, day: number) => Date.UTC(2026, month, day, 12)

test("builds six monthly jar balance snapshots from the transaction ledger", () => {
  const transactions: DashboardTransaction[] = [
    {
      type: "income",
      amount: 1000,
      toJarId: "nec",
      createdAt: timestamp(1, 15),
    },
    {
      type: "transfer",
      amount: 100,
      fromJarId: "nec",
      toJarId: "ffa",
      createdAt: timestamp(2, 10),
    },
    {
      type: "withdrawal",
      amount: 50,
      fromJarId: "nec",
      createdAt: timestamp(3, 5),
    },
  ]

  const result = buildDashboardMonthlyData(
    transactions,
    jars,
    timestamp(5, 15),
    5
  )

  assert.deepEqual(
    result.balances
      .filter((point) => point.jarId === "nec")
      .map((point) => point.balance),
    [1000, 900, 850, 850, 850]
  )
  assert.deepEqual(
    result.balances
      .filter((point) => point.jarId === "ffa")
      .map((point) => point.balance),
    [0, 100, 100, 100, 100]
  )
  assert.deepEqual(
    result.spending
      .filter((point) => point.jarId === "nec")
      .map((point) => point.total),
    [0, 100, 50, 0, 0]
  )
})

test("includes zero-value months and calculates goal progress", () => {
  const result = buildDashboardMonthlyData([], jars, timestamp(5, 15), 3)

  assert.equal(result.balances.length, 6)
  assert.ok(result.balances.every((point) => point.balance === 0))
  assert.ok(result.spending.every((point) => point.total === 0))

  assert.deepEqual(
    getGoalProgress(
      { name: "Emergency fund", type: "jar", targetAmount: 500, jarId: "nec" },
      [
        { jarId: "nec", balance: 250 },
        { jarId: "ffa", balance: 100 },
      ]
    ),
    { currentAmount: 250, percentage: 50 }
  )
  assert.deepEqual(
    getGoalProgress(
      {
        name: "Net worth",
        type: "netWorth",
        targetAmount: 200,
        jarId: undefined,
      },
      [
        { jarId: "nec", balance: 250 },
        { jarId: "ffa", balance: 100 },
      ]
    ),
    { currentAmount: 350, percentage: 100 }
  )
})

test("derives goal status and progress history from the ledger", () => {
  const transactions: DashboardTransaction[] = [
    {
      type: "income",
      amount: 100,
      toJarId: "nec",
      createdAt: timestamp(1, 15),
    },
    {
      type: "income",
      amount: 100,
      toJarId: "nec",
      createdAt: timestamp(2, 15),
    },
  ]
  const goal = {
    name: "Emergency fund",
    type: "jar",
    targetAmount: 250,
    jarId: "nec",
  } satisfies DashboardGoal

  assert.deepEqual(
    buildGoalProgressHistory(goal, transactions, jars, timestamp(4, 15), 4),
    [
      { month: "2026-02", currentAmount: 100, percentage: 40 },
      { month: "2026-03", currentAmount: 200, percentage: 80 },
      { month: "2026-04", currentAmount: 200, percentage: 80 },
      { month: "2026-05", currentAmount: 200, percentage: 80 },
    ]
  )

  assert.equal(
    getGoalStatus(
      goal,
      { currentAmount: 200, percentage: 80 },
      timestamp(4, 15)
    ),
    "active"
  )
  assert.equal(
    getGoalStatus(
      goal,
      { currentAmount: 250, percentage: 100 },
      timestamp(4, 15)
    ),
    "completed"
  )
  assert.equal(
    getGoalStatus(
      { ...goal, deadline: timestamp(3, 1) },
      { currentAmount: 200, percentage: 80 },
      timestamp(4, 15)
    ),
    "overdue"
  )
  assert.equal(
    getGoalStatus(
      { ...goal, status: "archived" },
      { currentAmount: 250, percentage: 100 },
      timestamp(4, 15)
    ),
    "archived"
  )
})
