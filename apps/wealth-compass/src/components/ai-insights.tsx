import { Card, CardContent } from "@gaia/ui/components/card"
import { Skeleton } from "@gaia/ui/components/skeleton"
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
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

export function AiInsightsSection({
  insights,
  isLoading,
}: {
  insights: Insight[] | undefined
  isLoading: boolean
}) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="flex gap-4 p-4">
              <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
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
