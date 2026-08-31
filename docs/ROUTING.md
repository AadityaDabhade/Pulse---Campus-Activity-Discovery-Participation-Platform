# Routing

Pulse uses **TanStack Router's file-based routing**, generated from `src/routes/*.tsx` into `src/routeTree.gen.ts`. That generated file must never be hand-edited — it is rebuilt automatically from the route files by the TanStack Router Vite plugin.

## File-Naming Conventions

Documented in the repo itself at [src/routes/README.md](../src/routes/README.md):

| File | Resulting URL |
|---|---|
| `index.tsx` | `/` |
| `about.tsx` | `/about` |
| `users/index.tsx` | `/users` |
| `users/$id.tsx` | `/users/:id` (dynamic segment — bare `$`, no curly braces) |
| `posts/{-$category}.tsx` | `/posts/:category?` (optional segment) |
| `files/$.tsx` | `/files/*` (splat — read via `_splat` param) |
| `_layout.tsx` | Layout route, renders children via `<Outlet />` |
| `__root.tsx` | App shell, wraps every page |

Do **not** introduce `src/pages/`, `src/routes/_app/index.tsx`, or `app/layout.tsx` — these are conventions from other frameworks (Next.js/Remix) and are explicitly called out as incorrect for this project.

## App Shell — `__root.tsx`

[src/routes/__root.tsx](../src/routes/__root.tsx) defines:
- Global `<head>` metadata (title, description, Open Graph tags, viewport, favicon, stylesheet link).
- `RootShell` — the outer `<html>`/`<head>`/`<body>` document wrapper (SSR shell).
- `RootComponent` — wraps all routes in `QueryClientProvider` and renders `<Outlet />`.
- `notFoundComponent` — a generic 404 page with a "Go home" link.
- `errorComponent` — a generic error boundary UI that also calls `reportLovableError()` for telemetry and offers "Try again" (calls `router.invalidate()`) / "Go home".

## Full Route Table

| Route file | URL | Purpose |
|---|---|---|
| [index.tsx](../src/routes/index.tsx) | `/` | Onboarding flow: Welcome → Auth (login/signup) → Profile setup → Hall selection → Celebrate. Redirects to `/home` if `pulse_visited` is already set in `localStorage`. |
| [home.tsx](../src/routes/home.tsx) | `/home` | Discover feed: campus updates + browsable activity-type categories |
| [activity.$type.tsx](../src/routes/activity.$type.tsx) | `/activity/:type` | Listing of activities for one type (e.g. `tea-coffee`); only `tea-coffee` has real seed data |
| [activity.index.tsx](../src/routes/activity.index.tsx) | `/activity` | Activity Hub — Hosted/Joined tabs × Requested/Upcoming/Ongoing/Completed filters |
| [activity.new.tsx](../src/routes/activity.new.tsx) | `/activity/new` | Create-activity form. Also handles editing via `?edit=<id>` search param (`validateSearch`) |
| [activity.view.$id.tsx](../src/routes/activity.view.$id.tsx) | `/activity/view/:id` | Participant-facing activity detail view |
| [activity.manage.$id.tsx](../src/routes/activity.manage.$id.tsx) | `/activity/manage/:id` | Host-facing activity management view |
| [activity.$id.notifications.tsx](../src/routes/activity.$id.notifications.tsx) | `/activity/:id/notifications` | Per-activity notifications & reminders tabs |
| [profile.index.tsx](../src/routes/profile.index.tsx) | `/profile` | Profile view + inline edit form + stats (hosted/joined counts) |
| [profile.edit.tsx](../src/routes/profile.edit.tsx) | `/profile/edit` | Standalone edit-profile form (near-duplicate of `/profile`'s inline form — see FRONTEND_ARCHITECTURE.md) |
| [profile.password.tsx](../src/routes/profile.password.tsx) | `/profile/password` | Change-password form (not connected to any real auth backend) |
| [host.verify.tsx](../src/routes/host.verify.tsx) | `/host/verify` | One-time host-eligibility flow (phone verification + profile photo) gating first-time hosting |
| [settings.index.tsx](../src/routes/settings.index.tsx) | `/settings` | Settings hub, links to sub-pages, logout |
| [settings.notifications.tsx](../src/routes/settings.notifications.tsx) | `/settings/notifications` | Global notification on/off toggle (localStorage only) |
| [settings.privacy.tsx](../src/routes/settings.privacy.tsx) | `/settings/privacy` | Privacy toggles (phone visibility, hall visibility, discoverability) — localStorage only |
| [settings.founder.tsx](../src/routes/settings.founder.tsx) | `/settings/founder` | Static "Founder's Note" content |
| [settings.about.tsx](../src/routes/settings.about.tsx) | `/settings/about` | Static app version/build info |
| [settings.help.tsx](../src/routes/settings.help.tsx) | `/settings/help` | Static `mailto:` support links |
| [settings.terms.tsx](../src/routes/settings.terms.tsx) | `/settings/terms` | Static Terms & Conditions copy |

## Route Parameters & Search Params

- Dynamic params use TanStack Router's typed `Route.useParams()` (e.g. `const { id } = Route.useParams()` in `activity.view.$id.tsx`).
- `activity.new.tsx` is the only route using `validateSearch` for a typed search param (`edit?: string`), reused for both create and edit modes of the same form.

## Navigation Primitives Used

- `<Link>` for declarative navigation (preserves TanStack Router's type-safe route params).
- `useNavigate()` for imperative navigation (e.g. after form submission).
- `useRouter()` + `router.history.back()` for back-navigation, generally guarded by `window.history.length > 1` with a fallback destination (e.g. back to `/activity` or `/settings`) if there's no history to pop.
- `useRouterState({ select: (s) => s.location.pathname })` used in `BottomNav` to determine active-tab highlighting.

## Route Protection — Current State

**There is no server-side or router-level auth guard on any route.** No route uses `beforeLoad` or a loader to check authentication/authorization. The only two forms of "gating" that exist are both client-side and easily bypassed by direct navigation:

1. **First-run redirect**: `index.tsx` checks `localStorage.getItem("pulse_visited")` in a `useEffect` and redirects to `/home` if set — this only prevents re-showing onboarding, it is not an auth check.
2. **Host-readiness redirect**: `BottomNav`'s "+" create button checks `isHostReady(getProfile())` (phone verified + phone number + photo present) and routes to `/host/verify` instead of `/activity/new` if not ready — but a user can still navigate directly to `/activity/new` by URL and bypass this check entirely.

**No route currently checks for a logged-in session at all.** Any URL in the app is directly reachable regardless of onboarding or "login" state. This must be addressed once real authentication exists — see [AUTHENTICATION_PLAN.md](./AUTHENTICATION_PLAN.md).

## SEO / Head Metadata

Every route defines a `head()` function returning `meta` (and occasionally `links`) — `title`, `description`, and Open Graph tags are set per-route. This is already in good shape and should be preserved/extended as new routes are added.

## Open Questions (TBD)

- Should route-level auth guards be implemented via TanStack Router's `beforeLoad`/loader mechanism once a backend exists, or handled entirely by a higher-level layout route? — **TBD**
- Is a dedicated `_authenticated` layout route (wrapping all routes except onboarding) the intended pattern going forward? — **TBD**
- Are there plans for deep-linking / shareable activity URLs to unauthenticated users (e.g. a public preview of an activity before login)? — **TBD**
