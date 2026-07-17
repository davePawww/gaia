export const CURRENCIES = [
  { code: "USD", symbol: "$", label: "US Dollar" },
  { code: "EUR", symbol: "€", label: "Euro" },
  { code: "GBP", symbol: "£", label: "British Pound" },
  { code: "JPY", symbol: "¥", label: "Japanese Yen" },
  { code: "CAD", symbol: "C$", label: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", label: "Australian Dollar" },
] as const

export type CurrencyCode = (typeof CURRENCIES)[number]["code"]

const STORAGE_KEY = "wealth-compass-currency"

export function getStoredCurrency(): CurrencyCode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && CURRENCIES.some((c) => c.code === stored)) {
      return stored as CurrencyCode
    }
  } catch {
    // localStorage unavailable
  }
  return "USD"
}

export function setStoredCurrency(code: CurrencyCode): void {
  try {
    localStorage.setItem(STORAGE_KEY, code)
  } catch {
    // localStorage unavailable
  }
}

export function formatCurrency(
  amount: number,
  currencyCode: CurrencyCode = getStoredCurrency()
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: currencyCode === "JPY" ? 0 : 2,
    maximumFractionDigits: currencyCode === "JPY" ? 0 : 2,
  }).format(amount)
}

export function getCurrencySymbol(code: CurrencyCode): string {
  return CURRENCIES.find((c) => c.code === code)?.symbol ?? "$"
}
