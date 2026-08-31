# Notification Architecture

## Current State: Entirely Simulated, Not Persisted, Not Triggered by Real Events

There is **no real notification system** in Pulse today — no push notifications, no email notifications, no backend-triggered in-app notifications. The one screen that appears to implement notifications, `/activity/:id/notifications` ([activity.$id.notifications.tsx](../src/routes/activity.$id.notifications.tsx)), renders **identical hardcoded seed content regardless of which activity id is in the URL**:

```ts
const INITIAL_NOTIFICATIONS: Item[] = [
  { id: "n1", message: "Host changed the activity timing.", timestamp: "10 mins ago" },
  { id: "n2", message: "Host updated the meeting location.", timestamp: "1 hour ago" },
];
const INITIAL_REMINDERS: Item[] = [
  { id: "r1", message: "Activity starts in 1 hour.", timestamp: "" },
  { id: "r2", message: "Activity starts in 15 minutes.", timestamp: "" },
];
```

"Mark as read" moves an item from the active list to a collapsible "N read" section — purely in local `useState`. Reloading the page resets everything back to the seed content. No notification is ever actually generated as a side effect of any real action elsewhere in the app (creating an activity, requesting to join, accepting/declining, removing a participant, editing activity details, etc. — none of these currently produce a notification for anyone).

There is also a **global notification toggle** at `/settings/notifications` (`localStorage["pulse_notifications"]`, default on) — but since no real notifications are ever generated, this toggle currently has no effect on anything.

## What the UI Already Implies About the Intended Design

Even though nothing is wired up, the existing screens reveal several real design intentions worth preserving:

1. **Two distinct categories**: "Notifications" (things that already happened — host changed timing, host updated location) vs. "Reminders" (time-based, forward-looking — "starts in 1 hour," "starts in 15 minutes"). A real system should likely keep this as two distinct types/tabs, not merge them.
2. **Per-activity scoping**: the route is `/activity/:id/notifications`, implying notifications are meant to be viewable in the context of a specific activity — though a **global** notification inbox (not scoped to one activity) may also be needed and does not currently exist anywhere in the app. Whether a global inbox is required is **TBD**.
3. **Read/unread state with a collapsible archive** — the "N read" expandable section pattern is a reasonable UX to carry forward.
4. **Bell icon entry points** already exist throughout the app (`ActivityCard` action rows in the Activity Hub, the `Header` component shared by participant/host activity views) — all linking to the same per-activity notifications route. This confirms the *entry points* are considered final UI, even though the *content* behind them is not real.

## Inferred Notification Trigger Events (Not Currently Implemented)

Based on what actions exist elsewhere in the app that a real user would reasonably expect to be notified about:

| Trigger | Recipient(s) | Currently implemented? |
|---|---|---|
| Someone requests to join your hosted activity | Host | No — no request even reaches the host in the current simulation, see [BUSINESS_LOGIC.md](./BUSINESS_LOGIC.md) |
| Host accepts your join request | Requesting participant | No |
| Host declines your join request | Requesting participant | No |
| Host edits activity details (time/location/etc.) | All accepted participants | No — this is literally the seed copy shown ("Host changed the activity timing"), but no real edit action triggers it |
| Host removes you from an activity | Removed participant | No |
| Host marks the activity as completed | All participants | No |
| Host deletes the activity | All accepted participants | No |
| Host adds a new document/material | Participants (maybe) | No |
| New chat message in an activity you're part of | Other participants | No — chat isn't even persisted, see [BUSINESS_LOGIC.md](./BUSINESS_LOGIC.md) |
| Activity is starting soon (time-based reminder) | Host + accepted participants | No — this is the seed reminder copy, but nothing computes it from the real `date`/`time` fields |
| Join-request acceptance window ("accept until") is closing soon | Host | No |

This table is a **starting list inferred from the product's own UI copy and flows**, not a confirmed backlog — which of these are actually required for v1 is a product decision, **TBD**.

## Requirements for a Real Implementation

1. **Persistent storage** for notifications and reminders — see the proposed `notifications` table in [DATABASE_REQUIREMENTS.md](./DATABASE_REQUIREMENTS.md).
2. **Server-side triggering**: notifications must be created as a side effect of real backend mutations (accept/decline, edit, remove, complete, delete, new message, new document) — not fabricated client-side.
3. **Delivery channels** — currently the app only has an in-app list. Real requirements for push notifications (mobile/web push), email digests, or SMS are **entirely undecided — TBD**. Given the app is a mobile-web experience (see [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) — safe-area-inset handling throughout suggests PWA intent), web push is a plausible direction but is **not a decision made here**.
4. **Time-based reminder scheduling**: reminders like "starts in 1 hour" require either a scheduled job/cron system or an on-demand computation against the activity's real `date`/`time` fields at read time — mechanism is **TBD**.
5. **Respecting user preference**: the existing global on/off toggle (`pulse_notifications`) should become a real, enforced, server-aware preference (and likely needs to be more granular — e.g. separate toggles per notification type — depending on product requirements, **TBD**).
6. **Respecting the "Enable Notifications" toggle at delivery time**, not just for display — currently this setting exists but does nothing.
7. **Read-state sync across devices**: since "mark as read" is currently pure local state, a real system needs this to be a persisted, server-synced action (`read_at` timestamp per notification, per the proposed schema).
8. **Unread count / badge** — no such UI element (e.g. a badge on the bell icon or bottom nav) currently exists anywhere in the app; whether this is required for v1 is **TBD**.

## Explicitly Out of Scope / TBD

- Push notification provider (web push via VAPID, Firebase Cloud Messaging, OneSignal, etc.) — **TBD**.
- Email notification provider/templates — **TBD**.
- Whether a global (cross-activity) notification inbox is needed in addition to the current per-activity route — **TBD**.
- Notification frequency/batching rules (e.g. digest vs. instant) — **TBD**.
- Whether users can configure notification preferences per-activity, not just globally — **TBD**.
- Exact reminder timing thresholds (the seed copy suggests 1 hour and 15 minutes before start, but this is placeholder content, not a confirmed requirement) — **TBD**.

This document does not implement a notification system or select a delivery provider — it documents the gap between the current UI's implied design and what a real implementation requires, for use in backend planning.
