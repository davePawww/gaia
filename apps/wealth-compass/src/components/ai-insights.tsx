import { useCallback, useEffect, useRef, useState } from "react"
import { Card, CardContent } from "@gaia/ui/components/card"
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Loader2,
} from "lucide-react"

interface Insight {
  type: "spending_change" | "trend" | "positive" | "anomaly"
  title: string
  description: string
  severity: "info" | "warning" | "success" | "alert"
}

const SEVERITY_BORDER: Record<string, string> = {
  info: "border-l-blue-500",
  warning: "border-l-amber-500",
  success: "border-l-green-500",
  alert: "border-l-red-500",
}

const SEVERITY_ICON: Record<string, typeof TrendingUp> = {
  spending_change: TrendingUp,
  anomaly: AlertTriangle,
  positive: CheckCircle,
  trend: Lightbulb,
}

const SEVERITY_ICON_COLOR: Record<string, string> = {
  info: "text-blue-500",
  warning: "text-amber-500",
  success: "text-green-500",
  alert: "text-red-500",
}

const LOADING_MESSAGES = [
  "Analyzing your spending patterns...",
  "Comparing month-over-month trends...",
  "Evaluating jar allocations...",
  "Checking for unusual activity...",
  "Calculating savings velocity...",
  "Generating personalized insights...",
  "Reviewing category breakdowns...",
  "Almost there...",
]

export function AiInsightsSection({
  insights,
  isLoading,
}: {
  insights: Insight[] | undefined
  isLoading: boolean
}) {
  const [messageIndex, setMessageIndex] = useState(0)
  const [animState, setAnimState] = useState<"entering" | "visible" | "leaving">("visible")
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const cycleMessage = useCallback(() => {
    setAnimState("leaving")
    timeoutRef.current = setTimeout(() => {
      setMessageIndex((i) => (i + 1) % LOADING_MESSAGES.length)
      setAnimState("entering")
      timeoutRef.current = setTimeout(() => setAnimState("visible"), 400)
    }, 400)
  }, [])

  useEffect(() => {
    if (!isLoading) return
    setAnimState("entering")
    const id = setTimeout(() => setAnimState("visible"), 400)
    const interval = setInterval(cycleMessage, 4000)
    return () => {
      clearTimeout(id)
      clearInterval(interval)
      clearTimeout(timeoutRef.current)
    }
  }, [isLoading, cycleMessage])

  if (isLoading) {
    const opacity = animState === "visible" ? "1" : "0"
    const translateY = animState === "entering" ? "8px" : animState === "leaving" ? "-8px" : "0"

    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p
            className="text-sm text-muted-foreground"
            style={{
              opacity,
              transform: `translateY(${translateY})`,
              transition: "opacity 400ms ease, transform 400ms ease",
            }}
          >
            {LOADING_MESSAGES[messageIndex]}
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!insights || insights.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
          <Lightbulb className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            AI insights will appear here once spending data is available.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {insights.map((insight, i) => {
        const Icon = SEVERITY_ICON[insight.type] ?? Lightbulb
        return (
          <Card
            key={i}
            className={`border-l-4 ${SEVERITY_BORDER[insight.severity]}`}
          >
            <CardContent className="flex gap-4 p-4">
              <Icon
                className={`h-5 w-5 shrink-0 mt-0.5 ${SEVERITY_ICON_COLOR[insight.severity]}`}
              />
              <div className="space-y-1">
                <div className="font-semibold">{insight.title}</div>
                <div className="text-sm text-muted-foreground">
                  {insight.description}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
