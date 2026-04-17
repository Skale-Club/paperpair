---
phase: 03-completion-tools
plan: "02"
subsystem: ui
tags: [next.js, react, tailwind, form-packs, uscis, submission]

# Dependency graph
requires:
  - phase: 03-01
    provides: sidebar nav items for /dashboard/submission (added by 03-01 Task 3)
provides:
  - /dashboard/submission page with AP warning, form downloads, assembly checklist, and lockbox link
affects: [interview-prep, any phase referencing submission flow]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Serialize FORM_PACKS before passing to Client Components (strip Date fields)"
    - "AP travel warning amber banner using --color-warning-* CSS vars with inline style"
    - "Checklist state in useState only — no DB persistence for ephemeral packet assembly"
    - "External USCIS links always use target=_blank rel=noopener noreferrer"

key-files:
  created:
    - src/app/dashboard/submission/page.tsx
    - src/app/dashboard/submission/submission-client.tsx
  modified: []

key-decisions:
  - "FORM_PACKS serialized before Server→Client prop pass to avoid Date (lockedUntil) serialization error"
  - "Checklist state in useState only per D-09 — no localStorage, no DB"
  - "Lockbox section links to USCIS.gov/i-485 only; no hardcoded street address per D-10"
  - "Submission page placed under /dashboard/submission (not (panel) route group) to avoid Immigration Timeline heading"

patterns-established:
  - "Serialize server-side objects with Date fields before passing as Client Component props"
  - "AP warning banner pattern reused from EwiWarning in initial-screener.tsx"

requirements-completed: ["SUB-01", "SUB-02", "SUB-03", "SUB-04"]

# Metrics
duration: 5min
completed: 2026-04-17
---

# Phase 03 Plan 02: Submission Packet Page Summary

**Submission Packet page at /dashboard/submission with amber AP warning, 6-form download list, 7-item assembly checklist, and USCIS lockbox link (no hardcoded address)**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-04-17T23:31:07Z
- **Completed:** 2026-04-17T23:35:00Z
- **Tasks:** 2 (+ checkpoint)
- **Files modified:** 2

## Accomplishments

- Submission page Server Component with auth guard and serialized FORM_PACKS prop
- SubmissionClient with four sections: AP travel warning (SUB-04), form download list (SUB-01), assembly checklist (SUB-02), lockbox link (SUB-03)
- All 118 existing tests pass — no regressions

## Task Commits

Each task was committed atomically:

1. **Task 1: Server Component page shell** - `6e9664a` (feat)
2. **Task 2: SubmissionClient with AP warning, downloads, checklist, lockbox** - `4a19fb4` (feat)

**Plan metadata:** (docs commit after checkpoint)

## Files Created/Modified

- `src/app/dashboard/submission/page.tsx` - Server Component; auth guard, serializes FORM_PACKS, renders SubmissionClient
- `src/app/dashboard/submission/submission-client.tsx` - Client Component; AP warning banner, form download list, 7-item checklist with useState, lockbox link to USCIS.gov/i-485

## Decisions Made

- Serialized FORM_PACKS before passing to SubmissionClient to strip `lockedUntil: Date` which would cause Next.js serialization error across Server/Client boundary
- Checklist state kept in `useState` only (no localStorage, no DB) per D-09 requirement
- Lockbox section points to `https://www.uscis.gov/i-485` only; copy explicitly tells user addresses change and to never use third-party sources (D-10)
- Page placed at `src/app/dashboard/submission/page.tsx` (not under `(panel)`) to avoid the "Immigration Timeline" heading from the panel group layout

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Known Stubs

None - all 6 form packs from FORM_PACKS render with real `coverPdfUrl` and `uscisUrl` values.

## Next Phase Readiness

- /dashboard/submission page is live and satisfies SUB-01 through SUB-04
- Human verification checkpoint is the next step (see plan task 3)
- Phase 03 completion tools are now fully implemented pending human verification

---
*Phase: 03-completion-tools*
*Completed: 2026-04-17*
