import { v } from "convex/values"
import { action, internalMutation, internalQuery } from "./_generated/server"
import { internal } from "./_generated/api"
import type { Id } from "./_generated/dataModel"

const CACHE_TTL_MS = 60 * 60 * 1000
const PROVIDER = "Frankfurter"
const SUPPORTED_CURRENCIES = new Set([
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "CAD",
  "AUD",
  "PHP",
])

interface CachedRate {
  _id: Id<"exchangeRates">
  sourceCurrency: string
  targetCurrency: string
  rate: number
  rateDate: string
  fetchedAt: number
  provider: string
}

interface ExchangeRateResult {
  rateId: Id<"exchangeRates"> | null
  sourceCurrency: string
  targetCurrency: string
  rate: number
  rateDate: string
  fetchedAt: number
  provider: string
  fromCache: boolean
  isStale: boolean
}

const cachedRateValidator = v.object({
  _id: v.id("exchangeRates"),
  sourceCurrency: v.string(),
  targetCurrency: v.string(),
  rate: v.number(),
  rateDate: v.string(),
  fetchedAt: v.number(),
  provider: v.string(),
})

const exchangeRateResultValidator = v.object({
  rateId: v.union(v.id("exchangeRates"), v.null()),
  sourceCurrency: v.string(),
  targetCurrency: v.string(),
  rate: v.number(),
  rateDate: v.string(),
  fetchedAt: v.number(),
  provider: v.string(),
  fromCache: v.boolean(),
  isStale: v.boolean(),
})

export const getExchangeRate = action({
  args: {
    sourceCurrency: v.string(),
    targetCurrency: v.string(),
    forceRefresh: v.optional(v.boolean()),
  },
  returns: exchangeRateResultValidator,
  handler: async (ctx, args): Promise<ExchangeRateResult> => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Not authenticated")
    validateCurrency(args.sourceCurrency)
    validateCurrency(args.targetCurrency)

    const now = Date.now()
    if (args.sourceCurrency === args.targetCurrency) {
      return {
        rateId: null,
        sourceCurrency: args.sourceCurrency,
        targetCurrency: args.targetCurrency,
        rate: 1,
        rateDate: new Date(now).toISOString().slice(0, 10),
        fetchedAt: now,
        provider: PROVIDER,
        fromCache: true,
        isStale: false,
      }
    }

    const cached: CachedRate | null = await ctx.runQuery(
      internal.exchangeRates.getCachedRate,
      {
        sourceCurrency: args.sourceCurrency,
        targetCurrency: args.targetCurrency,
      }
    )
    if (!args.forceRefresh && cached && now - cached.fetchedAt < CACHE_TTL_MS) {
      return rateResultFromCache(cached, false)
    }

    try {
      const response = await fetch(
        `https://api.frankfurter.dev/v2/rate/${encodeURIComponent(args.sourceCurrency)}/${encodeURIComponent(args.targetCurrency)}`,
        { headers: { Accept: "application/json" } }
      )
      if (!response.ok)
        throw new Error(`Rate provider returned ${response.status}`)
      const payload: unknown = await response.json()
      if (!isRatePayload(payload, args.sourceCurrency, args.targetCurrency)) {
        throw new Error("Rate provider returned an invalid response")
      }
      const rateId: Id<"exchangeRates"> = await ctx.runMutation(
        internal.exchangeRates.storeCachedRate,
        {
          sourceCurrency: args.sourceCurrency,
          targetCurrency: args.targetCurrency,
          rate: payload.rate,
          rateDate: payload.date,
          fetchedAt: now,
          provider: PROVIDER,
        }
      )
      return {
        rateId,
        sourceCurrency: args.sourceCurrency,
        targetCurrency: args.targetCurrency,
        rate: payload.rate,
        rateDate: payload.date,
        fetchedAt: now,
        provider: PROVIDER,
        fromCache: false,
        isStale: false,
      }
    } catch (error) {
      if (cached) {
        return rateResultFromCache(cached, true)
      }
      throw new Error(
        error instanceof Error ? error.message : "Unable to fetch exchange rate"
      )
    }
  },
})

export const getCachedRate = internalQuery({
  args: { sourceCurrency: v.string(), targetCurrency: v.string() },
  returns: v.union(cachedRateValidator, v.null()),
  handler: async (ctx, args) => {
    const rate = await ctx.db
      .query("exchangeRates")
      .withIndex("by_sourceCurrency_targetCurrency", (q) =>
        q
          .eq("sourceCurrency", args.sourceCurrency)
          .eq("targetCurrency", args.targetCurrency)
      )
      .unique()
    if (!rate) return null
    return {
      _id: rate._id,
      sourceCurrency: rate.sourceCurrency,
      targetCurrency: rate.targetCurrency,
      rate: rate.rate,
      rateDate: rate.rateDate,
      fetchedAt: rate.fetchedAt,
      provider: rate.provider,
    }
  },
})

export const storeCachedRate = internalMutation({
  args: {
    sourceCurrency: v.string(),
    targetCurrency: v.string(),
    rate: v.number(),
    rateDate: v.string(),
    fetchedAt: v.number(),
    provider: v.string(),
  },
  returns: v.id("exchangeRates"),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("exchangeRates")
      .withIndex("by_sourceCurrency_targetCurrency", (q) =>
        q
          .eq("sourceCurrency", args.sourceCurrency)
          .eq("targetCurrency", args.targetCurrency)
      )
      .unique()
    if (existing) {
      await ctx.db.patch(existing._id, args)
      return existing._id
    }
    return await ctx.db.insert("exchangeRates", args)
  },
})

function validateCurrency(currency: string) {
  if (!SUPPORTED_CURRENCIES.has(currency)) {
    throw new Error(`Unsupported currency: ${currency}`)
  }
}

function rateResultFromCache(
  cached: CachedRate,
  isStale: boolean
): ExchangeRateResult {
  return {
    rateId: cached._id,
    sourceCurrency: cached.sourceCurrency,
    targetCurrency: cached.targetCurrency,
    rate: cached.rate,
    rateDate: cached.rateDate,
    fetchedAt: cached.fetchedAt,
    provider: cached.provider,
    fromCache: true,
    isStale,
  }
}

function isRatePayload(
  value: unknown,
  sourceCurrency: string,
  targetCurrency: string
): value is { date: string; base: string; quote: string; rate: number } {
  if (typeof value !== "object" || value === null) return false
  if (
    !("date" in value) ||
    !("base" in value) ||
    !("quote" in value) ||
    !("rate" in value)
  )
    return false
  return (
    typeof value.date === "string" &&
    value.base === sourceCurrency &&
    value.quote === targetCurrency &&
    typeof value.rate === "number" &&
    Number.isFinite(value.rate) &&
    value.rate > 0
  )
}
