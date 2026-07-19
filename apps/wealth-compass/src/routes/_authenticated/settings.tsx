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
import { PERSONALITY_PRESETS, DEFAULT_JARS, JAR_FULL_NAMES } from "../../../convex/constants"
import { useState, useEffect } from "react"
import { Trash2, Plus } from "lucide-react"

function SettingsPage() {
  const { theme, setTheme } = useTheme()
  useCurrency()
  const jars = useQuery(api.jars.getUserJars)
  const categories = useQuery(api.categories.getUserCategories)
  const updateJar = useMutation(api.jars.updateJar)
  const updateAllJarPercentages = useMutation(api.jars.updateAllJarPercentages)
  const user = useQuery(api.users.getCurrentUser)

  const isLoading = jars === undefined || user === undefined || categories === undefined

  const handlePresetSelect = async (preset: (typeof PERSONALITY_PRESETS)[number]) => {
    try {
      await updateAllJarPercentages({ percentages: preset.percentages })
      toast.success(`Applied "${preset.name}" preset`)
    } catch {
      toast.error("Failed to apply preset")
    }
  }

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
              <CardTitle>Money Personality</CardTitle>
              <CardDescription>
                Choose a preset allocation based on your money personality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                {PERSONALITY_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => handlePresetSelect(preset)}
                    className="group flex flex-col rounded-lg border p-4 text-left transition-all hover:border-primary hover:shadow-md"
                  >
                    <span className="text-sm font-semibold">{preset.name}</span>
                    <span className="mt-1 text-xs text-muted-foreground">
                      {preset.description}
                    </span>
                    <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-muted">
                      {DEFAULT_JARS.map((jar) => (
                        <div
                          key={jar.name}
                          style={{
                            width: `${preset.percentages[jar.name as keyof typeof preset.percentages]}%`,
                            backgroundColor: jar.color,
                          }}
                          className="transition-all"
                          title={`${jar.fullName}: ${preset.percentages[jar.name as keyof typeof preset.percentages]}%`}
                        />
                      ))}
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                      {DEFAULT_JARS.map((jar) => (
                        <div key={jar.name} className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: jar.color }}
                          />
                          <span className="text-muted-foreground">
                            {jar.name} {preset.percentages[jar.name as keyof typeof preset.percentages]}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </button>
                ))}
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
              <CardTitle>Transaction Categories</CardTitle>
              <CardDescription>
                Manage sub-categories for each jar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {jars?.map((jar) => (
                <CategorySettings
                  key={jar._id}
                  jarName={jar.name}
                  categories={categories?.filter((c) => c.jarName === jar.name) ?? []}
                />
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
    <div className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-end sm:gap-4">
      <div className="flex-1 space-y-2">
        <Label htmlFor={`jar-name-${jar._id}`}>Name</Label>
        <Input
          id={`jar-name-${jar._id}`}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="w-full space-y-2 sm:w-24">
        <Label htmlFor={`jar-color-${jar._id}`}>Color</Label>
        <input
          id={`jar-color-${jar._id}`}
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          aria-label={`${name} color`}
          className="h-9 w-full cursor-pointer rounded border border-input bg-background"
        />
      </div>
      <div className="w-full space-y-2 sm:w-20">
        <Label htmlFor={`jar-pct-${jar._id}`}>%</Label>
        <Input
          id={`jar-pct-${jar._id}`}
          value={`${jar.percentage}%`}
          disabled
        />
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

function CategorySettings({
  jarName,
  categories,
}: {
  jarName: string
  categories: { _id: string; name: string }[]
}) {
  const [newCategory, setNewCategory] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")
  const addCategory = useMutation(api.categories.addCategory)
  const renameCategory = useMutation(api.categories.renameCategory)
  const deleteCategory = useMutation(api.categories.deleteCategory)
  const resetToDefaults = useMutation(api.categories.resetToDefaults)

  const handleAdd = async () => {
    if (!newCategory.trim()) return
    try {
      await addCategory({ jarName, name: newCategory.trim() })
      setNewCategory("")
      toast.success("Category added")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add category")
    }
  }

  const handleRename = async (categoryId: string) => {
    if (!editingName.trim()) return
    try {
      await renameCategory({ categoryId: categoryId as any, name: editingName.trim() })
      setEditingId(null)
      toast.success("Category renamed")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to rename category")
    }
  }

  const handleDelete = async (categoryId: string) => {
    try {
      await deleteCategory({ categoryId: categoryId as any })
      toast.success("Category deleted")
    } catch {
      toast.error("Failed to delete category")
    }
  }

  const handleReset = async () => {
    try {
      await resetToDefaults({ jarName })
      toast.success("Reset to defaults")
    } catch {
      toast.error("Failed to reset categories")
    }
  }

  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {JAR_FULL_NAMES[jarName] ?? jarName}
          </span>
          <span className="text-xs text-muted-foreground">
            ({categories.length} categories)
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleReset}>
          Reset to defaults
        </Button>
      </div>
      <div className="mt-3 space-y-2">
        {categories.map((cat) => (
          <div key={cat._id} className="flex items-center gap-2">
            {editingId === cat._id ? (
              <>
                <Input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="h-8 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRename(cat._id)
                    if (e.key === "Escape") setEditingId(null)
                  }}
                  autoFocus
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRename(cat._id)}
                  disabled={!editingName.trim()}
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingId(null)}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <span
                  className="flex-1 text-sm cursor-pointer hover:underline"
                  onClick={() => {
                    setEditingId(cat._id)
                    setEditingName(cat.name)
                  }}
                >
                  {cat.name}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(cat._id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </>
            )}
          </div>
        ))}
        <div className="flex items-center gap-2 pt-1">
          <Input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="New category..."
            className="h-8 text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd()
            }}
          />
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={handleAdd}
            disabled={!newCategory.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
})
