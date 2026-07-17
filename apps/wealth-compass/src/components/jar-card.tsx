import { Card, CardContent, CardHeader, CardTitle } from "@gaia/ui/components/card"
import { Badge } from "@gaia/ui/components/badge"
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@gaia/ui/components/progress"
import {
  Home,
  Shield,
  BookOpen,
  Gamepad2,
  Heart,
  TrendingUp,
  type LucideIcon,
} from "lucide-react"
import type { Doc } from "../../convex/_generated/dataModel"

const iconMap: Record<string, LucideIcon> = {
  Home,
  Shield,
  BookOpen,
  Gamepad2,
  Heart,
  TrendingUp,
}

interface JarCardProps {
  jar: Doc<"jars">
  balance: number
  recentIncome: number
}

export function JarCard({ jar, balance, recentIncome }: JarCardProps) {
  const Icon = iconMap[jar.icon] ?? Home
  const fillPercentage =
    recentIncome > 0 ? Math.min((balance / recentIncome) * 100, 100) : 0

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className="h-5 w-5" style={{ color: jar.color }} />
          {jar.name}
        </CardTitle>
        <Badge
          variant="secondary"
          className="text-xs"
          style={{ backgroundColor: `${jar.color}20`, color: jar.color }}
        >
          {jar.percentage}%
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">${balance.toLocaleString()}</div>
        <Progress value={fillPercentage} className="mt-3">
          <ProgressLabel className="sr-only">{jar.name} progress</ProgressLabel>
          <ProgressValue />
        </Progress>
        <p className="mt-1 text-xs text-muted-foreground">
          ${balance.toFixed(0)} of ${recentIncome.toFixed(0)} allocated
        </p>
      </CardContent>
    </Card>
  )
}
