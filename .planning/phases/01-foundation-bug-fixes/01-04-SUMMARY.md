---
phase: 01-foundation-bug-fixes
plan: 04
subsystem: auth
tags: [auth, supabase, prisma, react, tailwind, css-variables, invite, spouse]

# Dependency graph
requires:
  - phase: 01-foundation-bug-fixes
    provides: "SpouseInvite Prisma model, auth/callback invite_token handling, invite/spouse POST API"
provides:
  - "Auth form using olive/trust CSS variable palette instead of hard-coded emerald Tailwind classes"
  - "GET /api/invite/validate?token={token} — returns invite status and petitioner name"
  - "/invite/accept page with 4 UI states: loading, valid, expired, accepted"
affects: [auth, dashboard, spouse-invite-flow]

# Tech tracking
tech-stack:
  added: ["@vitejs/plugin-react (dev, enables JSX transforms in vitest)"]
  patterns:
    - "CSS custom property pattern: bg-[var(--color-trust)] instead of Tailwind color utilities for brand colors"
    - "Client Component with useSearchParams + fetch for token-based invite acceptance"
    - "GET API route with no auth check — token is the auth mechanism for pre-signup users"

key-files:
  created:
    - src/app/(auth)/auth-form.tsx
    - src/app/invite/accept/page.tsx
    - src/app/api/invite/validate/route.ts
    - src/__tests__/components/auth-form.test.tsx
    - src/__tests__/app/invite-accept.test.tsx
  modified:
    - vitest.config.ts

key-decisions:
  - "vitest.config.ts was importing @testing-library/react as a plugin — incorrect; replaced with @vitejs/plugin-react to enable JSX transforms in test environment"
  - "Invite validate endpoint intentionally has no auth check — spouse may not have an account yet; token is the auth mechanism"
  - "Accept button redirects to /login?invite_token= rather than calling a POST accept endpoint — auth/callback already handles viewerOfId assignment"

patterns-established:
  - "Brand color pattern: use bg-[var(--color-trust)] and focus:border-[var(--color-trust)] for interactive brand elements; keep emerald-200/50/800 for semantic success states"
  - "Invite page pattern: Client Component fetches /api/invite/validate on mount, renders state-machine UI based on response status"

requirements-completed: [AUTH-01, AUTH-02, AUTH-04, AUTH-05]

# Metrics
duration: 12min
completed: 2026-04-17
---

# Phase 01 Plan 04: Auth Color Fix + Spouse Invite Acceptance Page Summary

**Auth form migrated from hard-coded emerald Tailwind classes to CSS variable trust palette; spouse invite /invite/accept page built with 4 states (loading/valid/expired/accepted) and backing GET /api/invite/validate API route**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-04-17T14:12:00Z
- **Completed:** 2026-04-17T14:16:00Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- Replaced all brand emerald classes (`bg-emerald-600`, `hover:bg-emerald-700`, `focus:border-emerald-500`, `text-emerald-700`) in `src/app/(auth)/auth-form.tsx` with `var(--color-trust)` CSS variables; preserved semantic emerald-200/50/800 success state classes
- Created `/invite/accept` page as a Client Component with full state machine: loading spinner → valid invite (petitioner name, Accept + Decline) → expired/invalid warning → already-accepted message
- Created `GET /api/invite/validate` route that checks token validity via Prisma, returns status + petitioner name without requiring authentication
- Added `@vitejs/plugin-react` to vitest config (fixed broken JSX transform) enabling React component tests
- 8 new tests across 2 test files — all passing

## Task Commits

Each task was committed atomically:

1. **Task 1: Auth form color migration (AUTH-01/02)** - `e2c4f9e` (feat)
2. **Task 2: Spouse invite acceptance page (AUTH-04/05)** - `b9831c0` (feat)

**Plan metadata:** (docs commit after summary)

## Files Created/Modified

- `src/app/(auth)/auth-form.tsx` - Brand color classes migrated to CSS variables
- `src/app/invite/accept/page.tsx` - 4-state invite acceptance Client Component
- `src/app/api/invite/validate/route.ts` - GET endpoint returning invite status + petitioner info
- `src/__tests__/components/auth-form.test.tsx` - 3 color contract tests
- `src/__tests__/app/invite-accept.test.tsx` - 5 state-machine tests
- `vitest.config.ts` - Fixed: replaced @testing-library/react import with @vitejs/plugin-react

## Decisions Made

- The vitest config had `import react from "@testing-library/react"` which is not a vite plugin. Replaced with `@vitejs/plugin-react` and added to `plugins: [react()]`. This was needed to enable JSX compilation in tests.
- The invite validate API has no session auth check intentionally — the spouse receiving an invite may not have an account yet, so the token itself is the auth mechanism.
- Accept button redirects to `/login?invite_token={token}` rather than calling a separate POST endpoint, because `src/app/auth/callback/route.ts` already reads `invite_token` from the URL and assigns `viewerOfId` to the new UserProfile after OAuth completes.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed broken vitest JSX transform configuration**
- **Found during:** Task 1 (creating auth-form.test.tsx)
- **Issue:** `vitest.config.ts` imported `@testing-library/react` as a vite plugin (`import react from "@testing-library/react"`). This is not a vite plugin; it's a testing utility library. This caused "Unexpected JSX expression" parse errors when trying to render React components in tests.
- **Fix:** Installed `@vitejs/plugin-react`, replaced the broken import with `import react from "@vitejs/plugin-react"`, added `plugins: [react()]` to the vitest config.
- **Files modified:** `vitest.config.ts`, `package.json`, `package-lock.json`
- **Verification:** auth-form.test.tsx renders AuthForm successfully; 3 tests pass
- **Committed in:** e2c4f9e (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 3 - blocking infrastructure issue)
**Impact on plan:** Required fix to enable any React component testing. No scope creep — only corrected a pre-existing misconfiguration.

## Issues Encountered

- Pre-existing `fee-schedule.test.ts` tests fail with "Cannot read properties of undefined (reading 'biometrics')" — this is a pre-existing issue from the FEES_2026 barrel export plan (01-01) and is out of scope for this plan.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Auth-01/02: Auth form now uses brand color system consistently — no more hard-coded emerald classes on interactive elements
- AUTH-04/05: Spouse invite acceptance flow is complete end-to-end: invite email → /invite/accept page → Accept → /login?invite_token= → auth/callback assigns viewerOfId
- AUTH-03 (session persistence): Already handled by existing Supabase SSR middleware — no code changes needed
- All AUTH requirements complete; Phase 01 auth subsystem is fully implemented

---
*Phase: 01-foundation-bug-fixes*
*Completed: 2026-04-17*
