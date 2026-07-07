# gaia — shadcn/ui monorepo

**pnpm workspace monorepo** with Turbo (v2) task orchestration.

## Workspace layout

- `apps/web` — Vite 8 + React 19 app. Entry: `src/main.tsx` → `src/App.tsx`
- `packages/ui` — shared UI component lib (`@workspace/ui`). shadcn components land in `src/components/`

## Developer commands (run from root)

| Command | What it runs |
|---------|-------------|
| `pnpm dev` | `turbo dev` — starts Vite dev server |
| `pnpm build` | `turbo build` — `tsc -b && vite build` in `apps/web` |
| `pnpm lint` | `turbo lint` — ESLint flat config across packages |
| `pnpm format` | `turbo format` — Prettier with `prettier-plugin-tailwindcss` |
| `pnpm typecheck` | `turbo typecheck` — `tsc --noEmit` across packages |

**Order matters:** always `lint → typecheck → build` before committing.

## Framework & toolchain quirks

- **No test framework** configured — do not assume Jest, Vitest, or Playwright exist
- **TypeScript ~6** with `erasableSyntaxOnly: true` — no enums, no namespaces, no `private`/`public` parameter properties
- **Tailwind v4** — uses `@import "tailwindcss"` (not v3 PostCSS config), `@theme` directives, and `@custom-variant dark`
- **shadcn/ui v4** (base-nova style) — uses `@base-ui/react` primitives (not Radix), `@shadcn/tailwind.css` plugin, `tw-animate-css`
- **Path aliases** (configured in `apps/web/tsconfig.app.json` and `vite.config.ts`):
  - `@/` → `apps/web/src/`
  - `@workspace/ui/*` → `packages/ui/src/*`
- **CSS entrypoint** is `packages/ui/src/styles/globals.css` — imported in `apps/web/src/main.tsx`
- **React 19** — stable, but be aware of removed APIs (e.g., deprecated lifecycle methods, removed propTypes inference)
- **Dark mode** via `ThemeProvider` — press `d` key to toggle, persisted to localStorage key `"theme"`

## shadcn/ui component workflow

Add components with `pnpm dlx shadcn@latest add <component> -c apps/web`.

This writes to `packages/ui/src/components/`. Import from `@workspace/ui/components/<name>`:
```tsx
import { Button } from "@workspace/ui/components/button"
```

## Adding npm packages

Install at the workspace root (`pnpm add -w` for root deps, `pnpm add` in the subdirectory for per-package deps).

## Pre-commit checklist

- No lint errors (`pnpm lint`)
- No type errors (`pnpm typecheck`)
- Build succeeds (`pnpm build`)
