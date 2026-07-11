# Wealth Compass

## Tech Stack
- React 19 + TypeScript ~6
- Tailwind CSS v4 (via `@gaia/ui`)
- shadcn/ui v4 (via `@gaia/ui`)
- TanStack Router
- Convex (backend, auth, real-time)

## Package Manager
- Use `pnpm` for all package operations
- Use `pnpx` for executable commands (NOT npx)

## Linear Workflow
Each task follows this workflow for Linear issue status:
1. **Before starting work:** Move issue to "In Progress" using `linear_save_issue`
2. **During work:** Complete all steps in the task
3. **After completing all steps:** Move issue to "In Review" using `linear_save_issue`
4. **Wait for user approval** before moving to next task
5. **After user approves:** Issue stays in "In Review" until user explicitly approves

**Status transitions:**
```
Backlog -> In Progress -> In Review -> (user approves) -> Done
```

**Important:** Do NOT move issues to "Done" automatically. The user reviews and approves before marking as done.

## Shadcn Component Workflow
When building UI, always check if a shadcn/ui component exists that could help.
If a shadcn component is needed:
1. Install it in `packages/ui` using `pnpm dlx shadcn@latest add <component> -c apps/storybook`
2. Create a Storybook story for it in `apps/storybook/src/stories/`
3. Import components from `@gaia/ui/components/<name>`

## Path Aliases
- `@wealth-compass/*` -> `./src/*`

## Convex Conventions
- Queries are read-only, mutations write data, actions call external APIs
- All Convex functions are in the `convex/` directory at project root
- Use `useQuery` and `useMutation` hooks from Convex React client

## File Structure
- Routes: `src/routes/` (TanStack Router file-based routing)
- Components: `src/components/`
- Utilities: `src/lib/`
- Convex: `convex/` (project root, not src)
