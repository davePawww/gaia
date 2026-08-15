import { formatCurrency, type CurrencyCode } from "./currency.ts"

export type ExportTransaction = {
  createdAt: number
  type: "income" | "withdrawal" | "transfer"
  amount: number
  fromJarId?: string
  toJarId?: string
  note?: string
}

export type ExportJar = {
  jar: {
    _id: string
    name: string
  }
}

export type ExportFilters = {
  dateFrom?: string
  dateTo?: string
  type?: string
  jarId?: string
}

export const CSV_HEADERS = [
  "Date",
  "Type",
  "Amount",
  "Currency",
  "From Jar",
  "To Jar",
  "Note",
] as const

export function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function generateCsv(
  rows: Record<string, string>[],
  headers: readonly string[] = CSV_HEADERS,
): string {
  const headerLine = headers.map(escapeCsv).join(",")
  const dataLines = rows.map((row) =>
    headers.map((header) => escapeCsv(row[header] ?? "")).join(","),
  )
  return [headerLine, ...dataLines].join("\n")
}

export function filterTransactions(
  transactions: ExportTransaction[],
  filters: ExportFilters,
): ExportTransaction[] {
  let filtered = [...transactions]

  if (filters.dateFrom) {
    const from = new Date(filters.dateFrom).getTime()
    filtered = filtered.filter((transaction) => transaction.createdAt >= from)
  }
  if (filters.dateTo) {
    const to = new Date(filters.dateTo).getTime() + 86_400_000
    filtered = filtered.filter((transaction) => transaction.createdAt < to)
  }
  if (filters.type && filters.type !== "all") {
    filtered = filtered.filter((transaction) => transaction.type === filters.type)
  }
  if (filters.jarId && filters.jarId !== "all") {
    filtered = filtered.filter(
      (transaction) =>
        transaction.fromJarId === filters.jarId ||
        transaction.toJarId === filters.jarId,
    )
  }

  return filtered
}

function getJarName(jars: ExportJar[], jarId?: string): string {
  return jars.find((jar) => jar.jar._id === jarId)?.jar.name ?? ""
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toISOString().slice(0, 10)
}

export function buildCsvExport(
  transactions: ExportTransaction[],
  jars: ExportJar[],
  currency: CurrencyCode,
  today: string,
): { content: string; filename: string; mimeType: string } {
  const rows = transactions.map((transaction) => ({
    Date: formatDate(transaction.createdAt),
    Type: transaction.type,
    Amount: formatCurrency(transaction.amount, currency),
    Currency: currency,
    "From Jar": getJarName(jars, transaction.fromJarId),
    "To Jar": getJarName(jars, transaction.toJarId),
    Note: transaction.note ?? "",
  }))

  return {
    content: generateCsv(rows),
    filename: `wealth-compass-transfers-${today}.csv`,
    mimeType: "text/csv;charset=utf-8",
  }
}

export function buildJsonExport(
  transactions: ExportTransaction[],
  jars: ExportJar[],
  currency: CurrencyCode,
  today: string,
): { content: string; filename: string; mimeType: string } {
  const data = transactions.map((transaction) => ({
    date: formatDate(transaction.createdAt),
    type: transaction.type,
    amount: transaction.amount,
    currency,
    fromJar: getJarName(jars, transaction.fromJarId) || undefined,
    toJar: getJarName(jars, transaction.toJarId) || undefined,
    note: transaction.note || undefined,
  }))

  return {
    content: JSON.stringify(data, null, 2),
    filename: `wealth-compass-transfers-${today}.json`,
    mimeType: "application/json",
  }
}
