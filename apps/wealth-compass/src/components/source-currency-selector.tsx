import { Label } from "@gaia/ui/components/label"
import { CURRENCIES, isCurrencyCode } from "../lib/currency"
import { useSourceCurrency } from "../lib/use-source-currency"

export function SourceCurrencySelector() {
  const { sourceCurrency, setSourceCurrency } = useSourceCurrency()

  return (
    <div className="space-y-2">
      <Label htmlFor="preferred-source-currency">
        Preferred income currency
      </Label>
      <select
        id="preferred-source-currency"
        value={sourceCurrency}
        onChange={(event) => {
          if (isCurrencyCode(event.target.value)) {
            setSourceCurrency(event.target.value)
          }
        }}
        className="w-full rounded-md border bg-background px-3 py-2 text-sm sm:w-64"
      >
        {CURRENCIES.map((currency) => (
          <option key={currency.code} value={currency.code}>
            {currency.symbol} {currency.code} — {currency.label}
          </option>
        ))}
      </select>
      <p className="text-xs text-muted-foreground">
        Used by default when you allocate income. You can change it for each
        allocation.
      </p>
    </div>
  )
}
