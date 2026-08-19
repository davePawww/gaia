import assert from "node:assert/strict"
import test from "node:test"
import { convertCurrency, describeRateAge } from "../src/lib/exchange-rate.ts"

test("converts an amount with the supplied exchange rate", () => {
  assert.equal(convertCurrency(125.5, 1.2), 150.6)
})

test("rejects invalid conversion inputs", () => {
  assert.throws(() => convertCurrency(-1, 1.2))
  assert.throws(() => convertCurrency(10, 0))
})

test("describes when a rate was fetched", () => {
  const now = Date.UTC(2026, 7, 20, 10)
  assert.equal(describeRateAge(now, now), "just now")
  assert.equal(describeRateAge(now - 60_000, now), "1 minute ago")
  assert.equal(describeRateAge(now - 3_600_000, now), "1 hour ago")
})
