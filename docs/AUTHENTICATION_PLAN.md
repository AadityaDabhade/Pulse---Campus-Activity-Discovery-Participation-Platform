# Authentication Plan

## Current State: Fully Simulated, No Real Auth

There is **no real authentication system** in Pulse today. Everything described below is implemented entirely client-side, with no server verifying anything.

### Onboarding / Signup / Login (`src/routes/index.tsx`)

The onboarding flow (`Welcome → Auth → Profile → Hall → Celebrate`) implements a fake auth state machine:

1. User enters an "institute username" (the part before `@kgpian.iitkgp.ac.in`, hardcoded domain, forced lowercase, spaces stripped).
2. `accountExists(username)` is called — this is a **hardcoded stub** with a 350ms artificial delay:
   ```ts
   async function accountExists(username: string): Promise<boolean> {
     await new Promise((r) => setTimeout(r, 350));
     const u = username.trim().toLowerCase();
     return u === "demo" || u === "adityad21";
   }
   ```
   Only the literal strings `"demo"` and `"adityad21"` are treated as existing accounts; every other input is treated as a new signup.
3. **New account path**: shows a 6-digit OTP input (`InputOTP`) — **no real OTP is ever sent**; any 6 digits typed in are accepted (`handleVerifyOtp` just advances the phase unconditionally once length is 6). User then sets a password (≥6 characters, must match confirmation) — this password is **never stored or sent anywhere**; it only gates advancing to the next screen.
4. **Existing account path**: shows a password field. `handleExistingLogin` checks: if the username is `"adityad21"`, the password must literally equal `"123456"`; for any other "existing" username (i.e. `"demo"`), any password ≥6 characters succeeds. There is no real credential store.
5. On success, either path sets `localStorage["pulse_visited"] = "1"` and redirects to `/home`. This flag is the **entire** definition of "being logged in" today.
6. "Forgot password?" button exists in the UI but is an explicit no-op placeholder: `/* placeholder — wire to reset flow */`.

### "Logout"

`TopBar` and `settings.index.tsx` both implement logout identically: `localStorage.removeItem("pulse_visited")` then navigate to `/`. This doesn't invalidate any session (none exists) — it just re-triggers the onboarding redirect check.

### Route Protection

**None.** No route checks for an authenticated session. Every URL (including `/activity/new`, `/profile`, `/settings`, etc.) is directly navigable regardless of whether onboarding has been completed. See [ROUTING.md](./ROUTING.md) for detail.

### Secondary "Auth-Adjacent" Flows

- **Host phone verification** (`/host/verify`): collects a phone number, "sends" an OTP (`sendOtp()` just sets a boolean, no real SMS), accepts any 6-digit code as valid (`verifyOtp()` checks only `otp.length === 6`).
- **Profile email/phone change** (`/profile`, `/profile/edit`): same fake-OTP pattern — any 6-digit input verifies the change.
- **Password change** (`/profile/password`): validates only that the new password is ≥6 characters and matches confirmation. The "current password" field's value is **never checked against anything real** (there is no real password to check it against).

## What a Real Authentication System Needs to Provide

Based on what the frontend already expects to exist (i.e., what it's currently faking), a real implementation needs to support:

1. **Institute-email-gated signup**, restricted to `@kgpian.iitkgp.ac.in` addresses (confirm: is this a hard business rule, or should the domain be configurable for multi-institute support later? — **TBD**).
2. **Real OTP delivery** to institute email, for account verification during signup.
3. **Real OTP delivery** to a phone number, for host verification and phone-number changes.
4. **Password-based login** for returning users, with real credential storage (hashed, salted — never plaintext) — replacing the current hardcoded `"123456"` check entirely.
5. **Password reset ("Forgot password")** flow — currently entirely unimplemented (not even a stub), needs to be designed from scratch.
6. **Session/token issuance** on successful login/signup, and a real mechanism for the frontend to know "is there a valid session," replacing the current `pulse_visited` localStorage flag.
7. **Server-side session invalidation** on logout.
8. **Route-level guards** (likely via TanStack Router's `beforeLoad`, or a wrapping authenticated layout route) that redirect unauthenticated requests away from protected routes — currently no such guard exists anywhere. **This guard must be backed by a real, server-verified session check** (e.g. `beforeLoad` calling an endpoint that validates the session/token server-side), not merely a client-readable flag or cookie value. A guard that only checks client-side state would functionally reproduce today's `pulse_visited` localStorage flag — just with a more convincing implementation — without closing the actual gap.
9. **Authorization**, distinct from authentication: server-side checks that a user can only edit/delete/manage activities they host, and can only leave activities they've joined — currently enforced nowhere, not even client-side in most cases (any user could call `updateHosted` on any id if they knew it).

## Open Questions (TBD)

These are genuinely undecided — nothing in the codebase or product artifacts answers them, and this document does not guess:

- **Session mechanism**: cookie-based sessions vs. bearer JWTs vs. something else? — **TBD**.
- **OTP delivery provider**: for both email and SMS — **TBD**.
- **Password requirements**: the current UI only enforces a 6-character minimum; is that the real target policy, or a prototype placeholder? — **TBD**.
- **Account recovery**: what happens if a student loses access to their institute email (e.g. after graduation)? — **TBD**.
- **Single sign-on**: should this integrate with IIT Kharagpur's own institute SSO/identity system instead of a bespoke email+OTP+password flow? This is a significant architectural fork not addressed anywhere in the current frontend — **TBD, needs a product/infra decision before backend work starts**.
- **Session duration / "remember me"**: no such concept exists in the current UI — **TBD**.
- **Multi-device sessions**: should a user be able to be logged in on multiple devices simultaneously? — **TBD**.
- **Rate limiting / abuse prevention** on login, OTP request, and password-reset endpoints — **TBD**, not addressed anywhere in the prototype.
- **Account deletion**: no UI exists for a user to delete their account/data — **TBD** whether this is required (e.g. for compliance). If implemented, this also raises an undecided question covered in [DATABASE_REQUIREMENTS.md](./DATABASE_REQUIREMENTS.md): what happens to a deleted user's hosted activities and active participations (orphaned rows, cascading delete, or anonymized retention) — **TBD**, not addressed by any current frontend behavior since account deletion doesn't exist at all today.
- **Verification of "existing vs. new" account** without leaking whether a given institute email is registered (current stub trivially reveals this) — **TBD**, a real implementation should consider standard account-enumeration-prevention practices.

## Explicit Non-Goals of This Document

This document does not choose an auth provider, library, or protocol, and does not implement any authentication code. It exists to make the gap between "what the UI currently pretends to do" and "what a real system must actually do" unambiguous before backend work begins.
