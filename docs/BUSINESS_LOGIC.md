# Business Logic

This document describes the product rules and flows **as they are actually implemented in the frontend today**, including where those rules are simulated/incomplete rather than real. It is derived entirely from reading the route and store code — no rules are invented or assumed beyond what the code encodes.

## Core Entity: Activity

An Activity is the central object in the product. Its base shape ([discover-data.ts](../src/lib/discover-data.ts)) is extended once created through the real form ([activity-store.ts](../src/lib/activity-store.ts), type `StoredActivity`):

- Identity/display: `id`, `emoji`, `title`, `time` (freeform display string), `host` (display name only), `about`.
- Logistics: `date`, `rawTime`, `activityLocation`, `meetupPoint`, `acceptUntil`/`rawAcceptUntil` (join-request cutoff), `deadline` (display string derived from `acceptUntil`).
- Eligibility: `gender` ("Everyone"/"Men"/"Women"), `eligibility` (multi-select tags: Everyone/Freshers/2nd–4th Year/PG).
- Capacity: `capacity` (number), `joined` (count — see note below), `participants` (array of `StoredParticipant`).
- Cost: `cost` (display string, e.g. `"₹20/person"`), `costRaw` (raw number entered).
- Content: `documents` (`StoredDoc[]`), `photos` (`StoredPhoto[]`, only populated once completed), `chatEnabled` (boolean).
- Host info: `hostProfile` (`HostProfile` — name, hall, year, phone, avatar).
- Lifecycle: `status: "upcoming" | "ongoing" | "completed"`, `createdAt`, `leftAt?` (participant-side soft-leave timestamp).

**Note on `joined` vs. `participants`:** the base `joined` counter (from the seed/demo data model) and the real `participants` array coexist and are summed in places (e.g. `activity.view.$id.tsx`'s `Details` component computes `a.joined + activeParticipants`). This suggests the counter was designed for seed/demo display and the participant array for the real flow — a future backend should pick **one** source of truth for participant count (almost certainly `COUNT(participants)`), not both. Flagged here as an inconsistency in the current model, not a rule to preserve.

## Hosting Lifecycle

1. **Eligibility gate**: `isHostReady(profile)` requires `phoneVerified && phone && photo`. Enforced only by the "+" button in `BottomNav` redirecting to `/host/verify` first — **not enforced by the `/activity/new` route itself**, which is directly reachable regardless of readiness.
2. **Host verification** (`/host/verify`): collect + OTP-verify phone number, collect a profile photo (gallery or camera capture), preview the resulting host card, then `updateProfile({ hostVerifiedAt: Date.now() })` and continue to `/activity/new`.
3. **Activity creation** (`/activity/new`): a single-page form collecting activity type (via a full-screen category picker sourced from `discover-data.ts`'s `CATEGORIES`), description, location/meetup point, date/time, gender + eligibility + participant capacity, estimated cost, an Activity Chat on/off toggle, and optional document attachments. Submission requires: type, date, time, location, gender, at least one eligibility tag, and a valid participant count ≥ 1.
4. Pressing **Proceed** opens a bottom sheet to set "Accept join requests until" (a time-of-day cutoff), then **Host Activity** calls `addHosted(...)` with a client-generated id (`makeId()`) and navigates to `/activity`.
5. **Editing**: the same route/form is reused via `?edit=<id>`, pre-filling all fields from the existing stored activity and calling `updateHosted(id, patch)` instead of `addHosted`. **No validation exists, client- or server-side, for edits that conflict with existing participation** — e.g. the current form does not prevent a host from lowering `capacity` below the number of already-accepted participants, or moving `date`/`time` into the past. A real implementation needs to decide these rules explicitly; they are not inferable from the current frontend and are marked **TBD** in [API_REQUIREMENTS.md](./API_REQUIREMENTS.md).
6. **Managing** (`/activity/manage/:id`, host-only view): add/remove documents, view/manage participants (remove with soft-delete via `removedAt` timestamp), toggle to "Mark as Completed" (only surfaced once status is `"ongoing"`), or "Delete Activity" (hard delete, with a destructive confirm dialog).
7. **Completing**: `markCompleted()` sets the hosted activity's status to `"completed"` and also patches every matching joined-side copy (`saveJoined(getJoined().map(...))`) to keep both "sides" of local storage in sync — this manual dual-write is itself evidence that in a real system, hosted/joined should be two views over one shared Activity + Participation record, not two separately duplicated copies (see [DATABASE_REQUIREMENTS.md](./DATABASE_REQUIREMENTS.md)).
8. **Deleting**: `deleteActivity()` removes the hosted record and also strips any matching joined-side copy, cascading the deletion — again evidence that a real backend should model this as one row with cascading deletes, not parallel arrays.
9. **Post-completion**: hosts can add "follow-up documents" and upload to a photo gallery (`PhotoGallery`, `canUpload`); chat becomes read-only (`ActivityChat readOnly`).

## Joining Lifecycle

**Important limitation:** a fully working, end-to-end join flow (request → host review → accept/decline → upcoming → ongoing → completed) is implemented **only for a single hardcoded demo activity type, "Tea & Coffee"** (`activity.$type.tsx` + `tea-status.ts` + the 4 seeded `TEA_ACTIVITIES`). For every other activity type in the 34-item taxonomy (`discover-data.ts`), the listing page renders an empty state — there is no seed content and no join mechanism wired up.

The Tea & Coffee flow, as implemented:

1. Browsing `/activity/tea-coffee` shows the 4 seeded activities (or fewer, once the user has "joined" one, per `getTeaActivityId()`/`teaStatus` filtering logic).
2. Tapping **Join** on a card calls `setTeaActivityId(id)` + `setTeaStatus("requested")`, opens `JoinRequestSheet`.
3. Back in the Activity Hub (`/activity`, Joined → Requested filter), the same user sees the "Approval Pending" state and two **self-service simulation buttons**: "Simulate accept" and "Simulate decline" — there is no second user, host inbox, or real approval mechanism anywhere in the code. The host never actually reviews or approves anything.
4. On "Simulate accept" → status becomes `"accepted"`, surfaced under Joined → Upcoming, with a further "Simulate start time reached" button.
5. On "Simulate start time reached" → status becomes `"ongoing"`, surfaced under Joined → Ongoing with a "Live Now" pill.
6. On "Simulate decline" → status becomes `"declined"`, shown grayed-out with an ✕ to dismiss (which resets `teaStatus` to `"none"` and clears the joined id).

For activities created through the **real** hosting flow (`activity-store.ts`), there is **no join flow implemented at all** on the participant side — `addJoined()` exists in the store's API but nothing in the current routes calls it for a general (non-Tea-and-Coffee) activity. In other words: a user can host any activity type, but no UI currently lets a *different simulated participant* discover and request to join it, because Discover only shows real join CTAs for `tea-coffee`.

## Leaving / Removal Semantics

- **Participant leaves**: `LeaveActivityDialog` collects an optional free-text reason (not currently persisted anywhere — collected but discarded, since `onLeave` in `activity.view.$id.tsx` only sets `leftAt`, never stores the reason), then `updateJoined(id, { leftAt: Date.now() })`.
- **Host removes a participant**: `ParticipantsSheet`'s `onRemove` (host context only) sets `removedAt: Date.now()` on that specific `StoredParticipant` entry, after a native `confirm()` dialog (not the app's `ConfirmDialog` component — inconsistent with the rest of the app's UI).
- **Auto-hide after 24h**: both "left" (participant-side) and "removed" (participant-list-side) records are soft-deleted with a timestamp, then filtered out client-side once `isExpired(timestamp)` (`Date.now() - ts >= 24h`) — but this check only runs **on render** (specifically, once on mount of the Activity Hub for joined activities), so a card doesn't disappear automatically in real time; it disappears the next time the relevant screen is loaded after 24h has elapsed. A real backend would want this to be a scheduled/background job or simply a query-time filter, not a client render-time side effect.
- A dismiss (✕) button also lets the user manually clear a "left" card immediately rather than waiting the 24h.

## Activity Chat

Implemented as a **fully local, non-persisted, non-shared** component ([ActivityChat.tsx](../src/components/pulse/ActivityChat.tsx)): seeded with two hardcoded messages ("Rhea"/"You"), new messages append to local `useState` only. Reloading the page resets the thread. `readOnly` is passed when the activity is `"completed"`, showing a "Chat is locked" footer instead of the input. There is currently no connection between this component and any specific activity's identity — it renders the same seed conversation regardless of which activity it's mounted under.

## Documents & Materials

`FileAttachList` accepts files via `<input type="file" multiple>`, classifies them by MIME type (`image` / `pdf` / generic `file`; a `link` kind exists in the type but has no UI path to create one), and stores them as `{ id, name, kind, url: URL.createObjectURL(file) }`. These blob URLs are **only valid for the current page session** — reloading the browser invalidates them (the file is never actually uploaded anywhere).

## Photo Gallery

Only shown/relevant once an activity's status is `"completed"`. Host can upload additional photos (`canUpload` prop); participants see the gallery read-only. Same `URL.createObjectURL()` non-durability caveat as documents applies.

## Notifications & Reminders (Per-Activity)

`/activity/:id/notifications` is a **generic, non-activity-specific** page — its `INITIAL_NOTIFICATIONS`/`INITIAL_REMINDERS` arrays are hardcoded seed content, identical regardless of which activity id is in the URL. "Mark as read" moves an item from the active list into a collapsible "N read" section. Nothing is persisted — reloading resets to the seed content. See [NOTIFICATION_ARCHITECTURE.md](./NOTIFICATION_ARCHITECTURE.md) for what a real implementation would require.

## Profile & Settings Business Rules

- Changing email or phone in `/profile` or `/profile/edit` requires a simulated OTP step (any 6-digit input is accepted as valid — `emailOtp.length === 6` is the only check, no real code is sent or verified) before the change is applied.
- `phoneVerified`/`emailVerified` flags exist on the profile but are trivially settable by this same fake-OTP mechanism.
- Password change (`/profile/password`) validates only that the new password is ≥6 characters and matches its confirmation — the "current password" field is **never actually checked against anything** (no real credential exists to check it against).
- Privacy toggles (`/settings/privacy`: phone visibility to joined participants, hall visibility on cards, campus-search discoverability) are stored but **not actually enforced anywhere** in the current UI — e.g. `HostCard` always shows the host's phone number regardless of the `phone_visible` setting.
- Notification master toggle (`/settings/notifications`) is stored but not actually connected to suppressing any notification, since no real notifications are generated in the first place.

## Authentication (Business-Rule View)

See [AUTHENTICATION_PLAN.md](./AUTHENTICATION_PLAN.md) for full detail. In business terms: onboarding distinguishes "existing account" vs. "new account" via a hardcoded `accountExists()` stub (usernames `"demo"` and `"adityad21"` are treated as existing; everything else is "new" and goes through OTP + password creation). Existing-user login only succeeds for username `adityad21` with password `123456`, or accepts any password ≥6 characters for any other "existing" username — i.e., there is no real credential store.

## Onboarding Profile & Hall Data Is Collected But Discarded

This is a distinct issue from the fake authentication above, and easy to miss: the onboarding flow's **Profile** step (`ProfileScreen` in `index.tsx` — name, phone, gender, graduation year) and **Hall** step (`HallScreen` — selected hall) both collect real form input into local component `useState`, but **neither step ever calls `updateProfile()`**. Their respective "Continue" handlers (`onNext`) only advance the onboarding `step` state machine (`"profile" → "hall"`, `"hall" → markVisited → "celebrate"`); they never write to `profile-store.ts`.

The practical effect: **every session ends up on the hardcoded `DEFAULT_PROFILE`** ("Aaditya D.", RP Hall, 3rd Year CSE — see [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md)) regardless of what a user types into onboarding. This is not a "not yet wired to a backend" gap in the usual sense — it's not wired to anything at all, including the app's own local store. A real signup implementation cannot simply swap an existing `updateProfile()` call for a server call here; the data flow from these two screens into the user's actual profile needs to be built from scratch. See [BACKEND_IMPLEMENTATION_PLAN.md](./BACKEND_IMPLEMENTATION_PLAN.md) Phase 1.

## Trust & Safety

No screen in the current frontend, and no other document in this package, addresses **blocking a user, reporting a user/activity/chat message, or moderating content**. `settings.help.tsx`'s "Report a Bug" link is a bug-report `mailto:`, not a user-safety reporting mechanism. Given Pulse's core function is connecting strangers for in-person, off-platform meetups, this is a meaningful gap rather than an incidental one. Whether trust & safety tooling is required for an initial launch is a product decision — **TBD** — but it should be made explicitly; see [BACKEND_IMPLEMENTATION_PLAN.md](./BACKEND_IMPLEMENTATION_PLAN.md) Phase 7.

## Summary of Simulated vs. Real Logic

| Flow | Status |
|---|---|
| Create/edit/delete a hosted activity | Real (persisted to localStorage, full CRUD) |
| Host marks activity complete | Real (with correct cascading update to joined-side copies) |
| Browse activity taxonomy | Real (full 34-type taxonomy, categorized) |
| Join an activity (any type except Tea & Coffee) | **Not implemented** |
| Join/accept/decline for "Tea & Coffee" | **Simulated** (single user plays both roles via "Simulate…" buttons) |
| Leave an activity / remove a participant | Real (with 24h soft-delete/grace-period pattern) |
| Activity chat | **Simulated** (local-only, not shared, not persisted) |
| Documents/photos | **Simulated** (blob URLs, non-durable) |
| Notifications & reminders | **Simulated** (hardcoded seed content, not tied to real events) |
| Auth (signup/login/OTP) | **Simulated** (no real credential store or OTP delivery) |
| Onboarding profile/hall data capture | **Discarded** (collected in local form state, never persisted anywhere — see above) |
| Privacy/notification settings | Stored but **not enforced** anywhere |
| Trust & safety (blocking/reporting/moderation) | **Not implemented** — no UI or data model exists |
