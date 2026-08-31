# API Requirements

**No API exists today.** This document catalogs the operations a backend API would need to support, derived directly from the client-side store functions and route interactions documented in [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md) and [BUSINESS_LOGIC.md](./BUSINESS_LOGIC.md). It describes **capabilities needed**, not a finalized API contract — transport style (REST vs. GraphQL vs. RPC), exact URL/method conventions, request/response envelopes, versioning, pagination strategy, and error-format are all **TBD** and left for backend design.

## Approach

Every capability below currently exists as a synchronous, local function operating on `localStorage` (e.g. `addHosted()`, `getById()`). The API layer's job is to let these become asynchronous, server-backed, multi-user-safe equivalents — most naturally consumed through the `TanStack Query` `QueryClient` that is already wired into the app but currently unused (see [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md)).

## Auth Capabilities

See [AUTHENTICATION_PLAN.md](./AUTHENTICATION_PLAN.md) for full detail. At minimum, the frontend's existing screens imply:

| Capability | Currently simulated by |
|---|---|
| Check whether an account exists for a given institute username | `accountExists()` stub in `index.tsx` |
| Send an OTP to an institute email (new-account signup) | Not real — any 6-digit input accepted |
| Verify OTP + create account with a password | `AuthScreen` "new-password" phase |
| Log in with username + password | `AuthScreen` "existing" phase |
| Send OTP to a phone number (host verification, profile phone change) | `host.verify.tsx`, `profile.index.tsx` |
| Verify phone OTP | same |
| Change password | `profile.password.tsx` (never checks the real current password today) |
| Log out / invalidate session | Currently just clears `pulse_visited` from localStorage |
| "Forgot password" reset flow | Button exists in `AuthScreen` but has **no implementation** (`/* placeholder — wire to reset flow */`) |

## User/Profile Capabilities

| Capability | Currently backed by |
|---|---|
| Get current user's profile | `getProfile()` / `useProfile()` |
| Update profile fields (name, year, department, hall, gender, photo) | `updateProfile(patch)` |
| Change institute email (with OTP re-verification) | `profile.index.tsx`/`profile.edit.tsx` |
| Change phone number (with OTP re-verification) | same |
| Get counts of a user's hosted/joined activities | Computed client-side as `hosted.length`/`joined.length` in `profile.index.tsx` — likely wants a dedicated aggregate/stat endpoint or query rather than fetching full lists just to count them |
| Mark host verification complete | `updateProfile({ hostVerifiedAt })` |

## Activity Capabilities

| Capability | Currently backed by |
|---|---|
| List activity types/categories (taxonomy) | Static `CATEGORIES` in `discover-data.ts` — may remain static frontend config, see DATABASE_REQUIREMENTS.md |
| List/browse activities by type | `activity.$type.tsx` — currently only real for the seeded Tea & Coffee data; needs a real "list activities of type X, filtered to open/joinable ones" endpoint |
| Get campus updates/announcements feed | `home.tsx` currently renders one hardcoded `CampusUpdateCard` — needs a real feed endpoint if this is to be dynamic |
| Create an activity | `addHosted(activity)` |
| Update/edit an activity | `updateHosted(id, patch)` — **no validation rule currently exists, in the frontend or in this documentation, for edits that conflict with existing participation** (e.g. lowering `capacity` below the current accepted-participant count, or moving `date`/`time` into the past). This needs an explicit product decision before implementation — **TBD**, see [BUSINESS_LOGIC.md](./BUSINESS_LOGIC.md) |
| Delete an activity (cascades participants/docs/photos/chat) | `removeHosted(id)` + manual cascade to joined-side copies in `activity.manage.$id.tsx` |
| Get a single activity by id (host or participant view) | `getById(id)` |
| Mark an activity completed | `markCompleted()` — must cascade to update every participant's view, and likely trigger "did you enjoy this" prompts |
| List "my hosted activities" (optionally filtered by status) | `useHosted()` + client-side filtering by `status` |
| List "my joined activities" (optionally filtered by status) | `useJoined()` + client-side filtering |

## Participation Capabilities

| Capability | Currently backed by |
|---|---|
| Request to join an activity | Only simulated for Tea & Coffee: `setTeaActivityId` + `setTeaStatus("requested")` |
| Host: view pending join requests for their activity | **Not implemented at all** — no host-side "requests inbox" exists in the current UI |
| Host: accept a join request | Simulated via a self-service "Simulate accept" button — needs to become a real host action against a real requester |
| Host: decline a join request | Simulated via "Simulate decline" |
| Participant: leave an activity (with optional reason) | `updateJoined(id, { leftAt })` — reason is collected in the UI but currently discarded, not sent anywhere |
| Host: remove a participant | `updateHosted` patching `participants[].removedAt`, confirmed via a native `confirm()` dialog |
| List participants for an activity (host + participant views) | Read directly off `activity.participants` — needs a real "list participants of activity X" endpoint, likely excluding removed ones by default |
| Enforce the "accept join requests until" cutoff | Currently stored (`acceptUntil`) but **not enforced anywhere** — no code path actually blocks a late request |
| Enforce eligibility/gender restrictions on join requests | Currently stored but **not enforced anywhere** — any user could "join" a restricted activity in the current simulation |
| Enforce capacity limits on join requests | Currently stored (`capacity`) but **not enforced anywhere** — no code path blocks joining a full activity |

## Chat Capabilities

| Capability | Currently backed by |
|---|---|
| Send a message in an activity's chat | Local `useState` only in `ActivityChat` — **no persistence, no real backend needed today but required for a real product** |
| Fetch chat history for an activity | Not implemented — component always renders the same 2 hardcoded seed messages |
| Real-time message delivery to other participants | Not implemented — see [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) for the "realtime channel" gap; WebSocket vs. polling is **TBD** |
| Lock chat once activity completes | Handled purely client-side today (`readOnly` prop based on `status === "completed"`) — should also be enforced server-side once real writes exist |

## Documents & Photos Capabilities

See [FILE_STORAGE_PLAN.md](./FILE_STORAGE_PLAN.md) for storage-specific requirements. API-level capabilities implied:

| Capability | Currently backed by |
|---|---|
| Upload a document/material to an activity | `FileAttachList`'s `onAdd` — currently just creates a local blob URL |
| Remove a document | `onRemove` — local array filter only |
| Upload a photo to a completed activity's gallery | `PhotoGallery`'s `onAdd`, host-only |
| List documents/photos for an activity | Read directly off the activity object today |

## Notifications & Reminders Capabilities

See [NOTIFICATION_ARCHITECTURE.md](./NOTIFICATION_ARCHITECTURE.md) for full detail.

| Capability | Currently backed by |
|---|---|
| List notifications for the current user/activity | Hardcoded seed arrays in `activity.$id.notifications.tsx`, identical regardless of activity id |
| Mark a notification as read | Local `useState` array move, not persisted |
| List reminders (separately from notifications) | Same hardcoded pattern |
| Trigger a notification on a real event (join request, accept/decline, activity update, participant removed, etc.) | **Not implemented anywhere** — no event in the current frontend actually generates a notification for another user |
| Schedule/deliver time-based reminders (e.g. "starts in 1 hour") | **Not implemented** — reminder content is static seed text, not computed from the actual activity start time |

## Trust & Safety Capabilities

| Capability | Currently backed by |
|---|---|
| Report a user, activity, or chat message | **Not implemented** — no such capability exists anywhere in the current frontend |
| Block a user | **Not implemented** |
| Moderate/remove content | **Not implemented** |

None of the current frontend implies a design for these — unlike other sections in this document, there is no existing UI shape to reverse-engineer requirements from. Whether these are required for an initial launch is a product decision — **TBD**, flagged here so it is decided explicitly rather than defaulted into scope by omission. See [BUSINESS_LOGIC.md](./BUSINESS_LOGIC.md) and [BACKEND_IMPLEMENTATION_PLAN.md](./BACKEND_IMPLEMENTATION_PLAN.md) Phase 7.

## Settings Capabilities

| Capability | Currently backed by |
|---|---|
| Get/set global notification preference | `localStorage["pulse_notifications"]` — should likely become a real per-user server-side preference |
| Get/set privacy preferences (phone visibility, hall visibility, discoverability) | `localStorage["pulse_privacy"]` — same; also currently **not enforced** by any read path (e.g. `HostCard` always shows phone regardless of the setting) |

## Cross-Cutting Requirements Implied by the Frontend

- **Idempotency / concurrency**: the current localStorage stores always do full-array read-modify-write with no conflict detection. A real multi-user API needs proper concurrency handling (e.g. optimistic concurrency on `activities`, atomic capacity checks on join) that has no client-side precedent to copy from — this must be designed fresh.
- **Authorization**: almost every mutating capability above (edit/delete activity, accept/decline request, remove participant, mark completed) needs a server-side check that the caller is actually the host (or, for leave/join, the participant) — none of this exists client-side today beyond the UI simply not rendering certain buttons.
- **Rate limiting on OTP endpoints** — not addressed anywhere in the current prototype; recommended before real OTP delivery is wired up. **TBD** on specific thresholds.

## Explicitly TBD

- REST vs. GraphQL vs. tRPC/RPC style — **TBD**.
- Authentication transport (cookies/session vs. bearer JWT) — **TBD**, see AUTHENTICATION_PLAN.md.
- API versioning strategy — **TBD**.
- Pagination approach for activity/notification lists — **TBD** (current frontend never paginates; all lists are small, hardcoded, or per-user arrays).
- Whether a public (unauthenticated) read API is needed for activity previews/deep links — **TBD**.
