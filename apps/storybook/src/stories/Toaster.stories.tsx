import type { Meta, StoryObj } from "@storybook/react"
import { useEffect } from "react"
import { ThemeProvider } from "next-themes"
import { toast } from "sonner"
import { Button } from "@gaia/ui/components/button"
import { Toaster } from "@gaia/ui/components/sonner"

function ToastDemo() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={() => toast("Event created", { description: "Nov 11 at 3:00 PM" })}
        >
          Default Toast
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast.success("Saved!", { description: "Your changes have been saved." })
          }
        >
          Success
        </Button>
        <Button
          variant="outline"
          onClick={() => toast.error("Error", { description: "Something went wrong." })}
        >
          Error
        </Button>
        <Button
          variant="outline"
          onClick={() => toast.info("Heads up", { description: "New update available." })}
        >
          Info
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast.warning("Warning", { description: "This action cannot be undone." })
          }
        >
          Warning
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast("Loading...", {
              description: "Please wait",
              duration: 1000000,
            })
          }
        >
          Loading (dismiss to stop)
        </Button>
      </div>
      <Toaster />
    </ThemeProvider>
  )
}

const meta: Meta<typeof Toaster> = {
  title: "Components/Toaster",
  component: ToastDemo,
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <ToastDemo />,
}

function AutoToast() {
  useEffect(() => {
    toast("Event created", { description: "Nov 11 at 3:00 PM" })
    toast.success("Saved!", { description: "Your changes have been saved." })
    setTimeout(() => {
      toast.error("Connection lost", { description: "Please check your network." })
    }, 200)
  }, [])

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <Toaster />
    </ThemeProvider>
  )
}

export const Visible: Story = {
  render: () => <AutoToast />,
}
