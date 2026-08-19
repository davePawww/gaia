import assert from "node:assert/strict"
import test from "node:test"
import { getNextOccurrence } from "../convex/recurring.ts"

const monday = Date.UTC(2026, 7, 17, 9)

test("advances recurring income dates by the selected cadence", () => {
  assert.equal(
    getNextOccurrence({ frequency: "weekly", from: monday }),
    Date.UTC(2026, 7, 24, 9)
  )
  assert.equal(
    getNextOccurrence({ frequency: "biweekly", from: monday }),
    Date.UTC(2026, 7, 31, 9)
  )
  assert.equal(
    getNextOccurrence({ frequency: "monthly", from: monday }),
    Date.UTC(2026, 8, 17, 9)
  )
})
