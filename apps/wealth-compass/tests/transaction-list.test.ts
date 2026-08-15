import assert from "node:assert/strict"
import test from "node:test"
import {
  filterAndSortTransactions,
  paginateTransactions,
  type TransactionListItem,
} from "../src/lib/transaction-list.ts"

const transactions: TransactionListItem[] = [
  {
    _id: "old-income",
    type: "income",
    amount: 100,
    createdAt: Date.UTC(2026, 7, 13, 12),
    toJarId: "nec",
    categoryId: "salary",
    note: "Monthly salary",
  },
  {
    _id: "new-withdrawal",
    type: "withdrawal",
    amount: 25,
    createdAt: Date.UTC(2026, 7, 15, 12),
    fromJarId: "ffa",
    categoryId: "rent",
    note: "Rent and utilities",
  },
  {
    _id: "middle-transfer",
    type: "transfer",
    amount: 60,
    createdAt: Date.UTC(2026, 7, 14, 12),
    fromJarId: "nec",
    toJarId: "ffa",
    note: "Move to savings",
  },
]

test("filters by search, type, jar, category, and inclusive date range", () => {
  assert.deepEqual(
    filterAndSortTransactions(
      transactions,
      {
        search: "UTILITIES",
        type: "withdrawal",
        jarId: "ffa",
        categoryId: "rent",
        dateFrom: "2026-08-15",
        dateTo: "2026-08-15",
      },
      "newest"
    ).map((transaction) => transaction._id),
    ["new-withdrawal"]
  )
  assert.deepEqual(
    filterAndSortTransactions(
      transactions,
      { categoryId: "none" },
      "newest"
    ).map((transaction) => transaction._id),
    ["middle-transfer"]
  )
})

test("search includes descriptions and sort modes are deterministic", () => {
  const withDescription = {
    ...transactions[0],
    _id: "description-only",
    description: "Freelance payment",
  }
  assert.deepEqual(
    filterAndSortTransactions(
      [withDescription],
      { search: "freelance" },
      "newest"
    ).map((transaction) => transaction._id),
    ["description-only"]
  )
  assert.deepEqual(
    filterAndSortTransactions(transactions, {}, "oldest").map(
      (transaction) => transaction._id
    ),
    ["old-income", "middle-transfer", "new-withdrawal"]
  )
  assert.deepEqual(
    filterAndSortTransactions(transactions, {}, "amount-high").map(
      (transaction) => transaction._id
    ),
    ["old-income", "middle-transfer", "new-withdrawal"]
  )
  assert.deepEqual(
    filterAndSortTransactions(transactions, {}, "amount-low").map(
      (transaction) => transaction._id
    ),
    ["new-withdrawal", "middle-transfer", "old-income"]
  )
})

test("pagination provides incremental load-more slices and totals", () => {
  assert.deepEqual(paginateTransactions(transactions, 1, 2), {
    items: transactions.slice(0, 2),
    hasMore: true,
    total: 3,
  })
  assert.deepEqual(paginateTransactions(transactions, 2, 2), {
    items: transactions,
    hasMore: false,
    total: 3,
  })
})
