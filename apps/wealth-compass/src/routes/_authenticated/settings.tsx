import { createFileRoute } from "@tanstack/react-router"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@gaia/ui/components/card"
import { Button } from "@gaia/ui/components/button"
import { Input } from "@gaia/ui/components/input"
import { Label } from "@gaia/ui/components/label"
import { Separator } from "@gaia/ui/components/separator"
import { Skeleton } from "@gaia/ui/components/skeleton"
import { toast } from "sonner"
import { useTheme } from "@gaia/ui/lib/theme-provider"
import { useCurrency } from "@wealth-compass/lib/use-currency"
import { CurrencySelector } from "@wealth-compass/components/currency-selector"
import { useState, useEffect } from "react"

function SettingsPage() {
  const { theme, setTheme } = useTheme()
  useCurrency()
  const jars = useQuery(api.jars.getUserJars)
  const updateJar = useMutation(api.jars.updateJar)
  const user = useQuery(api.users.getCurrentUser)

  const isLoading = jars === undefined || user === undefined

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={user?.name ?? ""} disabled />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user?.email ?? ""} disabled />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Jar Configuration</CardTitle>
              <CardDescription>
                Customize your jar names and colors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {jars?.map((jar) => (
                <JarSettings key={jar._id} jar={jar} onUpdate={updateJar} />
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize the look and feel
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <div className="flex gap-2">
                  {(["light", "dark", "system"] as const).map((t) => (
                    <Button
                      key={t}
                      variant={theme === t ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTheme(t)}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Currency</Label>
                <CurrencySelector />
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

function JarSettings({
  jar,
  onUpdate,
}: {
  jar: { _id: string; name: string; color: string; percentage: number }
  onUpdate: any
}) {
  const [name, setName] = useState(jar.name)
  const [color, setColor] = useState(jar.color)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setName(jar.name)
    setColor(jar.color)
  }, [jar.name, jar.color])

  const handleSave = async () => {
    setSaving(true)
    try {
      await onUpdate({
        jarId: jar._id,
        name,
        color,
      })
      toast.success(`${name} updated`)
    } catch {
      toast.error("Failed to update jar")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex items-end gap-4 rounded-lg border p-3">
      <div className="flex-1 space-y-2">
        <Label>Name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="w-24 space-y-2">
        <Label>Color</Label>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="h-9 w-full cursor-pointer rounded border"
        />
      </div>
      <div className="w-20 space-y-2">
        <Label>%</Label>
        <Input value={`${jar.percentage}%`} disabled />
      </div>
      <Button
        size="sm"
        onClick={handleSave}
        disabled={saving || (name === jar.name && color === jar.color)}
      >
        {saving ? "..." : "Save"}
      </Button>
    </div>
  )
}

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
})
