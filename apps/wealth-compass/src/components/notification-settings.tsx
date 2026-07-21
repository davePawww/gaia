import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@gaia/ui/components/card";
import { Switch } from "@gaia/ui/components/switch";
import { Label } from "@gaia/ui/components/label";
import { Input } from "@gaia/ui/components/input";
import { Button } from "@gaia/ui/components/button";
import { Separator } from "@gaia/ui/components/separator";
import { Skeleton } from "@gaia/ui/components/skeleton";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import {
  subscribeToPush,
  savePushSubscription,
  unsubscribeFromPush,
  getNotificationPermission,
  registerServiceWorker,
} from "../lib/notifications";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY ?? "";

export function NotificationSettings() {
  const prefs = useQuery(api.notifications.getPreferences);
  const upsertPrefs = useMutation(api.notifications.upsertPreferences);
  const [saving, setSaving] = useState(false);

  const [incomeAllocationReminder, setIncomeAllocationReminder] = useState(false);
  const [goalDeadlineApproaching, setGoalDeadlineApproaching] = useState(false);
  const [goalCompleted, setGoalCompleted] = useState(false);
  const [spendingLimitWarning, setSpendingLimitWarning] = useState(false);
  const [monthlySpendingSummary, setMonthlySpendingSummary] = useState(false);
  const [spendingLimitThreshold, setSpendingLimitThreshold] = useState("50");
  const [goalDeadlineDays, setGoalDeadlineDays] = useState("7");

  const [pushEnabled, setPushEnabled] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("unsupported");

  useEffect(() => {
    getNotificationPermission().then(setPermission);
    registerServiceWorker();
  }, []);

  useEffect(() => {
    if (prefs) {
      setIncomeAllocationReminder(prefs.incomeAllocationReminder);
      setGoalDeadlineApproaching(prefs.goalDeadlineApproaching);
      setGoalCompleted(prefs.goalCompleted);
      setSpendingLimitWarning(prefs.spendingLimitWarning);
      setMonthlySpendingSummary(prefs.monthlySpendingSummary);
      setSpendingLimitThreshold(String(prefs.spendingLimitThreshold));
      setGoalDeadlineDays(String(prefs.goalDeadlineDays));
    }
  }, [prefs]);

  useEffect(() => {
    if (permission === "granted") {
      navigator.serviceWorker?.ready?.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          setPushEnabled(!!sub);
        });
      });
    }
  }, [permission]);

  const handleTogglePush = async (enabled: boolean) => {
    if (!VAPID_PUBLIC_KEY) {
      toast.error("Push notifications are not configured");
      return;
    }
    if (enabled) {
      const sub = await subscribeToPush(VAPID_PUBLIC_KEY);
      if (sub) {
        await savePushSubscription(sub);
        setPushEnabled(true);
        toast.success("Push notifications enabled");
      } else {
        toast.error("Could not enable push notifications");
      }
    } else {
      await unsubscribeFromPush();
      setPushEnabled(false);
      toast.success("Push notifications disabled");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await upsertPrefs({
        incomeAllocationReminder,
        goalDeadlineApproaching,
        goalCompleted,
        spendingLimitWarning,
        monthlySpendingSummary,
        spendingLimitThreshold: Number(spendingLimitThreshold) || 50,
        goalDeadlineDays: Number(goalDeadlineDays) || 7,
      });
      toast.success("Notification preferences saved");
    } catch {
      toast.error("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

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
    );
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
          <div className="flex items-center justify-between">
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
        </div>

        <Separator />

        <div className="space-y-4">
          <ToggleRow
            label="Income Allocation Reminder"
            description="Remind you to allocate income when you haven't this month"
            checked={incomeAllocationReminder}
            onCheckedChange={setIncomeAllocationReminder}
          />
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
            <Label htmlFor="spending-threshold">Spending Limit Threshold ($)</Label>
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

        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Preferences"}
        </Button>
      </CardContent>
    </Card>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <Label>{label}</Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
