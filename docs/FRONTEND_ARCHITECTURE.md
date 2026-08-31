# Frontend Architecture

## Framework & Tooling

| Concern | Choice | Notes |
|---|---|---|
| UI framework | React 19 | |
| App framework | TanStack Start | File-based routing + SSR |
| Router | TanStack Router | Routes generated into `src/routeTree.gen.ts` — **never hand-edit this file** |
| Build tool | Vite 8 | Config wrapped by `@lovable.dev/vite-tanstack-config`, see [vite.config.ts](../vite.config.ts) |
| Styling | Tailwind CSS v4 | CSS-first configuration (no `tailwind.config.js`); tokens defined in [src/styles.css](../src/styles.css) |
| Component primitives | shadcn/ui, "new-york" style | See [components.json](../components.json); icon library is `lucide-react` |
| Data fetching | TanStack Query | Installed and wired into router context, **not currently used by any component** |
| Forms | `react-hook-form` + `@hookform/resolvers` + `zod` | Installed but **not currently used** — all existing forms use plain `useState` |
| Language | TypeScript, strict mode | See [tsconfig.json](../tsconfig.json) |
| Linting/formatting | ESLint (flat config) + Prettier | See [eslint.config.js](../eslint.config.js), [.prettierrc](../.prettierrc) |
| Package manager | Bun (primary, per `bun.lock`/`bunfig.toml`); a `package-lock.json` also exists | Authoritative package manager is **TBD** |

## Folder Structure

```
src/
  routes/                # File-based routes — one file = one URL (see ROUTING.md)
    __root.tsx            # App shell: <html>, QueryClientProvider, error/404 boundaries
    README.md              # Routing conventions reference (checked into the repo itself)
    *.tsx                   # Individual route files
  components/
    pulse/                 # Product-specific components (Pulse's own design vocabulary)
    ui/                     # shadcn/ui primitives (Radix-based), largely stock
  lib/
    activity-store.ts       # localStorage-backed Activity data store + hooks
    profile-store.ts        # localStorage-backed user profile store + hooks
    tea-status.ts            # localStorage-backed demo/simulation state for the seeded "Tea & Coffee" flow
    discover-data.ts         # Static taxonomy (activity categories/types) + seed Activity data
    utils.ts                  # `cn()` class-merging helper (clsx + tailwind-merge)
    error-capture.ts          # Out-of-band capture of the last uncaught error (client + server)
    error-page.ts             # Static HTML fallback error page (used by server.ts)
    lovable-error-reporting.ts # Forwards runtime errors to the Lovable editor's telemetry hooks
  hooks/
    use-mobile.tsx            # `useIsMobile()` — viewport width media-query hook
  router.tsx                  # `getRouter()` — constructs the TanStack Router + QueryClient
  server.ts                    # Custom SSR entry; normalizes swallowed 500s into a friendly error page
  start.ts                      # `createStart()` instance + request-level error middleware
  styles.css                     # Tailwind v4 theme tokens, base layer, custom animation utilities
public/
  favicon.ico
.lovable/                        # Lovable platform metadata (project id/template/revision)
components.json                   # shadcn/ui codegen configuration
```

No `src/pages/`, `src/api/`, or `src/server/` (business-logic) directories exist. `src/routes/README.md` explicitly warns against introducing Next.js/Remix-style folder conventions (`src/pages/`, `app/layout.tsx`) since this project uses TanStack Start's own file-based routing rules.

## Path Aliases

`@/*` resolves to `src/*` (configured in [tsconfig.json](../tsconfig.json) and mirrored in `components.json`'s `aliases` block). All internal imports use this alias rather than relative paths (e.g. `@/components/pulse/Logo`, `@/lib/utils`).

## Rendering Model

- Every screen is a full-viewport "phone" experience: routes wrap their content in `PhoneFrame`/`Screen` ([src/components/pulse/PhoneFrame.tsx](../src/components/pulse/PhoneFrame.tsx)), which centers a max-440px-wide column and, above the `sm` breakpoint, renders it as a rounded, shadowed card against a neutral backdrop — simulating a phone screen on desktop. There is **no separate desktop layout**; this is a deliberate mobile-first (arguably mobile-only) design.
- SSR is enabled (TanStack Start default) but nearly all interactivity and all data is client-only; most components guard browser-only APIs with `typeof window === "undefined"` checks rather than using route loaders.

## Naming & Code Conventions Observed

- **Components**: PascalCase filenames matching the exported component (`ActivityCard.tsx` → `ActivityCard`).
- **Routes**: TanStack Router file-based naming — dots denote path segments, `$param` denotes dynamic segments (e.g. `activity.$id.notifications.tsx` → `/activity/:id/notifications`). See [ROUTING.md](./ROUTING.md) for the full convention table.
- **Hooks**: `use*` prefix, colocated with the store/data they wrap (`useProfile`, `useHosted`, `useJoined`, `useTeaStatus`, `useIsMobile`) rather than in a single central hooks file.
- **Styling**: Utility-first Tailwind classes inline in JSX; a single `cn()` helper (clsx + tailwind-merge) is used everywhere class lists need conditional merging. No CSS Modules, no styled-components, no separate stylesheet per component.
- **State stores**: Each store (`profile-store.ts`, `activity-store.ts`, `tea-status.ts`) follows the same shape — plain read/write functions operating on `localStorage`, a `CustomEvent` dispatched on write for same-tab reactivity, and a `use*` hook subscribing to both that event and the native `storage` event for cross-tab sync. See [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md) for full detail.
- **Type-only exports**: Domain types (`Activity`, `StoredActivity`, `Profile`, `TeaStatus`, etc.) are colocated in the same file as the store/data that produces them, not in a separate `types/` directory.

## Build/Dev Scripts

From [package.json](../package.json):

| Script | Command |
|---|---|
| `dev` | `vite dev` |
| `build` | `vite build` |
| `build:dev` | `vite build --mode development` |
| `preview` | `vite preview` |
| `lint` | `eslint .` |
| `format` | `prettier --write .` |

No test script exists — **no test runner is configured in this repository at all** (no Jest/Vitest/Playwright/Cypress dependency present).

## Known Frontend Debt (for context, not action items in this document)

- `profile.index.tsx` and `profile.edit.tsx` are near-duplicate implementations of the same form.
- The "Tea & Coffee" seeded demo flow (`tea-status.ts`) is interleaved with the general-purpose `activity-store.ts` logic inside `activity.index.tsx` and `activity.view.$id.tsx`, rather than being cleanly separated or removed.
- Design tokens for font sizes/heights are frequently inlined as arbitrary Tailwind values (e.g. `text-[13.5px]`) rather than a shared type scale — see [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md).

This document describes the frontend as it exists today; it does not propose changes to it.
