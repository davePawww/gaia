import assert from "node:assert/strict"
import test from "node:test"
import { shouldMarkGoalComplete } from "../convex/finance.ts"

test("completes active jar and net-worth goals once their targets are reached", () => {
  const balances = { nec: 500, ffa: 300 }

  assert.equal(
    shouldMarkGoalComplete(
      { type: "jar", jarId: "nec", targetAmount: 500, status: "active" },
      balances
    ),
    true
  )
  assert.equal(
    shouldMarkGoalComplete(
      { type: "netWorth", targetAmount: 800, status: "active" },
      balances
    ),
    true
  )
})

test("does not re-complete archived or already completed goals", () => {
  const balances = { nec: 500 }

  assert.equal(
    shouldMarkGoalComplete(
      { type: "jar", jarId: "nec", targetAmount: 100, status: "completed" },
      balances
    ),
    false
  )
  assert.equal(
    shouldMarkGoalComplete(
      { type: "jar", jarId: "nec", targetAmount: 100, status: "archived" },
      balances
    ),
    false
  )
})
