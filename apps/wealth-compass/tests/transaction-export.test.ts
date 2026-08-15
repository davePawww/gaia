import assert from "node:assert/strict"
import test from "node:test"
import {
  buildCsvExport,
  buildJsonExport,
  filterTransactions,
  generateCsv,
  type ExportJar,
  type ExportTransaction,
} from "../src/lib/transaction-export.ts"

const jars: ExportJar[] = [
  { jar: { _id: "nec", name: "NEC" } },
  { jar: { _id: "ffa", name: "FFA" } },
]

const transactions: ExportTransaction[] = [
  {
    createdAt: Date.UTC(2026, 7, 14, 12),
    type: "income",
    amount: 1234.5,
    toJarId: "nec",
    note: 'Lunch, "team"\nreview',
  },
  {
    createdAt: Date.UTC(2026, 7, 15, 12),
    type: "withdrawal",
    amount: 50,
    fromJarId: "ffa",
  },
]

test("CSV output has the accepted columns, currency, dates, names, and escaping", () => {
  const result = buildCsvExport(transactions, jars, "USD", "2026-08-15")

  assert.equal(
    result.filename,
    "wealth-compass-transfers-2026-08-15.csv",
  )
  assert.equal(result.mimeType, "text/csv;charset=utf-8")
  assert.match(
    result.content,
    /^Date,Type,Amount,Currency,From Jar,To Jar,Note\n/,
  )
  assert.match(
    result.content,
    /2026-08-14,income,"\$1,234\.50",USD,,NEC,"Lunch, ""team""\nreview"/,
  )
  assert.match(result.content, /2026-08-15,withdrawal,\$50\.00,USD,FFA,,/)
})

test("CSV escaping quotes commas, quotes, and newlines", () => {
  assert.equal(
    generateCsv([{ Note: 'a,b "c"\nd' }], ["Note"]),
    'Note\n"a,b ""c""\nd"',
  )
})

test("filters include both date endpoints and selected transaction dimensions", () => {
  assert.deepEqual(
    filterTransactions(transactions, { dateFrom: "2026-08-15", dateTo: "2026-08-15" }),
    [transactions[1]],
  )
  assert.deepEqual(
    filterTransactions(transactions, { type: "income" }),
    [transactions[0]],
  )
  assert.deepEqual(
    filterTransactions(transactions, { jarId: "ffa" }),
    [transactions[1]],
  )
})

test("JSON output preserves numeric amounts, currency, resolved jars, and filename", () => {
  const result = buildJsonExport(transactions, jars, "PHP", "2026-08-15")
  const data = JSON.parse(result.content) as Array<Record<string, unknown>>

  assert.equal(result.filename, "wealth-compass-transfers-2026-08-15.json")
  assert.equal(result.mimeType, "application/json")
  assert.deepEqual(data[0], {
    date: "2026-08-14",
    type: "income",
    amount: 1234.5,
    currency: "PHP",
    toJar: "NEC",
    note: 'Lunch, "team"\nreview',
  })
  assert.deepEqual(data[1], {
    date: "2026-08-15",
    type: "withdrawal",
    amount: 50,
    currency: "PHP",
    fromJar: "FFA",
  })
})
