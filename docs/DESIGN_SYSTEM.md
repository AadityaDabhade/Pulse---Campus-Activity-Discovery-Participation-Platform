# Design System

All design tokens are defined in [src/styles.css](../src/styles.css) using Tailwind CSS v4's CSS-first configuration (`@theme inline`), backed by `shadcn/ui` conventions ([components.json](../components.json): style `new-york`, base color `slate`, icon library `lucide-react`). There is no `tailwind.config.js` — the theme lives entirely in CSS.

## Color System

Colors are defined in `oklch` color space, as both a light (`:root`) and dark (`.dark`) palette. **Dark mode tokens exist but no UI control currently toggles them** — there is no theme switcher anywhere in the app; dark mode support is latent, not active.

### Semantic tokens (light theme values)

| Token | Value | Usage |
|---|---|---|
| `--background` / `--foreground` | white / near-black | Base page colors |
| `--card` / `--card-foreground` | white / near-black | Card surfaces |
| `--primary` / `--primary-foreground` | Pulse green `oklch(0.72 0.17 155)` / white | Primary actions, active states |
| `--secondary` / `--secondary-foreground` | near-white gray / dark | Secondary surfaces (segmented controls, input backgrounds) |
| `--muted` / `--muted-foreground` | near-white gray / mid gray | De-emphasized text/surfaces |
| `--accent` / `--accent-foreground` | soft green tint / dark green | Icon chips, badges, highlight surfaces |
| `--destructive` / `--destructive-foreground` | red / near-white | Destructive actions (delete, leave) |
| `--border` / `--input` / `--ring` | light gray / light gray / primary green | Borders, input outlines, focus rings |
| `--pulse-green`, `--pulse-green-soft` | alias of primary / accent | Named brand aliases |
| `--chart-1..5` | multi-hue palette | Reserved for data visualization; **not currently used anywhere in the app** |
| `--sidebar-*` | shadcn sidebar token set | Reserved for the shadcn `Sidebar` component; **not currently used** (no sidebar exists in the product) |

### Shadows (custom, not part of stock Tailwind/shadcn)

| Token | Purpose |
|---|---|
| `--shadow-soft` | Default resting elevation for cards |
| `--shadow-lift` | Elevated elements: sheets, dialogs, bottom nav |
| `--shadow-green` | Primary-action emphasis shadow (buttons, FAB) |

Exposed as Tailwind utilities: `shadow-soft`, `shadow-lift`, `shadow-green`.

## Radius Scale

Base `--radius: 0.625rem` (10px), with derived steps registered in `@theme inline`:

`--radius-sm` (−4px) · `--radius-md` (−2px) · `--radius-lg` (base) · `--radius-xl` (+4px) · `--radius-2xl` (+8px) · `--radius-3xl` (+12px) · `--radius-4xl` (+16px)

In practice, the product overwhelmingly uses `rounded-2xl` and `rounded-3xl` — sharp/small radii are essentially unused, giving the app its soft, pill-like visual character.

## Typography

There is **no centralized type scale** — font sizes are set per-element as arbitrary Tailwind bracket values (e.g. `text-[13.5px]`, `text-[15px]`, `text-[20px]`, `text-[26px]`, `text-[32px]`). Observed conventions, inferred from usage across components:

| Approx. size | Common usage |
|---|---|
| 10–11.5px | Micro-labels, pill/badge text, eyebrow text (uppercase, tracked) |
| 12–13.5px | Secondary/meta text, hints, muted captions |
| 14–15px | Body text, form labels, buttons |
| 16–18px | Section headers, dialog titles |
| 20–26px | Screen titles |
| 28–34px | Hero/onboarding headlines |

- Font stack: system default (no custom `font-family` declared).
- `font-feature-settings: "ss01", "cv11"` and antialiasing are set globally in the `body` base layer.
- Weight usage: `font-medium` for most UI text, `font-semibold` for headings/emphasis — `font-bold` is essentially unused.
- Letter spacing: wide/tracked uppercase (`tracking-[0.18em]`–`[0.22em]`) is a signature pattern for eyebrows and the "PULSE" wordmark ([src/components/pulse/Logo.tsx](../src/components/pulse/Logo.tsx)).

**Recommendation for future work (not yet implemented):** consolidate the ad hoc pixel values into a named Tailwind type scale (e.g. `text-caption`, `text-body`, `text-title`) as the component count grows, to prevent drift. This is a design-system maturity gap, not a bug.

## Spacing & Sizing Conventions

- Touch targets: buttons and icon-buttons are consistently sized `h-10`–`h-14` (40–56px), respecting mobile tap-target guidelines.
- Card padding: `p-4`–`p-5` typical.
- Screen horizontal padding: `px-5`/`px-6` typical.
- Bottom-safe-area handling: `pb-[env(safe-area-inset-bottom)]` used consistently in fixed-position bars/sheets (`BottomNav`, sheets, sticky CTAs) — confirms PWA/mobile-web deployment intent.

## Motion System

Custom keyframes and utility classes defined in `styles.css`, registered via Tailwind v4's `@utility` directive:

| Utility | Keyframe | Used for |
|---|---|---|
| `animate-float` | `pulse-float` | Gentle vertical bob, applied by `FeatureCard` ([COMPONENT_LIBRARY.md](./COMPONENT_LIBRARY.md)). **Currently dormant in practice** — `FeatureCard` is not rendered by any route today, so this utility is defined and functional but not actually visible anywhere in the live app |
| `animate-pop` | `pulse-pop` | Scale-in with overshoot (success checkmarks, selection badges) |
| `animate-draw` | `pulse-draw` | SVG stroke "drawing" effect (checkmark path in `SuccessCheck`) |
| `animate-fade-up` | `pulse-fade-up` | Screen-entry fade + rise (used on nearly every onboarding step) |
| `animate-ring` | `pulse-ring` | Expanding/fading ring (success state halo) |
| `animate-heartbeat` | `pulse-heartbeat` | Logo pulse on the onboarding "Celebrate" screen exit |
| `animate-slide-in` / `animate-slide-out` | `pulse-slide-in` / `pulse-slide-out` | Cycling welcome-screen item cards |

Interaction motion: nearly every tappable element uses `transition-transform` + `active:scale-[0.98]` (buttons/cards) or `active:scale-95` (icon buttons) — this is the app's core "tactile" signature and should be preserved in any new component.

Sheets/dialogs use `translate-y-full → translate-y-0` transitions (bottom sheets) or `scale-95 → scale-100` + opacity (centered dialogs), both at `duration-200`–`300` with `ease-out`/`cubic-bezier(0.22, 1, 0.36, 1)` easing.

## Iconography

`lucide-react` exclusively, stroke width consistently set to `2.2`–`2.4` (slightly heavier than the library default of `2`), sized `h-4 w-4` to `h-7 w-7` depending on context. No custom icon set exists.

## Component Styling Pattern

- Utility-first, inline Tailwind classes; class-list merging always goes through `cn()` ([src/lib/utils.ts](../src/lib/utils.ts), `clsx` + `tailwind-merge`).
- Two parallel component "system levels" exist:
  1. **shadcn/ui primitives** (`src/components/ui/*`) — largely stock, Radix-based, follow shadcn's own conventions (`class-variance-authority` variants, `data-slot` attributes).
  2. **Pulse product components** (`src/components/pulse/*`) — hand-built with raw Tailwind, several re-implementing dialog/sheet patterns from scratch (`ConfirmDialog`, `JoinRequestSheet`, `LeaveActivityDialog`, `ParticipantsSheet`) instead of using the shadcn `Dialog`/`Sheet` primitives already available in `components/ui/`. This inconsistency is noted here as observed fact — see [COMPONENT_LIBRARY.md](./COMPONENT_LIBRARY.md) for the full inventory.

## Dark Mode

CSS variables for a full dark palette exist (`.dark` block in `styles.css`), and Tailwind's `@custom-variant dark (&:is(.dark *))` is registered — but:

- No component ever adds/removes a `.dark` class.
- No settings screen exposes a theme toggle.

**Status: dark mode is defined but not wired up or reachable by any user flow.** Whether dark mode is an intended near-term feature is **TBD**.

## Assets

Only asset in the repository is `public/favicon.ico`. No logo image file exists — the "PULSE" wordmark is rendered as styled text ([src/components/pulse/Logo.tsx](../src/components/pulse/Logo.tsx)), not an SVG/image asset. No illustration or photography assets exist; all decorative visuals in the current UI are emoji.
