# Backend Implementation Plan

## Purpose of This Document

This document sequences the requirements laid out across [DATABASE_REQUIREMENTS.md](./DATABASE_REQUIREMENTS.md), [API_REQUIREMENTS.md](./API_REQUIREMENTS.md), [AUTHENTICATION_PLAN.md](./AUTHENTICATION_PLAN.md), [FILE_STORAGE_PLAN.md](./FILE_STORAGE_PLAN.md), and [NOTIFICATION_ARCHITECTURE.md](./NOTIFICATION_ARCHITECTURE.md) into a proposed phased plan. **No backend code is implemented as part of this document or this documentation pass.** Technology choices remain **TBD** throughout unless explicitly stated otherwise — this is a sequencing and scoping plan, not a technical design or a commitment to specific tools.

## Guiding Principle

Build the backend to match what the frontend **already assumes**, correcting the one significant structural issue identified in [DATABASE_REQUIREMENTS.md](./DATABASE_REQUIREMENTS.md) along the way: the current frontend stores "hosted" and "joined" as two duplicated copies of activity data per user; the backend should instead model **one activity + a participation relationship**, with hosted/joined being different queries over the same underlying data. This single correction should inform schema and API design from day one rather than being retrofitted later.

## Phase 0 — Decisions Required Before Any Backend Work Starts

These are blocking, not sequencing, and are called out explicitly because this documentation package deliberately does not answer them:

- Backend language/framework — **TBD**.
- Database engine — **TBD**.
- Hosting/infra provider (the existing Nitro config defaults to a Cloudflare target — confirm if this extends to the backend, or if the backend will live elsewhere) — **TBD**.
- Auth approach: bespoke email+OTP+password vs. institute SSO integration (see [AUTHENTICATION_PLAN.md](./AUTHENTICATION_PLAN.md)) — **TBD, high-impact decision**.
- Object storage provider for files (see [FILE_STORAGE_PLAN.md](./FILE_STORAGE_PLAN.md)) — **TBD**.
- Real-time strategy for chat/live status: WebSockets, Server-Sent Events, or polling — **TBD**.
- Push/email/SMS notification providers — **TBD**.
- API transport style (REST/GraphQL/RPC) — **TBD**.

Resolving these is a prerequisite for accurate estimation of every phase below.

## Phase 1 — Foundation: Auth + Users + Core Schema

**Goal:** replace the fake onboarding flow with a real one, and stand up the core data model.

- Implement real signup: institute-email domain validation, real OTP delivery, password creation with real hashing/storage.
- Implement real login: real credential verification, replacing the hardcoded `"adityad21"`/`"123456"` check.
- Implement session issuance and a route-guard mechanism on the frontend (likely via TanStack Router `beforeLoad`) to replace the `pulse_visited` localStorage flag as the source of truth for "is this user logged in." **This guard must resolve against a real, server-verified session (e.g. a `beforeLoad` call that hits an auth-check endpoint), not merely a client-readable flag or cookie** — otherwise it reproduces today's `pulse_visited` problem behind a more sophisticated-looking wrapper. See [AUTHENTICATION_PLAN.md](./AUTHENTICATION_PLAN.md) item 8.
- Stand up `users` and `halls` tables per [DATABASE_REQUIREMENTS.md](./DATABASE_REQUIREMENTS.md); reconcile the two conflicting hall lists and the two conflicting `year` representations currently in the frontend as part of this phase (requires a product decision — **TBD**, flagged here as a blocking cleanup item, not something to resolve unilaterally).
- Implement profile read/update endpoints, replacing `profile-store.ts`'s localStorage calls. **Note:** the current onboarding flow's Profile and Hall steps (`ProfileScreen`/`HallScreen` in `index.tsx`) collect name/phone/gender/year/hall into local component state but never call `updateProfile()` — that data is discarded today, not merely "not yet connected to a backend." Real signup must actually wire these fields into the new user record from scratch; this is not a simple swap of an existing client-side call for a server one. See [BUSINESS_LOGIC.md](./BUSINESS_LOGIC.md).
- Implement "forgot password" (currently a non-functional placeholder button in the UI).
- Implement host-verification phone OTP for real.

**Exit criteria:** a real user can sign up, log in on a second device/browser, and see the same profile — something that is structurally impossible today.

## Phase 2 — Activities & Participation (Core Product Loop)

**Goal:** make hosting and joining real, multi-user operations.

- Stand up `activities`, `participations`, and `activity_types` (or confirm `activity_types` stays static frontend config — **TBD**) per [DATABASE_REQUIREMENTS.md](./DATABASE_REQUIREMENTS.md).
- Implement create/edit/delete-activity endpoints, replacing `addHosted`/`updateHosted`/`removeHosted`.
- Implement the full join lifecycle for **all** activity types (not just the current Tea & Coffee simulation): request → host review → accept/decline → active participation → leave/remove.
- Implement a real host-facing "pending requests" view — this does not exist in any form today and is a net-new screen/flow, not just a backend swap for existing UI.
- Enforce, server-side, the constraints that are currently only stored but never enforced: capacity limits, eligibility/gender restrictions, and the "accept join requests until" cutoff.
- Replace the dual hosted/joined array writes (`markCompleted`, `deleteActivity` in `activity.manage.$id.tsx` currently manually pushing updates to both local arrays) with single-source-of-truth queries over `activities` + `participations`.
- Retire `tea-status.ts` and the seeded `TEA_ACTIVITIES` simulation entirely once general joining works — do not carry the simulation-specific branching in `activity.index.tsx`/`activity.$type.tsx`/`activity.view.$id.tsx` forward.

**Exit criteria:** two different real user accounts, on two different devices, can host and join the same activity, with the host seeing and responding to a real request from the participant.

## Phase 3 — Files (Documents & Photos)

**Goal:** replace blob-URL "storage" with durable, shared file storage per [FILE_STORAGE_PLAN.md](./FILE_STORAGE_PLAN.md).

**Dependency note:** profile-photo storage (`users.photo_url`) only needs Phase 1 (the `users` table). Activity document/photo storage needs Phase 1 **and Phase 2** — `activity_documents.activity_id` and `activity_photos.activity_id` are foreign keys to `activities.id`, which does not exist until Phase 2 is complete. Do not start activity-scoped file storage before Phase 2 lands.

- Stand up object storage and an upload endpoint (or pre-signed-URL flow — if pre-signed URLs are used, the client uploads directly to storage rather than through the API layer shown in [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md)'s target diagram; update that diagram's assumptions accordingly if this path is chosen).
- Migrate `activity_documents` and `activity_photos` to real storage-backed URLs.
- Migrate profile photo upload similarly.
- Define and enforce file size/type/count limits (none exist today).
- Decide and implement file access control (public-by-URL vs. authorization-gated) — **TBD, privacy-sensitive, should not ship without an explicit decision**.

**Exit criteria:** a document or photo uploaded by one user is visible to another user, on another device, after both browsers have been fully restarted.

## Phase 4 — Chat

**Goal:** make `ActivityChat` a real, shared, persisted feature.

- Stand up `activity_messages` per [DATABASE_REQUIREMENTS.md](./DATABASE_REQUIREMENTS.md).
- Implement send/fetch-history endpoints.
- Decide and implement real-time delivery (WebSocket/SSE) vs. polling — **TBD**, but note the current UI already assumes near-real-time delivery (no manual refresh button exists), so some form of live update is implied by the existing UX even though the mechanism is undecided.
- Enforce the existing `chat_enabled`/`completed → read-only` rules server-side, not just client-side as today.

**Exit criteria:** two different real users, in the same activity, can see each other's messages without refreshing in a way that feels synchronous.

## Phase 5 — Notifications & Reminders

**Goal:** replace hardcoded seed content with real, triggered, persisted notifications per [NOTIFICATION_ARCHITECTURE.md](./NOTIFICATION_ARCHITECTURE.md).

- Stand up `notifications` (and, if scoped separately, `reminders`) tables.
- Wire notification creation into every relevant mutation from Phase 2 onward (join request, accept, decline, edit, remove, complete, delete, new document, new message).
- Implement time-based reminder scheduling against real activity `date`/`time` values.
- Decide and implement delivery channels beyond in-app (push/email) — **TBD**, may be deferred past initial launch depending on product priority.
- Make the existing (currently inert) notification preference toggle actually gate delivery.

**Exit criteria:** performing a real action (e.g. Host A accepts Participant B's request) produces a notification that Participant B actually sees, without either user refreshing seed data.

## Phase 6 — Enforcement & Privacy Settings

**Goal:** make the settings that already exist in the UI actually do something.

- Enforce `phone_visible`/`hall_visible`/`discoverable` privacy settings server-side (e.g. `HostCard` should conditionally omit the phone number based on the host's actual privacy setting — it currently always shows it).
- Confirm whether "discoverable" implies a campus-wide user search feature that doesn't exist yet — **TBD**, this setting currently has no corresponding feature to gate at all.

## Phase 7 — Hardening

Not tied to a specific frontend feature, but required for a production system regardless:

- Authorization audit across all mutating endpoints (host-only actions, participant-only actions).
- Rate limiting, especially on OTP and auth endpoints, and on high-frequency user actions (chat messages, join requests) to prevent spam/abuse — none of the current frontend or this documentation package addresses abuse prevention beyond OTP endpoints specifically.
- Input validation server-side (the frontend has some client-side validation, e.g. required fields on activity creation, but none of it should be trusted as the sole gate).
- **Trust & safety**: no document in this package, nor any screen in the current frontend, addresses blocking a user, reporting a user/activity/chat message, or moderating content — despite Pulse being an app that connects strangers for in-person meetups. This is a significant gap, not an oversight to leave silent. Whether this is required for an initial launch or can follow later is a product decision — **TBD** — but it should be explicitly decided, not defaulted into "later" by omission.
- Monitoring/error-reporting for the backend, mirroring the care already put into frontend error handling (`error-capture.ts`, `error-page.ts`, `lovable-error-reporting.ts` — see [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md)).
- Automated testing — **note: no test infrastructure exists anywhere in this repository today** (frontend or otherwise); introducing a test strategy for the new backend (and ideally backfilling frontend tests) should be planned explicitly rather than assumed.

## Explicit Non-Sequencing Notes

- This phase order is **proposed**, prioritizing "make the core loop real" before peripheral features (files, chat, notifications) — but the actual priority order is a product decision and may reasonably differ. **TBD.**
- No phase above includes effort estimates, team sizing, or timelines — none of that information exists in the source material this documentation is based on, and inventing it here would violate the "no assumptions" instruction this package was built under.
- This plan does not cover mobile-native app development, only the backend for the existing mobile-web frontend.

## Summary Table

| Phase | Unlocks | Depends on |
|---|---|---|
| 0 | Technology decisions | — |
| 1 | Real accounts, real login | Phase 0 |
| 2 | Real hosting + joining (any activity type) | Phase 1 |
| 3 | Durable documents/photos | Phase 1 (profile photos) **and Phase 2** (activity-scoped documents/photos FK to `activities.id`) |
| 4 | Real shared chat | Phase 2 (activity/participant identity) |
| 5 | Real notifications/reminders | Phase 2 (events to notify about) |
| 6 | Privacy settings actually work | Phase 1–2 |
| 7 | Production hardening | All prior phases |

This document is the final piece of the documentation package requested; it deliberately stops short of implementation, per instruction.
