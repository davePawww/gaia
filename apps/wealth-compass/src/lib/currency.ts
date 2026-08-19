export const CURRENCIES = [
  { code: "USD", symbol: "$", label: "US Dollar" },
  { code: "EUR", symbol: "€", label: "Euro" },
  { code: "GBP", symbol: "£", label: "British Pound" },
  { code: "JPY", symbol: "¥", label: "Japanese Yen" },
  { code: "CAD", symbol: "C$", label: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", label: "Australian Dollar" },
  { code: "PHP", symbol: "₱", label: "Philippine Peso" },
] as const

export type CurrencyCode = (typeof CURRENCIES)[number]["code"]

const STORAGE_KEY = "wealth-compass-currency"
const SOURCE_STORAGE_KEY = "wealth-compass-source-currency"

export function isCurrencyCode(value: string): value is CurrencyCode {
  return CURRENCIES.some((currency) => currency.code === value)
}

export function getStoredCurrency(): CurrencyCode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && isCurrencyCode(stored)) return stored
  } catch {
    // localStorage unavailable
  }
  return "USD"
}

export function getStoredSourceCurrency(): CurrencyCode {
  try {
    const stored = localStorage.getItem(SOURCE_STORAGE_KEY)
    if (stored && isCurrencyCode(stored)) return stored
  } catch {
    // localStorage unavailable
  }
  return getStoredCurrency()
}

export function setStoredSourceCurrency(code: CurrencyCode): void {
  try {
    localStorage.setItem(SOURCE_STORAGE_KEY, code)
  } catch {
    // localStorage unavailable
  }
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
