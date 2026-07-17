import { useCallback, useSyncExternalStore } from "react"
import {
  type CurrencyCode,
  getStoredCurrency,
  setStoredCurrency,
} from "./currency"

let listeners: Array<() => void> = []

function emitChange() {
  for (const listener of listeners) {
    listener()
  }
}

function subscribe(callback: () => void) {
  listeners = [...listeners, callback]
  return () => {
    listeners = listeners.filter((l) => l !== callback)
  }
}

function getSnapshot(): CurrencyCode {
  return getStoredCurrency()
}

export function useCurrency() {
  const currency = useSyncExternalStore(subscribe, getSnapshot)

  const setCurrency = useCallback((code: CurrencyCode) => {
    setStoredCurrency(code)
    emitChange()
  }, [])

  return { currency, setCurrency }
}
