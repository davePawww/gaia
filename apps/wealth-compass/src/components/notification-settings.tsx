import { useQuery, useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@gaia/ui/components/alert-dialog"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@gaia/ui/components/card"
import { Switch } from "@gaia/ui/components/switch"
import { Label } from "@gaia/ui/components/label"
import { Input } from "@gaia/ui/components/input"
import { Button } from "@gaia/ui/components/button"
import { Separator } from "@gaia/ui/components/separator"
import { Skeleton } from "@gaia/ui/components/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@gaia/ui/components/select"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import {
  subscribeToPush,
  savePushSubscription,
  unsubscribeFromPush,
  getNotificationPermission,
  registerServiceWorker,
} from "../lib/notifications"
import { useCurrency } from "../lib/use-currency"

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY ?? ""
type ReminderFrequency = "daily" | "weekly" | "custom"

export function NotificationSettings() {
  const { currency, toCanonicalAmount, toDisplayAmount } = useCurrency()
  const prefs = useQuery(api.notifications.getPreferences)
  const upsertPrefs = useMutation(api.notifications.upsertPreferences)
  const sendTestNotification = useMutation(
    api.notifications.sendTestNotification
  )
  const clearAllNotifications = useMutation(
    api.notifications.clearAllNotifications
  )
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [clearDialogOpen, setClearDialogOpen] = useState(false)

  const [incomeAllocationReminder, setIncomeAllocationReminder] =
    useState(false)
  const [incomeAllocationFrequency, setIncomeAllocationFrequency] =
    useState<ReminderFrequency>("daily")
  const [incomeAllocationCustomDay, setIncomeAllocationCustomDay] =
    useState("1")
  const [goalDeadlineApproaching, setGoalDeadlineApproaching] = useState(false)
  const [goalCompleted, setGoalCompleted] = useState(false)
  const [spendingLimitWarning, setSpendingLimitWarning] = useState(false)
  const [monthlySpendingSummary, setMonthlySpendingSummary] = useState(false)
  const [spendingLimitThreshold, setSpendingLimitThreshold] = useState("50")
  const [goalDeadlineDays, setGoalDeadlineDays] = useState("7")
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false)
  const [quietHoursStart, setQuietHoursStart] = useState("22:00")
  const [quietHoursEnd, setQuietHoursEnd] = useState("07:00")
  const [quietHoursTimezone] = useState(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
  )

  const [pushEnabled, setPushEnabled] = useState(false)
  const [permission, setPermission] = useState<
    NotificationPermission | "unsupported"
  >("unsupported")

  useEffect(() => {
    getNotificationPermission().then(setPermission)
    registerServiceWorker()
  }, [])

  useEffect(() => {
    if (prefs) {
      setIncomeAllocationReminder(prefs.incomeAllocationReminder)
      setIncomeAllocationFrequency(prefs.incomeAllocationFrequency ?? "daily")
      setIncomeAllocationCustomDay(String(prefs.incomeAllocationCustomDay ?? 1))
      setGoalDeadlineApproaching(prefs.goalDeadlineApproaching)
      setGoalCompleted(prefs.goalCompleted)
      setSpendingLimitWarning(prefs.spendingLimitWarning)
      setMonthlySpendingSummary(prefs.monthlySpendingSummary)
      setSpendingLimitThreshold(
        String(toDisplayAmount(prefs.spendingLimitThreshold))
      )
      setGoalDeadlineDays(String(prefs.goalDeadlineDays))
      setQuietHoursEnabled(prefs.quietHoursEnabled ?? false)
      setQuietHoursStart(prefs.quietHoursStart ?? "22:00")
      setQuietHoursEnd(prefs.quietHoursEnd ?? "07:00")
    }
  }, [prefs, toDisplayAmount])

  useEffect(() => {
    if (permission === "granted") {
      navigator.serviceWorker?.ready?.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          setPushEnabled(!!sub)
        })
      })
    }
  }, [permission])

  const handleTogglePush = async (enabled: boolean) => {
    if (!VAPID_PUBLIC_KEY) {
      toast.error("Push notifications are not configured")
      return
    }
    if (enabled) {
      try {
        const sub = await subscribeToPush(VAPID_PUBLIC_KEY)
        if (!sub) {
          const nextPermission = await getNotificationPermission()
          setPermission(nextPermission)
          toast.error(
            nextPermission === "denied"
              ? "Notifications are blocked in your browser settings"
              : "Could not create a browser push subscription"
          )
          return
        }

        await savePushSubscription(sub)
        setPushEnabled(true)
        setPermission("granted")
        toast.success("Push notifications enabled")
      } catch (error) {
        const errorName = error instanceof Error ? error.name : ""
        const errorMessage = error instanceof Error ? error.message : ""
        const isPushServiceError =
          errorName === "AbortError" ||
          errorMessage.includes("push service error")

        toast.error(
          isPushServiceError
            ? "Your browser push service rejected the subscription. In Brave, enable Use Google Services for Push Messaging and try again."
            : "Could not enable push notifications"
        )
      }
    } else {
      try {
        await unsubscribeFromPush()
        setPushEnabled(false)
        toast.success("Push notifications disabled")
      } catch {
        toast.error("Could not disable push notifications")
      }
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await upsertPrefs({
        incomeAllocationReminder,
        incomeAllocationFrequency,
        incomeAllocationCustomDay: Math.min(
          Math.max(Number(incomeAllocationCustomDay) || 1, 1),
          28
        ),
        goalDeadlineApproaching,
        goalCompleted,
        spendingLimitWarning,
        monthlySpendingSummary,
        spendingLimitThreshold: toCanonicalAmount(
          Number(spendingLimitThreshold) || 50
        ),
        goalDeadlineDays: Number(goalDeadlineDays) || 7,
        quietHoursEnabled,
        quietHoursStart,
        quietHoursEnd,
        quietHoursTimezone,
      })
      toast.success("Notification preferences saved")
    } catch {
      toast.error("Failed to save preferences")
    } finally {
      setSaving(false)
    }
  }

  const handleSendTest = async () => {
    setTesting(true)
    try {
      await sendTestNotification()
      toast.success("Test notification created")
    } catch {
      toast.error("Could not send test notification")
    } finally {
      setTesting(false)
    }
  }

  const handleClearAll = async () => {
    setClearing(true)
    try {
      const result = await clearAllNotifications()
      setClearDialogOpen(false)
      toast.success(
        result.deleted === 0
          ? "Notification history is already empty"
          : `Cleared ${result.deleted} notification${result.deleted === 1 ? "" : "s"}`
      )
    } catch {
      toast.error("Could not clear notification history")
    } finally {
      setClearing(false)
    }
  }

  if (prefs === undefined) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          Configure which notifications you receive and how
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label>Push Notifications</Label>
              <p className="text-xs text-muted-foreground">
                {permission === "unsupported"
                  ? "Not supported in this browser"
                  : permission === "denied"
                    ? "Blocked by browser settings"
                    : pushEnabled
                      ? "Enabled"
                      : "Disabled"}
              </p>
            </div>
            <Switch
              checked={pushEnabled}
              onCheckedChange={handleTogglePush}
              disabled={permission === "unsupported" || permission === "denied"}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSendTest}
              disabled={testing}
            >
              {testing ? "Sending..." : "Send Test Notification"}
            </Button>
            <AlertDialog
              open={clearDialogOpen}
              onOpenChange={setClearDialogOpen}
            >
              <AlertDialogTrigger
                render={<Button variant="outline" size="sm" />}
              >
                Clear Notification History
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Clear notification history?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This permanently removes the notifications shown in your
                    notification center.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={clearing}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleClearAll}
                    disabled={clearing}
                  >
                    {clearing ? "Clearing..." : "Clear History"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <p className="text-xs text-muted-foreground">
            Test notifications are also added to your in-app notification
            center.
          </p>
        </div>

        <Separator />

        <div className="space-y-4">
          <ToggleRow
            label="Income Allocation Reminder"
            description="Remind you to allocate income when you haven't this month"
            checked={incomeAllocationReminder}
            onCheckedChange={setIncomeAllocationReminder}
          />
          {incomeAllocationReminder && (
            <div className="grid gap-3 rounded-lg border bg-muted/30 p-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Reminder Frequency</Label>
                <Select
                  value={incomeAllocationFrequency}
                  onValueChange={(value) =>
                    setIncomeAllocationFrequency(
                      (value as ReminderFrequency) ?? "daily"
                    )
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly (Monday)</SelectItem>
                    <SelectItem value="custom">Custom day of month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {incomeAllocationFrequency === "custom" && (
                <div className="space-y-2">
                  <Label htmlFor="income-reminder-day">Day of month</Label>
                  <Input
                    id="income-reminder-day"
                    type="number"
                    min="1"
                    max="28"
                    value={incomeAllocationCustomDay}
                    onChange={(e) =>
                      setIncomeAllocationCustomDay(e.target.value)
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Choose a day from 1 to 28.
                  </p>
                </div>
              )}
            </div>
          )}
          <ToggleRow
            label="Goal Deadline Approaching"
            description="Alert you when a goal deadline is near"
            checked={goalDeadlineApproaching}
            onCheckedChange={setGoalDeadlineApproaching}
          />
          <ToggleRow
            label="Goal Completed"
            description="Celebrate when you reach a goal"
            checked={goalCompleted}
            onCheckedChange={setGoalCompleted}
          />
          <ToggleRow
            label="Spending Limit Warning"
            description="Warn when jar balance drops below a threshold"
            checked={spendingLimitWarning}
            onCheckedChange={setSpendingLimitWarning}
          />
          <ToggleRow
            label="Monthly Spending Summary"
            description="Get a summary of your spending on the 1st of each month"
            checked={monthlySpendingSummary}
            onCheckedChange={setMonthlySpendingSummary}
          />
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="spending-threshold">
              Spending Limit Threshold ({currency})
            </Label>
            <Input
              id="spending-threshold"
              type="number"
              min="0"
              value={spendingLimitThreshold}
              onChange={(e) => setSpendingLimitThreshold(e.target.value)}
              className="w-32"
            />
            <p className="text-xs text-muted-foreground">
              Warn when a jar balance drops below this amount
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="deadline-days">Goal Deadline Reminder (Days)</Label>
            <Input
              id="deadline-days"
              type="number"
              min="1"
              max="30"
              value={goalDeadlineDays}
              onChange={(e) => setGoalDeadlineDays(e.target.value)}
              className="w-32"
            />
            <p className="text-xs text-muted-foreground">
              Days before deadline to send reminder
            </p>
          </div>
        </div>

        <div className="space-y-4 rounded-lg border bg-muted/30 p-3">
          <ToggleRow
            label="Quiet Hours"
            description="Suppress browser push delivery during these hours"
            checked={quietHoursEnabled}
            onCheckedChange={setQuietHoursEnabled}
          />
          {quietHoursEnabled && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="quiet-hours-start">Start</Label>
                <Input
                  id="quiet-hours-start"
                  type="time"
                  value={quietHoursStart}
                  onChange={(e) => setQuietHoursStart(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quiet-hours-end">End</Label>
                <Input
                  id="quiet-hours-end"
                  type="time"
                  value={quietHoursEnd}
                  onChange={(e) => setQuietHoursEnd(e.target.value)}
                />
              </div>
              <p className="text-xs text-muted-foreground sm:col-span-2">
                Quiet hours use your browser timezone ({quietHoursTimezone}).
                In-app history is preserved.
              </p>
            </div>
          )}
        </div>

        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Preferences"}
        </Button>
      </CardContent>
    </Card>
  )
}

function ToggleRow({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string
  description: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="space-y-0.5">
        <Label>{label}</Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}
