export type TransactionListItem = {
  _id: string
  type: "income" | "withdrawal" | "transfer"
  amount: number
  createdAt: number
  note?: string
  description?: string
  categoryId?: string
  fromJarId?: string
  toJarId?: string
}

export type TransactionListFilters = {
  search?: string
  type?: string
  jarId?: string
  categoryId?: string
  dateFrom?: string
  dateTo?: string
}

export type TransactionSort = "newest" | "oldest" | "amount-high" | "amount-low"

export function filterAndSortTransactions<T extends TransactionListItem>(
  transactions: T[],
  filters: TransactionListFilters,
  sort: TransactionSort
): T[] {
  const search = filters.search?.trim().toLowerCase() ?? ""
  const filtered = transactions.filter((transaction) => {
    if (
      search &&
      ![transaction.note, transaction.description]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(search))
    ) {
      return false
    }

    if (
      filters.type &&
      filters.type !== "all" &&
      transaction.type !== filters.type
    ) {
      return false
    }

    if (
      filters.jarId &&
      filters.jarId !== "all" &&
      transaction.fromJarId !== filters.jarId &&
      transaction.toJarId !== filters.jarId
    ) {
      return false
    }

    if (filters.categoryId === "none" && transaction.categoryId) return false
    if (
      filters.categoryId &&
      filters.categoryId !== "all" &&
      filters.categoryId !== "none" &&
      transaction.categoryId !== filters.categoryId
    ) {
      return false
    }

    if (
      filters.dateFrom &&
      transaction.createdAt < new Date(filters.dateFrom).getTime()
    ) {
      return false
    }
    if (
      filters.dateTo &&
      transaction.createdAt >= new Date(filters.dateTo).getTime() + 86_400_000
    ) {
      return false
    }

    return true
  })

  return filtered.sort((a, b) => {
    if (sort === "oldest") return a.createdAt - b.createdAt
    if (sort === "amount-high")
      return b.amount - a.amount || b.createdAt - a.createdAt
    if (sort === "amount-low")
      return a.amount - b.amount || b.createdAt - a.createdAt
    return b.createdAt - a.createdAt
  })
}

export function paginateTransactions<T>(
  transactions: T[],
  page: number,
  pageSize: number
): { items: T[]; hasMore: boolean; total: number } {
  const safePage = Math.max(1, page)
  const safePageSize = Math.max(1, pageSize)
  const end = safePage * safePageSize

  return {
    items: transactions.slice(0, end),
    hasMore: end < transactions.length,
    total: transactions.length,
  }
}
