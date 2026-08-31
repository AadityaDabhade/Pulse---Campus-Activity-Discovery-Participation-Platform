# Pulse — Project Overview

## What Pulse Is

Pulse is a campus social-coordination app built for IIT Kharagpur ("KGPian") students. It lets students spontaneously host and join small, informal meet-ups — referred to throughout the app as **Activities** — such as chai runs, sports pickup games, study groups, movie nights, cab/toto sharing, and similar low-stakes campus plans.

The product thesis, taken directly from in-app copy ([src/routes/settings.founder.tsx](../src/routes/settings.founder.tsx)):

> "Campus goes by fast. Some of the best evenings — a spontaneous chai run, a study huddle, a random walk to the lake — never happen because we couldn't find the two other people who also felt like it. Pulse is a small attempt to fix that."

## Current State (as of this documentation)

Pulse is a **frontend-only, high-fidelity prototype**. There is:

- No backend server (beyond SSR rendering).
- No database.
- No real authentication.
- No real-time chat, notifications, or file storage.

All application data (user profile, hosted/joined activities, chat messages, documents, photos, notification state) lives in the browser's `localStorage`/`sessionStorage` and is lost on cache clear, and does not sync between two different real users. Every screen, interaction, and animation is fully built and navigable — this is a **complete UI/UX prototype awaiting a backend**, not a partial UI.

The project was originally scaffolded and exported from [Lovable](https://lovable.dev) on a TanStack Start template (see `.lovable/project.json`, `AGENTS.md`).

## Target Users

- **Primary**: IIT Kharagpur students (institute email domain `@kgpian.iitkgp.ac.in` is hardcoded into onboarding).
- **Two implicit roles per user** (not separate accounts — every user can act as both):
  - **Host** — creates and manages an Activity.
  - **Participant** — discovers and joins Activities hosted by others.

## Core Product Loop

1. A student **discovers** activity types and campus updates on the Discover feed (`/home`).
2. A student either:
   - **Hosts** a new Activity (`/activity/new`), gated behind a one-time host-verification step (phone + photo), or
   - **Joins** an Activity someone else is hosting (currently only fully wired for one seeded demo activity type, "Tea & Coffee").
3. Both hosts and participants manage their involvement from the **Activity Hub** (`/activity`), tracking Hosted vs. Joined activities across Requested → Upcoming → Ongoing → Completed states.
4. Activities support in-app chat, shared documents/materials, and (once completed) a shared photo gallery.

## Technology Snapshot

| Layer | Choice |
|---|---|
| Framework | TanStack Start (React 19, SSR) |
| Routing | TanStack Router (file-based, in `src/routes/`) |
| Styling | Tailwind CSS v4 (CSS-first config) + shadcn/ui ("new-york" style) |
| Data fetching (installed, unused) | TanStack Query |
| Build tool | Vite 8 |
| Deployment target | Nitro, defaulting to Cloudflare (per `vite.config.ts` comments) |
| Language | TypeScript (strict mode) |
| Package manager | Bun (per `bun.lock`, `bunfig.toml`) — a `package-lock.json` also exists; authoritative package manager is **TBD**, see [FRONTEND_ARCHITECTURE.md](./FRONTEND_ARCHITECTURE.md) |

## What This Documentation Package Covers

This `/docs` folder documents the **current, real state of the frontend** and lays out the **requirements and open questions** for building the backend that does not yet exist. No backend code is implemented as part of this documentation effort. Wherever a decision has not actually been made by the team, it is explicitly marked **TBD** rather than assumed.

| Document | Purpose |
|---|---|
| [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) | High-level system shape, today and target state |
| [FRONTEND_ARCHITECTURE.md](./FRONTEND_ARCHITECTURE.md) | Folder structure, build tooling, conventions |
| [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) | Tokens, typography, spacing, motion |
| [ROUTING.md](./ROUTING.md) | Full route table and routing conventions |
| [COMPONENT_LIBRARY.md](./COMPONENT_LIBRARY.md) | Catalog of all reusable components |
| [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md) | Client-side state/localStorage stores |
| [BUSINESS_LOGIC.md](./BUSINESS_LOGIC.md) | Product rules inferred from the frontend |
| [DATABASE_REQUIREMENTS.md](./DATABASE_REQUIREMENTS.md) | Inferred data model for a future database |
| [API_REQUIREMENTS.md](./API_REQUIREMENTS.md) | Endpoints a backend would need to expose |
| [AUTHENTICATION_PLAN.md](./AUTHENTICATION_PLAN.md) | Current auth stub and real-auth requirements |
| [FILE_STORAGE_PLAN.md](./FILE_STORAGE_PLAN.md) | Requirements for documents/photos storage |
| [NOTIFICATION_ARCHITECTURE.md](./NOTIFICATION_ARCHITECTURE.md) | Requirements for real notifications |
| [BACKEND_IMPLEMENTATION_PLAN.md](./BACKEND_IMPLEMENTATION_PLAN.md) | Phased plan tying the above together |
