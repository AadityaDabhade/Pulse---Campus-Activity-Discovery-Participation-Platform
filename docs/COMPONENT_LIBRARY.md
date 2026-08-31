# Component Library

Components live in two tiers under `src/components/`:

- **`ui/`** — stock/near-stock [shadcn/ui](https://ui.shadcn.com) primitives (Radix-based), style `new-york` (see [components.json](../components.json)).
- **`pulse/`** — Pulse's own product-level components, built from `ui/` primitives and raw Tailwind.

## `components/ui/` — Primitives (shadcn/ui)

These are largely stock shadcn components, generated via the shadcn CLI (`components.json` config: base color `slate`, icon library `lucide-react`, `cssVariables: true`). They are general-purpose and not Pulse-specific.

| Component | File | Notes on current usage in Pulse |
|---|---|---|
| Accordion | `accordion.tsx` | Not currently used by any route |
| Alert / AlertDialog | `alert.tsx`, `alert-dialog.tsx` | Not currently used — Pulse instead hand-rolls `ConfirmDialog` (see below) |
| AspectRatio | `aspect-ratio.tsx` | Not currently used |
| Avatar | `avatar.tsx` | Not currently used — Pulse instead hand-rolls `Avatar` inline in `profile.index.tsx` |
| Badge | `badge.tsx` | Not currently used |
| Breadcrumb | `breadcrumb.tsx` | Not currently used |
| Button | `button.tsx` | Not currently used — Pulse uses its own `PulseButton` |
| Calendar | `calendar.tsx` | Not currently used — date entry uses native `<input type="date">` |
| Card | `card.tsx` | Not currently used — Pulse uses its own `ActivityCard`/ad hoc card markup |
| Carousel | `carousel.tsx` | Not currently used |
| Chart | `chart.tsx` | Not currently used (no data visualization exists in the product yet) |
| Checkbox | `checkbox.tsx` | Not currently used |
| Collapsible | `collapsible.tsx` | Not currently used — notification "N read" expand/collapse is hand-rolled state instead |
| Command | `command.tsx` | Not currently used |
| ContextMenu | `context-menu.tsx` | Not currently used |
| Dialog | `dialog.tsx` | Not currently used — Pulse hand-rolls all dialogs (`ConfirmDialog`, `LeaveActivityDialog`) instead of this primitive |
| Drawer | `drawer.tsx` | Not currently used |
| DropdownMenu | `dropdown-menu.tsx` | Not currently used |
| Form | `form.tsx` (react-hook-form wrapper) | Not currently used — all forms use plain `useState` |
| HoverCard | `hover-card.tsx` | Not currently used |
| InputOTP | `input-otp.tsx` | **Used** — onboarding email OTP entry in `index.tsx` |
| Input | `input.tsx` | Not currently used — Pulse uses its own `PulseInput` |
| Label | `label.tsx` | Not currently used |
| Menubar | `menubar.tsx` | Not currently used |
| NavigationMenu | `navigation-menu.tsx` | Not currently used |
| Pagination | `pagination.tsx` | Not currently used |
| Popover | `popover.tsx` | Not currently used |
| Progress | `progress.tsx` | Not currently used |
| RadioGroup | `radio-group.tsx` | Not currently used |
| Resizable | `resizable.tsx` | Not currently used |
| ScrollArea | `scroll-area.tsx` | Not currently used — native overflow scroll + `scrollbar-none` utility used instead |
| Select | `select.tsx` | Not currently used — Pulse uses its own `PulseSelect` (native `<select>`-based) |
| Separator | `separator.tsx` | Not currently used |
| Sheet | `sheet.tsx` | **Used** — `TopBar`'s side menu is the one place a real shadcn primitive backs a Pulse UI pattern |
| Sidebar | `sidebar.tsx` | Not currently used (no sidebar navigation pattern exists in the product) |
| Skeleton | `skeleton.tsx` | Not currently used (no loading-skeleton states exist anywhere) |
| Slider | `slider.tsx` | Not currently used |
| Sonner (toast) | `sonner.tsx` | Not currently used — no toast notifications appear anywhere currently |
| Switch | `switch.tsx` | Not currently used — Pulse hand-rolls toggle switches inline (e.g. Activity Chat toggle, notification settings) instead of this primitive |
| Table | `table.tsx` | Not currently used |
| Tabs | `tabs.tsx` | Not currently used — Pulse hand-rolls segmented controls (`SegButton`) instead |
| Textarea | `textarea.tsx` | Not currently used — raw `<textarea>` elements used instead |
| Toggle / ToggleGroup | `toggle.tsx`, `toggle-group.tsx` | Not currently used |
| Tooltip | `tooltip.tsx` | Not currently used |

**Observation:** a large fraction of the installed shadcn library is unused by the current product surface, and several patterns (dialogs, sheets, switches, tabs) are duplicated by hand-rolled Pulse equivalents rather than built on the matching primitive. This is worth a deliberate decision (consolidate on shadcn primitives vs. keep the bespoke Pulse versions) but is out of scope for this documentation pass — noted here as an accurate inventory only.

## `components/pulse/` — Product Components

| Component | File | Purpose | Key props |
|---|---|---|---|
| `PhoneFrame`, `Screen` | [PhoneFrame.tsx](../src/components/pulse/PhoneFrame.tsx) | Outer device-frame wrapper used by every route; `Screen` is the padded inner content column | `children`, `className` |
| `TopBar` | [TopBar.tsx](../src/components/pulse/TopBar.tsx) | Header with logo + hamburger menu (shadcn `Sheet`) linking to profile/settings/logout | none |
| `BottomNav` | [BottomNav.tsx](../src/components/pulse/BottomNav.tsx) | Fixed bottom navigation: Discover / Activity Hub tabs + floating "+" create-activity FAB (routes to `/host/verify` or `/activity/new` depending on host-readiness) | none |
| `Logo` | [Logo.tsx](../src/components/pulse/Logo.tsx) | "PULSE" wordmark (styled text, no image asset) | `className` |
| `ActivityCard` | [ActivityCard.tsx](../src/components/pulse/ActivityCard.tsx) | The core reusable activity card — shows emoji/title/host/time, joined/capacity, eligibility tags, meetup point, cost; either a "Join" CTA (`onJoin`) or a custom `actions` slot; `live` prop shows a "Live Now" pill | `activity`, `actions?`, `onJoin?`, `live?` |
| `ActivityTypeCard` | [ActivityTypeCard.tsx](../src/components/pulse/ActivityTypeCard.tsx) | Square emoji tile linking to `/activity/:type`, used in Discover's category rows | `slug`, `name`, `emoji`, `className?` |
| `CampusUpdateCard` | [CampusUpdateCard.tsx](../src/components/pulse/CampusUpdateCard.tsx) | Wide card for institute announcements on Discover | `eyebrow`, `title`, `meta`, `emoji`, `className?` |
| `HallCard` | [HallCard.tsx](../src/components/pulse/HallCard.tsx) | Selectable gradient tile for hall selection during onboarding | `name`, `gradient`, `selected?`, `onClick?` |
| `FeatureCard` | [FeatureCard.tsx](../src/components/pulse/FeatureCard.tsx) | Floating animated card with icon/title/description; **not referenced by any current route** (likely leftover from a marketing/landing section) | `title`, `description`, `icon`, `delay?` |
| `PulseButton` | [PulseButton.tsx](../src/components/pulse/PulseButton.tsx) | The app's standard button — variants `primary`/`ghost`/`outline`, `full`-width by default | standard button props + `variant?`, `full?` |
| `PulseInput` | [PulseInput.tsx](../src/components/pulse/PulseInput.tsx) | Standard text input with label/hint/leading/trailing slot support | standard input props + `label?`, `hint?`, `leading?`, `trailing?` |
| `PulseSelect` | [PulseSelect.tsx](../src/components/pulse/PulseSelect.tsx) | Native-`<select>`-based dropdown styled to match `PulseInput` | standard select props + `label?`, `options`, `placeholder?` |
| `SuccessCheck` | [SuccessCheck.tsx](../src/components/pulse/SuccessCheck.tsx) | Animated checkmark-in-circle used at the end of onboarding auth | none |
| `EmptyState` | [EmptyState.tsx](../src/components/pulse/EmptyState.tsx) | Generic "no activities of this type" empty state (Create One / Explore Other Activities) | `onExplore?`, `onCreate?` |
| `EmptyHosted` | [EmptyHosted.tsx](../src/components/pulse/EmptyHosted.tsx) | Empty state for Activity Hub → Hosted tab | `onCreate?` |
| `EmptyJoined` | [EmptyJoined.tsx](../src/components/pulse/EmptyJoined.tsx) | Empty state for Activity Hub → Joined tab, with faux ghost `ActivityCard`s in the background for visual texture | `onExplore?` |
| `ConfirmDialog` | [ConfirmDialog.tsx](../src/components/pulse/ConfirmDialog.tsx) | Generic centered confirm/cancel modal (hand-rolled, not shadcn `Dialog`); `destructive` styling variant | `open`, `onClose`, `onConfirm`, `title`, `description?`, `confirmLabel?`, `cancelLabel?`, `destructive?` |
| `JoinRequestSheet` | [JoinRequestSheet.tsx](../src/components/pulse/JoinRequestSheet.tsx) | Bottom sheet confirming a join request was sent (hand-rolled, not shadcn `Sheet`) | `open`, `onClose`, `onGoToHub` |
| `LeaveActivityDialog` | [LeaveActivityDialog.tsx](../src/components/pulse/LeaveActivityDialog.tsx) | Centered dialog with optional reason textarea, confirms leaving an activity (hand-rolled) | `open`, `onClose`, `onConfirm(reason)` |
| `ParticipantsSheet` | [ParticipantsSheet.tsx](../src/components/pulse/ParticipantsSheet.tsx) | Bottom sheet listing active participants; host variant supports a `Remove` action per participant (browser `confirm()` used for the remove confirmation, not `ConfirmDialog`) | `open`, `onClose`, `participants`, `onRemove?` |
| `PhotoGallery` | [PhotoGallery.tsx](../src/components/pulse/PhotoGallery.tsx) | 3-column photo grid; `canUpload` adds an upload tile (host-only, on completed activities) | `photos`, `onAdd?`, `canUpload?` |
| `FileAttachList` | [FileAttachList.tsx](../src/components/pulse/FileAttachList.tsx) | Document/material attachment list + dashed-border upload control; `readOnly` renders download links instead of remove buttons | `docs`, `onAdd?`, `onRemove?`, `readOnly?`, `label?` |
| `ActivityChat` | [ActivityChat.tsx](../src/components/pulse/ActivityChat.tsx) | In-activity chat thread. **Entirely local `useState`, seeded with two hardcoded messages, not persisted or shared between users.** `readOnly` locks input once an activity is completed | `readOnly?` |

## Hooks

| Hook | File | Purpose |
|---|---|---|
| `useIsMobile()` | [use-mobile.tsx](../src/hooks/use-mobile.tsx) | Boolean viewport-width media query (<768px). Not currently consumed anywhere in the routes/components reviewed — reserved for responsive logic |
| `useProfile()` | [profile-store.ts](../src/lib/profile-store.ts) | Subscribes to the profile localStorage store |
| `useHosted()` / `useJoined()` | [activity-store.ts](../src/lib/activity-store.ts) | Subscribe to hosted/joined activity localStorage arrays |
| `useTeaStatus()` | [tea-status.ts](../src/lib/tea-status.ts) | Subscribes to the seeded "Tea & Coffee" demo status |

See [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md) for the underlying store implementation shared by these hooks.

## Composition Notes

- `ActivityCard` is the single most reused component across Discover, Activity Hub, and empty-state previews — any change to its layout has wide blast radius.
- `Header`, `Section`, `Details`, and `HostCard` are exported directly from [activity.view.$id.tsx](../src/routes/activity.view.$id.tsx) and re-imported by [activity.manage.$id.tsx](../src/routes/activity.manage.$id.tsx) — i.e. some "shared components" currently live inside a route file rather than `components/pulse/`. Worth relocating if these routes diverge further.
- `SubHeader` is similarly exported from [settings.notifications.tsx](../src/routes/settings.notifications.tsx) and reused by four other settings sub-pages.
- `Avatar` is exported from [profile.index.tsx](../src/routes/profile.index.tsx) and reused by `TopBar`, `profile.edit.tsx`, and `host.verify.tsx` — another case of a shared component living inside a route file.

These cross-route imports are accurate as-is and are called out here for awareness; no restructuring is proposed or performed in this document.
