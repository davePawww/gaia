import { useCallback, useSyncExternalStore } from "react"
import {
  getStoredSourceCurrency,
  setStoredSourceCurrency,
  type CurrencyCode,
} from "./currency"

let listeners: Array<() => void> = []

function subscribe(callback: () => void) {
  listeners = [...listeners, callback]
  return () => {
    listeners = listeners.filter((listener) => listener !== callback)
  }
}

export function useSourceCurrency() {
  const sourceCurrency = useSyncExternalStore(
    subscribe,
    getStoredSourceCurrency,
    getStoredSourceCurrency
  )
  const setSourceCurrency = useCallback((code: CurrencyCode) => {
    setStoredSourceCurrency(code)
    for (const listener of listeners) listener()
  }, [])

  return { sourceCurrency, setSourceCurrency }
}
