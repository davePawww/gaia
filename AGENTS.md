# gaia — shadcn/ui monorepo

**pnpm workspace monorepo** with Turbo (v2) task orchestration.

## Workspace layout

- `apps/storybook` — Storybook v10 for component development and documentation
- `packages/ui` — shared UI component lib (`@gaia/ui`). shadcn components land in `src/components/`

## Developer commands (run from root)

| Command | What it runs |
|---------|-------------|
| `pnpm dev` | `turbo dev` |
| `pnpm lint` | `turbo lint` — ESLint flat config across packages |
| `pnpm format` | `turbo format` — Prettier with `prettier-plugin-tailwindcss` |
| `pnpm typecheck` | `turbo typecheck` — `tsc --noEmit` across packages |
| `pnpm storybook` | starts Storybook on port 6006 (run from `apps/storybook/`) |

**Order matters:** always `lint → typecheck` before committing.

## Framework & toolchain quirks

- **No test framework** configured — do not assume Jest, Vitest, or Playwright exist
- **TypeScript ~6** with `erasableSyntaxOnly: true` — no enums, no namespaces, no `private`/`public` parameter properties
- **Tailwind v4** — uses `@import "tailwindcss"` (not v3 PostCSS config), `@theme` directives, and `@custom-variant dark`
- **shadcn/ui v4** (base-nova style) — uses `@base-ui/react` primitives (not Radix), `@shadcn/tailwind.css` plugin, `tw-animate-css`
- **Path aliases**: `@gaia/ui/*` → `packages/ui/src/*` (configured per-app in tsconfig and vite config)
- **CSS entrypoint** is `packages/ui/src/styles/globals.css` — each app imports `@gaia/ui/globals.css` once
- **React 19** — stable, but be aware of removed APIs (e.g., deprecated lifecycle methods, removed propTypes inference)
- **Dark mode** — toggled via Storybook themes addon (docs/accessibility/themes panels enabled)
- **Storybook addons** — docs (autodocs), a11y, themes

## shadcn/ui component workflow

Add components with:

```bash
pnpm dlx shadcn@latest add <component> -c apps/storybook
```

This writes to `packages/ui/src/components/`. Import from `@gaia/ui/components/<name>`:

```tsx
import { Button } from "@gaia/ui/components/button"
import { Badge } from "@gaia/ui/components/badge"
```

## Adding npm packages

Install at the workspace root (`pnpm add -w` for root deps, `pnpm add` in the subdirectory for per-package deps).

## Pre-commit checklist

- No lint errors (`pnpm lint`)
- No type errors (`pnpm typecheck`)
