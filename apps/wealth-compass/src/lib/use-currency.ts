import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { useAction } from "convex/react"
import { api } from "../../convex/_generated/api"
import {
  formatCurrency as formatCurrencyValue,
  getStoredCurrency,
  setStoredCurrency,
  type CurrencyCode,
} from "./currency"
import { convertFromCanonical, convertToCanonical } from "./exchange-rate"

const CANONICAL_CURRENCY: CurrencyCode = "USD"

interface CurrencyContextValue {
  currency: CurrencyCode
  rate: number
  isChangingCurrency: boolean
  setCurrency: (code: CurrencyCode) => Promise<void>
  toDisplayAmount: (amount: number) => number
  toCanonicalAmount: (amount: number) => number
  formatDisplayAmount: (amount: number) => string
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null)

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const getExchangeRate = useAction(api.exchangeRates.getExchangeRate)
  const getExchangeRateRef = useRef(getExchangeRate)
  const [currency, setCurrencyState] = useState<CurrencyCode>(getStoredCurrency)
  const [rate, setRate] = useState<number | null>(
    currency === CANONICAL_CURRENCY ? 1 : null
  )
  const [isChangingCurrency, setIsChangingCurrency] = useState(false)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    getExchangeRateRef.current = getExchangeRate
  }, [getExchangeRate])

  const loadRate = useCallback(async (targetCurrency: CurrencyCode) => {
    if (targetCurrency === CANONICAL_CURRENCY) return 1
    const result = await getExchangeRateRef.current({
      sourceCurrency: CANONICAL_CURRENCY,
      targetCurrency,
    })
    return result.rate
  }, [])

  useEffect(() => {
    if (rate !== null || loadError) return
    let cancelled = false
    void loadRate(currency)
      .then((nextRate) => {
        if (!cancelled) setRate(nextRate)
      })
      .catch(() => {
        if (!cancelled) setLoadError(true)
      })
    return () => {
      cancelled = true
    }
  }, [currency, loadError, loadRate, rate])

  const setCurrency = useCallback(
    async (code: CurrencyCode) => {
      if (code === currency) return
      setIsChangingCurrency(true)
      try {
        const nextRate = await loadRate(code)
        setStoredCurrency(code)
        setCurrencyState(code)
        setRate(nextRate)
      } finally {
        setIsChangingCurrency(false)
      }
    },
    [currency, loadRate]
  )

  const value = useMemo<CurrencyContextValue | null>(() => {
    if (rate === null) return null
    const toDisplayAmount = (amount: number) =>
      convertFromCanonical(amount, rate)
    const toCanonicalAmount = (amount: number) =>
      convertToCanonical(amount, rate)
    return {
      currency,
      rate,
      isChangingCurrency,
      setCurrency,
      toDisplayAmount,
      toCanonicalAmount,
      formatDisplayAmount: (amount: number) =>
        formatCurrencyValue(toDisplayAmount(amount), currency),
    }
  }, [currency, isChangingCurrency, rate, setCurrency])

  if (!value && loadError) {
    return createElement(
      "div",
      {
        className:
          "flex min-h-screen flex-col items-center justify-center gap-3 text-sm text-muted-foreground",
      },
      createElement("p", null, "Unable to load the display exchange rate."),
      createElement(
        "button",
        {
          className: "rounded-md border px-3 py-2 text-foreground",
          onClick: () => setLoadError(false),
          type: "button",
        },
        "Retry"
      )
    )
  }

  if (!value) {
    return createElement(
      "div",
      {
        className:
          "flex min-h-screen items-center justify-center text-sm text-muted-foreground",
      },
      "Loading display currency…"
    )
  }

  return createElement(CurrencyContext.Provider, { value }, children)
}

export function useCurrency() {
  const value = useContext(CurrencyContext)
  if (!value)
    throw new Error("useCurrency must be used within CurrencyProvider")
  return value
}
