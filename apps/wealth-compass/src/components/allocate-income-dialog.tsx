import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactElement,
} from "react"
import { useAction, useMutation, useQuery } from "convex/react"
import { RefreshCw } from "lucide-react"
import { api } from "../../convex/_generated/api"
import type { Id } from "../../convex/_generated/dataModel"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@gaia/ui/components/dialog"
import { Button } from "@gaia/ui/components/button"
import { Input } from "@gaia/ui/components/input"
import { Label } from "@gaia/ui/components/label"
import { toast } from "sonner"
import {
  CURRENCIES,
  formatCurrency,
  isCurrencyCode,
  type CurrencyCode,
} from "@wealth-compass/lib/currency"
import {
  convertCurrency,
  describeRateAge,
} from "@wealth-compass/lib/exchange-rate"
import { useSourceCurrency } from "@wealth-compass/lib/use-source-currency"

interface ExchangeRateState {
  rateId: Id<"exchangeRates"> | null
  rate: number
  rateDate: string
  fetchedAt: number
  provider: string
  isStale: boolean
}

interface AllocateIncomeDialogProps {
  currency: CurrencyCode
  children: ReactElement
}

export function AllocateIncomeDialog({
  currency,
  children,
}: AllocateIncomeDialogProps) {
  const { sourceCurrency: preferredSourceCurrency } = useSourceCurrency()
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState("")
  const [selectedSource, setSelectedSource] = useState<CurrencyCode>(
    preferredSourceCurrency
  )
  const [rate, setRate] = useState<ExchangeRateState | null>(null)
  const [canonicalRate, setCanonicalRate] = useState<ExchangeRateState | null>(
    null
  )
  const [rateLoading, setRateLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const rateRequest = useRef(0)
  const jars = useQuery(api.jars.getUserJars)
  const getExchangeRate = useAction(api.exchangeRates.getExchangeRate)
  const getExchangeRateRef = useRef(getExchangeRate)
  const allocateIncome = useMutation(api.transactions.allocateIncome)

  useEffect(() => {
    getExchangeRateRef.current = getExchangeRate
  }, [getExchangeRate])

  const refreshRate = useCallback(
    async (forceRefresh = false) => {
      const requestNumber = rateRequest.current + 1
      rateRequest.current = requestNumber
      setRateLoading(true)
      try {
        const displayRatePromise = getExchangeRateRef.current({
          sourceCurrency: selectedSource,
          targetCurrency: currency,
          forceRefresh,
        })
        const canonicalRatePromise =
          currency === "USD"
            ? displayRatePromise
            : getExchangeRateRef.current({
                sourceCurrency: selectedSource,
                targetCurrency: "USD",
                forceRefresh,
              })
        const [nextRate, nextCanonicalRate] = await Promise.all([
          displayRatePromise,
          canonicalRatePromise,
        ])
        if (rateRequest.current === requestNumber) {
          setRate(nextRate)
          setCanonicalRate(nextCanonicalRate)
        }
      } catch (error) {
        if (rateRequest.current === requestNumber) {
          setRate(null)
          setCanonicalRate(null)
          toast.error(
            error instanceof Error
              ? error.message
              : "Unable to load the exchange rate"
          )
        }
      } finally {
        if (rateRequest.current === requestNumber) setRateLoading(false)
      }
    },
    [currency, selectedSource]
  )

  useEffect(() => {
    if (!open) return
    void refreshRate()
  }, [open, refreshRate])

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setSelectedSource(preferredSourceCurrency)
      setRate(null)
      setCanonicalRate(null)
    }
    setOpen(nextOpen)
  }

  const originalAmount = Number.parseFloat(amount) || 0
  const convertedAmount = rate ? convertCurrency(originalAmount, rate.rate) : 0
  const splits =
    jars?.map((jar) => ({
      ...jar,
      splitAmount: (convertedAmount * jar.percentage) / 100,
    })) ?? []

  const handleSubmit = async () => {
    if (originalAmount <= 0) {
      toast.error("Please enter a valid amount")
      return
    }
    if (!rate || !canonicalRate) {
      toast.error("Wait for an exchange rate before allocating income")
      return
    }

    setSubmitting(true)
    try {
      await allocateIncome({
        amount: originalAmount,
        sourceCurrency: selectedSource,
        targetCurrency: "USD",
        rateId: canonicalRate.rateId ?? undefined,
      })
      toast.success(
        selectedSource === currency
          ? `Allocated ${formatCurrency(convertedAmount, currency)} across ${jars?.length ?? 0} jars`
          : `Converted ${formatCurrency(originalAmount, selectedSource)} to ${formatCurrency(convertedAmount, currency)} and allocated it`
      )
      setOpen(false)
      setAmount("")
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to allocate income. Please try again."
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={children} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Allocate Income</DialogTitle>
          <DialogDescription>
            Convert your income to {currency} and split it across your jars.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-[1fr_8rem] gap-3">
            <div className="space-y-2">
              <Label htmlFor="income-amount">Total income</Label>
              <Input
                id="income-amount"
                type="number"
                placeholder="0.00"
                min="0"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="income-currency">Currency</Label>
              <select
                id="income-currency"
                value={selectedSource}
                onChange={(event) => {
                  if (isCurrencyCode(event.target.value)) {
                    setSelectedSource(event.target.value)
                    setRate(null)
                  }
                }}
                className="h-9 w-full rounded-md border bg-background px-2 text-sm"
              >
                {CURRENCIES.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.code}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-lg border bg-muted/50 p-3 text-sm">
            {rateLoading ? (
              <p className="text-muted-foreground">Loading exchange rate…</p>
            ) : rate ? (
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">
                    1 {selectedSource} ={" "}
                    {rate.rate.toLocaleString(undefined, {
                      maximumFractionDigits: 6,
                    })}{" "}
                    {currency}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => void refreshRate(true)}
                    aria-label="Refresh exchange rate"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Refresh
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {rate.provider} rate dated {rate.rateDate}; fetched{" "}
                  {describeRateAge(rate.fetchedAt)}
                  {rate.isStale ? " (last known rate)" : ""}
                </p>
                {originalAmount > 0 && (
                  <p className="pt-1 font-medium">
                    Converted total: {formatCurrency(convertedAmount, currency)}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-destructive">Exchange rate unavailable.</p>
            )}
          </div>

          {originalAmount > 0 && rate && (
            <div className="space-y-2 rounded-lg border p-3">
              <p className="text-xs font-medium text-muted-foreground">
                Allocation preview
              </p>
              <div className="space-y-1">
                {splits.map((split) => (
                  <div
                    key={split._id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: split.color }}
                      />
                      <span>{split.name}</span>
                      <span className="text-muted-foreground">
                        ({split.percentage}%)
                      </span>
                    </div>
                    <span className="font-medium">
                      {formatCurrency(split.splitAmount, currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              submitting ||
              rateLoading ||
              originalAmount <= 0 ||
              !rate ||
              !canonicalRate
            }
          >
            {submitting ? "Allocating…" : "Allocate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
