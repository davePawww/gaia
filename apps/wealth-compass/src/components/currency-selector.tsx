import { Button } from "@gaia/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@gaia/ui/components/dropdown-menu"
import { ChevronDown } from "lucide-react"
import { useCurrency } from "../lib/use-currency"
import { CURRENCIES, type CurrencyCode } from "../lib/currency"

export function CurrencySelector() {
  const { currency, setCurrency } = useCurrency()
  const current = CURRENCIES.find((c) => c.code === currency)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" size="sm" aria-label="Select currency" />}>
        {current?.symbol} {current?.code}
        <ChevronDown className="ml-1 h-3 w-3" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {CURRENCIES.map((c) => (
          <DropdownMenuItem
            key={c.code}
            onClick={() => setCurrency(c.code as CurrencyCode)}
          >
            <span className="mr-2">{c.symbol}</span>
            {c.code} - {c.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
