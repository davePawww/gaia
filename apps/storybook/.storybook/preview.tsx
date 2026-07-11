import "@gaia/ui/globals.css"
import type { Preview } from "@storybook/react-vite"
import { withThemeByClassName } from "@storybook/addon-themes"

const preview: Preview = {
  tags: ["autodocs"],
  decorators: [
    withThemeByClassName({
      defaultTheme: "light",
      themes: {
        light: "light",
        dark: "dark",
      },
    }),
  ],
  parameters: {
    layout: "centered",
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
}

export default preview
