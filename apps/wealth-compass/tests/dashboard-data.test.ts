import assert from "node:assert/strict"
import test from "node:test"
import {
  buildDashboardMonthlyData,
  getGoalProgress,
  type DashboardJar,
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
